var request = require('request');
var discovery = require('discovery/locator.js');
var config = require('config.js');

var weatherServer = "http://localhost:3031";
var queueServer = "http://localhost:3031";

function handleItem(item) {
    discovery.findAny("weather", function (weatherUrl) {
        if (weatherUrl === null) {
            console.log('no weather services available!!!');
            return;
        }
        discovery.findOne("queue", function (queueUrl) {
            if (queueUrl === null) {
                console.log('queue service is gone!!!');
                return;
            }
            request.get(url+"/weather/"+item.message, function (err, response, body) {
                if (err || response.statusCode != 200) { 
                    return;
                }
                var temperature = JSON.parse(body).temperature;
                var response = {form: {sender: item.sender, temperature: temperature}};
                request.post(queueUrl+'/answers', response, function (err, response, body) {
                    console.log('telling '+item.sender+' that temperature is '+temperature);
                });
            });
        });
    });
    
}

function serve () {
    discovery.findOne("queue", function (queueUrl) {
        if (queueUrl === null) {
            console.log('queue service is gone!!!');
            return;
        }
        request.get(queueServer+"/items/pop", function (err, response, body) {
            if (err || response.statusCode != 200 || !body) { 
                setTimeout(function () { serve(); }, 1000);
            } else {
                handleItem(JSON.parse(body));
                setTimeout(function () { serve(); }, 0);
            }
        });
    });
}

var service = {
    form: {
        type: config.serviceType,
        name: config.serviceName,
        heartbeat: "http://"+ip.address()+":"+addr.port+"/heartbeat",
        url: "http://"+ip.address()+":"+addr.port
    }
};
var target = "http://"+config.discoveryService+":3032/discovery/register"
request.post(target, service, function (err, res, body) {
});

serve();

