const express = require("express");
const cors = require("cors");

const bodyParser = require("body-parser");
const passport = require("./passport");
const app = express();

// Use cors middleware to enable cross-origin resource sharing
app.use(cors());


// Use body-parser middleware to parse incoming requests
app.use(bodyParser.json({limit: "200mb"}));
app.use(bodyParser.urlencoded({extended: true}));

// Initialize Passport and session middleware
app.use(passport.initialize());
app.set('json spaces', 0)

module.exports = app