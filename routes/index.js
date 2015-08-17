'use strict';

var express = require('express');
var router = express.Router();
var config = require('../config');
var calls = require('../controllers/calls_controller');
var slack = require('../controllers/slack_controller');
var twilio = require('../controllers/twilio_controller');
var clarify = require('../controllers/clarify_controller');
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
  calls.index(req, res);
});

router.post('/clarify/notify', function (req, res) {
  clarify.notify(req, res);
});

router.get('/calls/show/:id', ensureAuthenticated, function (req, res) {
  calls.show(req, res);
});

router.put('/calls/:id', ensureAuthenticatedAjax, function (req, res) {
  calls.update(req, res);
});

router.delete('/calls/:id', ensureAuthenticatedAjax, function(req, res){
  calls.remove(req, res);
});

router.post('/search', ensureAuthenticated, function(req, res){
  calls.search(req, res);
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

router.post('/twilio/call/status', function (req, res) {
  twilio.callStatus(req, res);
});

router.post('/twilio/dial/status', function (req, res) {
  twilio.dialStatus(req, res);
});

router.post('/twilio/call/accepted', function (req, res) {
  twilio.callAccepted(req, res);
});

module.exports = router;
