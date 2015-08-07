'use strict';

exports.test = function(req, res) {
  res.status(200).send('Hi ' + req.body.user_name);
};
