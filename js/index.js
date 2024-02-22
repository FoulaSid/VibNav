function initMap() {
  //autocomplete 
  var originInput = document.getElementById('origin');
  new google.maps.places.Autocomplete(originInput);

  var destinationInput = document.getElementById('destination');
  new google.maps.places.Autocomplete(destinationInput);
  setUserLocation();
}

function setUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;

      var geocoder = new google.maps.Geocoder();
      var latLng = new google.maps.LatLng(lat, lng);

      geocoder.geocode({ 'latLng': latLng }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            document.getElementById('origin').value = results[0].formatted_address;
          } else {
            console.error('No results found');
          }
        } else {
          console.error('Geocoder failed due to: ' + status);
        }
      });
    }, function() {
      console.error("Geolocation is not supported by this browser.");
    });
  }
}

function closePopup() {
  var Popup = document.getElementById("popup");
  Popup.classList.remove("open-popup");
}

function closeFailedPopup() {
  triggerVibration(50);
  var Popup = document.getElementById("failed");
  Popup.classList.remove("open-popup");
}

function openPopup() {
  var popup = document.getElementById("popup");
  popup.classList.add("open-popup");
}

function openFailedPopup() {
  var popup = document.getElementById("failed");
  popup.classList.add("open-popup");
}

function voiceRecognition() {
  if ('webkitSpeechRecognition' in window) {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'el-GR'; //greek words
    triggerVibration(200);

    var recognitionTimeout;

    recognition.onstart = function() {
      document.getElementById('vc-txt').textContent = ""; 
      openPopup(); 
      recognitionTimeout = setTimeout(function() {
        recognition.stop();
      }, 5000); 
    };

    recognition.onresult = function(event) {
      clearTimeout(recognitionTimeout); //clear timeout
      var transcript = event.results[0][0].transcript;
      document.getElementById('vc-txt').textContent = "'" + transcript + "'";
      document.getElementById('vc-txt').style.color = "green";
      document.getElementById('destination').value = transcript;
    };

    recognition.onend = function() {
      clearTimeout(recognitionTimeout); 
      setTimeout(closePopup, 1000);
      startNavigation();
    };

    recognition.onerror = function(event) {
      clearTimeout(recognitionTimeout); 
    };

    recognition.start();
  } else {
    console.log("Your browser does not support the Web Speech API");
  }
}

 function triggerVibration(duration) {
  if ("vibrate" in navigator) {
    navigator.vibrate(duration);
    }
}

function startNavigation() {
  var origin = document.getElementById('origin').value;
  var destination = document.getElementById('destination').value;
  if(origin.trim() !== "" && destination.trim() !== "") {
    triggerVibration(500);
    saveInput();
    window.location.href='map.html'
  }
  else{
    triggerVibration(900);
    openFailedPopup();
  }
}

function saveInput() {
  var origin = document.getElementById('origin').value;
  var destination = document.getElementById('destination').value;

  localStorage.setItem('origin', origin);
  localStorage.setItem('destination', destination);
}

window.onload = function() {
  initMap();
};
