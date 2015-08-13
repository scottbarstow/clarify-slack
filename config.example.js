var config = {
  BASE_URL: 'http://example.com',
  SESSION_SECRET: 'BIG DEAL',
  mongodb: {
    URI: 'mongodb://localhost/clarify-slack'
  },
  clarify: {
    API_KEY: 'Your Clarify API Key'
  },
  slack: {
    TOKEN: 'Slack Team Token'
  },
  twilio: {
    ACCOUNT_SID: 'Twilio Account Sid',
    AUTH_TOKEN: 'Twilio Auth Token',
    PHONE: 'Phone number verified in Twilio account'
  }
};

module.exports = config;