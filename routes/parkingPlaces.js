const express = require('express');
const router = express.Router();

var Client = require('node-rest-client').Client;
var client = new Client();
var utf8 = require('utf8');
var _ = require ("underscore");
var geolib = require('geolib');
var config = require(__dirname + '/../config.js');

// model
ParkingPlaceModel = require(__dirname + '/../models/parkingPlaces.js');

// sort a collection of objects on a specified numeric field
Array.prototype.sortOn = function(key){
    this.sort(function(a, b){
        if(a[key] < b[key]){
            return -1;
        }else if(a[key] > b[key]){
            return 1;
        }
        return 0;
    });
}

// handler for loading a particular parkraum
router.get("/:parkingplaceid", function(req, res) {
  ParkingPlaceModel.getParkingPlace(req.params.parkingplaceid, function(err, parkingPlace){
      if(err){
        res.status(500).send('Internal Server Error! Please try again.');
      } else {
        if(parkingPlace.length != 0){
          res.status(200).send(parkingPlace);
        }else res.status(404).send('No results found.');
      }
  }, 10000);
});

// handle the search
router.get("/", function(req, res) {
  // the object which contains the search options
  var search_options = {};
  // if a parameter is defined then we put it in the search object
  if(req.query.parkingplacename !== undefined) search_options.parkraumBahnhofName = req.query.parkingplacename;
  if(req.query.hours !== undefined) search_options.parkraumOeffnungszeiten = req.query.hours;
  if(req.query.state !== undefined) search_options.bundesland = req.query.state;
  if(req.query.manager !== undefined) search_options.betreiber = req.query.manager;
  if(req.query.isDBBahn !== undefined) {
    search_options.parkraumIsDbBahnPark = (req.query.isDBBahn == "1" ? true:false);
  }
  if(req.query.type !== undefined) search_options.parkraumParkart = req.query.type;
  if(req.query.technic !== undefined) search_options.parkraumTechnik = req.query.technic;

  console.log(search_options);

  // fetch objects
  ParkingPlaceModel.getParkingPlaces(search_options, function(err, places) {
    // console.log(places);
    if(err) res.status(500).send('Internal server error. Try again later please.');
    else {
      if(places.length > 0) {
        // if a longitude and latitude are defined, then we want to look for places around this coordinates
        if((req.query.latitude !== undefined)&&(req.query.longitude !== undefined)) {
          var latitude = req.query.latitude;
          var longitude = req.query.longitude;
          _.each(places, function(place) {
            var aDistance = geolib.getDistance(
                {latitude: latitude, longitude: longitude},
                {latitude: place.parkraumGeoLatitude, longitude: place.parkraumGeoLongitude}
            );
            place.distance = aDistance;
          });
          places.sortOn("distance");
          res.json(_.first(places, config.NUMBER_RESULTS_NEAR_LOOK));
          return;
        }

        // if city is defined, then we want to look for places around this city. A radius (parameter distance) could be provided too
        if(req.query.city !== undefined) {
          var city = req.query.city;

          console.log(city);

          // We fetch the GPS coordinates of the city
          client.get(config.GOOGLEMAP_GET_DATAS_ADRESS_ENDPOINT + '' + utf8.encode(city), function (datas, response) {
            var city_coordinates = datas.results[0].geometry.location;
            console.log(city_coordinates.lat);
            console.log(city_coordinates.lng);
            // Calculate distances for all the retrieved places
            _.each(places, function(place){
              var aDistance = geolib.getDistance(
                  {latitude: city_coordinates.lat, longitude: city_coordinates.lng},
                  {latitude: place.parkraumGeoLatitude, longitude: place.parkraumGeoLongitude}
              );
              place.distance = aDistance;
            });
            places.sortOn("distance");

            if(req.query.distance !== undefined) {
              var distance = req.query.distance;

              // Filter to keep just the places which corresponds to the distance parameter
              var places_suiting_distance_parameter = _.filter(places, function (place) {
                  return place.distance < distance*1000;
              });
              if(places_suiting_distance_parameter.length != 0){
                places_suiting_distance_parameter.sortOn("distance");
                res.status(200).send(_.first(places_suiting_distance_parameter, config.NUMBER_RESULTS_NEAR_LOOK));
              }else res.status(404).send('No results found.');
            } else {
              res.status(200).send(_.first(places, config.NUMBER_RESULTS_NEAR_LOOK));
            }
          });
        } else {
          if(req.query.ids !== undefined) {
            var ids = JSON.parse(req.query.ids);

            var results = _.filter(places, function (place) {
              var index = ids.indexOf(place.parkraumId);
              return index > -1;
            });
            res.json(results);
          } else res.json(places);
        }
      } else res.status(404).send('No results found.');
    }
  }, 10000);
});

module.exports = router;
