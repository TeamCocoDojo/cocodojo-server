
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , codeSession = require('./routes/code_session')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
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

app.all('/:codeSessionId/create', codeSession.create);
app.all('/:codeSessionId/sync', codeSession.sync);
app.all('/:codeSessionId/destroy', codeSession.destroy);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
