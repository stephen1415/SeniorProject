//Stephen Chatham

var readdrip = require('readdirp');
var mm = require('music-metadata');
var prompt = require('prompt');
var fs = require('fs');
var validator  = require('email-validator');
var MongoClient = require('mongodb').MongoClient;


//Test File Location was 'C:\Users\Stephen\Music\iTunes\iTunes Media\Music'
//Stores the parsed metadata as an object array of song objects
//Lastly the songs array is written to a Json file in the current dir for future access
var songs = [];
var email = '';//users email to be sent to web server
var settings;//used for the file search process, setup in build start promise

//Function that recursively iterates through the file system from the provided starting directory.
//the function returns an array of audio file locations. Uses the readdrip library
function buildFileSearchPromise(settings){
    return new Promise(function(resolve, reject){
        var allFilePaths = [];
        readdrip(settings)
            .on('data', function (entry) {
                // execute every time a file is found in the provided directory
                let fileLoc = entry.fullPath;
                //Parses the path name to get the file extension. In this case only looking for .pdf
                let fileType = fileLoc.substring(fileLoc.length - 4, fileLoc.length);

                // Store the fullPath of the file with desired extension
                if (fileType === '.mp3') {
                    allFilePaths.push(fileLoc);
                } else if (fileType === '.m4a') {
                    allFilePaths.push(fileLoc);
                } else if (fileType === '.mp4') {
                    allFilePaths.push(fileLoc);
                } else if (fileType === '.wav') {
                    allFilePaths.push(fileLoc);
                }
            })
            .on('warn', function (warn) {
                console.log("Warn: ", warn);
            })
            .on('error', function (err) {
                console.log("Error: ", err);
                reject(err);
            })
            .on('end', function () {
                console.log("Total Number of Audio Files Located: " + allFilePaths.length);
                resolve(allFilePaths.slice(0, allFilePaths.length));
            })
    })
}

//Gets the start directory from the user and sets the settings for the file search
//Uses the prompt library to get user input
//Returns true if the location is a Directory
//Otherwise returns false
function buildStartPromise(){
    return new Promise(function(resolve, reject) {
        prompt.start();
        prompt.get(['startDirectory'], function (err, result){
            console.log('Command Input recieved:');
            console.log('Start Directory: ' + result.startDirectory);

            settings = {
                root: result.startDirectory,
                entryType: 'all',
                // Filter files
                fileFilter: ['*.mp3', '*.m4a', '*.wav', '*.mp4']
            };

           try {
               var stats = fs.statSync(result.startDirectory);
               if (stats.isDirectory()) {
                   resolve(true);
               }else{
                   console.log("Not a valid Directory");
                   resolve(false);
               }
           }catch (err){
               console.log("Not a valid Directory: make sure there are no quotations");
               resolve(false);
               reject(err);
           }
        })
})}

//gets the users email and verifies it is in a valid email format
//returns true if valid and false otherwise
//stores the email  in an email variable to be used later
function buildGetUserEmailPromise(){
    return new Promise(function(resolve, reject) {
        prompt.start();
        prompt.get(['EnterGmailAccount'], function (err, result) {
            console.log('Command Input recieved:');
            console.log('Email entered: ' + result.EnterGmailAccount);

            email = result.EnterGmailAccount;
            if (err) {
                reject(err);
            } else {
                if (validator.validate(email)){
                    resolve(true);
                }else{
                    console.log("Not a valid Email address");
                    resolve(false);
                }
            }
        })
})}

//async function declaration...uses promises to force synchronization
async function doFileSearch(settings){
    return buildFileSearchPromise(settings);
}

async function doStartFileLocation(){
    return buildStartPromise();
}

async function getUserEmail(){
    return buildGetUserEmailPromise();
}

async  function createMongoDb(){
    return buildMongoDb();
}

//function to use async and await to synchronize the sequence of function calls due to dependency
//Use this function to search and parse the files
async function startService() {
    //loop used to make sure the email provided is valid before moving to next function
    //function returns true when email is valid
    while (!await getUserEmail()) {
        //do nothing but repeat the function
    }
    //loop used to make sure the start directory provided is valid before moving to next function
    //function returns true when provided dir is valid
    while (!await doStartFileLocation()) {
        //do nothing but repeat the function
    }

    //searches the provided dir for music files
    var files = await doFileSearch(settings);
    //gets the metadata for located files
    await getMetaData(files);

    if (songs.length > 0) {
        //writes the songs object array to a usable Json file
        fs.writeFile("./songs.json", JSON.stringify(songs, null, 4), (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
        console.log('Done collecting metadata and writing to Json file');
    }else{
        console.log("NO SONGS TO PUT IN JSON FILE");
    }

    //populates the database with the songs array of objects
    if (await createMongoDb())
        console.log("DB Created");
    else{
        console.log("There was a problem while creating the DB");
    }

    //send server ip and email to web server

}

//Iterates through the located file locations parsing metadata and storing relative info into a song object, pushed to an array
//Uses music-metadata library
async function getMetaData(files){
    let title ='';
    let artist ='';
    let album ='';
    let genre ='';
    let duration = 0;

    if (files.length >0) {
        console.log("***GETTING META DATA, THIS WILL TAKE A FEW MINUTES***");

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            //console.log("getting file metadata: " + file);
            let metadata = await mm.parseFile(file, {native: true});
            title = metadata.common.title;
            artist = metadata.common.artist;
            album = metadata.common.album;
            genre = metadata.common.genre;
            duration = metadata.format.duration;

            let song = {
                title: title, artist: artist, album: album,
                genre: genre, duration: duration, fullPath: files[i]
            };

            songs.push(song);
        }
    }else{
        console.log("NO FILES LOCATED AND NO METADATA");
    }
}

//create a mongo db and populate with songs
async function buildMongoDb() {
    return new Promise(function (resolve, reject) {
        const url = "mongodb://localhost:27017";
        let count = 0;

        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            const db = client.db('muzerdb');

            db.collection('allMusic').insertMany(songs, function (err, res) {
                if (err) throw err;
                count = res.insertedCount;
                console.log(count + " documents inserted");
                client.close();

                if (count > 0) {
                    resolve(true);
                }else {
                    resolve(false);
                }
            });
            client.close();
    })
})}

//Main Function call to start the process
startService();