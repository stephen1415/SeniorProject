//Boilerplate code for connecting to mongoDB

const MongoClient = require('mongodb').MongoClient;
//console.log('Run app.');
MongoClient.connect('mongodb://localhost:27017/Login',(err,client)=>{//Need to change to Heroku address
    if(err){
        return console.log('Unable to connect to MongoDB server.');
    }
    console.log('Connected to MongoDB server.');
    const db = client.db('Login')
    db.collection('Login').insertOne({
        login: 'Stangil',
        password: 'password',
        ip: '127.0.0.1'

    },(err, result)=>{
        if(err){
            return console.log('Unable to insert Login', err);
        }

        console.log(JSON.stringify(result.ops, undefined, 2));
    });

    client.close();
});

//YOU WILL NEED TO INSTALL MONGO DB ON YOUR LOCAL COMPUTER TO TEST