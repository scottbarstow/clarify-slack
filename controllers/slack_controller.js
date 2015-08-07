'use strict';

exports.test = function(req, res) {
  console.log(req.body);
  res.sendStatus(200);
}


