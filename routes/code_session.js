/**
 * Created with JetBrains WebStorm.
 * User: xiaoxiao
 * Date: 6/6/13
 * Time: 10:59 AM
 * To change this template use File | Settings | File Templates.
 */

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var ot = require("ot");
var docs = {};
var codeSessions = {};

var cocodojoDB = function(host, port) {
  this.db= new Db('cocodojo', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

cocodojoDB.prototype.getCollection= function(callback) {
  this.db.collection('codeSession', function(error, codeSessionCollection) {
    if(error) {
      callback(error);
    }
    else {
      callback(null, codeSessionCollection);
    }
  });
};

cocodojoDB.prototype.updateOperation = function(codeSessionId, operation, callback) {
  this.getCollection(function(error, codeSessionCollection) {
    if (error) {
      callback(error);
    }
    else {
      console.log("code session id= " + codeSessionId);
      console.log("operations= " + operation);
      console.log(codeSessionCollection);
      codeSessionCollection.update(
        {_id: codeSessionCollection.db.bson_serializer.ObjectID.createFromHexString(codeSessionId)},
        {"$push": {operations: operation}},
        function(error, codeSessionId){
          if (error) {
            console.log("xxxxx");
            callback(error);
          }
          else {
            callback(null, codeSessionId);
          }
        });
    }
  });
};

var cocodojoDBObj = new cocodojoDB('ec2-54-215-138-196.us-west-1.compute.amazonaws.com', 27017);


var doc = function(codeSessionId){
  this.codeSessionId = codeSessionId;
  this.server = new ot.Server("");
};

doc.prototype.receive = function(data) {
  console.log(data.operation + " before convert");

  var operation = this.server.receiveOperation(data.revision, data.operation);
  cocodojoDBObj.updateOperation(this.codeSessionId, operation, function() {

  });
}

exports.sync = function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

  var codeSessionId = req.params.codeSessionId;
  var revision = req.body.revision;
  var operation = ot.TextOperation.fromJSON(JSON.parse(req.body.operation));
  console.log(revision);
  console.log("first time " + operation);
  docs[codeSessionId].receive({
    revision: revision,
    operation: operation
  });
  res.end();
};

exports.create = function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  var codeSessionId = req.params.codeSessionId;
  var newDoc = new doc(codeSessionId);
  docs[codeSessionId] = newDoc;
  res.end();
};

exports.destroy = function(req, res) {
  var codeSessionId = req.params.codeSessionId;
  docs.delete(codeSessionId);
  res.end();
};