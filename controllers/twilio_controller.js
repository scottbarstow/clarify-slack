var config = require('../config');
var twilio = require('twilio');
var Call = require('../models/call');

exports.accepted = function(req, res) {
  console.log('ACCEPTED:', req.body);

  Call.findOne({twilio_sid: req.body.CallSid}, function(err, call){
    var resp = new twilio.TwimlResponse();
    resp.say('Welcome to Clarify Slack!')
      .dial(call.to, {
        action: config.BASE_URL + "/twilio/dial/status",
        record: true
      });
    res.type('text/xml');
    res.send(resp.toString());
  });
};

exports.callStatus = function(req, res) {
  console.log('CALL:', req.body);
  res.send('');
};

exports.dialStatus = function(req, res) {
  console.log('DIAL:', req.body);
  res.send('');
};
