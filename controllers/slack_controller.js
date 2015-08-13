var config = require('../config');
var request = require('request');
var twilio = require('twilio');
var client = twilio(config.twilio.ACCOUNT_SID, config.twilio.AUTH_TOKEN);
var User = require('../models/user');
var Call = require('../models/call');

exports.call = function(req, res) {
  var slackInfo = req.body;
  if (slackInfo.text && slackInfo.text.length > 0){
    User.findOne({'profile.slackUser': slackInfo.user_name}, function(err, user){
      client.calls.create({
        from: config.twilio.PHONE,
        to: user.profile.phone,
        method: "POST",
        statusCallbackMethod: "POST",
        StatusCallback: config.BASE_URL + "/twilio/status",
        Url: config.BASE_URL + "/twilio/accepted",
        record: "true"
      }, function(err, call) {
        if (err){
          return res.status(400).send(slackInfo.user_name + ', we could not get a call: ' + err.message);
        }
        Call.create({
          from: user.profile.phone,
          to: slackInfo.text,
          twilio_sid: call.sid
        });
        res.status(200).send('Call has started');
      });
    });
  } else {
    res.status(200).send(slackInfo.user_name + ', please type a phone number you want to call.');
  }
};