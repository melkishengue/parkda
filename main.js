var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require('mongoose');

var morgan = require('morgan');

//load our confoguration file
config = require('./config.js');

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use( bodyParser.json());       // to support JSON-encoded bodies

app.use(morgan('tiny'));

var options = {
  db: { native_parser: true },
  server: { poolSize: 5 },
  replset: { rs_name: 'myReplicaSetName' }
}

const url = "mongodb://" + config.DB.USER + ":" + config.DB.PASSWORD + "@" + config.DB.HOST  + ":" + config.DB.PORT + "/" + config.DB.DBNAME;

mongoose.connect(url, options);

// Loading our models
// Belegung = require('./model/belegung.js');
// BelegungsPrognose = require('./model/belegungsprognose.js');

var parkingPlaces = require(__dirname + '/routes/parkingPlaces');

// allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// route for handling /parkingplaces/
app.use('/parkingplaces/', parkingPlaces);

// defining public folder
app.use(express.static('public'));

// Main route. We juste send our index.html file
app.get("/", function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

app.listen(config.SERVER_PORT);
console.log('The app is running on port ' + config.SERVER_PORT + '. Navigate to localhost: ' + config.SERVER_PORT + '  to see the magic ;)');
