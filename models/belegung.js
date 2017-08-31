var mongoose = require('mongoose');

var belegungSchema = mongoose.Schema({
  id: {
    type: Number
  },
  siteId: {
    type: Number
  },
  flaechenNummer: {
    type: Number
  },
  stationName: {
    type: String
  },
  siteName: {
    type: String
  },
  displayName: {
    type: String
  },
  validData: {
    type: Boolean
  },
  timestamp: {
    type: Date
  },
  timeSegment: {
    type: Date
  },
  category: {
    type: Number
  },
  text: {
    type: String
  }
});

var Belegung = mongoose.model('belegung', belegungSchema);
module.exports = Belegung;

module.exports.getOccupancyDatasPerTimeInterval = function(siteId, interval_value1, interval_value2, callback, limit){
  Belegung.find({siteId: siteId, $and: [{timeSegment: {$lt: interval_value2, $gt: interval_value1}}]}, callback).limit(limit);
}

module.exports.getLastOccupancy = function(siteId, callback){
  Belegung.find({siteId: siteId}, null, {sort: {timeSegment: -1}}, callback).limit(1);
}

module.exports.createBelegung = function(belegung, callback){
  Belegung.create(belegung, callback);
}

module.exports.emptyCollection = function(callback){
  Belegung.collection.remove(callback);
}
