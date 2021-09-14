// Imports 
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const { v4: uuidv4 } = require('uuid');

const app = express();

//Setup scripts

const formatCode = require(__dirname + "/scripts/format-note");

//Setup server configuration

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

app.set('view engine', 'ejs');


//Start server
var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log("Server started listening on port: " + port + ".");
});

//Databse server configuration
// mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]
// mongo "mongodb://Admin:${DBPASSWORD}@<host>:<port>/admin?authSource=admin"
const mongoose = require("mongoose");
// mongoose.connect("mongodb://" + process.env.DB_USERNAME + ":" + process.env.DB_PASSWORD + "@" + process.env.SERVER_ADDRESS + "/notebin?authSource=admin");
mongoose.connect(process.env.SERVER_ADDRESS, {useNewUrlParser: true});

const noteSchema = {noteID: {type: String, required: true}, content: String};
const Note = mongoose.model("Note", noteSchema);


//Server requests

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/new", function(req, res) {
    res.render("createNote");
});

app.get("/error", function(req, res) {
   sendError();
});

app.get("/note/:noteID", function(req, res) {
    const noteID = req.params.noteID;

    Note.findOne({noteID: noteID}, function(error, foundNote) {
        if(error) {
            res.redirect("/error");
        } else {
            res.render("note", {uuid: noteID, content: foundNote.content});
        }
    });
});

app.get("/raw/:noteID", function(req, res) {
    const noteID = req.params.noteID;

    Note.findOne({noteID: noteID}, function(error, foundNote) {
        if(error) {
            res.redirect("/error");
        } else {
            res.render("raw", {uuid: noteID, content: foundNote.content});
        }
    });

});

app.get("/submit", function(req, res) {
    res.redirect("/error");
})

app.post("/submit", function(req, res) {
    const content = req.body.note;
    const newUUID = uuidv4();
    const newNote = new Note({noteID: newUUID, content: content});

    newNote.save(function(err, note) {
        console.log(err);
        if(err) {
            res.redirect("/error");
        } else {
            res.redirect("/note/" + newUUID);
        }
    });
});

function sendError(err) {
    res.render("error", {error: err});
}

