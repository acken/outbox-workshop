var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var discovery = require('./discovery/locator.js');

var tasksProcessedCount = 0;
var backlog = 0;
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
    res.send({tasksProcessed: tasksProcessedCount, backlog: backlog});
})

///////////////////////////////////////
// Routes goes here

var items = [];
app.post('/items', function (req, res) {
    items.push(req.body);
    res.status(200).send({});
    backlog++;
});
app.get('/items/pop', function (req, res) {
    if (items.length > 0) {
        backlog--;
    }
    res.status(200).send(items.pop()); 
});
app.post('/answers', function (req, res) {
    console.log('telling '+req.body.sender+' that temperature is '+req.body.temperature);
    tasksProcessedCount++;
    res.status(200).send({});
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
