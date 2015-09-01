'use strict';

var config = require('../config');
var request = require('request');
var Call = require('../models/call');
var _ = require('lodash');
var clarify = require('clarifyio');
var clarifyClient = new clarify.Client('api.clarify.io', config.clarify.API_KEY);
var mailBuilder = require('../mailer/mail-builder');
var mailer = require('../mailer/mailer');

exports.notifyCall = function (req, res) {
  console.log("CLARIFY:", req.body)
  if('insight' in req.body && req.body.insight === 'transcript_r9'){
    console.log("got insight");
    handleTranscription(req,res);
  }
  else {
    handleCall(req, function(call){
      notifySlack('Your Call ' + call.bundle_id + ' from ' + call.from + ' to ' + call.to + ' has been indexed and is ready for search. Type /clarifyer search to search the audio.',
          call.user.profile.slackToken,
          call.slack_channel_id);
    });
    res.sendStatus(200);
  }
};

exports.notifyMedia = function (req, res) {
  handleCall(req, function(call){
    notifySlack('Your audio ' + req.body.bundle_id + ' has been indexed. You can now search',
        call.user.profile.slackToken,
        call.slack_channel_id);
  });

  res.sendStatus(200);
};

exports.view = function (req, response) {
  var bundleId = req.params.bundleId,
    query = req.query.q;

  clarifyClient.search({query: query, embed: 'metadata', limit: 20}, function (err, res) {
    if (!err) {
      var bundle = _.first(_.where(res._embedded.items, {id: bundleId}));
      if (bundle) {
        var terms = (res.search_terms || []).map(function (t) {
          return t.term;
        });

        var index = res._embedded.items.indexOf(bundle);
        var itemResult = res.item_results[index];
        var hits = gatherHits(itemResult, terms);

        clarifyClient.getTracks(bundleId, function (err, res) {
          response.status(200).render('view', {
            user: req.user,
            model: {
              name: res.tracks[0].media_url,
              mediaUrl: res.tracks[0].media_url,
              bundleId: bundleId,
              duration: res.tracks[0].duration,
              created: res.tracks[0].created,
              hits: hits
            }
          });
        })
      }
    }
  });
};

var gatherHits = function (itemResult, terms) {
  var hits = [];
  (itemResult.term_results || []).forEach(function (tr, i) {
    var term = terms[i] || '';
    var matches = tr.matches || [];
    matches.forEach(function (m) {
      if (m.type === 'audio') {
        m.hits.forEach(function (h) {
          h.term = term;
          hits.push(h);
        });
      }
    });
  });
  return hits;
};

var handleCall = function(req, callback){
  var io = req.app.get('io');

  if ('bundle_processing_cost' in req.body) {
    Call.findById(req.body.external_id, function (err, call) {
      call.processing_cost = req.body.bundle_processing_cost;
      io.sockets.in(call.user).emit('call.indexed', call);
      call.save();
    });
  }

  if (req.body.track_id) {
    var trackData = req.body._embedded['clarify:track'];
    Call.findById(req.body.external_id)
        .populate('user profile')
        .exec(function (err, call) {
          if (call) {
            call.bundle_id = req.body.bundle_id;
            call.indexedAt = Date.now();
            call.data = JSON.stringify(req.body);
            call.duration = trackData.duration;
            call.save();
            callback(call);
          }
        });
  }
};

var handleTranscription = function (req, res) {
  Call.findOne({bundle_id: req.body.bundle_id}, function(err, call){
    if (call) {
      var conversation = req.body.segments.map(function(segment){
        var terms = segment.terms.map(function(item){
          return item.term;
        });
        return segment.speaker + ': ' + terms.join(' ');
      });

      var data = {
        conversation: conversation,
        user: call.user
      };
      mailBuilder.build('transcribe', data, function(content){
        var tempEmail = 'vova.kalinkin@gmail.com';
        mailer.send('Your transcription is ready', content, tempEmail);
      });
    }
  });
  res.sendStatus(200);
};

var notifySlack = function (msg, token, channel) {
  request.get('https://slack.com/api/chat.postMessage', {
    qs: {
      token: token,
      channel: channel,
      text: msg,
      username: 'Clarifyer'
    }
  });
};
