# Clarify Slack

## Prerequisites
`sudo npm install -g grunt-cli`

## Installation
1. `grunt install`
2. `./generate-ssl-cert.sh`

## Running
`grunt`

## Usage
0. Open your Slack profile and add your phone number.
1. Sign up.
2. Sign in.
3. Open Profile page and add API tokens and keys.
  - Your Slack name.
  - Your Slack Web API token. Open https://api.slack.com/web and click "Create token" and copy/paste shown value.
  - Your Twilio SID and Wep API token. Open https://www.twilio.com/user/account/voice-sms-mms/getting-started, expand "Show API Credentials" and copy paste values.
4. Save profile.
5. Open Slack app and type command in format `/clarifyer <phone number>`
