var mongoose = require('mongoose');

var belegungsprognoseSchema = mongoose.Schema({
  siteId: {
    type: Number,
    unique: true
  },
  morgensBelegung: {
    type: Number
  },
  vormittagsBelegung: {
    type: Number
  },
  nachmittagsBelegung: {
    type: Number
  },
  abendsBelegung: {
    type: Number
  },
  nachtsBelegung: {
    type: Number
  }
});

var BelegungsPrognose = mongoose.model('belegungsprognose', belegungsprognoseSchema);
module.exports = BelegungsPrognose;

module.exports.getBelegungsPrognose = function(siteId, callback){
  BelegungsPrognose.find({siteId: siteId}, callback).limit(1);
}

module.exports.createBelegungsPrognose = function(belegungsprognose, callback){
  BelegungsPrognose.create(belegungsprognose, callback);
}

module.exports.updateOrCreateBelegungsPrognose = function(siteId, __prognose, callback){
  BelegungsPrognose.findOne({siteId: siteId}, function(err, belegungsprognose){
    // console.log(belegungsprognose);
    if(belegungsprognose){
      // Existiert schon --> update
      if(__prognose.morgensBelegung == 0 ) __prognose.morgensBelegung = belegungsprognose.morgensBelegung;
      if(__prognose.vormittagsBelegung == 0 ) __prognose.vormittagsBelegung = belegungsprognose.vormittagsBelegung;
      if(__prognose.nachmittagsBelegung == 0 ) __prognose.nachmittagsBelegung = belegungsprognose.nachmittagsBelegung;
      if(__prognose.abendsBelegung == 0 ) __prognose.abendsBelegung = belegungsprognose.abendsBelegung;
      if(__prognose.nachtsBelegung == 0 ) __prognose.nachtsBelegung = belegungsprognose.nachtsBelegung;
      BelegungsPrognose.update({siteId: siteId}, __prognose, callback);
    }else{
      // Existiert nicht schon --> create
      BelegungsPrognose.create(__prognose, callback);
    }
  });
}

module.exports.emptyCollection = function(callback){
  BelegungsPrognose.collection.remove(callback);
}
