var path = require('path');
var EmailTemplate = require('email-templates').EmailTemplate;

function MailBuilder() {
  function build(templateName, object, callback){
    var templateDir = path.join(__dirname, 'templates', templateName);
    var message = new EmailTemplate(templateDir);
    return message.render(object, callback);
  }

  return {
    build: build
  }
}

module.exports = MailBuilder();