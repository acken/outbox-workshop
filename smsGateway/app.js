var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var discovery = require('./discovery/locator.js');

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

var request = require('request');
app.post('/sms', function (req, res) {
    if (!req.body.sender || !req.body.message) {
        res.status(406).send('Requires {"sender": "phone number", "message": "text message"}');
        return;
    }
    discovery.findOne("queue", function (url) {
        if (url !== null) {
            var receiver = url+"/items";
            var body = { form: req.body };
            request.post(receiver, body, function (err, response, body) {
                if (err || response.statusCode != 200) { 
                    res.status(500).send(err);
                    return;
                }
                tasksProcessedCount++;
                res.status(200).send({});
            });
        } else {
            console.log('queues are down!!!');
            res.status(500).send('queues are down!!!');
        }
    }); 
});

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
