var path = require('path');
var EmailTemplate = require('email-templates').EmailTemplate;

function MailBuilder() {
  function build(templateName, object){
    var templateDir = path.join(__dirname, 'templates', templateName);
    var message = new EmailTemplate(templateDir);
    return message.render(object);
  }

  return {
    build: build
  }
}

module.exports = MailBuilder();