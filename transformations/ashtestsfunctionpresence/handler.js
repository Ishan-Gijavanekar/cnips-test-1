const xml2js = require('xml2js');

module.exports = function name(event, ctx, config) {
    //add your script here to transform or enrich the event
    console.log(event);

    const xmlData = `
<users>
    <user>
        <id>1</id>
        <name>John Doe</name>
        <email>johndoe@example.com</email>
        <age>30</age>
    </user>
    <user>
        <id>2</id>
        <name>Jane Smith</name>
        <email>janesmith@example.com</email>
        <age>25</age>
    </user>
</users>
`;

    const parser = new xml2js.Parser({ explicitArray: true });

    parser.parseString(xmlData, (err, result) => {
        if (err) {
            console.error("Error parsing XML:", err);
            return;
        }
        console.log(result);
        event = result
    });
    //remember to return the transformed event object for the pipeline to continue processing the event
    return event;
}