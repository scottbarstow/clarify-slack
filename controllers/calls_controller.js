'use strict';

var clarify = require('clarifyio');
var config = require('../config');
var clarifyClient = new clarify.Client('api.clarify.io', config.clarify.API_KEY);
var  _ = require('lodash');
var Call = require('../models/call');

exports.index = function(req, res) {
  Call.find({user: req.user}, function(err, calls){
    res.render('calls/index', {calls: calls, user: req.user});
  });
};

exports.remove = function(req, res) {
  Call.findById(req.params.id, function(err, call){
    if (call.bundle_id) {
      clarifyClient.removeBundle(call.bundle_id);
    }
    call.remove(function(){
      res.status(200).json('Call has been removed.')
    });
  });
};

exports.show = function(req, res) {
  Call.findOne({_id: req.params.id, user: req.user})
    .exec(function(err, call){
      if (err) {
        res.status(404).send('Not found');
      } else{
        res.render('calls/show', {call: call, user: req.user});
    	}
    });
};

exports.search = function(req, res) {
  var query = req.body.query;
  var searchResult = {
    results: []
  };

  clarifyClient.search({query: query, embed: 'metadata'}, function(err, result){
    var terms = (result.search_terms || []).map(function(t){ return t.term; });
    var count = Math.min(result.total, result.limit);

    var ids = [];
    if (count > 0) {
      ids = result._embedded.items.map(function(item){
        return item._embedded["clarify:metadata"].data.callId;
      });
    }

    Call.find({"_id": {"$in": ids}, user: req.user}, function(err, data){
      var calls = _.transform(data, function(tcalls, item){
        tcalls[item.id] = item;
      });

      for(var i = 0; i < count; i++) {
        var metadata = result._embedded.items[i]._embedded["clarify:metadata"].data;
        var itemResult = result.item_results[i];
        var media = calls[metadata.callId];
        if (media){
          var item = {
            id: media._id,
            mediaUrl: media.url,
            name: media.name,
            score: itemResult.score,
            hits: gatherHits(itemResult, terms),
            duration: media.duration,
            searchTermResults: itemResult.term_results
          };
          searchResult.results.push(item);
        }
      }
      res.status(200).json(searchResult);
    });
  });

};

var gatherHits = function(itemResult, terms) {
  var hits = [];
  (itemResult.term_results || []).forEach(function (tr, i) {
    var term = terms[i] || "";
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
