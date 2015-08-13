var config = require('../config');
var request = require('request');
var twilio = require('twilio');

exports.call = function(req, res) {
    var slackInfo = req.body,
        user = req.user;

    if (slackInfo.text && slackInfo.text.length > 0){
        request.get('https://slack.com/api/users.info', {
            qs: {
                token: user.profile.slackToken,
                user: slackInfo.user_id
            }
        }, function(err, response, body){
            var info = JSON.parse(body),
                u = info.user;

            if (info.ok && u.profile.phone && u.profile.phone.length > 0){
                var client = twilio(user.profile.twilioSid, user.profile.twilioToken);
                client.calls.create({
                    from: u.profile.phone,
                    to: slackInfo.text,
                    method: "POST",
                    statusCallbackMethod: "POST",
                    StatusCallback: config.BASE_URL + "/slack/status",
                    Url: config.BASE_URL + "/slack/accepted",
                    record: "true"
                }, function(err, call) {
                    if (err){
                        return res.status(200).send('Hi ' + slackInfo.user_name + ', we could not get a call: ' + err.message);
                    }

                    console.log(call.sid);
                    res.status(200).send('Hi ' + slackInfo.user_name + ' call sid:' + call.sid);
                });
            } else {
                res.status(200).send('Hi ' + slackInfo.user_name + ', we could get your profile from Slack.');
            }
        });
    } else {
        res.status(200).send('Hi ' + slackInfo.user_name + ', please type a phone number you want to call.');
    }
};

exports.accepted = function(req, res) {
    console.log('ACCEPTED:', req.body);
    var resp = new twilio.TwimlResponse();
    resp.say('Welcome to Clarify Slack!')
      .dial(req.body.From);
    res.type('text/xml');
    res.send(resp.toString());
};


exports.status = function(req, res) {
    console.log('STATUS:', req.body);
    res.send('');
};
