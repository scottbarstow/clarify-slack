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
  }
});

module.exports = mongoose.model('Call', Call);
