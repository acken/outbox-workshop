var request = require('request');

var weatherServer = "http://localhost:3031";
var queueServer = "http://localhost:3031";

function handleItem(item) {
    request.get(weatherServer+"/weather/"+item.message, function (err, response, body) {
        if (err || response.statusCode != 200) { 
            return;
        }
        var temperature = JSON.parse(body).temperature;
        var response = {form: {sender: item.sender, temperature: temperature}};
        request.post(queueServer+'/answers', response, function (err, response, body) {
            console.log('telling '+item.sender+' that temperature is '+temperature);
        });
    });
}

function serve () {
    request.get(queueServer+"/items/pop", function (err, response, body) {
        if (err || response.statusCode != 200 || !body) { 
            setTimeout(function () { serve(); }, 1000);
        } else {
            handleItem(JSON.parse(body));
            setTimeout(function () { serve(); }, 0);
        }
    });
}

serve();

