require('../models/user');
var config = require('../config');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(){
  var done = this.async();
  mongoose.connection.on('open', function(){
    User.findOne({username: 'admin'}, function(err, user){
      if (user == null) {
        User.create({
          username: 'admin',
          password: 'admin',
          roles: ['admin']
        }, function(){
          done(true);
        });
      } else {
        done(true);
      }
    });
  });
  mongoose.connect(config.mongodb.URI);
};
