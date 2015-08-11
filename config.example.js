var config = {
    BASE_URL: 'http://exmaple.com',
    SESSION_SECRET: 'Very small session secret',
    mongodb: {
        URI: 'mongodb://localhost/clarify-indexer'
    },
    clarify: {
        API_KEY: 'Clarify API key'
    },
    slack: {
        COMMAND_TOKEN: 'Slack /clarifyer command token',
        API_TOKEN: 'Slack Web API token'
    },
    twilio: {
        TOKEN: 'Twilio Web API token',
        SID: 'Twilio SID'
    }
};

module.exports = config;
