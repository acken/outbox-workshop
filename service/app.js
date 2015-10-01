var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

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
    tasksProcessedCount++;
    res.send({tasksProcessed: tasksProcessedCount});
})

///////////////////////////////////////
// Routes goes here

app.get('/:name', function (req, res) {
    res.send({greeting: "hello " + req.params.name});
});

// Queue service
var items = [];
app.post('/items', function (req, res) {
    items.push(req.body);
};
app.get('/items/pop', function (req, res) {
    res.status(200).send(items.pop());
});

// Sms receiver - calls next service directly
var request = require('request');
app.post('/sms', function (req, res) {
    if (!req.body.sender || !req.body.message) {
        res.status(406).send('Requires {"sender": "phone number", "message": "text message"}');
        return;
    }
    var receiver = "http://localhost:3031/items";
    var body = { form: req.body };
    console.log(body);
    request.post(receiver, body, function (err, response, body) {
        if (err || response.statusCode != 200) { 
            res.status(500).send(err);
            return;
        }
        res.status(200).send({});
    });
})

// Sms handler
app.post('/weather/sms', function (req, res) {
    console.log(req.body);
    if (!req.body.sender || !req.body.message) {
        res.status(406).send('Requires {"sender": "phone number", "message": "text message"}');
        return;
    }
    var receiver = "http://localhost:3031/weather/kampala";
    request.get(receiver, function (err, response, body) {
        if (err || response.statusCode != 200) { 
            res.status(500).send(err);
            return;
        }
        res.status(200).send(body);
    });
});

// Weather service
app.get('/weather:city', function (req, res) {
    if (req.params.city === 'kampala') {
        res.status(200).send({temperature: 28});
    } else {
        res.sendStatus(404);
    }
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
