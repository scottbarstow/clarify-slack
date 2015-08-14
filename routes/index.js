'use strict';

var express = require('express');
var router = express.Router();
var config = require('../config');
var records = require('../controllers/records_controller');
var slack = require('../controllers/slack_controller');
var twilio = require('../controllers/twilio_controller');
var users = require('../controllers/user_controller');
var passport = require('passport');
var User = require('../models/user');

var ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/sign_in');
};

var ensureAuthenticatedAjax = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json('User is not authorized.');
};

var authSlackTeam = function (req, res, next) {
  if (req.body.token === config.slack.TOKEN) {
    return next();
  }
  res.status(401).json('Slack Team is not authorized');
};

var authSlackUser = function(req, res, next) {
  User.findOne({'profile.slackUser': req.body.user_name}, function(err, user){
    if (user) {
      req.user = user;
      return next();
    } else {
      res.status(401).json('Slack User is not authorized');
    }
  });
};

router.get('/', ensureAuthenticated, function (req, res) {
  records.index(req, res);
});

router.post('/notify', function (req, res) {
  records.notify(req, res);
});

router.get('/show/:id', ensureAuthenticated, function (req, res) {
  records.show(req, res);
});

router.put('/:id', ensureAuthenticatedAjax, function (req, res) {
  records.update(req, res);
});

router.get('/sign_in', function (req, res) {
  res.render('sign_in', {user: req.user});
});

router.get('/sign_up', function (req, res) {
  res.render('sign_up');
});
router.post('/sign_up', users.signup);

router.post('/sign_in', passport.authenticate('local', {failureRedirect: '/sign_in'}), function (req, res) {
  res.redirect('/');
});

router.get('/sign_out', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/profile', ensureAuthenticated, users.profile);
router.post('/profile', ensureAuthenticated, users.saveProfile);

router.post('/slack/call', authSlackTeam, authSlackUser, function (req, res) {
  slack.call(req, res);
});

router.post('/twilio/status', function (req, res) {
  twilio.status(req, res);
});

router.post('/twilio/accepted', function (req, res) {
  twilio.accepted(req, res);
});

module.exports = router;
