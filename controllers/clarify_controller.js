'use strict';

var request = require('request');
var Call = require('../models/call');

var notifySlack = function(call) {
  request.get('https://slack.com/api/chat.postMessage', { 
    qs: {
      token: call.user.profile.slackToken,
      channel: call.slack_channel_id,
      text: 'Your Call from ' + call.from + ' to ' + call.to + ' has been indexed and is ready for search. Type /clarifyer search to search the audio.',
      username: 'Clarifyer'
    }
  });
};

exports.notify = function(req, res) {
  var io = req.app.get('io');

  if ('bundle_processing_cost' in req.body) {
    Call.findById(req.body.external_id, function(err, call){
      call.processing_cost = req.body.bundle_processing_cost;
      io.sockets.in(call.user).emit('call.indexed', call);
      call.save();
    });
  }

  if (req.body.track_id) {
    var trackData = req.body._embedded['clarify:track'];
    Call.findById(req.body.external_id)
      .populate('user profile')
      .exec(function(err, call){
        if (call) {
          call.bundle_id = req.body.bundle_id;
          call.indexedAt = Date.now();
          call.data = JSON.stringify(req.body);
          call.duration = trackData.duration;        
          call.save();
          notifySlack(call);
        }
      });
  }
  res.sendStatus(200);
};
