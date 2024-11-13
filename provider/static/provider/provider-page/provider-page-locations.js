document.addEventListener("DOMContentLoaded", function(){
    // ======================= Map Functions ===============================
    const fallbackLatitude = 24.7136;  // Riyadh's latitude
    const fallbackLongitude = 46.6753; // Riyadh's longitude
    const mapZoomLevel = 13;           // Default zoom level

    // Function to initialize the map and add a draggable marker
    function initializeMap(latitude, longitude) {
        // Initialize map centered on given coordinates
        const map = L.map('location-map').setView([latitude, longitude], mapZoomLevel);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add a draggable marker and set its initial position
        const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);

        // Update hidden fields with initial position
        document.getElementById('location-latitude').value = latitude;
        document.getElementById('location-longitude').value = longitude;

        // Event listener for marker movement
        marker.on('dragend', function (event) {
            const { lat, lng } = event.target.getLatLng();
            document.getElementById('location-latitude').value = lat;
            document.getElementById('location-longitude').value = lng;
            console.log(`Marker moved to: ${lat}, ${lng}`);
        });
    }

    // Try to get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                initializeMap(latitude, longitude); // Use user's current location
            },
            error => {
                console.warn("Geolocation error:", error);
                alert("Could not access your location. Defaulting to Riyadh.");
                initializeMap(fallbackLatitude, fallbackLongitude); // Fallback to Riyadh
            }
        );
    } else {
        alert("Geolocation is not supported by this browser. Defaulting to Riyadh.");
        initializeMap(fallbackLatitude, fallbackLongitude); // Fallback to Riyadh
    }





    // ============ add location map ====================


    function initializeAddMap(latitude, longitude) {
        // Initialize map centered on given coordinates
        const map = L.map('add-location-map').setView([latitude, longitude], mapZoomLevel);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add a draggable marker and set its initial position
        const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);

        // Update hidden fields with initial position
        document.getElementById('add-location-latitude').value = latitude;
        document.getElementById('add-location-longitude').value = longitude;

        // Event listener for marker movement
        marker.on('dragend', function (event) {
            const { lat, lng } = event.target.getLatLng();
            document.getElementById('add-location-latitude').value = lat;
            document.getElementById('add-location-longitude').value = lng;
            console.log(`Marker moved to: ${lat}, ${lng}`);
        });
    }

    // Try to get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                initializeAddMap(latitude, longitude); // Use user's current location
            },
            error => {
                console.warn("Geolocation error:", error);
                alert("Could not access your location. Defaulting to Riyadh.");
                initializeAddMap(fallbackLatitude, fallbackLongitude); // Fallback to Riyadh
            }
        );
    } else {
        alert("Geolocation is not supported by this browser. Defaulting to Riyadh.");
        initializeAddMap(fallbackLatitude, fallbackLongitude); // Fallback to Riyadh
    }


    // ============ pop up ==============


    const locationPopUpShadow = document.getElementById("location-pop-up-shadow");
    const locationPopUp = document.getElementById("location-pop-up");
    const locationAddButton = document.getElementById("location-add-button")
    locationPopUpShadow.addEventListener("click", function () {
    locationPopUpShadow.style.display = 'none';
    locationPopUp.style.display = 'none';
  })



  locationAddButton.addEventListener("click", function () {
    locationPopUpShadow.style.display = 'block';
    locationPopUp.style.display = 'block';
  })
});