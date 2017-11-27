// These are the places that will show up on the side navigation and map.
var initialPlaces = [{
    name: 'Jane\'s Carousel',
    location: {
      lat: 40.704430,
      lng: -73.992386
    }
  },
  {
    name: 'The River Café',
    location: {
      lat: 40.703684,
      lng: -73.994861
    }
  },
  {
    name: 'Brooklyn Bridge',
    location: {
      lat: 40.706100,
      lng: -73.996868
    }
  },
  {
    name: 'Brooklyn Museum',
    location: {
      lat: 40.671206,
      lng: -73.963631
    }
  },
  {
    name: 'Barclays Center',
    location: {
      lat: 40.682509,
      lng: -73.975046
    }
  },
  {
    name: 'Prospect Park',
    location: {
      lat: 40.656423,
      lng: -73.973840
    }
  },
  {
    name: 'New York Aquarium',
    location: {
      lat: 40.574264,
      lng: -73.974874
    }
  },
  {
    name: 'Brooklyn Botanic Garden',
    location: {
      lat: 40.667621,
      lng: -73.963189
    }
  },
  {
    name: 'Brooklyn Brewery',
    location: {
      lat: 40.721724,
      lng: -73.957172
    }
  },
  {
    name: 'Green-Wood Cemetery',
    location: {
      lat: 40.659004,
      lng: -73.995602
    }
  }
];



// this creates the connection between the data and the user interface.
function destination(data) {
  this.name = ko.observable(data.name);
  this.location = ko.observable(data.location);
}

function ViewModel() {
  var self = this;
  // initial all the variable to shorten the following code
  self.markers = [];
  var bounds = new google.maps.LatLngBounds();
  var largeInfowindow = new google.maps.InfoWindow();
  var content = "loading...Please wait for a sec.";
  var client_id = "FZPMCSEYO134W0XYREE1QGP5TE4OXP2Z4QXCNAATK3MKIME0";
  var client_secret = "YGNCPSLBHXFWEFRWR3E3I4JUV3YHMKT0J3I53GDNTAVOUTXM";
  var foursquareUrl = "https://api.foursquare.com/v2/venues/search";
  var foursquarebaseUrl = "https://api.foursquare.com/v2/venues/";
  var img = "https://pbs.twimg.com/media/DIxqdQFUQAEunYd.jpg";

  self.showPlaces = ko.observableArray(initialPlaces);
  // connect to the raw data
    self.showPlaces().forEach(function(data) {
    // creates marker for those locations in the raw data
    marker = new google.maps.Marker({
      position: data.location,
      map: map,
      title: data.name,
      animation: google.maps.Animation.DROP
    });

    data.marker = marker;
    this.markers.push(marker);
    marker.addListener('click', function() {
      //creates info window if you click the marker.
      populateInfoWindow(this, largeInfowindow);
    });
    // it makes all the markers fit into the screen.
    bounds.extend(marker.position);
    map.fitBounds(bounds);
  });

  // This make sure the info window shows all the information.
  function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      // use ajax to abstract information by using location's name
      $.ajax({
      dataType: "json",
      url: foursquareUrl,
      data: {
        client_id: client_id,
        client_secret: client_secret,
        query: marker.title, // gets data from marker.title (array of object)
        near: "brooklyn",
        limit: 1, // limit 1 result to make it load faster.
        v: 20171101 // version date
      },
      // if ajax works correctly it will abstract information from foursquare
      success: function(data) {
        venue = data.response.venues[0];
        venuename = venue.name;
        address1 = venue.location.formattedAddress[0];
        address2 = venue.location.formattedAddress[1];
        foursquareId = venue.id;
        foursquarelink = "https://foursquare.com/v/" + foursquareId;
        // It will also able to get the photos from the venue id.
        $.ajax({
          dataType: "json",
          url: foursquarebaseUrl + foursquareId + '/photos',
          data: {
            client_id: client_id,
            client_secret: client_secret,
            limit: 2,
            v: 20171101,
          },
          // if there is picture, it will show a picture for the info window.
          success: function(data) {
            item = data.response.photos.items[1];
            prefix = item.prefix;
            suffix = item.suffix;
            imageURL = prefix + '250x200' + suffix;
            img = imageURL;
          },
          // if there is no picture, it will show a noimg photo.
          error: function() {
            img = 'https://pbs.twimg.com/media/DIxqdQFUQAEunYd.jpg';
          }
        }).done(function() {
          // Generate the infomation to the info window.
          content = '<div class="infotitle">'+venuename+'</div>'+
          '<img class ="picture" src="'+img+'"/>'+'<div class="address">'+
          address1+'</div>'+'<div class="address">'+address2+'</div>'+
          "<a href='"+foursquarelink+"'target='_blank'>"+"More Info"+"</a>";

          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function() {marker.setAnimation(null);}, 1420);
          infowindow.marker = marker;
          infowindow.setContent(content);
          infowindow.open(map, marker);
          map.setZoom(16);
          map.panTo(marker.position);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick',function(){
            infowindow.setMarker = null;
          });
        });

      },
      // If the AJAX not working, show the error message to the user.
      error: function() {
          content = '<div class="infotitle">'+'Something wrong right now.'+
          ' Please try again.'+'</div>';
      }
    });


    }
  }

  self.listViewClick = function(data) {
    //This clicking the title works the same as clicking the marker
    if (data.name) {
      map.setZoom(16);
      map.panTo(data.location);
      data.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {data.marker.setAnimation(null);}, 1420);
      populateInfoWindow(data.marker, largeInfowindow);
      //if it's a small screen, it will return to the map afterward.
      if (screen.width < 500) {
      document.getElementById("map").style.marginLeft = "0px";
      document.getElementById("hamberger").style.left = "20px";
    }
    }
  };

  self.query = ko.observable('');
  //this is the search function
  self.search = ko.computed(function() {
    var filter = self.query().toLowerCase();
    var inQuery = self.showPlaces();
    //this is how the search result connect to the markers
    return ko.utils.arrayFilter(inQuery, function(data) {
      if (data.name.toLowerCase().indexOf(filter) >= 0) {
        data.marker.setVisible(true);
        return true;
      } else {
        data.marker.setVisible(false);
      }
    });
  });

}

//this is how the hamburger button can show and hide the side navigation
function openNav() {
  if (document.getElementById("map").style.marginLeft == "0px") {
    document.getElementById("map").style.marginLeft ="250px";
    document.getElementById("hamberger").style.left = "270px";
  } else {
    document.getElementById("map").style.marginLeft = "0px";
    document.getElementById("hamberger").style.left = "20px";
  }
}



// Initial the map with a prefix locaqtion and limit the user control.
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 40.6782,
      lng: -73.9442
    },
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
  });
  // Make sure everything load correctly after the initMap function.
  ko.applyBindings(ViewModel());
}
// if the map run into an error, it will alert the user.
function mapError() {
    alert("Something's wrong with the map. Please try again later!");
}
