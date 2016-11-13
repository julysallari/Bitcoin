var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Datastore = require('nedb')
var db = new Datastore({ filename: 'database/database', autoload: true });
db.ensureIndex({ fieldName: 'collection', unique: true }, function (err) {});

var index = require('./routes/index');
var users = require('./routes/users');

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

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var nodes;
var dataNodes;
db.findOne({collection:"nodes"}, function (err, data) {
	if (err) {console.log("Find Error " + err);return;}
	if (data) {
		dataNodes = data;
		nodes = _updateNodes();
	} else {
		db.insert({collection:"nodes", nodes: {}}, function (err, data) {
			if (err) {console.log("Insert Error " + err);return;}
			dataNodes = data;
			nodes = _updateNodes();
		});
	}
});

function persistNodes() {
	dataNodes = _updateDataNodes();
	db.update({_id: dataNodes._id},{ $set: {nodes: dataNodes.nodes}}, function () {});
}

function _updateDataNodes() {
	var dataNodes = {_id: nodes._id, collection:"nodes", nodes: {}};
	for (var k in nodes.nodes) {
		dataNodes.nodes[replaceAll(k,'.','_')] = nodes.nodes[k];
	}
	return dataNodes;
}

function _updateNodes() {
	var nodes = {_id: dataNodes._id, collection:"nodes", nodes: {}};
	for (var k in dataNodes.nodes) {
		nodes.nodes[replaceAll(k,'_','.')] = nodes.nodes[k];
	}
	return nodes;
}

function replaceAll(s1, s2, s3) {
	return s1.split(s2).join(s3);
}