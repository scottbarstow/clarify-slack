var config = require('../config');
var twilio = require('twilio');
var Call = require('../models/call');

exports.callAccepted = function(req, res) {
  console.log('ACCEPTED:', req.body);

  Call.findOne({twilio_sid: req.body.CallSid}, function(err, call){
    var twiml = new twilio.TwimlResponse();
    twiml.say('Welcome to Clarify Slack!')
      .dial(call.to, {
        action: config.BASE_URL + "/twilio/dial/status",
        record: true
      });
    res.type('text/xml');
    res.send(twiml.toString());
  });
};

exports.callStatus = function(req, res) {
  console.log('CALL:', req.body);
  var twiml = new twilio.TwimlResponse();
  res.type('text/xml');
  res.send(twiml.toString());
};

exports.dialStatus = function(req, res) {
  console.log('DIAL:', req.body);
  var twiml = new twilio.TwimlResponse();
  res.type('text/xml');
  res.send(twiml.toString());
};
