# Clarify Slack

A demonstration app that shows how to make phone calls from Slack using the Twilio API, record the call, and then index the contents of the recorded call using the Clarify.io API.

The app also allows you to search the contents of previous recordings, request a transcription of the audio, and finally index an arbitrary media url, all from the Slack UI.

## Prerequisites
`sudo npm install -g grunt-cli`

## Installation
1. `grunt install`
2. `grunt seed` to create the default admin user. Username 'admin', password 'admin'

## Configuration
1. Copy config.example.js to config.js
2. Configure the settings in the config file. You can find the Clarify API keys in the Clarify Developer portal.  
3. Set your Twilio API credentials, and add a purchased phone number from Twilio to the PHONE section of the Twilio config.
4. You'll need to get an API token from Slack (see instructions below). We made a choice not to use oAuth for purposes of this demo app to keep the configuration simpler.
5. Configure the mail server settings if you want to have transcribed audio emailed to you.

## Running
`grunt`

## Slack Setup
In order to have the app work, you'll need to set up two things in Slack: A Slack Slash command, and an API token.  We'll take them in reverse order.

1. To get your Slack API token, go to [Slack Web API Settings](https://api.slack.com/web), and scroll down to the Authentication section.  Click 'Create Token' for the Slack instance you want to test with.
2. With the app running, login with the default user (admin, admin) and click the 'Profile' link in the upper right corner. Put in your Slack username and paste the Slack token into the token field.
3. Then create a Slack Slash command by navigating to the Slack integrations page at https://<yourslackinstance>.slack.com/services/new and scrolling to the bottom.
4. Click 'Slash Commands'
5. At the 'Choose a Command' prompt, enter /clarifyer and click the big green button.
6. Scroll down to the Integration Settings and put the following URL into the URL textbox:  http://<yourexternalhost>:<port>/slack/command. e.g. http://slack.rockethangar.com:3000/slack/command
7. Select POST for the method
8. For Autocomplete help text, put something like 'Clarifyer lets you make calls, record them and then search'
9. For Usage Hint, put something like "call",  "search", "index", "transcribe"
10. Scroll to the bottom and Save Integration.
11. Last, go to your Slack Profile and make sure you have your phone number set up.  This is the number that will be used to call you and bridge the outbound call.

Then, presuming your app is running, you can, from any Slack channel, do /clarifyer command value. See below section for usage parameters.

### Slack Command Syntax

1. /clarifyer call <number> or /clarifyer call @slackuser. Note: if you are calling a number it is best to use international country codes. e.g. /clarifyer call +19195551212
2. /clarifyer search <url>
3. /clarifyer transcribe <bundle id>
4. /clarifyer index <url>


## How It Works

### Making calls

When you type /clarifyer call number, the app will call the phone number of the Slack user who typed in the command.  When that user answers the call, the app initiates the 2nd leg of the call to the number specified and joins the two calls together. When the destination answers, the call begins recording.

When both parties hang up, the recording url is sent off to Clarify to be indexed. Upon completion of indexing, the app will post a message in the Slack channel that the call has been indexed, similar to the following:

```
Your Call 89051ef85e7f413ebfa20f550fc1134 from +number to +number has been indexed and is ready for search. Type /clarifyer search to search the audio.
```


The app also creates a local record in the DB to store the Bundle ID and tie all of the information together.

### Searching 

When you type /clarifyer search 'text', the request is sent to Clarify. As the results are returned, they are compared against what is in the local DB to validate. The app then posts a message in the Slack channel that says 

```
Your search term was found in the following: 
* Call to 'number' at 1.81 seconds 
* Call to 'number' at 1.67 seconds 
* Call to 'number' at 2.92 seconds
```

Each of the results is a hpyerlink to the app that will then allow the user to play the results in a media player.  As of now (as far as we can tell) you can't embed a media player directly in Slack. If someone knows how to do this, that would be great!

### Transcribing 

Using the ID that was sent back to you from the Call action, you can type /clarifyer transcribe id.  This will send a request off to Clarify to transcribe the audio from the call. When completed, Clarify will send a callback to the app, and the app will email the contents of the transcription to the user who requested it.

### Indexing

Last but not least, if you want to simply index an arbitrary media file, you can type /clarifyer index url.  When the indexing is complete, you'll get a message in Slack telling you it's now searchable. 