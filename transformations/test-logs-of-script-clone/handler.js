const ldap = require('ldapjs');

module.exports = async function (event, ctx, config) {
    // Create an LDAP client
    const client = ldap.createClient({ url: config.ldapurl });

    // Function to bind to the LDAP server
    const bindToServer = () => {
        return new Promise((resolve, reject) => {
            client.bind(config.binddn, config.binddnpw, (err) => {
                if (err) {
                    reject(`Bind failed: ${err}`);
                } else {
                    resolve();
                }
            });
        });
    };

    // Function to construct the dynamic filter
    const buildFilter = (filterString) => {

        const objectClasses = filterString.split(',');

        return `(|${objectClasses.map(oc => `(objectClass=${oc.trim()})`).join('')})`;

    };

    // Function to search for groups
    const searchGroups = () => {
        return new Promise((resolve, reject) => {
            const opts = {
                filter: '(objectClass=groupOfNames)',
                scope: 'sub',
                attributes: ['cn', 'member']
            };

            const groups = [];

            client.search(config.groupBaseDN, opts, (err, res) => {
                if (err) {
                    reject(`Search failed: ${err}`);
                    return;
                }

                res.on('searchEntry', (entry) => {
                    const groupEntry = {
                        DN: entry.dn.toString(),
                        Members: entry.pojo.attributes.find(attr => attr.type === 'member').values,
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

    try {
        await bindToServer();

       // const users = await searchUsers();
        const groups = await searchGroups();

        // Map users to their groups
   /*     const activeUsers = users.map(user => {
            const userDN = user.DN;
            const userGroups = groups.filter(group => group.Members.includes(userDN)).map(group => ({
                DN: group.DN,
                Attributes: group.Attributes
            }));

            return {
                user,
                groups: userGroups
            };
        }); */

       
        event.result = groups
        return event;
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
