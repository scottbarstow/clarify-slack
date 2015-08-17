var config = require('../config');
var request = require('request');
var twilio = require('twilio');
var twilioClient = twilio(config.twilio.ACCOUNT_SID, config.twilio.AUTH_TOKEN);
var Call = require('../models/call');

exports.call = function(req, res) {
  var slackInfo = req.body;
  var user = req.user;

  if (slackInfo.text && slackInfo.text.length > 0){
    request.get('https://slack.com/api/users.info', {
      qs: {
        token: user.profile.slackToken,
        user: slackInfo.user_id
      }
    }, function(err, response, body){
      var info = JSON.parse(body);
      var u = info.user;

      if (info.ok && u.profile.phone && u.profile.phone.length > 0){
        twilioClient.calls.create({
          from: config.twilio.PHONE,
          to: u.profile.phone,
          method: "POST",
          statusCallbackMethod: "POST",
          StatusCallback: config.BASE_URL + "/twilio/call/status",
          Url: config.BASE_URL + "/twilio/call/accepted"
        }, function(err, call) {
          if (err){
            return res.status(200).send(slackInfo.user_name + ', we could not get a call: ' + err.message);
          }
          Call.create({
            from: u.profile.phone,
            to: slackInfo.text,
            date: Date.now(),
            twilio_sid: call.sid,
            slack_channel_id: slackInfo.channel_id,
            user: user
          });
          res.status(200).send('Call has started');
        });
      } else {
        res.status(400).send(slackInfo.user_name + ', we could not get your profile from Slack.');
      }
    });
  } else {
    res.status(400).send(slackInfo.user_name + ', please type a phone number you want to call.');
  }
};
