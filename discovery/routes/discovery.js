var express = require('express');
var router = express.Router();
var services = require('../services/handler.js');

router.post('/register', function(req, res, next) {
    if (!req.body.type || !req.body.name || !req.body.heartbeat) {
        res.status(400).send('Expected format: {"type": "service type", "name": "service name", "heartbeat": "Full GET url responding with HTTP 200 OK. As an example: http://192.168.0.3:3031/heartbeat"}');
        return;
    }
    services.register(req.body);
    res.status(200).send({});
});

module.exports = router;
