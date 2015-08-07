'use strict';

require('../models/record.js');
var Record = require('mongoose').model('Record');
var clarify = require('clarifyio');
var config = require('../config');
var clarifyClient = new clarify.Client("api.clarify.io", config.clarify.API_KEY);
var  _ = require('lodash');

exports.index = function(req, res) {
  var filter = {
    user: req.user
  };
  if (req.query.tag) {
    filter['tags.name'] = req.query.tag;
  }
  Record.find(filter, function(err, records){
    Record.find().distinct('tags.name', function(err, tags){
      res.render('records/index', {records: records, user: req.user, tags: tags});
    });
  });
};

exports.add = function(req, res) {
  Record.create({
    name: req.body.name,
    url: req.body.url,
    addedAt: Date.now(),
    user: req.user
  }, function(err, record){
    var metadata = {
      recordId: record._id
    };
    clarifyClient.createBundle({
      name: record.name,
      media_url: req.body.url,
      notify_url: config.BASE_URL + '/notify',
      external_id: record._id,
      metadata: JSON.stringify(metadata)
    });
    res.redirect('/');
  });
};

exports.update = function(req, res) {
  Record.findById(req.params.id, function(err, record){
    if (record == null) {
      res.status(404).json('Record not found.');
    } else {
      record.name = record.name;
      record.save(function(){
        res.status(200).json('Record has been updated.');
      });
    }
  });
};

exports.remove = function(req, res) {
  Record.findById(req.params.id, function(err, record){
    if (record.bundle_id) {
      clarifyClient.removeBundle(record.bundle_id);
    }
    record.remove(function(){
      res.status(200).json('Record has been removed.')
    });
  });
};

exports.notify = function(req, res) {
  var io = req.app.get('io');

  if ('bundle_processing_cost' in req.body) {
    Record.findById(req.body.external_id, function(err, record){
      record.processing_cost = req.body.bundle_processing_cost;
      io.sockets.in(record.user).emit('record.indexed', record);
      record.save();
    });
  }

  if (req.body.track_id) { // Handle tracks
    var trackData = req.body._embedded['clarify:track'];
    Record.findById(req.body.external_id, function(err, record){
      if (record) {
        record.bundle_id = req.body.bundle_id;
        record.indexedAt = Date.now();
        record.data = JSON.stringify(req.body);
        record.duration = trackData.duration;
        record.save();
      }
    });
  }
  res.sendStatus(200);
};

exports.show = function(req, res) {
  Record.findOne({_id: req.params.id, user: req.user})
    .populate('tags')
    .exec(function(err, record){
      if (err) {
        res.status(404).send('Not found');
      } else{
        console.log(record);
        var tagsString = _.map(record.tags, 'name').join(',');
        res.render('records/show', {record: record, user: req.user, tags: tagsString});
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
        return item._embedded["clarify:metadata"].data.recordId;
      });
    }

    Record.find({"_id": {"$in": ids}, user: req.user}, function(err, data){
      var records = _.transform(data, function(trecords, item){
        trecords[item.id] = item;
      });

      for(var i = 0; i < count; i++) {
        var metadata = result._embedded.items[i]._embedded["clarify:metadata"].data;
        var itemResult = result.item_results[i];
        var media = records[metadata.recordId];
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
      if (m.type === "audio") {
        m.hits.forEach(function (h) {
          h.term = term;
          hits.push(h);
        });
      }
    });
  });
  return hits;
};
