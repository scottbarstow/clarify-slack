'use strict';

var config = require('../config');
var request = require('request');
var Call = require('../models/call');
var clarify = require('clarifyio');
var clarifyClient = new clarify.Client('api.clarify.io', config.clarify.API_KEY);

var notifySlack = function(msg, token, channel) {
  request.get('https://slack.com/api/chat.postMessage', { 
    qs: {
      token: token,
      channel: channel,
      text: msg,
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
          notifySlack('Your Call from ' + call.from + ' to ' + call.to + ' has been indexed and is ready for search. Type /clarifyer search to search the audio.',
              call.user.profile.slackToken, call.slack_channel_id);
        }
      });
  }
  res.sendStatus(200);
};

exports.indexNotify = function(req, res) {
    if (typeof req.body.bundle_processing_cost !== "undefined") {
        clarifyClient.getMetadata(req.body.bundle_id, function (err, result) {
            console.log(result);
            if (!err){
                notifySlack("Your call audio has been indexed. You can now search", result.data.token, result.data.channel);
            }
        });
    }

    res.sendStatus(200);
};