const MongoClient = require('mongodb').MongoClient;
const port = process.env.PORT || 3000;//sets up port for either heroku port or local host port 3000
var io = require('socket.io').listen(port);
console.log(`listening on port ${port}`);
var myLogin;
var myPassword;
var myIP;
io.on('connection', function (socket) {
    console.log('connected:', socket.client.id);
    pingClient();
    socket.on('serverEvent', function (data) {
        console.log('new message from client:', data);
        myLogin = data.login;
        myPassword = data.password;
        myIP = data.ip;
        sendData();
    });
   function pingClient() {
        socket.emit('clientEvent', 'passed');
        console.log('Ping client');
    }
});
//TO CHECK REMOTE LOGS ENTER: heroku logs IN COMMAND LINE

//Insert record into database
//need to run local database to test
//TODO: Works locally but not on Heroku yet, in logs from heroku it says:(Unable to insert Login { MongoError: not authorized on Login to execute command)
function sendData(){ //Local Connect mongodb://localhost:27017/Login ----- Other connects(process.env.MONGODB_URI || ds145573.mlab.com:45573/heroku_qc14rtbr
        MongoClient.connect('mongodb://heroku_qc14rtbr:l2vg8298v3nk7e9a96l6usjeda@ds145573.mlab.com:45573/heroku_qc14rtbr',(err,client)=>{
        if(err){
            return console.log('Unable to connect to MongoDB server.');
        }
        console.log('Connected to MongoDB server.');
        const db = client.db('Login')//Create Login
        console.log('database name: ',db);
        db.collection('Login').insertOne({
            login: myLogin,
            password: myPassword,
            ip: myIP

        },(err, result)=>{
            if(err){
                return console.log('Unable to insert Login', err);
            }
            console.log(JSON.stringify(result.ops, undefined, 2));
        });
        
        client.close();
    });
}
//YOU WILL NEED TO INSTALL MONGO DB ON YOUR LOCAL COMPUTER TO TEST

