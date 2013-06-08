
/**
 * Module dependencies.
 */

var express = require('express')
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
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
}

var headerMiddleware = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
  res.end();
}

app.all('/*', headerMiddleware);
app.get('/index.html', index.index);

var syncServers = {};

http.createServer(app).listen(5000, function() {
    console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(3333);
io.set('origins', process.env.origin || '*:*');
io.sockets.on('connection', function(socket) {

  socket.emit('doneConnection', { message: 'hello' });

  socket.on('create', function(data) {
    var editorServer = new ot.EditorSocketIOServer("", [], data.codeSessionId);
    syncServers[data.codeSessionId] = editorServer;
    socket.emit('doneCreate', {});
  });

  socket.on('join', function(data) {
    console.log(data);
    if (syncServers[data.codeSessionId]) {
      var editorServer = syncServers[data.codeSessionId];
      editorServer.addClient(socket);
    }
  });
});
