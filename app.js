var http = require('http');
var express = require('express');
var app = express();

var fs = require('fs');
var {queryAlbum} = require('./mongoQueryDBAlbum');
var {queryArtist} = require('./mongoQueryDBArtist');
var {queryTitle} = require('./mongoQueryDBTitle');
var {queryAll} = require('./mongoQueryDBAll');

//initialize express
var os = require('os');

//gets local IP address
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
//IP address will have to be sent to front end

//declare public directory to be used to store files

app.use('/public', express.static(__dirname + '/public'));

//make deafult route to serve our static file

app.get('/', function (req, res) {
    return res.redirect('/public/home.html');
});

//start app on port 3003
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(3003, function () {
    console.log(`Listening on IP address: ${addresses} port 3003...`);
});

//getting query from front end
io.on('connection', function (socket) {
    console.log('Made connection.', `SOCKET ID:${socket.id}`);

    socket.on('query', function (data) {
        //create query from data and send back song info using queryAlbum queryTitle queryArtist
        console.log('QUERY VALUES:' + data.value + ' ' + data.search);
        //Need to receive back the json objects
        if (data.value == 'album') {
            queryAlbum(data.search, (results) => {
                sendQueryResults(socket, results);
            });
        } else if (data.value == 'artist') {
            queryArtist(data.search, (results) => {
                sendQueryResults(socket, results);
            });
        } else if (data.value == 'song') {
            queryTitle(data.search, (results) => {
                sendQueryResults(socket, results);
            });
        } else if (data.value == 'all') {
            queryAll((results) => {
                sendQueryResults(socket, results);
            });
        }
    });
});

//sends the results json file to the client
function sendQueryResults(socket, results) {
    let resultsJson = JSON.parse(results);
    for (let i in resultsJson) {
        let entry = resultsJson[i];
        entry.encodedId = encodeURIComponent(entry.fullPath);
    }
    socket.emit('results', JSON.stringify(resultsJson));
}

//define route to music directory and create a readstream to requested file and pipes output
//TODO: This route will have to be set by database or when install happens
app.get('/music', function (req, res, next) {
    var file = decodeURIComponent(req.query.id);
    fs.exists(file, function (exists) {
        if (exists) {
            let options = {
                headers: {
                    "content-type": 'audio/mp4'
                }
            };
            res.sendFile(file, options, function (err) {
                if (err) {
                    next(err);
                } else {
                    console.log("sent file: " + file);
                }
            });
        }
        else {
            res.send("Its s 404");
            res.end();
        }
    });
});

// following is the code for downloading music files, note that the code remains same except that we add 2 headers viz
// Content-disposition and Content-Type which forces the chrome browser to force download rather than playing the media
// Note that the following is tested with google chrome and it may work differently in Mozilla and Opera based on your
// installed plugins.

app.get('/download', function (req, res) {
    var fileId = req.query.id;
    fs.exists(file, function (exists) {
        if (exists) {
            res.setHeader('Content-disposition', 'attachment; filename=' + fileId);
            res.setHeader('Content-Type', 'application/audio/mp4');
            var rstream = fs.createReadStream(file);
            rstream.pipe(res);
        }
        else {
            res.send("Its a 404");
            res.end();
        }
    });
});