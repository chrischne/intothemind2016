var osc = require('node-osc');
var express = require('express');

var sendingPort = 8081;
var listeningPort = 3333;

var app = express();
var server = app.listen(sendingPort);

console.log('forwarding messages to socket.io on http://127.0.0.1:'+ sendingPort);

var socket = require('socket.io');
var io = socket(server);



var oscServer, oscClient;

//this is where we are listening for OSC messages
console.log('listening to OSC messages on 127.0.0.1:'+ listeningPort);
 oscServer = new osc.Server(listeningPort, '127.0.0.1');

  oscServer.on('message', function(msg, rinfo) {
    //  console.log(msg, rinfo);
    console.log(msg[0]);
      io.sockets.emit("muse", msg);
    });

io.sockets.on('connection', function (socket) {
  console.log('connection: ' + socket.id);

});

