'use strict';

var mongoose = require('mongoose');

var Record = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
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
  addedAt: {
    type: Date
  },
  indexedAt: {
    type: Date
  },
  tags: [{
    name:{
      type: String,
      trim: true
    }
  }],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Record', Record);
