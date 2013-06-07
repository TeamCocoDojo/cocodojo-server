
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , codeSession = require('./routes/code_session')
  , index = require("./routes/index")
  , http = require('http')
  , path = require('path')
  , io = require("socket.io");

var ot = require("ot");

var app = express();

// all environments
app.set('port', process.env.PORT || 3333);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var headerMiddleware = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
  res.end();
}

app.all('/*', headerMiddleware);


//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});

var editorServer = null;
var io = require('socket.io').listen(app.get("port"));
io.sockets.on('connection', function (socket) {

  socket.emit('doneConnection', { message: 'hello' });

  socket.on('create', function(data) {
    console.log("############### On Create");
    console.log(data);
    editorServer = new ot.EditorSocketIOServer("", [], data.codeSessionId);
    io.sockets.emit('doneCreate', "");
  });

  socket.on('join', function(data) {
    console.log("@@@@@@@@@@@@@@@ On Join");
    console.log(editorServer.docId);
    editorServer.addClient(socket);
  });
});