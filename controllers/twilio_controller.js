var twilio = require('twilio');

var Call = require('../models/call');

exports.accepted = function(req, res) {
  Call.findOne({twilio_sid: req.body.CallSid}, function(err, call){
    var resp = new twilio.TwimlResponse();
    resp.say('Welcome to Clarify Slack!')
      .dial(call.to);
    res.type('text/xml');
    res.send(resp.toString());
  });
};

exports.status = function(req, res) {
  console.log('STATUS:', req.body);
  res.send('');
};
