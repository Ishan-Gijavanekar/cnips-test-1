module.exports = function (event, ctx, config, vars) {
    console.log(event);

    let groupInfo = event;
    if (groupInfo) {
        if (groupInfo.KUNDEN) {
            let kundenData = groupInfo.KUNDEN.KUNDE;
            if (Array.isArray(kundenData)) {
                console.log("Processing multiple KUNDE entries...");
                event.transformedData = kundenData.map(kunde => transformData({ KUNDE: kunde }));
            } else if (typeof kundenData === "object") {
                console.log("Processing single KUNDE entry inside KUNDEN...");
                event.transformedData = [transformData({ KUNDE: kundenData })];
            }
        } else if (groupInfo.KUNDE) {
            console.log("Processing single KUNDE entry...");
            event.transformedData = transformData(groupInfo);
        }
    }

    return event;
};

function transformData(input) {
    if (!input || !input.KUNDE) {
        return "Invalid input: Missing 'KUNDE' key";
    }

    const kunde = input.KUNDE;

    function getSafeValue(value, defaultValue = "") {
        return value !== undefined && value !== null ? value.trim() : defaultValue;
    }

    function generateGroupName(name1, name2, name3, kunnr) {
        const parts = [name1, name2, name3].map(getSafeValue).filter(part => part !== "");
        return `${parts.join(" ")} - ${getSafeValue(kunnr)}`.trim();
    }

    function mapCustomFields(data) {
        return {
            street: getSafeValue(data.STRASSE),
            zip: getSafeValue(data.PLZ),
            city: getSafeValue(data.ORT),
            country: getSafeValue(data.LAND),
            language: getSafeValue(data.SPRACHE),
            WZkey: getSafeValue(data.WZ_SCHLUESSEL),
            customerClass: getSafeValue(data.KONTOKLASSE),
            UVCarrier: getSafeValue(data.UV_TRAEGER),
            UVCarrierno: getSafeValue(data.UV_MITGLIEDSNR),
            contractEndDate: getSafeValue(data.VERTRAGSENDE),
            unit_rv: getSafeValue(data.OE_RV),
            unit_center: getSafeValue(data.OE_ZENTRUM),
            regionalvertrieb: getSafeValue(data.REGIONALVERTRIEB),
            zentrum: getSafeValue(data.ZENTRUM),
            auftragssperre: getSafeValue(data.AUFTRAGSSPERRE),
            IsAvailableForAllUsersOfSystemTenant: getSafeValue(data.SONDERVERTRAG, "").toLowerCase()
        };
    }

    function processSubGroups(bsData) {
        let bsArray = Array.isArray(bsData) ? bsData : bsData ? [bsData] : [];

        return bsArray.map(bs => {
            let subgroup = {
                groupId: getSafeValue(bs.KUNNR),
                groupName: generateGroupName(bs.NAME1, bs.NAME2, bs.NAME3, bs.KUNNR),
                customFields: mapCustomFields(bs),
                subGroups: []
            };

            if (bs.ADMIN) {
                let user = mapUsers(bs.ADMIN, bs.KUNNR, false);
                if (user) subgroup.users = [user];
            }

            if (bs.UNTERBSN && bs.UNTERBSN.UNTERBS) {
                let unterbsArray = Array.isArray(bs.UNTERBSN.UNTERBS) ? bs.UNTERBSN.UNTERBS : [bs.UNTERBSN.UNTERBS];
                let subSubGroups = unterbsArray.map(unterbs => ({
                    groupId: getSafeValue(unterbs.KUNNR),
                    groupName: generateGroupName(unterbs.NAME1, unterbs.NAME2, unterbs.NAME3, unterbs.KUNNR),
                    customFields: mapCustomFields(unterbs),
                    users: unterbs.ADMIN ? [mapUsers(unterbs.ADMIN, unterbs.KUNNR, false)].filter(Boolean) : []
                }));
                subgroup.subGroups = subSubGroups;
            }
            return subgroup;
        });
    }

    function mapUsers(admin, groupId, isKundeGroup) {
        if (!admin || !admin.EMAIL) return null;

        return {
            userEntity: {
                provider: "self",
                family_name: getSafeValue(admin.NAME),
                given_name: getSafeValue(admin.VORNAME),
                phone_number: getSafeValue(admin.TELEFON),
                email: getSafeValue(admin.EMAIL),
                sap_nr: getSafeValue(admin.PERSONNR),
                groupId: getSafeValue(groupId),
                roles: isKundeGroup ? ["GROUP_ADMIN", "MEMBER_ADDER", "MEMBER_INVITER", "MEMBER_UPDATER", "LEADER"] : ["GROUP_ADMIN", "MEMBER_ADDER", "MEMBER_INVITER", "MEMBER_UPDATER"],
                customFields: {
                    sapId: getSafeValue(admin.PERSONNR)
                }
            }
        };
    }

    let users = [];
    if (kunde.ADMIN) {
        let user = mapUsers(kunde.ADMIN, kunde.KUNNR, true);
        if (user) users.push(user);
    }

    let cidaasPayload = {
        groupId: getSafeValue(kunde.KUNNR),
        groupName: generateGroupName(kunde.NAME1, kunde.NAME2, kunde.NAME3, kunde.KUNNR),
        customFields: mapCustomFields(kunde),
        subGroups: kunde.BSN && kunde.BSN.BS ? processSubGroups(kunde.BSN.BS) : [],
        users: users
    };

    return cidaasPayload;
}
