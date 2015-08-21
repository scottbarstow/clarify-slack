var config = require('../config');
var request = require('request');
var twilio = require('twilio');
var clarify = require('clarifyio');
var twilioClient = twilio(config.twilio.ACCOUNT_SID, config.twilio.AUTH_TOKEN);
var clarifyClient = new clarify.Client('api.clarify.io', config.clarify.API_KEY);
var Call = require('../models/call');
var _ = require('lodash');

exports.command = function (req, res) {
  var slackInfo = req.body;
  var user = req.user;

  if (slackInfo.text && slackInfo.text.length > 0) {
    var command = slackInfo.text.split(' ')[0],
      param = slackInfo.text.split(' ')[1];

    switch (command) {
      case "call":
        return call(param, req, res);
      case "search":
        return search(param, req, res);
      case "transcribe":
        return transcribe(param, req, res);
      case "index":
        return index(param, req, res);
    }
  } else {
    res.status(400).send("I'm sorry, I don't understand what you're after. Try call or search");
  }
};

function call(number, req, res) {
  var slackInfo = req.body;
  var user = req.user;
  var io = req.app.get('io');

  request.get('https://slack.com/api/users.list', {
    qs: {
      token: user.profile.slackToken
    }
  }, function (err, response, body) {
    var info = JSON.parse(body);
    var originatingSlackUser;
    if(info.ok){
      var members = info.members;
      originatingSlackUser = members.filter(function(u){return  u.name === slackInfo.user_name})[0];
      // are we trying to call another slack user?
      if(number.indexOf("@") > -1 ){
        destinationSlackUser = members.filter(function(u){return u.name === number.substring(1).trim()})[0];
        if(destinationSlackUser.profile && destinationSlackUser.profile.phone){
          number = destinationSlackUser.profile.phone;
        }
      }
    }
    var u = originatingSlackUser;

    if (info.ok && u.profile.phone && u.profile.phone.length > 0) {
      twilioClient.calls.create({
        from: config.twilio.PHONE,
        to: u.profile.phone,
        method: "POST",
        statusCallbackMethod: "POST",
        StatusCallback: config.BASE_URL + "/twilio/call/status",
        Url: config.BASE_URL + "/twilio/call/accepted"
      }, function (err, call) {
        if (err) {
          return res.status(200).send(slackInfo.user_name + ', we could not get a call: ' + err.message);
        }
        Call.create({
          from: u.profile.phone,
          to: number,
          date: Date.now(),
          twilio_sid: call.sid,
          slack_channel_id: slackInfo.channel_id,
          user: user
        });
        res.status(200).send('Call has started');
      });
    } else {
      res.status(400).send(slackInfo.user_name + ', we could not get your profile from Slack.');
    }
  });
}

function search(query, req, res) {
  var slackInfo = req.body,
    user = req.user;

  if (slackInfo.text && slackInfo.text.length > 0) {
    clarifyClient.search({query: query, embed: 'metadata'}, function (err, res) {
      if (err) {
        return res.status(400).send("We couldn't perform a search. Please try again later.");
      }

      var msg = '*Your search term was found in the following: *\n';
      _.each(res._embedded.items, function (item, i) {
        if (item.external_id) {
          msg += '* <' + config.BASE_URL + '/view/' + item.id + '/' + query + '|Call to ' + item.name + '>';
        } else {
          msg += '* <' + config.BASE_URL + '/view/' + item.id + '/' + query + '|Indexed URL>';
        }

        var second = res.item_results[i].term_results[0].matches[0].hits[0].start;
        msg += ' at ' + second + ' seconds \n';
      });

      notifySlack(msg, user.profile.slackToken, slackInfo.channel_id);
    });
  } else {
    notifySlack(slackInfo.user_name + ', please type a search criteria.', user.profile.slackToken, slackInfo.channel_id);
  }

  res.status(200).send();
}

function transcribe(param, req, res) {
  var options = {
    url: 'https://api.clarify.io/v1/bundles/' + param + '/insights',
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + config.clarify.API_KEY
    },
    form: {
      insight: 'transcript_r9',
      notify_url: config.BASE_URL + '/clarify/notify/transcribe'
    }
  };
  request(options, function(err, res, body){
    if (err) {
      console.log(err);
    } else {
      console.log(body);
    }
  });
}

function index(url, req, res) {
  var slackInfo = req.body;
  var user = req.user;

  clarifyClient.createBundle({
    name: 'Provided URL',
    media_url: url,
    notify_url: config.BASE_URL + '/clarify/indexNotify',
    metadata: JSON.stringify({
      token: user.profile.slackToken,
      channel: slackInfo.channel_id
    })
  }, function (err, data) {
  });

  res.status(200).send('Clarify is indexing provided URL. You will be notified the contents are searchable.');
}

var notifySlack = function (msg, token, channel) {
  request.get('https://slack.com/api/chat.postMessage', {
    qs: {
      token: token,
      channel: channel,
      text: msg,
      username: 'Clarifyer'
    }
  });
};