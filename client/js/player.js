//keeps track of ip address
var host = 'http://10.100.73.105:3003';

//make socket connection
var socket = io(host);//needs to be public ip

//variable to keep track of file locations
var songLoc = [];

//receives data from query results from server
socket.on('results', function (data) {
    console.log(data);
    if (data != 'HELLO') {
        createButtons(JSON.parse(data));
    }
});

function callServer(value, search) {
    //clears any currently loaded buttons
    document.getElementById("button-box").innerHTML = "";
    //sets music to the json file received
    searchSongs(value, search);
}

//creates the buttons that will be used to select the songs to stream
//value is the value in the select box, search is the value in the search bar
function createButtons(music) {
    //used to create the ids for the buttons
    var count = 0;

    for (var i in music) {
        //creates the button element, assigns class, id, and onclick properties
        var createDiv = document.createElement("button");
        createDiv.className = "button";
        createDiv.id = count;
        createDiv.onclick = function () {
            playSong(this.id);

        };

        //creates the name element for the button and assigns assigns the class
        var createName = document.createElement("div");
        createName.className = "name";

        //creates the artist element for the button and assigns assigns the class
        var createArtist = document.createElement("div");
        createArtist.className = "artist";

        //creates the album element for the button and assigns assigns the class
        var createAlbum = document.createElement("div");
        createAlbum.className = "album";

        //gets the name, artist, and title from the json object
        var name = document.createTextNode(music[i].title);
        var artist = document.createTextNode(music[i].artist);
        var album = document.createTextNode(music[i].album);

        //places location data into songLoc
        songLoc[count] = music[i].encodedId;

        //adds the name, artist, and album information to the corresponding elements
        createName.appendChild(name);
        createArtist.appendChild(artist);
        createAlbum.appendChild(album);

        //adds the name, artist, and album elements to the button element
        createDiv.appendChild(createName);
        createDiv.appendChild(createArtist);
        createDiv.appendChild(createAlbum);

        //adds the button element to the button-box element
        var buttonBox = document.getElementById("button-box");
        buttonBox.appendChild(createDiv);

        count++;
    }
}

//used to query back end and receive json file
//value is the value in the select box, search is the value in the search bar
function searchSongs(value, search) {
    if (value != null) {
        socket.emit('query', {
            value: value,
            search: search
        });
    } else {
        console.log("ERROR: value of select element is invalid");
    }
}

//function for selecting the song to stream to the player
//id is the id of the button we have selected
function playSong(id) {
    //changes the player to display the name, artist, and album of the song
    document.getElementById("songname").innerHTML = document.getElementById(id).getElementsByClassName("name")[0].innerHTML;
    document.getElementById("songartist").innerHTML = document.getElementById(id).getElementsByClassName("artist")[0].innerHTML;
    document.getElementById("songalbum").innerHTML = document.getElementById(id).getElementsByClassName("album")[0].innerHTML;

    document.getElementById("source").src = host + "/music?id=" + songLoc[id];
    let audio = document.getElementById("audioPlayer");
    audio.load();
}

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("myBtn").style.display = "block";
    } else {
        document.getElementById("myBtn").style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
} 