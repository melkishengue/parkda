require('dotenv').config();
var ParkingPlaces = require(__dirname + '/models/parkingPlaces.js');
var Client = require('node-rest-client').Client;
var client = new Client();
var config = require(__dirname + '/config.js');
var mongoose = require('mongoose');
var _ = require('underscore');
var sleep = require('sleep');

var options = {
  db: { native_parser: true },
  server: { poolSize: 5 },
  replset: { rs_name: 'myReplicaSetName' }
};

const url = "mongodb://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_HOST  + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME;
console.log('url: ', url);

mongoose.connection.on('error', function (err) {
  console.log(err);
});

mongoose.connect(url, options);



ParkingPlaces.emptyCollection(function(err){
  if(err){
    console.log(err);
  }else{
    console.log('Collection Parkraums dropped');
    console.log('Collection being rebuild');
    console.log('++ Calling ' + config.PARKRAUME_ENDPOINT);
    // Quering the REST Server to get the list of parking places.
    client.get(config.PARKRAUME_ENDPOINT, function (datas, response) {
      var i = 1;
      _.each(datas.results, function(place){
        place.id = i++;
        place.occupancy = 0;
        ParkingPlaces.createPlace(place, function(err, newPlace){
          sleep.sleep(1);
          if(err){
            console.log(err);
          }else console.log('[+] ' + newPlace.parkraumBahnhofName + ' parking place wird hinzugefügt...');
        });
      });
    });
  }
});
