var map;

var directionsService;
var directionsRenderer;

// Trexon step
var currentStepIndex = 0;
var destination;
var userLocationMarker = null;


// Arxikopoihsh map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: new google.maps.LatLng(40.6401, 22.9444), // suntetagmenes Thessalonikis
        zoom: 12
    });

    directionsService = new google.maps.DirectionsService();
    //epeksergasia-style tou route
    directionsRenderer = new google.maps.DirectionsRenderer({
        polylineOptions: {
            strokeOpacity: 0,
            icons: [{
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#0000FF',
                    fillOpacity: 1.0,
                    strokeColor: '#0000FF',
                    strokeOpacity: 1.0,
                    scale: 2 // megethos dots
                },
                offset: '0',
                repeat: '10px' // suxnothta dots
            }]
        }
    });
    console.log("DirectionsService and DirectionsRenderer initialized");

    directionsRenderer.setMap(map);

  // marker gia thn topothesia tou xrhsth
    userLocationMarker = new google.maps.Marker({
        map: map,
        icon: {
            url: './images/user.png',
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        title: "Your Location"
    });

  // deikse ta input apo to allo html
  displayInput();
}

//pass tis times twn inputs apo local storage 
function displayInput() {
    var origin = localStorage.getItem('origin') || 'Not set'; //default not set
    destination = localStorage.getItem('destination') || 'Not set';

    document.getElementById('origin-text').textContent = origin; 
    document.getElementById('destination-text').textContent = destination;

    // route
    calculateAndDisplayRoute();
}

function calculateAndDisplayRoute() {
    var origin = document.getElementById('origin-text').textContent;

    if (origin === 'Not set' || destination === 'Not set') {
        alert('Please set both origin and destination.');
        return;
    }

    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: 'WALKING' //MODE , mporei na to allaksw se driving alla allazw kai to threshold
    }, function (response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            var route = response.routes[0];

          // emfanish step sto text view gia ta steps
            if (route.legs[0].steps.length > 0) {
                var totalSteps = route.legs[0].steps.length;
                displayNextStep(route.legs[0].steps[currentStepIndex], totalSteps);
                
            }

            // user tracking
            trackUserProgress(route);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

//emfanish epomenou step
function displayNextStep(step, totalSteps) {
    var directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.innerHTML = `Step ${currentStepIndex + 1} of ${totalSteps}: ${step.instructions}`;
        directionsPanel.innerHTML += "<br>Distance: " + step.distance.text + ", Duration: " + step.duration.text;
    }
}

function handleStep(step) {
    if (!step) return;

    var instruction = step.instructions.replace(/<[^>]+>/g, '').toLowerCase(); //kane replace ta sumvola me keno

    // Patterns analoga me to step
    if (instruction.includes("turn left")) {
        triggerVibration([100, 50, 100, 50, 300]);

    } else if (instruction.includes("turn right")) {
        triggerVibration([300, 50, 100, 50, 100]);

    } else if (instruction.includes("east")) {
        triggerVibration([100,50]); 

    } else if (instruction.includes("west")) {
        triggerVibration([100, 100, 100]); 
        
    } else if (instruction.includes("north")) {
        triggerVibration([150, 200, 150, 200, 150]); 

    } else if (instruction.includes("south")) {
        triggerVibration([200, 25, 200, 25, 200]); 
    }

}


// Track user 
function trackUserProgress(route) {
    console.log("Tracking user progress");
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function (position) {
            var userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var routeSteps = route.legs[0].steps;
            const NEXT_STEP_THRESHOLD_DISTANCE = 10; // 10 metra gia to epomeno step

            console.log("User location updated: ", userLocation);

            if (currentStepIndex < routeSteps.length) {
                var nextStepLocation = routeSteps[currentStepIndex].end_location;
                var distanceToNextStep = google.maps.geometry.spherical.computeDistanceBetween(userLocation, nextStepLocation);
                console.log("Distance to next step: ", distanceToNextStep);

                if (distanceToNextStep < NEXT_STEP_THRESHOLD_DISTANCE) {
                    currentStepIndex++;
                    var totalSteps = route.legs[0].steps.length;
                    displayNextStep(routeSteps[currentStepIndex], totalSteps);
                }
            }
            if (userLocationMarker) {
                userLocationMarker.setPosition(userLocation);
                
            }


            var destinationLocation = new google.maps.LatLng(route.legs[0].end_location.lat(), route.legs[0].end_location.lng());
            var distanceToDestination = google.maps.geometry.spherical.computeDistanceBetween(userLocation, destinationLocation);

            const DESTINATION_THRESHOLD_DISTANCE = 5; // gia otan ftasei ston proorismo
            if (distanceToDestination < DESTINATION_THRESHOLD_DISTANCE) {
                showArrivalMessage(); //pop up oti eftase
            }

            startStepCheckInterval(routeSteps); //gia ta vibrations

        }, function (error) {
            console.error("Error occurred: " + error.message);
        }, { enableHighAccuracy: true });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function startStepCheckInterval(routeSteps) { 
    checkStepState(routeSteps);
}

//tsekare step kai kalese ton handler
function checkStepState(routeSteps) {
    if (currentStepIndex < routeSteps.length) {
        var currentStep = routeSteps[currentStepIndex];
        handleStep(currentStep);
    }
}


// pop up gia otan ftasei
function showArrivalMessage() {
    triggerVibration(600);
    var popup = document.getElementById("popup");
    popup.classList.add("open-popup");
}




// Vibration fun
function triggerVibration(duration) {
    if ("vibrate" in navigator) {
        navigator.vibrate(duration);
    }
}

// Close popup
function closePopup() {
    triggerVibration(50);
    var Popup = document.getElementById("popup");
    Popup.classList.remove("open-popup");
    window.location.href = "index.html";
}

window.onload = initMap;
