var express = require('express');
var router = express.Router();
var services = require('../services/handler.js');
var ip = require('ip');

module.exports = function (app) {
    /* GET home page. */
    router.get('/', function(req, res, next) {
      var address = "http://"+ip.address()+":"+app.get('port');
      res.render('index', {
          title: 'Service Discovery',
          url: address,
          alive: services.get(),
          failing: services.getFailing()
      });
    });
    return router;
};
