var express = require('express');
var router = express.Router();
var services = require('../services/handler.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Service Discovery', alive: services.get(), failing: services.getFailing() });
});

module.exports = router;
