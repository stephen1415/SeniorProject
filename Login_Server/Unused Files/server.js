const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
//Makes index.js and index.html accessable
app.use(express.static(publicPath));
//Displays when a user is connected
io.on('connection', (socket)=>{
    console.log('New user connected');
});
//Shows when server is up
server.listen(port,()=>{
    console.log(`Server up on port: ${port}`);
});