var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var discovery = require('./discovery/locator.js');
var request = require('request');

var tasksStarted = 0;
var tasksProcessedCount = 0;
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/heartbeat', function (req, res) {
    res.send({tasksProcessed: tasksProcessedCount});
})

///////////////////////////////////////
// Routes goes here

function handleItem(url, queueUrl, item) {
    request.get(url+"/weather/"+item.message, function (err, response, body) {
        if (err || response.statusCode != 200) { 
            tasksStarted--;
            discovery.report('weather', url, err);
            console.log('At this point we are just stealing peoples money');
            return;
        }
        var temperature = JSON.parse(body).temperature;
        var response = {form: {sender: item.sender, temperature: temperature}};
        request.post(queueUrl+'/answers', response, function (err, response, body) {
            tasksProcessedCount++;
            tasksStarted--;
            console.log('telling '+item.sender+' that temperature is '+temperature);
        });
    });
}

function serve () {
    if (tasksStarted > 30) {
        setTimeout(function () { serve(); }, 100);
        return;
    }
    discovery.findOne("queue", function (queueUrl) {
        if (queueUrl === null) {
            console.log('queue service is gone!!!');
            setTimeout(function () { serve(); }, 1000);
            return;
        }
        discovery.findAny("weather", function (weatherUrl) {
            if (weatherUrl === null) {
                console.log('no weather services available!!!');
                setTimeout(function () { serve(); }, 1000);
                return;
            }
            request.get(queueUrl+"/items/pop", function (err, response, body) {
                if (err || response.statusCode != 200 || !body) { 
                    if (err) {
                        discovery.report('queue', queueUrl, err);
                    }
                    setTimeout(function () { serve(); }, 100);
                } else {
                    tasksStarted++;
                    handleItem(weatherUrl, queueUrl, JSON.parse(body));
                    // Simulate 100ms 
                    setTimeout(function () { serve(); }, 100);
                }
            });
        });
    });
}

setTimeout(serve, 1000);;

//////////////////////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
