
const { Client } = require('pg');
let client;
module.exports = {
    setup: async function(config) {
        client = new Client({
            user: config.username,
            host: config.host,
            database: config.database,
            password: config.password,
            port: 5432
        });
        await client.connect();
    },
    execute: async function(event, ctx, config) {
        try {
            await client.query('INSERT INTO events (operation, details) VALUES ($1, $2)', [event.operation, event.details]);
        } catch(error) {
            console.error(error);
            throw "Failed to insert into table";
        }
    },
    teardown: async function(config) {
        await client.end();
    }
}
