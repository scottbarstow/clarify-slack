var config = require('../config');
var twilio = require('twilio');
var Call = require('../models/call');
var clarify = require('clarifyio');
var clarifyClient = new clarify.Client('api.clarify.io', config.clarify.API_KEY);

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

  var callInfo = req.body;
  if (req.body.CallStatus === 'completed') {
    Call.findOne({twilio_sid: callInfo.CallSid}, function(err, call){
      clarifyClient.createBundle({
        name: call.to,
        media_url: call.url,
        notify_url: config.BASE_URL + '/clarify/notify',
        external_id: call._id,
        metadata: JSON.stringify({callId: call._id})
      });
    });
  }

  var twiml = new twilio.TwimlResponse();
  res.type('text/xml');
  res.send(twiml.toString());
};

exports.dialStatus = function(req, res) {
  console.log('DIAL:', req.body);
  var io = req.app.get('io');

  var callInfo = req.body;
  Call.findOne({twilio_sid: callInfo.CallSid}, function(err, call){
    call.url = callInfo.RecordingUrl;    
    call.save();
    io.sockets.in(call.user).emit('call.added', call);
  });

  var twiml = new twilio.TwimlResponse();
  res.type('text/xml');
  res.send(twiml.toString());
};
