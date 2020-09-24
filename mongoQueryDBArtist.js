var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');

var queryArtist = (artist, callback) => {
    const url = "mongodb://localhost:27017";

    MongoClient.connect(url, function (err, client) {
        if (err) throw err;
        const dbo = client.db('muzerdb');
        var query = {artist: artist};
        dbo.collection("allMusic").find(query, {projection: {_id: 0}}).toArray(function (err, result) {
            client.close();
            callback(JSON.stringify(result, null, 4));
        });
    });
};
module.exports = {queryArtist};


