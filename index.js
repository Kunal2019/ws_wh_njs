'use strict';
const express = require('express');
const PORT = process.env.PORT || 4001;
const server = express();
const bodyParser = require("body-parser");
const expressWs = require('express-ws')(server);

const {
  conversation,
} = require('@assistant/conversation');

// Create an app instance
const app = conversation();

var g_query = '';
var g_resp = '';
var last_updated = '';
var d = new Date();
var epoch_time = '';
var cur_time = '';
var socket_timeout = 15 * 1000;

var ws_client = [];


const path = require('path');
const INDEX = path.join(__dirname, 'index.html');

server.use(
    bodyParser.urlencoded({
        extended: true
    })
);

server.use(bodyParser.json());


server.ws('/', function (ws, req) {
    ws.on('connect', () => console.log('client connected'));
    last_updated = new Date().getTime();
    ws_client.push(ws);
    ws.on('message', function (msg) {
        last_updated = new Date().getTime();
        ws.send(myfunction(null, msg));
        console.log('g_resp: ' + g_resp + ' ' + epoch_time);
    });
    ws.on('close', () => { console.log('client Disconnected'); ws_client.pop(ws); });


    setInterval(function () { if (ws_client != 0) { check_ws(ws) }; }, 1000);

    setInterval(function () {
        if (g_query == '?') { ws.send("?"); g_query = null; }
        else if (g_query == 'CMD:on' || g_query == 'CMD:off') { ws.send(g_query); g_query = null; }
        else if (g_query == 'CMD:temp' || g_query == 'CMD:temperature') { ws.send(g_query); g_query = null; }
    }, 1000);
});

function check_ws(ws) {
    cur_time = new Date().getTime();
    // console.log('cur_time' + cur_time) ;
    // console.log('epoch_time' + epoch_time) ;
    epoch_time = parseInt(last_updated) + socket_timeout;
    if (cur_time > epoch_time) { ws.close() }
}

function myfunction(query, resp) {
    if (resp != null) { g_resp = resp; }
    console.log('myfunction_resp: ' + g_resp);
    if (query != null) { g_query = query; }
    console.log('myfunction_query: ' + g_query);
    if (resp == '"heartbeat":"keepalive"') { return 'server: ok'; }
    else if (resp == '"astate":"ON"' || resp == '"astate":"OFF"') { return 'aack'; }
    else if (resp == '"qstate":"ON"' || resp == '"qstate":"OFF"') { return 'qack'; }
    else if (resp == '"cstate":"ON"' || resp == '"cstate":"OFF"') { return 'cack'; }
    else { return 'server: command not recognised' }
};

server.post("/webhook", function (req, res) {
    console.log('echo');
  app.handle('Simple', conv => {
  conv.add(new Simple({
    speech: 'This is the first simple response.',
    text: 'This is the 1st simple response.'
  }));
    });

    
 }); 
server.use((req, res) => res.sendFile(INDEX)).listen(PORT, () => console.log(`webhook Listening on ${PORT}`))
