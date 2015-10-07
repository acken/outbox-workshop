var express = require('express');
var router = express.Router();
var services = require('../services/handler.js');

router.post('/register', function(req, res) {
    if (!req.body.type || !req.body.name || !req.body.heartbeat || !req.body.url) {
        res.status(400).send('Expected format: {"type": "service type", "name": "service name", "heartbeat": "Full GET url responding with HTTP 200 OK. As an example: http://192.168.0.3:3031/heartbeat"}');
        return;
    }
    services.register(req.body);
    res.status(200).send({});
});

router.get('/:name', function(req, res) {
    res.status(200).send(services.getByName(req.params.name));
});

router.post('/report', function (req, res) {
    if (!req.body.type || req.body.url === undefined || !req.body.reason) {
        res.status(400).send('Expected format: {"type": "service type", "url": "service url", "reason": "what is wrong with it"}');
    }
    services.report(req.body);
});

module.exports = router;
