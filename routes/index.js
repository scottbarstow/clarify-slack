'use strict';

var express = require('express');
var router = express.Router();
var User = require('../models/user');
var records = require('../controllers/records_controller');
var slack = require('../controllers/slack_controller');
var users = require('../controllers/user_controller');
var passport = require('passport');
var config = require('../config');

var ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/sign_in');
};

var ensureAuthenticatedAjax = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.status(401).json('User is not authorized.');
};

var authSlackTeam = function(req, res, next) {
    User.find({'profile.slackUser': req.body.user_name}, function(err, users){
        if(!err && users.length == 1){
            req.user = users[0];
            return next();
        } else {
            res.status(401).json('Slack Team is not authorized');
        }
    });
};

router.get('/', ensureAuthenticated, function(req, res){
  records.index(req, res);
});

router.post('/search', ensureAuthenticated, function(req, res){
  records.search(req, res);
});

router.get('/search', ensureAuthenticated, function(req, res){
  res.render('records/search', {user: req.user})
});

router.delete('/:id', ensureAuthenticatedAjax, function(req, res){
  records.remove(req, res);
});

router.delete('/record/:recordId/tags/:name', ensureAuthenticatedAjax, function(req, res){
  tags.remove(req, res);
});

router.post('/notify', function(req, res){
  records.notify(req, res);
});

router.get('/show/:id', ensureAuthenticated, function(req, res){
  records.show(req, res);
});

router.put('/:id', ensureAuthenticatedAjax, function(req, res){
  records.update(req, res);
});

router.get('/sign_in', function(req, res){
  res.render('sign_in', { user: req.user });
});

router.get('/sign_up', function(req, res){
    res.render('sign_up');
});
router.post('/sign_up', users.signup);

router.get('/profile', ensureAuthenticated, users.profile);
router.post('/profile', ensureAuthenticated, users.saveProfile);

router.post('/sign_in', passport.authenticate('local', { failureRedirect: '/sign_in'}), function(req, res){
  res.redirect('/');
});

router.get('/sign_out', function(req, res){
  req.logout();
  res.redirect('/');
});

router.post('/slack/call', authSlackTeam, function(req, res){
    console.log(req.body);
    slack.call(req, res);
});

router.post('/slack/status', function(req, res){
    slack.status(req, res);
});

router.post('/slack/accepted', function(req, res){
    slack.accepted(req, res);
});

module.exports = router;
