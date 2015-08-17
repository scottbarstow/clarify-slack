'use strict';

var mongoose = require('mongoose');

var Call = new mongoose.Schema({
  from: {
    type: String
  },
  to: {
    type: String
  },
  twilio_sid: {
    type: String
  },
  slack_channel_id: {
    type: String
  },
  url: {
    type: String
  },
  data: {
    type: String
  },
  duration: {
    type: Number,
    default: 0,
    get: function(value){
      return value.toHHMMSS();
    }
  },
  processing_cost: {
    type: Number,
    get: function(value) {
      return '$' + value;
    }
  },
  bundle_id: {
    type: String
  },
  date: {
    type: Date
  },
  indexedAt: {
    type: Date
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Call', Call);
