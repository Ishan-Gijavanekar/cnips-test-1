const ldap = require('ldapjs');

module.exports = async function (config) {
    // Create an LDAP client
    const client = ldap.createClient({ url: config.ldapurl });

    // Function to bind to the LDAP server
    const bindToServer = () => {
        return new Promise((resolve, reject) => {
            client.bind("creditplus\\svc_cidaas-iam-p", config.binddnpw, (err) => {
                if (err) {
                    reject(`Bind failed: ${err}`);
                } else {
                    resolve();
                }
            });
        });
    };

    // Function to search for users
    const searchUsers = () => {
        return new Promise((resolve, reject) => {
            const opts = {
                filter: '(objectClass=organizationalPerson)',
                scope: 'sub',
                attributes: ["mail", "givenName", "sn", "extensionAttribute8", "employeeNumber", "gCAAttribute1", "employeeNumber", "telephoneNumber", "facsimileTelephoneNumber", config.userActiveAttributeKey]
            };

            const users = [];

            client.search(config.userBaseDN, opts, (err, res) => {
                if (err) {
                    reject(`Search failed: ${err}`);
                    return;
                }

                res.on('searchEntry', (entry) => {
                    const userAccountControl = entry.pojo.attributes.find(attr => attr.type === "userAccountControl");
                    const userAccountControlValue = userAccountControl ? userAccountControl.values[0] : null;

                    const userActiveAttributeValues = new Set(["512", "66048", "1049088", "1114624"]);
                    const userStatus = userActiveAttributeValues.has(userAccountControlValue) ? "active" : "inactive";
                    const userEntry = {
                        DN: entry.dn.toString(),
                        Attributes: entry.pojo.attributes.map(attr => ({
                            Name: attr.type,
                            Values: attr.values,
                            ByteValues: attr.values.map(value => Buffer.from(value).toString('base64'))
                        })),
                        userAccountStatus: userStatus
                    };
                    users.push(userEntry);
                });

                res.on('error', (err) => {
                    reject(`Search error: ${err.message}`);
                });

                res.on('end', (result) => {
                    if (result.status !== 0) {
                        reject(`Search failed with status: ${result.status}`);
                    }
                    resolve(users);
                });
            });
        });
    };

    // Function to search for groups
    const searchGroups = (DN) => {
        return new Promise((resolve, reject) => {
            const opts = {
                filter: '(&(member=' + escapeFilter(DN) + '))',
                scope: 'sub',
                attributes: ['cn', 'dn']
            };
            const groups = [];
            client.search("OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int", opts, (err, res) => {
                if (err) {
                    console.log(err)
                    reject(`Search failed: ${err}`);
                    return;
                }

                res.on('searchEntry', (entry) => {
                    const groupEntry = {
                        DN: entry.dn.toString(),
                        Attributes: entry.pojo.attributes.map(attr => ({
                            Name: attr.type,
                            Values: attr.values,
                            ByteValues: attr.values.map(value => Buffer.from(value).toString('base64'))
                        }))
                    };
                    groups.push(groupEntry);
                });

                res.on('error', (err) => {
                    reject(`Search error: ${err.message}`);
                });

                res.on('end', (result) => {
                    if (result.status !== 0) {
                        reject(`Search failed with status: ${result.status}`);
                    }
                    resolve(groups);
                });
            });
        });
    };

    function escapeFilter(filter) {
        const hex = "0123456789abcdef";

        function mustEscape(char) {
            const code = char.charCodeAt(0);
            return code > 0x7f || code === 0x28 || code === 0x29 || code === 0x5c || code === 0x2a; // ASCII for (, ), \, *
        }

        let result = "";
        for (let i = 0; i < filter.length; i++) {
            const char = filter[i];
            if (mustEscape(char)) {
                const code = char.charCodeAt(0);
                result += "\\" + hex[(code >> 4)] + hex[code & 0xf];
            } else {
                result += char;
            }
        }
        return result;
    }

    function splitUserDataFlexible(data) {
        const activeUsers = data.activeUsers || [];
        const inactiveUsers = data.inactiveUsers || [];

        const packets = [];
        const maxUsersPerPacket = 50;
        let activeIndex = 0;
        let inactiveIndex = 0;

        while (activeIndex < activeUsers.length || inactiveIndex < inactiveUsers.length) {
            const packetActiveUsers = [];
            const packetInactiveUsers = [];

            // Fill active users until reaching max or end of active users
            while (packetActiveUsers.length < maxUsersPerPacket && activeIndex < activeUsers.length) {
                packetActiveUsers.push(activeUsers[activeIndex]);
                activeIndex++;
            }

            // Fill remaining slots with inactive users
            while (
                packetActiveUsers.length + packetInactiveUsers.length < maxUsersPerPacket &&
                inactiveIndex < inactiveUsers.length
            ) {
                packetInactiveUsers.push(inactiveUsers[inactiveIndex]);
                inactiveIndex++;
            }

            // Add the packet to the result
            packets.push({
                data: {
                    activeUsers: packetActiveUsers,
                    inactiveUsers: packetInactiveUsers
                }
            });
        }

        return packets;
    }

    try {
        await bindToServer();

        const users = await searchUsers();
        let userListActive = [];
        let userListInactive = [];
        for (let i = 0; i < users.length; i++) {
            const groupsList = await searchGroups(users[i].DN);
            if (users[i] && users[i].userAccountStatus && users[i].userAccountStatus === "active") {
                userListActive.push({ user: users[i], groups: groupsList })
            } else {
                userListInactive.push({ user: users[i], groups: groupsList })
            }
        }

        const result = {
            activeUsers: userListActive,
            inactiveUsers: userListInactive,
        };

        let event = splitUserDataFlexible(result);
        //remember to return the transformed event object for the pipeline to continue processing the event
        return event;
    } catch (error) {
        console.error('Error: ', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};