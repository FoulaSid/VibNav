var map;
var directionsService;
var directionsRenderer;
var currentStepIndex = 0;
var destination;
var userLocationMarker = null;

/*
 * Initializes the map on the page, sets up the directions service and renderer, and places a marker for the user's location
 * The map is centered on Thessaloniki by default. The directions renderer is configured to display the route with a custom polyline
*/
function initMap() {
// Create a new map centered on Thessaloniki, Greece
    map = new google.maps.Map(document.getElementById("map"), {
        center: new google.maps.LatLng(40.6401, 22.9444), // Coordinates of Thessaloniki
        zoom: 12
    });
    
// Initialize the directions service and renderer with custom polyline options
    directionsService = new google.maps.DirectionsService();
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
                    scale: 2 // Size of the dots
                },
                offset: '0',
                repeat: '10px' // Spacing of the dots
            }]
        }
    });
    directionsRenderer.setMap(map);
    
// Create and place a marker for the user's current location on the map
    userLocationMarker = new google.maps.Marker({
        map: map,
        icon: {
            url: './images/user.png',
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        title: "Your Location"
    });
    
  displayInput();
}

/*
 * Retrieves the origin and destination from local storage or sets them to 'Not set' if not found
 * Displays the origin and destination input fields and initiates route calculation
*/
function displayInput() {
    var origin = localStorage.getItem('origin') || 'Not set';
    destination = localStorage.getItem('destination') || 'Not set';

    document.getElementById('origin-text').textContent = origin; 
    document.getElementById('destination-text').textContent = destination;
    
    calculateAndDisplayRoute();
}

/*
 * Alerts the user if the origin or destination is not set, otherwise it requests a walking route between the two points.
 * Requests a route from the directions service and renders it on the map.
*/
function calculateAndDisplayRoute() {
    var origin = document.getElementById('origin-text').textContent;

    if (origin === 'Not set' || destination === 'Not set') {
        alert('Please set both origin and destination.');
        return;
    }

// Request a walking route between the origin and destination
    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: 'WALKING' 
    }, function (response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            var route = response.routes[0];
            if (route.legs[0].steps.length > 0) {
                var totalSteps = route.legs[0].steps.length;
                displayNextStep(route.legs[0].steps[currentStepIndex], totalSteps); 
            }
            trackUserProgress(route);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

//Displays the current navigation step and its details in the directions panel
function displayNextStep(step, totalSteps) {
    var directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.innerHTML = `Step ${currentStepIndex + 1} of ${totalSteps}: ${step.instructions}`;
        directionsPanel.innerHTML += "<br>Distance: " + step.distance.text + ", Duration: " + step.duration.text;
    }
}

/*
 * Triggers vibration patterns based on the navigation instruction
 * Different patterns are used for directions like left turn, right turn, and other directions
*/
function handleStep(step) {
    if (!step) return;
    
// Strip HTML tags from the instruction text and convert it to lowercase
    var instruction = step.instructions.replace(/<[^>]+>/g, '').toLowerCase(); 
    
// Trigger different vibration patterns based on the instruction content
    if (instruction.includes("turn left")) {
        triggerVibration([100, 50, 100, 50, 300]);
    } else if (instruction.includes("turn right")) {
        triggerVibration([300, 50, 100, 50, 100]);
    } else if (instruction.includes("east")) {
        triggerVibration([150,50]); 
    } else if (instruction.includes("west")) {
        triggerVibration([100, 100, 100]); 
    } else if (instruction.includes("north")) {
        triggerVibration([150, 200, 150, 200, 150]); 
    } else if (instruction.includes("south")) {
        triggerVibration([200, 25, 200, 25, 200]); 
    }
}

//Monitors the user's progress along the route, updating their position and checking proximity to the next step
function trackUserProgress(route) {
    // Check if geolocation is supported
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function (position) {
            var userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var routeSteps = route.legs[0].steps;
            // Threshold distance to consider the user has reached the next step
            const NEXT_STEP_THRESHOLD_DISTANCE = 10; 

            // Check if the user is close to the next step and update the current step index
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
            // Update the user's location marker on the map.
            if (userLocationMarker) {
                userLocationMarker.setPosition(userLocation);
            }
            // Check if the user has reached the destination
            var destinationLocation = new google.maps.LatLng(route.legs[0].end_location.lat(), route.legs[0].end_location.lng());
            var distanceToDestination = google.maps.geometry.spherical.computeDistanceBetween(userLocation, destinationLocation);
            
            // Threshold distance to consider the user has arrived at the destination
            const DESTINATION_THRESHOLD_DISTANCE = 5; 
            if (distanceToDestination < DESTINATION_THRESHOLD_DISTANCE) {
                showArrivalMessage(); 
            }
            // Continuously check the user's step state
            checkStepState(routeSteps); 
        }, function (error) {
            console.error("Error occurred: " + error.message);
        }, { enableHighAccuracy: true });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

// Checks the state of the current step and triggers vibration if necessary
function checkStepState(routeSteps) {
    if (currentStepIndex < routeSteps.length) {
        var currentStep = routeSteps[currentStepIndex];
        handleStep(currentStep);
    }
}

// Displays a message indicating the user has arrived at the destination and triggers a vibration
function showArrivalMessage() {
    triggerVibration(600);
    var popup = document.getElementById("popup");
    popup.classList.add("open-popup");
}

// Triggers a vibration for a specified duration or pattern
function triggerVibration(duration) {
    if ("vibrate" in navigator) {
        navigator.vibrate(duration);
    }
}
// Closes the arrival message popup and navigates back to the index page
function closePopup() {
    triggerVibration(50);
    var Popup = document.getElementById("popup");
    Popup.classList.remove("open-popup");
    window.location.href = "index.html";
}

// Set the map initialization function to run when the window loads
window.onload = initMap;
