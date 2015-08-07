'use strict';

var mongoose = require('mongoose');

var State = new mongoose.Schema({
  name: {
    type: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  content: {
    type: String
  } 
});

module.exports = mongoose.model('State', State);
