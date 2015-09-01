'use strict';

var User = require('../models/user');

exports.signup = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var repeatPassword = req.body.repeatPassword;

  User.find({username: username}, function (err, user) {
    if (user.length > 0) {
      req.flash('error', 'User with same username already exists.');
      res.redirect('/sign_up');
    } else {
      if (password !== repeatPassword) {
        req.flash('error', 'Passwords don\'t match.');
        res.redirect('/sign_up');
      } else {
        User.create({
          username: username,
          password: password
        }, function () {
          req.flash('success', 'Use your username and password to sign in.');
          res.redirect('/sign_in');
        });
      }
    }
  });
};

exports.profile = function (req, res) {
  res.render('profile', {
    user: req.user,
    profile: req.user.profile
  });
};

exports.saveProfile = function (req, res) {
  User.findById(req.body.userId, function (err, user) {
    if (!err) {
      user.profile.slackUser = req.body.slackUser;
      user.profile.slackToken = req.body.slackToken;
      user.save();
      res.render('profile', {
        user: user,
        profile: user.profile
      });
    } else {
      res.render('profile', {
        user: req.user,
        profile: req.user.profile
      });
    }
  });
};