var nodemailer = require('nodemailer');
var config = require('../config');
var smtpTransport = require('nodemailer-smtp-transport');

function Mailer() {
  var transport = nodemailer.createTransport(smtpTransport({
    host: config.SMTP_SERVER,
    port: 25,
    auth: {
      user: config.SMTP_LOGIN,
      pass: config.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  }));

  function send(subject, content, to, from) {
    return transport.sendMail({
      from: from || 'Clarify Slack <clarify.slack@rockethangar.com>',
      to: to,
      subject: subject,
      html: content.html,
      text: content.text
    });
  }

  return {
    send: send
  }
}

module.exports = Mailer();