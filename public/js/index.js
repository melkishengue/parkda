$(document).ready(function(){
  // List of icons for the MAP
  var icons = {
    'Parkplatz': '../images/letter_p.png',
    'Parkhaus': '../images/parkinggarage.png',
    'Parkraum': '../images/parkinggarage.png',
    'Tiefgarage': '../images/parkinggarage.png',
    'Parkdeck': '../images/conference.png',
    'user_icon': '../images/smiley_happy.png'
  }
  // Array to display messages on free places
  var occupancy_correspondance = {
    0: {
      text: 'Keine',
      frei: 0
    },
    1: {
      text: 'Zwischen 0 und 10 Freiplätze',
      frei: 10
    },
    2: {
      text: 'Zwischen 10 und 30 Freiplätze',
      frei: 30
    },
    3: {
      text: 'Zwischen 30 und 50 Freiplätze',
      frei: 50
    },
    4: {
      text: 'Mehr als 50 Freiplätze',
      frei: 100
    }
  };
  // Not found html message
  var HTML_RESULTS_NOT_FOUND = '<div class="alert alert-danger-db">Keine Treffer gefunden.<br/>Dass es keine Treffer gibt liegt daran, dass nicht alle Bahnhöfe Parkplätze anbieten.</br></br>Hinweis: Benutze die <a class="in-der-naehe-suchen">Suche in Deiner Nähe</a> um in der Nähe liegende Parkplätze zu finden, oder die <a class="erweiterte-suche">erweiterte Suche</a> um Parkplätze in der Nähe eines bestimmten Ort zu finden.</div>';
  console.log(icons['parkplatz']);

  var sm = new SimpleCookies();

  // Will contain the list of users favorites places
  var favorites = [];

  // Loads users favorites
  function loadFavorites() {
    $('#results-container').html('<div style="padding:5px;background-color:orangered;color:white;margin-top:5px;margin-bottom:5px;">Loading favs...</div>');
    var favsIds = sm.getCookie("favs");
    if(favsIds != "") {
      var tabFavsIds = JSON.parse(favsIds);
      $.ajax({type: "GET",
        url: '/parkingplaces/',
        data: {ids: JSON.stringify(tabFavsIds)},
        dataType: "json",
        success: function(msg){
          _.each(msg, function(place){
            favorites.push(place);
          });
          console.log(favorites);
          console.log(msg);
          $('#results-container').empty();
          processResponse(msg, false, null, null);
        },
         error: function(xhr, status, error) {
          if(xhr.status == 404) {
              console.log(error);
              $('#results-container').html('Keine Favs zum Laden');
          }else{
            if(xhr.status == 500) {
                console.log(error);
            }else console.log(error);
          }
         }
      });
    } else {
      $('#results-container').html('Keine Favs zum Laden');
    }

  }

  loadFavorites();

  // coloriate the star to show that the parking place was register as favorite
  function displayFavorites(){
    console.log('calling favorites');
    var favsIds = sm.getCookie('favs');
    if(favsIds != "") {
      unDisplayFavorites();
      var tabFavsIds = JSON.parse(favsIds);
      _.each(tabFavsIds, function(favorite){
        $('.panel[parkraumId='+ favorite +']').find('.add-to-fav').addClass('favorited');
      });
    }
  }

  function displayFavoritesAll(){
    console.log('calling all favorites');
    $('.add-to-fav').addClass('favorited');
  }

  function unDisplayFavorites(){
    $('.add-to-fav').removeClass('favorited');
  }

  // Initialise Map
  var center = new google.maps.LatLng(51.7080978, 8.7725584);
  var map = new ParkplatzMap(center, 7);
  var styles = [{"featureType":"water","stylers":[{"color":"#19a0d8"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"weight":6}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#e85113"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-40}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-20}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"road.highway","elementType":"labels.icon"},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"lightness":20},{"color":"#efe9e4"}]},{"featureType":"landscape.man_made","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"hue":"#11ff00"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"hue":"#4cff00"},{"saturation":58}]},{"featureType":"poi","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#f0e4d3"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-10}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"}]}];
  map.initialise(document.getElementById("map-canvas"), styles);

  // handler for researching parkings near the user location
  $(document).on("click", ".favs-zeigen", function(event) {
    loadFavorites();
  });

  $(document).on("click", ".close-panel", function(event) {
    $(this).parents('.panel').hide(100);
  });

  // Get the input box
  var textInput = document.getElementById('navbar-search-id');

  // Init a timeout variable to be used below
  var timeout = null;

  // Listen for keystroke events
  textInput.onkeyup = function (e) {

      // Clear the timeout if it has already been set.
      // This will prevent the previous task from executing
      // if it has been less than <MILLISECONDS>
      clearTimeout(timeout);

      // Make a new timeout set to go off in 800ms
      timeout = setTimeout(function () {
        loadResults(textInput.value);
      }, 900);
  };

  $(document).on("click", ".in-der-naehe-suchen", function(event) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(loadParkingPlacesNearAround);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
  });

  $(document).on("click", ".parkplatz_link", function(e) {
    var identifier = $(this).attr('marker_identifier');
    var _marker = map.getMarkers().filter(function(marker){
      return marker.identifier == identifier;
    });
    _.each(map.getMarkers(), function(marker){
      marker.infoWindow.close();
    });
    map.setCenter(_marker[0].position.lat(), _marker[0].position.lng());
    _marker[0].infoWindow.open(map, _marker[0]);
    map.setZoom(18);
    e.preventDefault();
  });

  $(document).on("click", ".show-tarife-link", function(e) {
    $(this).parents('.panel-content').find('.table-preise').toggle(300);
    e.preventDefault();
  });

  $(document).on("click", "#search-submit", function(e) {
    loadResults($("#navbar-search-id").val());
  });

  $('form').submit(function( event ) {
    event.preventDefault();
  });

  $(document).on("click", ".laod-prognose-daten", function(e) {
    var parkraumId = $(this).parents('.panel').eq(0).attr('parkraumId');
    var $this = $(this);
    $.ajax({type: "GET",
      url: '/api/belegungsprognoses/' + parkraumId,
      dataType: "json",
      success: function(msg){
        // console.log(msg);
        var prognose = msg[0];
        console.log(prognose);
        var html = $this.siblings('.belegungs-chart').eq(0).html();
        if(html == ''){
          // Draw the chart for the free places
          $this.siblings('.belegungs-chart').eq(0).show().highcharts({
                  title: {
                      text: 'FREIPLÄTZE IM LAUFE DES TAGES.',
                      x: -20, //center
                      style: {
                          color: '#000',
                          font: 'bold 13px DBSans'
                      }
                  },
                  subtitle: {
                      text: 'Daten werden nach und nach gebaut',
                      x: -20,
                      style: {
                          color: '#000',
                          font: 'bold 13px DBSans'
                      }
                  },
                  xAxis: {
                      title: {
                          text: 'Tag',
                          style: {
                              color: '#000',
                              font: 'bold 13px DBSans'
                          }
                      },
                      categories: ['Mongen', 'Vorm.', 'Nachm.', 'Abend', 'Nacht']
                  },
                  yAxis: {
                      title: {
                          text: 'Freiplätze',
                          style: {
                              color: '#000',
                              font: 'bold 13px DBSans'
                          }
                      },
                      plotLines: [{
                          value: 0,
                          width: 1,
                          color: '#808080'
                      }]
                  },
                  tooltip: {
                      valueSuffix: 'P'
                  },
                  legend: {
                      layout: 'vertical',
                      align: 'right',
                      verticalAlign: 'middle',
                      borderWidth: 0,
                      font: 'bold 11px DBSans'
                  },
                  series: [{
                      name: 'Frei Plätze',
                      data: [occupancy_correspondance[prognose.morgensBelegung]['frei'], occupancy_correspondance[prognose.vormittagsBelegung]['frei'], occupancy_correspondance[prognose.nachmittagsBelegung]['frei'], occupancy_correspondance[prognose.abendsBelegung]['frei'], occupancy_correspondance[prognose.nachtsBelegung]['frei']]
                  }]
              });
        }else{
          $this.siblings('.belegungs-chart').eq(0).toggle(200);
        }
      },
       error: function(xhr, status, error) {
        if(xhr.status == 404) {
            console.log(error);
        }else{
          if(xhr.status == 500) {
              console.log(error);
          }else console.log(error);
        }
       }
    });
  });

  $(document).on("click", ".erweiterte-suche", function(e) {
    $('#advanced-search-container-id').show(200);
  });

  // iterate through fields and remove fields with empty values
  function purify(anObject) {
    var result = {};
    Object.keys(anObject).forEach(function(key, index) {
      if(anObject[key] !== '') result[key] = anObject[key];
    });

    return result;
  }

  $(document).on("click", "#advanced-search-form-submit", function(e) {
    var distance = $('#advanced-search-form-submit-entfernung').val();
    var city = $('#advanced-search-form-submit-city').val();
    var hours = $('#advanced-search-form-submit-city-open').find('option:selected').attr('value');
    var state = $('#advanced-search-form-submit-city-state').find('option:selected').attr('value');
    var manager = $('#advanced-search-form-submit-city-betreiber').find('option:selected').attr('value');
    var isDBBahn = $('#advanced-search-form-submit-city-isdbbahn').find('option:selected').attr('value');
    var type = $('#advanced-search-form-submit-city-parkplatztype').find('option:selected').attr('value');
    var technic = $('#advanced-search-form-submit-city-technik').find('option:selected').attr('value');

    var datas = {
      city: city,
      hours: hours,
      state: state,
      manager: manager,
      isDBBahn: isDBBahn,
      type: type,
      technic: technic,
      distance: distance
    };

    // iterate through fields and remove fields with empty values
    datas = purify(datas);

    console.log(datas);

    $.ajax({type: "GET",
      url: '/parkingplaces/',
      dataType: "json",
      data: datas,
      success: function(msg){
        console.log(msg);
        $('#results-container').empty();
        processResponse(msg, false, null, null);
        $(window).scrollTop(0);
        $('#advanced-search-container-id').hide();
      },
       error: function(xhr, status, error) {
        if(xhr.status == 404) {
            console.log(error);
            $('#results-container').html(HTML_RESULTS_NOT_FOUND);
            map.removeAllMarkers();
        }else{
          if(xhr.status == 500) {
              console.log(error);
          }
        }
       }
    });
  });

  $(document).on("click", ".add-to-fav", function(e) {
    var placeId = $(this).parents('.panel').eq(0).attr('parkraumId');
    var favsIds = sm.getCookie('favs');
    console.log('favsIds', favsIds)
    if(favsIds !== "") {
      var tabFavsIds = JSON.parse(favsIds);

      var index = tabFavsIds.indexOf(placeId);
      if(index > -1) {
        tabFavsIds.splice(index, 1);
      } else {
        tabFavsIds.push(placeId);
      }

      console.log(tabFavsIds);

      sm.setCookie('favs', JSON.stringify(tabFavsIds));
    } else {
      sm.setCookie('favs', JSON.stringify([placeId]));
    }
    displayFavorites();
    // sm.deleteCookie('favs');
  });

  $(document).on("click", "#advanced-search-form-submit-use-user-location", function(e) {
    animate(this);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(laodCityNameFromCoordinates);
        // desanimate(this);
    } else {
        alert("Geolocation is not supported by this browser.");
        desanimate(this);
    }
  });

  function laodCityNameFromCoordinates(position){
    $.ajax({type: "GET",
      url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&sensor=true',
      dataType: "json",
      success: function(msg){
        $('#advanced-search-form-submit-city').val(msg.results[1].address_components[1].long_name);
        $("#advanced-search-form-submit-use-user-location").siblings('.loader').hide();
        $("#advanced-search-form-submit-use-user-location").removeAttr('disabled');
        // $('#results-container').removeClass('loading');
      },
       error: function(xhr, status, error) {
         $('#results-container').removeClass('loading');
        if(xhr.status == 404) {
            console.log(error);
            $('#results-container').html(HTML_RESULTS_NOT_FOUND);
            map.removeAllMarkers();
        }else{
          if(xhr.status == 500) {
              console.log(error);
          }
        }
       }
    });
  }

  function animate(id){
    $('<span class="loader"><img src="../images/35.gif" alt="" class="loader-img" /></span>').insertAfter(id);
    $(id).attr('disabled', 'disabled');
  }

  function desanimate(id){
    $(id).siblings('.loader').hide();
    $(id).removeAttr('disabled');
  }

  function loadResults(input){

    if((input != "")&&(input.length > 1)){

      $.ajax({type: "GET",
        url: '/parkingplaces/',
        data: {
           parkingplacename: input
        },
        dataType: "json",
        success: function(msg){
          console.log(msg);
          $('#results-container').empty();
          processResponse(msg, false, null, null);
        },
         error: function(xhr, status, error) {
          if(xhr.status == 404) {
              console.log(error);
              $('#results-container').html(HTML_RESULTS_NOT_FOUND);
              map.removeAllMarkers();
          }else{
            if(xhr.status == 500) {
                console.log(error);
            }
          }
         }
      });
    }else map.removeAllMarkers();
  }

  function loadParkingPlacesNearAround(position) {
    $('#results-container').addClass('loading');
    $.ajax({type: "GET",
      url: '/parkingplaces/',
      dataType: "json",
      data: {
         latitude: position.coords.latitude,
         longitude: position.coords.longitude
      },
      success: function(msg){
        console.log(msg);
        $('#results-container').removeClass('loading');
        processResponse(msg, true, position.coords.latitude, position.coords.longitude);
      },
       error: function(xhr, status, error) {
         $('#results-container').removeClass('loading');
        if(xhr.status == 404) {
            console.log(error);
            $('#results-container').html(HTML_RESULTS_NOT_FOUND);
            map.removeAllMarkers();
        }else{
          if(xhr.status == 500) {
              console.log(error);
          }
        }
       }
    });
    return false;
  }

  function processResponse(msg, display_user_current_position, user_latitude, user_longitude){
    var code = "";
    $('#results-container').empty();
    map.removeAllMarkers();
    _.each(msg, function(place){
      var identifier = place._id;

        if (place.parkraumDisplayName != '') var name = place.parkraumDisplayName;
        else var name = place.parkraumBahnhofName + ' ' + place.parkraumKennung;
        if(place.parkraumIsAusserBetrieb){
          code += '<div class="panel panel-default disabled-div" parkraumId="'+ place.parkraumId +'">';
          name += '<i>[Außerbetrieb]</i>';
        }
        else code += '<div class="panel panel-default" parkraumId="'+ place.parkraumId +'">';
        code += '<span class="glyphicon glyphicon-star add-to-fav at-close-position" aria-hidden="true"></span>';
        code += '<div class="panel-heading"><a href="#" class="parkplatz_link" marker_identifier="'+identifier+'">' + name + '</a></div>';

      code += '<div class="panel-content small"><p><ul>';
      var c = 1;
      console.log(place.occupancy);
      if(place.occupancy != 0) code += '<li class="red">Enthält <span class="bold">'+ place.parkraumStellplaetze +' Parkplätze</span>. <span class="bold">'+ occupancy_correspondance[place.occupancy]['text'] +'</span> gerade frei. </li>';
      else code += '<li class="red">Enthält <span class="bold">'+ place.parkraumStellplaetze +' Parkplätze</span>. <span class="old">Keine Angabe zu den Freiplätzen.</span></li>';
      if(place.parkraumParkart != "") code += '<li class="red">Parkraumparkart <span class="bold"> <img src="'+ icons[place.parkraumParkart] +'" alt="" />  '+ place.parkraumParkart +'.</span></li>';
      if(place.parkraumEntfernung != "") code += '<li class="red">Befindet sich <span class="bold">'+ place.parkraumEntfernung +' von '+ place.parkraumBahnhofName +'.</span></li>';
      if(place.parkraumZufahrt != "") code += '<li class="red">Straße: <span class="bold">'+ place.parkraumZufahrt +'.</span></li>';
      if(place.parkraumOeffnungszeiten != "") code += '<li class="red">Öffnungszeiten: <span class="bold">'+ place.parkraumOeffnungszeiten +'.</span></li>';
      if(place.parkraumTechnik != "") code += '<li class="red">parkraumTechnik: <span class="bold">'+ place.parkraumTechnik +'.</span></li>';
      if(place.zahlungMedien != "") code += '<li class="red">zahlungMedien: <span class="bold">'+ place.zahlungMedien +'.</span></li>';
      if(place.tarifParkdauer != "") code += '<li class="red">Parkdauer: <span class="bold">'+ place.tarifParkdauer +'.</span></li>';
      if(place.parkraumBetreiber != "") code += '<li class="red">Betreiber: <span class="bold">'+ place.parkraumBetreiber +'.</span></li>';
        code += '</ul></p>';
        code += '<ul class="links-ul"><li><a href="#" class="bold show-tarife-link"><span class="glyphicon glyphicon-euro" aria-hidden="true"></span> Tarife ansehen</a></li>';
        code += '<div class="bs-example table-preise" data-example-id="hoverable-table"> <table class="table table-hover"> <thead> ';
          code += '<tr class="bold"> <th>#</th> <th>Bezeichnung</th><th>Preis</th></tr> </thead> <tbody> <tr>';
          if(place.tarif20Min != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>20Min.</td> <td>'+ place.tarif20Min +'€</td></tr>';
          if(place.tarif30Min != "") code += ' <tr> <th scope="row">'+ (c++).toString() +'</th> <td>30Min.</td> <td>'+ place.tarif30Min +'€</td></tr>';
          if(place.tarif1Std != "") code += ' <tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Std</td> <td>'+ place.tarif1Std +'€</td></tr>';
          if(place.tarif1Tag != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Tag</td> <td>'+ place.tarif1Tag +'€</td></tr>';
          if(place.tarif1TagRabattDB != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Tag mit Rabbat der DBBahn</td> <td>'+ place.tarif1TagRabattDB +'€</td></tr>';
          if(place.tarif1Woche != "") code += ' <tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Woche</td> <td>'+ place.tarif1Woche +'€</td></tr><tr>';
          if(place.tarif1WocheRabattDB != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Woche mit Rabbat der DBahn</td> <td>'+ place.tarif1WocheRabattDB +'€</td></tr>';
          if(place.tarif1MonatAutomat != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Monat (Zahlung am Automat)</td> <td>'+ place.tarif1MonatAutomat +'€</td></tr>';
          if(place.tarif1MonatDauerparken != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Monat (Dauerparken)</td> <td>'+ place.tarif1MonatDauerparken +'€</td></tr>';
          if(place.tarif1MonatDauerparkenFesterStellplatz != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Monat (Festplatz)</td> <td>'+ place.tarif1MonatDauerparkenFesterStellplatz +'€</td></tr>';
        code += '</tbody> </table> </div>';
        // if(place.occupancy != 0) code += '<li><a href="#" class="bold laod-prognose-daten" parkraumId="'+ place.parkraumId +'"> <span class="glyphicon glyphicon-signal" aria-hidden="true"></span> Belegungs Prognose ansehen</a><div class="belegungs-chart"></div></li></ul>';
        code += '<li><span class="bold silver" parkraumId="'+ place.parkraumId +'"> <span class="glyphicon glyphicon-signal" aria-hidden="true"></span> Keine Prognose verfügbar</span></li></ul>';
        code +='</div></div>';
      code += '<hr>';
      var point = new google.maps.LatLng(place.parkraumGeoLatitude, place.parkraumGeoLongitude);
      var contentString = '<div id="content">'+
          '<div id="siteNotice">'+
          '<h5 id="firstHeading" class="firstHeading"><!--<img src="../images/parking.png">--> '+name+'</h5>'+
          '</div>';
      map.addMarker(point, icons[place.parkraumParkart], contentString, identifier, false, false);

    });
    if(display_user_current_position){
      var user_point = new google.maps.LatLng(user_latitude, user_longitude);
      var contentString = '<div id="content">'+
          '<div id="siteNotice">'+
          '<h5 id="firstHeading" class="firstHeading">Da bist Du!</h5>'+
          '</div>';
      map.addMarker(user_point, icons['user_icon'], contentString, '', true, true);
      // reCenter
      $('#hinweis-advanced-search').html(msg.length + ' Treffer in deiner Nähe');
    }else $('#hinweis-advanced-search').html(msg.length + ' Treffer gefunden');
    $('#results-container').html(code);
    unDisplayFavorites();
    displayFavorites();
    map.adjustMapForMarkers();
  }
});
