const publicIp = require('public-ip');
//getting public ip and print to console
//var pubIp = "";
var Login = "Stan";
var Password = "mypassword";
var pubIp;// = '';
publicIp.v4().then(ip => {
    pubIp = ip;
    sendData();
});


var io = require('socket.io-client');//Local connect: ('http://localhost:3000/'||
var socket = io.connect('https://arcane-citadel-69850.herokuapp.com/', {
    reconnection: true
});
//need to send IP, Login, and password as an object
function sendData(){
    console.log('Connect with server...');
    socket.on('connect', function () {
        //console.log('step2');
        var loginObject = {
            login: Login,
            password: Password,
            ip: pubIp
        };
        console.log('connected to host');
        socket.on('clientEvent', function (data) {//TODO: Need to make this fire when Login and password are entered
            socket.emit('serverEvent', loginObject);
            socket.emit('disconnect', socket.id);
            socket.close();
            console.log('sent data');
        });
    });
}
