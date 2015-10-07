var request = require('request');
var config = require('../config.js');

function find(name, response) {
    request.get(config.discoveryService+"/discovery/"+name, function (err,res, body) {
        if (err) {
            console.log(err);
            response([]);
        }
        response(JSON.parse(body));
    });
}

module.exports = {
    find: function (name, res) {
        find(name, res);
    },
    findOne: function (name, res) {
        find(name, function (services) {
            if (services.length > 0) {
                res(services[0]);
            } else {
                res(null);
            }
        }); 
    },
    findAny: function (name, res) {
        find(name, function (services) {
            if (services.length > 0) {
                var id = Math.round(Math.random() * (services.length - 1));
                res(services[id]);
            } else {
                res(null);
            }
        }); 
    }
}
