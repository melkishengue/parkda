var mongoose = require('mongoose');
var _ = require('underscore');
var FavoriteSchema = mongoose.Schema({
  cookie_user_id: {
    type: String,
    unique: true
  },
  favorites: [{
    parkraumId: {
      type: Number
    }
  }]
});

var Favorite = mongoose.model('favorite', FavoriteSchema);
module.exports = Favorite;

module.exports.getFavoriteUser = function(cookie_user_id, callback, limit){
  Favorite.find({cookie_user_id: cookie_user_id}, callback).limit(limit);
}

module.exports.updateFavorite = function(cookie_user_id, parkraumId, callback){
  Favorite.find({cookie_user_id: cookie_user_id, favorites: { $elemMatch: { 'parkraumId': parkraumId } }}, function(err, _favorite){
    if(_favorite.length != 0){
      console.log('The Parkraum existiert schon als favorite für den Parkraum ' + parkraumId);

      // trying to delete the favorite. But the favs are nested in this Favorite objects, I dont know how to delete them.
      // What I do is I loop through the favs and recopy them all, except the one I want to remove.
      // Then I delete the old record and create a new one.
      // This is expensive but I dont have the choice now.
      var n = [];
      _.each(_favorite[0].favorites, function(f){
        if(f.parkraumId != parkraumId) n.push(f);
      });
      var d = new Favorite({
        cookie_user_id: cookie_user_id,
        favorites: n
      });
      _favorite[0].remove();
      d.save(function(err){
        if(!err){
          Favorite.find({cookie_user_id: cookie_user_id}).populate('favorites').exec(function(err, favorites){
            callback(err, favorites);
          })
        }else{
          console.log(err);
          callback(err);
        }
      });
    }else{
      console.log('The Parkraum existiert noch nicht als favorite für den Parkraum ' + parkraumId);
      Favorite.find({cookie_user_id: cookie_user_id}, function(err, __favorite){
        if(__favorite.length == 0){
          console.log('favorites for the user exist not yet. We gonna create it!');
          var d = new Favorite({
            cookie_user_id: cookie_user_id,
            favorites: [{
              parkraumId: parkraumId
            }]
          })
          d.save(function(err){
            if(!err){
              Favorite.find({cookie_user_id: cookie_user_id}).populate('favorites').exec(function(err, favorites){
                callback(err, favorites);
              })
            }else{
              callback(err);
            }
          })
        }else{
          console.log('favorites for the user already exist. We gonna update it!');
          __favorite[0].favorites.push({parkraumId: parkraumId});
          __favorite[0].save(function(err){
            Favorite.find({cookie_user_id: cookie_user_id}).populate('favorites').exec(function(err, favorites){
              console.log(JSON.stringify(favorites, null, "\t"));
              callback(err, favorites);
            });
          });
        }
      });
    }
  });
}

module.exports.emptyCollection = function(callback){
  Favorite.collection.remove(callback);
}
