var mongoose = require('mongoose');

var parkingPlaceSchema = mongoose.Schema({
  type: {
    type: String
  },
  bundesland: {
    type: String
  },
  isPublished: {
    type: Boolean
  },
  parkraumAusserBetriebText: {
    type: String
  },
  parkraumAusserBetrieb_en: {
    type: String
  },
  parkraumBahnhofName: {
    type: String
  },
  parkraumBahnhofNummer: {
    type: Number
  },
  parkraumBemerkung: {
    type: String
  },
  parkraumBemerkung_en: {
    type: String
  },
  parkraumBetreiber: {
    type: String
  },
  parkraumDisplayName: {
    type: String
  },
  parkraumEntfernung: {
    type: String
  },
  parkraumGeoLatitude: {
    type: String
  },
  parkraumGeoLongitude: {
    type: String
  },
  parkraumHausnummer: {
    type: String
  },
  parkraumId: {
    type: String
  },
  parkraumIsAusserBetrieb: {
    type: Boolean
  },
  parkraumIsDbBahnPark: {
    type: Boolean
  },
  parkraumIsOpenData: {
    type: Boolean
  },
  parkraumIsParktagesproduktDbFern: {
    type: Boolean
  },
  parkraumKennung: {
    type: String
  },
  parkraumName: {
    type: String
  },
  parkraumOeffnungszeiten: {
    type: String
  },
  parkraumOeffnungszeiten_en: {
    type: String
  },
  parkraumParkTypName: {
    type: String
  },
  parkraumParkart: {
    type: String
  },
  parkraumReservierung: {
    type: String
  },
  parkraumSlogan: {
    type: String
  },
  parkraumSlogan_en: {
    type: String
  },
  parkraumStellplaetze: {
    type: String
  },
  parkraumTechnik: {
    type: String
  },
  parkraumTechnik_en: {
    type: String
  },
  parkraumURL: {
    type: String
  },
  parkraumZufahrt: {
    type: String
  },
  parkraumZufahrt_en: {
    type: String
  },
  tarif1MonatAutomat: {
    type: String
  },
  tarif1MonatDauerparken: {
    type: String
  },
  tarif1MonatDauerparkenFesterStellplatz: {
    type: String
  },
  tarif1Std: {
    type: String
  },
  tarif1Tag: {
    type: String
  },
  tarif1TagRabattDB: {
    type: String
  },
  tarif1Woche: {
    type: String
  },
  tarif1WocheRabattDB: {
    type: String
  },
  tarif20Min: {
    type: String
  },
  tarif30Min: {
    type: String
  },
  tarifBemerkung: {
    type: String
  },
  tarifBemerkung_en: {
    type: String
  },
  tarifFreiparkzeit: {
    type: String
  },
  tarifFreiparkzeit_en: {
    type: String
  },
  tarifMonatIsDauerparken: {
    type: Boolean
  },
  tarifMonatIsParkAndRide: {
    type: Boolean
  },
  tarifMonatIsParkscheinautomat: {
    type: Boolean
  },
  tarifParkdauer: {
    type: String
  },
  tarifParkdauer_en: {
    type: String
  },
  tarifRabattDBIsBahnCard: {
    type: Boolean
  },
  tarifRabattDBIsParkAndRail: {
    type: Boolean
  },
  tarifRabattDBIsbahncomfort: {
    type: Boolean
  },
  tarifSondertarif: {
    type: String
  },
  tarifSondertarif_en: {
    type: String
  },
  tarifWieRabattDB: {
    type: String
  },
  tarifWieRabattDB_en: {
    type: String
  },
  tarifWoVorverkaufDB: {
    type: String
  },
  tarifWoVorverkaufDB_en: {
    type: String
  },
  zahlungKundenkarten: {
    type: String
  },
  zahlungMedien: {
    type: String
  },
  zahlungMedien_en: {
    type: String
  },
  zahlungMobil: {
    type: String
  },
  occupancy: {
    type: Number
  }
});

var ParkingPlace = mongoose.model('parkraum', parkingPlaceSchema);
module.exports = ParkingPlace;

module.exports.getParkingPlaces = function(options, callback, limit){
  if(options.parkraumBahnhofName !== undefined) {
    var r = new RegExp(options.parkraumBahnhofName, 'i');
    options.parkraumBahnhofName = {$regex: r};
  }

  ParkingPlace.find(options).limit(limit).exec(callback);
}

module.exports.getParkingPlace = function(parkraumId, callback){
  ParkingPlace.find({parkraumId: parkraumId}, callback).limit(1);
  // Parkraum.find({parkraumKennung: 'P2'}, callback).limit(limit);
}

module.exports.updateOccupancy = function(parkraumId, occupancy){
  ParkingPlace.findOne({ parkraumId: parkraumId }, function (err, place){
    place.occupancy = occupancy;
    place.save();
  });
}

module.exports.createPlace = function(place, callback){
  ParkingPlace.create(place, callback);
}

module.exports.emptyCollection = function(callback){
  ParkingPlace.collection.remove(callback);
}
