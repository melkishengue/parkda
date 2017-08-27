$(document).ready(function(){
  // THIS IS THS JAVASCRIPT FILE FOR THE MOBILE VERSION
  var IP = 'localhost';
  var PORT = '1991';
  // Server URL
  var $SERVER_URL = "http://"+IP+":"+PORT;
  // List of icons for the MAP
  var icons = {
    'Parkplatz': '../images/letter_p.png',
    'Parkhaus': '../images/parkinggarage.png',
    'Parkraum': '../images/parkinggarage.png',
    'Tiefgarage': '../images/parkinggarage.png',
    'Parkdeck': '../images/conference.png',
    'user_icon': '../images/direction_down.png'
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
  var HTML_RESULTS_NOT_FOUND = '<div class="alert alert-danger-db">Keine treffern gefunden.<br/>Dass es keine Treffern gibt liegt daran, dass nicht alle Bahnhöfe Parkplätze anbieten.</br></br>Hinweis: Benutze die <a class="in-der-naehe-suchen">Suche in Deiner Nähe</a> um na­he­lie­gende Parkplätze zu finden, oder die <a class="erweiterte-suche">erweiterte Suche</a> um naheliegende Parkplätze eines bestimmten Ort zu finden.</div>';

  // Will contain the list of users favorites places
  var favorites = [];
  // modal to display search results
  var modal = new tingle.modal({
      footer: true,
      stickyFooter: true,
      cssClass: ['custom-class-1', 'custom-class-2'],
  });
  // add button
  modal.addFooterBtn('Schließen', 'tingle-btn tingle-btn--danger', function() {
      // here goes some logic
      modal.close();
      $('#reshow-results').show();
  });

  // modal for displaying no resuslts error message
  var modal2 = new tingle.modal({
      footer: true,
      stickyFooter: true,
      cssClass: ['custom-class-1', 'custom-class-2'],
  });
  // add button
  modal2.addFooterBtn('Schließen', 'tingle-btn tingle-btn--danger', function() {
      // here goes some logic
      modal2.close();
  });

  // modal for displaying no resuslts error message
  var modal3 = new tingle.modal({
      footer: true,
      stickyFooter: true,
      cssClass: ['custom-class-1', 'custom-class-2'],
  });
  // add button
  modal3.addFooterBtn('Suchen', 'tingle-btn tingle-btn--primary', function() {
    var entfernung = $('#advanced-search-form-submit-entfernung').val();
    var city = $('#advanced-search-form-submit-city').val();
    var hours = $('#advanced-search-form-submit-city-open').find('option:selected').attr('value');
    var bundesland = $('#advanced-search-form-submit-city-state').find('option:selected').attr('value');
    var betreiber = $('#advanced-search-form-submit-city-betreiber').find('option:selected').attr('value');
    var isDBBahn = $('#advanced-search-form-submit-city-isdbbahn').find('option:selected').attr('value');
    var type = $('#advanced-search-form-submit-city-parkplatztype').find('option:selected').attr('value');
    var technic = $('#advanced-search-form-submit-city-technik').find('option:selected').attr('value');
    $.ajax({type: "POST",
      url: '/api/search/by/advanced/',
      dataType: "json",
      data: {
        city: city,
        hours: hours,
        bundesland: bundesland,
        betreiber: betreiber,
        isDBBahn: isDBBahn,
        type: type,
        technic: technic,
        entfernung: entfernung
      },
      success: function(msg){
        $('#results-container').empty();
        processResponse(msg, false, null, null);
        $(window).scrollTop(0);
        $('#advanced-search-container-id').hide();
      },
       error: function(xhr, status, error) {
        if(xhr.status == 404) {
            console.log(error);
            modal2.setContent(HTML_RESULTS_NOT_FOUND);
            modal2.open();
            modal.close();
            modal3.close();
            map.removeAllMarkers();
        }else{
          if(xhr.status == 500) {
              console.log(error);
          }
        }
       }
    });
  });
  // add button
  modal3.addFooterBtn('Schließen', 'tingle-btn tingle-btn--danger', function() {
      modal3.close();
  });

  modal3.isInitialised = false;

  $(document).on("click", ".erweiterte-suche", function(e) {
    if(modal3.isInitialised == false){
      var content = '';
      content +=  "<div id='mobile-form-search-container'>"
        content +=  "<form action='' id='advanced-search-form'>"
        content +=  "  <div class='form-group'>"
            content +=  "<label for='advanced-search-form-submit-entfernung' class='bold'>Max. Entfernung(Km):</label>"
            content +=  "<input type='text' class='form-control' id='advanced-search-form-submit-entfernung' placeholder='Entfernung in km'></input>"
          content +=  "</div>"
          content +=  "<div class='form-group'>"
            content +=  "<label for='advanced-search-form-submit-city' class='bold'>Von (Stadt)</label><a href='#' id='advanced-search-form-submit-use-user-location'>"
              content +=  "<span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span> Standort verwenden</a>"
            content +=  "<input type='text' class='form-control' id='advanced-search-form-submit-city' placeholder='Name einer Stadt'></input>"
        content +=  "</div>"
          content +=  "<div class='form-group'>"
            content +=  "<label for='advanced-search-form-submit-city-open' class='bold'>Öffnungszeiten:</label>"
            content +=  "<select class='show-menu-arrow' id='advanced-search-form-submit-city-open'>"
              content +=  "<option value=''>-- Wählen --</option>"
              content +=  "<option value='24 Stunden, 7 Tage'>24 Stunden, 7 Tage</option>"
              content +=  "<option value='06:00 - 22:00 Uhr'>06:00 - 22:00 Uhr</option>";
              content +=  "<option value='04:00 - 22:00 Uhr. Ausfahrt jederzeit möglich.'>04:00 - 22:00 Uhr. Ausfahrt jederzeit möglich.</option>"
              content +=  "<option value='Mo-Fr: 06:00 - 22:00 Uhr, Sa: 07:00 - 24:00 Uhr, So+F: geschlossen. Ausfahrt mit Parkticket jederzeit möglich.'>Mo-Fr: 06:00 - 22:00 Uhr, Sa: 07:00 - 24:00 Uhr, So+F: geschlossen. Ausfahrt mit Parkticket jederzeit möglich.</option>"
            content +=  "</select>"
          content +=  "</div>"
          content +=  "<div class='form-group'>"
            content +=  "<label for='advanced-search-form-submit-city-state' class='bold'>Bundesland:</label>"
            content +=  "<select class='show-menu-arrow' id='advanced-search-form-submit-city-state' ultiple ata-actions-box='true' noneSelectedText='Keine Auswahl' selectAllText='Alle auswählen'>"
              content +=  "<option value=''>-- Wählen --</option>"
              content +=  "<option value='Baden-Württemberg'>Baden-Württemberg</option>"
              content +=  "<option value='Bayern'>Bayern</option>"
              content +=  "<option value='Brandenburg'>Brandenburg</option>"
              content +=  "<option value='Bremen'>Bremen</option>"
              content +=  "<option value='Berlin'>Berlin</option>"
              content +=  "<option value='Hamburg'>Hamburg</option>"
              content +=  "<option value='Hessen'>Hessen</option>"
              content +=  "<option value='Niedersachsen'>Niedersachsen</option>"
              content +=  "<option value='Nordrhein-Westfalen'>Nordrhein-Westfalen</option>"
              content +=  "<option value='Rheinland-Pfalz'>Rheinland-Pfalz</option>"
              content +=  "<option value='Saarland'>Saarland</option>"
              content +=  "<option value='Sachsen'>Sachsen</option>"
              content +=  "<option value='Sachsen-Anhalt'>Sachsen-Anhalt</option>"
              content +=  "<option value='Schleswig-Holstein'>Schleswig-Holstein</option>"
              content +=  "<option value='Thüringen'>Thüringen</option>"
              content +=  "<option value='Mecklenburg-Vorpommern'>Mecklenburg-Vorpommern</option>"
            content +=  "</select>"
          content +=  "</div>"
          content +=  "<div class='form-group'>"
            content +=  "<label for='advanced-search-form-submit-city-betreiber' class='bold'>Betreiber:</label>"
            content +=  "<select class='show-menu-arrow' id='advanced-search-form-submit-city-betreiber'>"
              content +=  "<option value=''>-- Wählen --</option>"
              content +=  "<option  value='PRBL - Parkraumbewirtschaftung Linne'>PRBL - Parkraumbewirtschaftung Linne</option>"
              content +=  "<option value='Contipark Parkgaragen GmbH (www.contipark.de)'>Contipark Parkgaragen GmbH (www.contipark.de)</option>"
            content +=  "</select>"
          content +=  "</div>"
          content +=  "<div class='form-group'>"
            content +=  "<label for='advanced-search-form-submit-city-isdbbahn' class='bold'>Von DBBahn:</label>"
            content +=  "<select class='show-menu-arrow' id='advanced-search-form-submit-city-isdbbahn'>"
              content +=  "<option value=''>-- Wählen --</option>"
              content +=  "<option value='true'>Ja</option>"
              content +=  "<option value='false'>Nein</option>"
            content +=  "</select>"
          content +=  "</div>"
          content +=  "<div class='form-group'>"
            content +=  "<label for='advanced-search-form-submit-city-parkplatztype' class='bold'>ParkplatzArt:</label>"
            content +=  "<select class='show-menu-arrow' id='advanced-search-form-submit-city-parkplatztype'>"
            content +=  "  <option value=''>-- Wählen --</option>"
              content +=  "<option value='Parkplatz'>Parkplatz</option>"
              content +=  "<option value='Parkdeck'>Parkdeck</option>"
              content +=  "<option value='Parkhaus'>Parkhaus</option>"
              content +=  "<option value='Tiefgarage'>Tiefgarage</option>"
            content +=  "</select>"
          content +=  "</div>"
          content +=  "<div class='form-group'>"
            content +=  "<label for='advanced-search-form-submit-city-technik' class='bold'>ParkraumTechnik:</label>"
            content +=  "<select class='show-menu-arrow'  class='float-left' id='advanced-search-form-submit-city-technik'>"
              content +=  "<option value=''>-- Wählen --</option>"
              content +=  "<option value='keine'>Keine</option>"
              content +=  "<option value='Parkscheinautomat'>Parkscheinautomat</option>"
              content +=  "<option value='Schrankenanlage'>Schrankenanlage</option>"
            content +=  "</select>"
          content +=  "</div>"
        content +=  "</form>"
      content +=  "</div>";

      modal.close();
      modal2.close();
      modal3.setContent(content);
      modal3.open();
      $("#navbar-toggle-id").click();

      var u_id = document.getElementById("advanced-search-form-submit-use-user-location");
      var fetchUserLocation = function() {
          var elt = this;
          animate(elt);
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(laodCityNameFromCoordinates);
              // desanimate(this);
          } else {
              alert("Geolocation is not supported by this browser.");
              desanimate(elt);
          }
      };
      u_id.addEventListener('click', fetchUserLocation, false);
      modal3.isInitialised = true;
    }else{
      modal3.open();
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

  // Initialise Map
  var center = new google.maps.LatLng(51.7080978, 8.7725584);
  var map = new ParkplatzMap(center, 7);
  // styles for the map. taken from https://snazzymaps.com
  var styles = [{"featureType":"water","stylers":[{"color":"#19a0d8"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"weight":6}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#e85113"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-40}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-20}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"road.highway","elementType":"labels.icon"},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"lightness":20},{"color":"#efe9e4"}]},{"featureType":"landscape.man_made","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"hue":"#11ff00"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"hue":"#4cff00"},{"saturation":58}]},{"featureType":"poi","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#f0e4d3"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-10}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"}]}];
  map.initialise(document.getElementById("map-canvas"), styles);

  favorites = [];
  function loadFavorites(){
    $.ajax({type: "GET",
      url: '/api/user/favorites/parkraums/',
      dataType: "json",
      success: function(msg){
        console.log(msg);
        $('#results-container').empty();
        _.each(msg, function(parkraum){
          favorites.push(parkraum);
        });
        $("#navbar-toggle-id").click();
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
  }

  function displayFavorites(){
    console.log(favorites);
    _.each(favorites, function(favorite){
      $('.panel[parkraumId='+ favorite.parkraumId +']').find('.add-to-fav').addClass('favorited');
    })
  }

  function unDisplayFavorites(){
    $('.add-to-fav').removeClass('favorited');
  }

  function fethcfavorites(){
    $.ajax({type: "GET",
      url: '/api/favorites/user/',
      dataType: "json",
      success: function(msg){
        _.each(msg[0].favorites, function(favorite){
          favorites.push(favorite);
        })
        // favorites = msg.favorites;
        // console.log(favorites);
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
  }

  // handler for researching parkings near the user location
  $(document).on("click", ".favs-zeigen", function(event) {
    loadFavorites();
  });

  $('form').submit(function( event ) {
    loadResults($("#navbar-search-id").val());
    $("#navbar-toggle-id").click();
    event.preventDefault();
  });

  // handler for researching parkings near the user location
  $(document).on("click", ".in-der-naehe-suchen", function(event) {
    // event.preventDefault();
    // Get the GPS position from the navigator
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(loadParkraumeInderNaehe,
    function(error){
         alert(error.message);
    });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
  });

  $(document).on("click", ".parkplatz_link", function(e) {
    var identifier = $(this).attr('marker_identifier');
    console.log(typeof map.getMarkers());
    var _marker = map.getMarkers().filter(function(marker){
      return marker.identifier == identifier;
    });

    console.log(identifier);
    console.log(_marker[0]);
    map.setCenter(_marker[0].position.lat(), _marker[0].position.lng());
    map.setZoom(18);

    e.preventDefault();
    // return false;
  });

  $(document).on("click", "#search-submit", function(e) {
    if((typeof modal) != 'undefined') modal.close();
    loadResults($("#navbar-search-id").val());
    $("#navbar-toggle-id").click();
  });

  $(document).on("click", ".show-tarife-link", function(e) {
    alert('click');
    $(this).parents('.panel-content').find('.table-preise').toggle(300);
    e.preventDefault();
    // return false;
  });

  $(document).on("click", "#reshow-results", function(e) {
    if(modal) modal.open();
  });

  $(document).on("click", ".mehrInfos", function(e) {
    var parkraumId = $(this).attr('parkraumId');
    $.ajax({type: "GET",
      url: '/api/parkraums/' + parkraumId,
      dataType: "json",
      success: function(msg){
        console.log(msg);
        $('#results-container').empty();
        processResponse(msg, false, null, null);
      },
       error: function(xhr, status, error) {
        if(xhr.status == 404) {
            console.log(error);
        }else{
          if(xhr.status == 500) {
              console.log(error);
          }
        }
       }
    });
  });

  function loadResults(input){
    if((input != "")&&(input.length > 1)){
      $.ajax({type: "GET",
        url: '/api/parkraums/search/by/parkraumName/' + input,
        dataType: "json",
        success: function(msg){
          console.log(msg);
          var code = "";
          $('#results-container').empty();
          processResponse(msg, false, null, null);
        },
         error: function(xhr, status, error) {
          if(xhr.status == 404) {
              console.log(error);
              modal2.setContent(HTML_RESULTS_NOT_FOUND);
              modal2.open();
              modal.close();
              modal3.close();
              var u_id = document.getElementsByClassName("in-der-naehe-suchen");
              var f = function() {
                  // $("#navbar-toggle-id").click();
                  // $(".navbar-collapse collapse").slideUp();
                  var elt = this;
                  animate(elt);
                  if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(loadParkraumeInderNaehe,
                        function(error){
                             alert(error.message);
                        });
                      // desanimate(this);
                  } else {
                      alert("Geolocation is not supported by this browser.");
                      desanimate(elt);
                  }
              };
              u_id[0].addEventListener('click', f, false);

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

  function loadParkraumeInderNaehe(position) {
    // alert("Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude);
    $('#results-container').addClass('loading');
    $("#navbar-toggle-id").click();
    $.ajax({type: "GET",
      url: '/api/parkraums/search/by/currentPosition',
      dataType: "json",
      data: {
         latitude: position.coords.latitude,
         longitude: position.coords.longitude
      },
      success: function(msg){
        $('#results-container').removeClass('loading');
        processResponse(msg, true, position.coords.latitude, position.coords.longitude);
      },
       error: function(xhr, status, error) {
         $('#results-container').removeClass('loading');
        if(xhr.status == 404) {
            console.log(error);
            $('#results-container').html('<div class="alert alert-danger-db">keine treffer gefunden.<br/>Hinweis: Dass es keine Treffern gibt liegt daran, dass nicht alle bahnhöfe parkplatz anbieten.</div> ');
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
    _.each(msg, function(parkraum){
      var identifier = parkraum._id;

        if (parkraum.parkraumDisplayName != '') var name = parkraum.parkraumDisplayName;
        else var name = parkraum.parkraumBahnhofName + ' ' + parkraum.parkraumKennung;
        if(parkraum.parkraumIsAusserBetrieb){
          code += '<div class="panel panel-default disabled-div" parkraumId="'+ parkraum.parkraumId +'">';
          name += '<i>[Außerbetrieb]</i>';
        }
        else code += '<div class="panel panel-default" parkraumId="'+ parkraum.parkraumId +'">';
        code += '<span class="glyphicon glyphicon-star add-to-fav" aria-hidden="true"></span>';
        code += '<div class="panel-heading"><a href="#" class="parkplatz_link" marker_identifier="'+identifier+'">' + name + '</a></div>';

      code += '<div class="panel-content small"><p><ul>';
      // for (property in parkraum) {
      //   code += property + ':' + parkraum[property]+'</br>';
      // }
      // if(parkraum.occupancy != 0) code += '<li><span class="bold">Freiplätze: </span>'+ (parkraum.parkraumStellplaetze - parkraum.occupancy) +'/'+ parkraum.parkraumStellplaetze +'</li>';
      var c = 1;
      if(parkraum.occupancy != 0) code += '<li class="red">Enthält <span class="bold">'+ parkraum.parkraumStellplaetze +' Parkplätze</span>. <span class="bold">'+ occupancy_correspondance[parkraum.occupancy]['text'] +'</span> gerade frei. </li>';
      else code += '<li class="red"><span class="old">Keine Angabe zu den Freiplätzen.</span></li>';
      if(parkraum.parkraumParkart != "") code += '<li class="red">Parkraumparkart <span class="bold"> <img src="'+ icons[parkraum.parkraumParkart] +'" alt="" />  '+ parkraum.parkraumParkart +'.</span></li>';
      if(parkraum.parkraumEntfernung != "") code += '<li class="red">Befindet sich <span class="bold">'+ parkraum.parkraumEntfernung +' von '+ parkraum.parkraumBahnhofName +'.</span></li>';
      if(parkraum.parkraumZufahrt != "") code += '<li class="red">Straße: <span class="bold">'+ parkraum.parkraumZufahrt +'.</span></li>';
      if(parkraum.parkraumOeffnungszeiten != "") code += '<li class="red">Öffnungszeiten: <span class="bold">'+ parkraum.parkraumOeffnungszeiten +'.</span></li>';
      if(parkraum.parkraumTechnik != "") code += '<li class="red">parkraumTechnik: <span class="bold">'+ parkraum.parkraumTechnik +'.</span></li>';
      if(parkraum.zahlungMedien != "") code += '<li class="red">zahlungMedien: <span class="bold">'+ parkraum.zahlungMedien +'.</span></li>';
      if(parkraum.tarifParkdauer != "") code += '<li class="red">Parkdauer: <span class="bold">'+ parkraum.tarifParkdauer +'.</span></li>';
      if(parkraum.parkraumBetreiber != "") code += '<li class="red">Betreiber: <span class="bold">'+ parkraum.parkraumBetreiber +'.</span></li>';
        code += '</ul></p>';
        code += '<ul class="links-ul"><li><a href="#" class="bold show-tarife-link"><span class="glyphicon glyphicon-euro" aria-hidden="true"></span> Tarife ansehen</a></li>';
        code += '<div class="bs-example table-preise" data-example-id="hoverable-table"> <table class="table table-hover"> <thead> ';
          code += '<tr class="bold"> <th>#</th> <th>Bezeichnung</th><th>Preis</th></tr> </thead> <tbody> <tr>';
          if(parkraum.tarif20Min != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>20Min.</td> <td>'+ parkraum.tarif20Min +'€</td></tr>';
          // else code += '<tr> <th scope="row">1</th> <td>20Min.</td> <td>- €</td></tr>';
          if(parkraum.tarif30Min != "") code += ' <tr> <th scope="row">'+ (c++).toString() +'</th> <td>30Min.</td> <td>'+ parkraum.tarif30Min +'€</td></tr>';
          // else code += ' <tr> <th scope="row">2</th> <td>30Min.</td> <td>- €</td></tr>';
          if(parkraum.tarif1Std != "") code += ' <tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Std</td> <td>'+ parkraum.tarif1Std +'€</td></tr>';
          // else code += ' <tr> <th scope="row">3</th> <td>1Std</td> <td>- €</td></tr>';
          if(parkraum.tarif1Tag != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Tag</td> <td>'+ parkraum.tarif1Tag +'€</td></tr>';
          // else code += '<tr> <th scope="row">4</th> <td>1Tag</td> <td>- €</td></tr>';
          if(parkraum.tarif1TagRabattDB != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Tag mit Rabbat der DBBahn</td> <td>'+ parkraum.tarif1TagRabattDB +'€</td></tr>';
          // else code += '<tr> <th scope="row">5</th> <td>1Tag mit Rabbat der DBBahn</td> <td>- €</td></tr>';
          if(parkraum.tarif1Woche != "") code += ' <tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Woche</td> <td>'+ parkraum.tarif1Woche +'€</td></tr><tr>';
          // else code += ' <tr> <th scope="row">6</th> <td>1Woche</td> <td>- €</td></tr><tr>';
          if(parkraum.tarif1WocheRabattDB != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Woche mit Rabbat der DBahn</td> <td>'+ parkraum.tarif1WocheRabattDB +'€</td></tr>';
          // else code += '<tr> <th scope="row">7</th> <td>1Woche mit Rabbat der DBahn</td> <td>- €</td></tr>';
          if(parkraum.tarif1MonatAutomat != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Monat (Zahlung am Automat)</td> <td>'+ parkraum.tarif1MonatAutomat +'€</td></tr>';
          // else code += '<tr> <th scope="row">8</th> <td>1Monat (Zahlung am Automat)</td> <td>- €</td></tr>';
          if(parkraum.tarif1MonatDauerparken != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Monat (Dauerparken)</td> <td>'+ parkraum.tarif1MonatDauerparken +'€</td></tr>';
          // else code += '<tr> <th scope="row">9</th> <td>1Monat (Dauerparken)</td> <td>- €</td></tr>';
          if(parkraum.tarif1MonatDauerparkenFesterStellplatz != "") code += '<tr> <th scope="row">'+ (c++).toString() +'</th> <td>1Monat (Festplatz)</td> <td>'+ parkraum.tarif1MonatDauerparkenFesterStellplatz +'€</td></tr>';
          // else code += '<tr> <th scope="row">10</th> <td>1Monat (Festplatz)</td> <td>- €</td></tr>';
        code += '</tbody> </table> </div>';
        if(parkraum.occupancy != 0) code += '<li><a href="#" class="bold laod-prognose-daten" parkraumId="'+ parkraum.parkraumId +'"> <span class="glyphicon glyphicon-signal" aria-hidden="true"></span> Belegungs Prognose ansehen</a><div class="belegungs-chart"></div></li></ul>';
        else code += '<li><span class="bold silver" parkraumId="'+ parkraum.parkraumId +'"> <span class="glyphicon glyphicon-signal" aria-hidden="true"></span> Keine Prognose verfügbar</span></li></ul>';
        code +='</div></div>';
      code += '<hr>';
      var point = new google.maps.LatLng(parkraum.parkraumGeoLatitude, parkraum.parkraumGeoLongitude);
      var contentString = '<div id="content">'+
          '<div id="siteNotice">'+
          '<h5 id="firstHeading" class="firstHeading"><!--<img src="../images/parking.png">--> '+name+'</h5>'+
          '<div id="bodyContent">';
          // '<p><b>'+parkraum.parkraumEntfernung+'m</b> vom Hbf.';
          // if(parkraum.occupancy != 0) contentString += '</br>Noch <b>'+ (parkraum.parkraumStellplaetze - parkraum.occupancy) +'</b> frei Plätze!';
          if(parkraum.occupancy != 0) contentString += '</br>Noch <b>'+ (parkraum.parkraumStellplaetze - parkraum.occupancy) +'</b> frei Plätze!</br><a href="#" class="mehrInfos" parkraumId="' + parkraum.parkraumId + '"> >> Mehr Infos</a>';
          else contentString += '</br>Keine Infos zu den Plätzen.</br><a href="#" class="mehrInfos" parkraumId="' + parkraum.parkraumId + '"> >> Mehr Infos</a>';
          '</p>'+
          '</div>'+
          '</div>';
          '</p>'+
          '</div>'+
          '</div>';

      map.addMarker(point, icons[parkraum.parkraumParkart], contentString, identifier, false);

    });
    if(display_user_current_position){
      console.log(msg.length);
      var user_point = new google.maps.LatLng(user_latitude, user_longitude);
      var contentString = '<div id="content">'+
          '<div id="siteNotice">'+
          '<h5 id="firstHeading" class="firstHeading">Da bist Du!</h5>'+
          // '<div id="bodyContent">'+
          // '<p><b>'+msg.length+'</b> Parkplätze in deiner Nähe gefunden. '+
          // '</div>'+
          '</div>';
      map.addMarker(user_point, icons['user_icon'], contentString, '', true);
    }
    // set content
    modal.setContent(code);
    // $('.add-to-fav').addClass('favorited');

    unDisplayFavorites();
    displayFavorites();

    // add a button
    // modal.addFooterBtn('Button label', 'tingle-btn tingle-btn--primary', function() {
    //     // here goes some logic
    //     modal.close();
    // });



    // open modal
    modal.open();
    modal2.close();
    modal3.close();
    // adding Listeners for the links to show prices
    var classname = document.getElementsByClassName("show-tarife-link");
    var showTarifeListener = function() {
        var elt = this;
        $(elt).parents('.panel-content').find('.table-preise').toggle(300);
    };
    for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', showTarifeListener, false);
    }

    // adding Listeners for the links to parkraums name
    var classname = document.getElementsByClassName("parkplatz_link");
    var showOnMapListener = function() {
        var elt = this;
        var identifier = $(elt).attr('marker_identifier');
        console.log(typeof map.getMarkers());
        var _marker = map.getMarkers().filter(function(marker){
          return marker.identifier == identifier;
        });
        _.each(map.getMarkers(), function(marker){
          marker.infoWindow.close();
        })
        console.log(identifier);
        console.log(_marker[0]);
        map.setCenter(_marker[0].position.lat(), _marker[0].position.lng());
        _marker[0].infoWindow.open(map, _marker[0]);
        map.setZoom(18);
        modal.close();

        modal2.close();
        modal3.close();
        $('#reshow-results').show();
        e.preventDefault();
    };
    for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', showOnMapListener, false);
    }

    // adding Listeners to the links to show occupancydatas
    var classname = document.getElementsByClassName("laod-prognose-daten");
    var showOccupancyDatas = function() {
        var elt = this;
        var html = $(elt).siblings('.belegungs-chart').eq(0).html();
        if(html == ''){
          var parkraumId = $(elt).attr('parkraumId');
          $.ajax({type: "GET",
            url: '/api/belegungsprognoses/' + parkraumId,
            dataType: "json",
            success: function(msg){
              console.log(msg);
              var prognose = msg[0];
                $(elt).siblings('.belegungs-chart').eq(0).show().highcharts({
                    title: {
                        text: 'Belegungs des Tages',
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
                            text: 'Belegungs',
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
                        valueSuffix: '°C'
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        borderWidth: 0,
                        font: 'bold 11px DBSans'
                    },
                    series: [{
                        name: 'Belegungs',
                        data: [occupancy_correspondance[prognose.morgensBelegung]['frei'], occupancy_correspondance[prognose.vormittagsBelegung]['frei'], occupancy_correspondance[prognose.nachmittagsBelegung]['frei'], occupancy_correspondance[prognose.abendsBelegung]['frei'], occupancy_correspondance[prognose.nachtsBelegung]['frei']]
                    }]
                });

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
        }else $(elt).siblings('.belegungs-chart').eq(0).toggle(200);
    };
    for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', showOccupancyDatas, false);
    }

    // adding Listeners to the links to show occupancydatas
    var classname = document.getElementsByClassName("add-to-fav");
    var toggleFavorite = function() {
        var elt = this;
        var parkraumId = $(elt).parents('.panel').eq(0).attr('parkraumId');
        console.log(parkraumId);
        $.ajax({type: "POST",
          url: '/api/favorites/add/' + parkraumId,
          dataType: "json",
          success: function(msg){
            // console.log(msg);
            favorites = [];
            _.each(msg[0].favorites, function(favorite){
              favorites.push(favorite);
            })
            // favorites = msg.favorites;
            // console.log(favorites);
            unDisplayFavorites();
            displayFavorites();
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
    };
    for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', toggleFavorite, false);
    }
    map.adjustMapForMarkers();
  }
});
