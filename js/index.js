function initMap() {
  // Enable Google Places Autocomplete for the origin and destination input field
  var originInput = document.getElementById('origin');
  new google.maps.places.Autocomplete(originInput);

  var destinationInput = document.getElementById('destination');
  new google.maps.places.Autocomplete(destinationInput);

  // Set the user's current location as the default origin.
  setUserLocation();
}

// Set the user's current location using the Geolocation API and Geocoding API
function setUserLocation() {
  // Check if the Geolocation API is supported in the browser
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      // Get the current position of the device
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;

      // Use the Google Geocoding API to get the address from the latitude and longitude
      var geocoder = new google.maps.Geocoder();
      var latLng = new google.maps.LatLng(lat, lng);

      // Convert the latitude and longitude to an address.
      geocoder.geocode({ 'latLng': latLng }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            // Set the first result as the value of the origin input field
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

// Enable voice recognition for destination input field
function voiceRecognition() {
  // Check if the Web Speech API is supported in the browser.
  if ('webkitSpeechRecognition' in window) {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = false; // Do not continue capturing after the user stops speaking
    recognition.interimResults = false; // Only return final results
    recognition.lang = 'el-GR'; // Set the language to Greek
    triggerVibration(200); // Trigger a vibration to indicate the start of voice recognition

    var recognitionTimeout;

    // Handle the start of speech recognition.
    recognition.onstart = function() {
      document.getElementById('vc-txt').textContent = ""; // Clear previous text
      openPopup(); // Open the popup to show recognition status
      // Timeout to stop recognition (takes too long for Greek lang)
      recognitionTimeout = setTimeout(function() {
        recognition.stop();
      }, 5000); // 5-second timeout.
    };

    // Handle the results of speech recognition
    recognition.onresult = function(event) {
      clearTimeout(recognitionTimeout); 
      var transcript = event.results[0][0].transcript; 
      // Display the recognized text and change its color to green
      document.getElementById('vc-txt').textContent = "'" + transcript + "'";
      document.getElementById('vc-txt').style.color = "green";
      // Set the recognized text as the value of the destination input field
      document.getElementById('destination').value = transcript;
    };

    // Handle the end of speech recognition
    recognition.onend = function() {
      clearTimeout(recognitionTimeout); 
      setTimeout(closePopup, 1000); // Close the popup after a short delay
      startNavigation(); // Start navigation using the recognized destination
    };
    
    recognition.onerror = function(event) {
      clearTimeout(recognitionTimeout); 
    };

    recognition.start();
  } else {
    console.log("Your browser does not support the Web Speech API");
  }
}

// Trigger a vibration with the given duration.
 function triggerVibration(duration) {
  if ("vibrate" in navigator) {
    navigator.vibrate(duration);
    }
}

// Start navigation using the provided origin and destination.
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

// Save the origin and destination to local storage for map.html
function saveInput() {
  var origin = document.getElementById('origin').value;
  var destination = document.getElementById('destination').value;

  localStorage.setItem('origin', origin);
  localStorage.setItem('destination', destination);
}

window.onload = function() {
  initMap();
};
