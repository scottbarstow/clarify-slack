'use strict';

var mongoose = require('mongoose');
var crypto = require('crypto');

var User = new mongoose.Schema({
  username: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    default: ''
  },
  salt: {
    type: String
  },
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin']
    }],
    default: ['user']
  }
});

User.pre('save', function(next) {
  if (this.password) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

User.methods.hashPassword = function(password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
  } else {
    return password;
  }
};

User.methods.authenticate = function(password) {
  return this.password === this.hashPassword(password);
};

module.exports = mongoose.model('User', User);
