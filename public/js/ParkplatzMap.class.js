/*
  Description: A class to integrate google map maps in app, markers and Infowindows
  Creator: Melchisedek Hengue Touomo
  License: MIT https://opensource.org/licenses/MIT
*/

// Cunstrotor
function ParkplatzMap(center, zoom){
  this.center = center;
  this.zoom = zoom;
  // array of all the markers
  this.markers = [];
  this.map_id = "";
  this.infoWindow = null;
}

// Initialisation
ParkplatzMap.prototype.initialise = function(id, styles) {
  this.map_id = id;
  this.map = new google.maps.Map(id, {
    zoom: this.zoom,
    center: this.center,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });
  this.map.setOptions({styles: styles});
  google.maps.event.addListener(this.map, 'bounds_changed', function(event) {
    // this.setZoom(this.getZoom()-1);

    if (this.getZoom() > 20) {
      this.setZoom(20);
    }
  });
};

// Returns the center of the map
ParkplatzMap.prototype.getCenter = function() {
  return this.center;
};

// Returns zoom of map
ParkplatzMap.prototype.getZoom = function() {
  return this.zoom;
};

// Returns map ID
ParkplatzMap.prototype.getMapId = function() {
  return this.map_id;
};

// Returns infoWindow
ParkplatzMap.prototype.getInfoWindow = function() {
  return this.infoWindow;
};

// Return all the markers of the map
ParkplatzMap.prototype.getMarkers = function() {
  return this.markers;
};

// Add marker to the map
ParkplatzMap.prototype.addMarker = function(location, icon, InfoWindowHtml, stringIdentifier, isAnimated, isOpenedByDefault) {
  var marker = new google.maps.Marker({
    position: location,
    map: this.map,
    icon: icon,
    identifier: stringIdentifier,
    animation: google.maps.Animation.DROP
    // animation: google.maps.Animation.BOUNCE
  });
  if(isAnimated == true) marker.setAnimation(google.maps.Animation.BOUNCE);

  var infowindow = new google.maps.InfoWindow({
    content: InfoWindowHtml,boxStyle: {
          padding: "0px 100px 0px 0px",
        }
  });

  this.infoWindow = infowindow;

  if(isOpenedByDefault) {
    infowindow.open(this.map, marker);
  } else {
    marker.addListener('click', function() {
      infowindow.open(this.map, marker);
    });
  }


  marker.infoWindow = infowindow;
  this.markers.push(marker);
};

// Removes all markers from the map
ParkplatzMap.prototype.removeAllMarkers = function() {
  this.clearMarkers();
  this.markers = [];
};

ParkplatzMap.prototype.reCenter = function() {

};

// Removes the markers from the map, but keeps them in the array.
ParkplatzMap.prototype.clearMarkers = function() {
  this.setMapOnAll(null);
}

// Makes all markers appear on the map
ParkplatzMap.prototype.showMarkers = function() {
  setMapOnAll(this.map);
}

// Set the zoom of the map
ParkplatzMap.prototype.setZoom = function(zoom) {
  this.map.setZoom(zoom);
}

// Set center of the map
ParkplatzMap.prototype.setCenter = function(lat, lon) {
  console.log(lat + ' et ' + lon);
  var location = new google.maps.LatLng(lat, lon);
  this.map.setCenter(location);
}

// Makes all the markers visible on the map
ParkplatzMap.prototype.adjustMapForMarkers = function() {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < this.markers.length; i++) {
   bounds.extend(this.markers[i].getPosition());
  }
  this.map.fitBounds(bounds);
}

// Sets the map on all markers in the array.
ParkplatzMap.prototype.setMapOnAll = function(map) {
  for (var i = 0; i < this.markers.length; i++) {
    this.markers[i].setMap(map);
  }
}
