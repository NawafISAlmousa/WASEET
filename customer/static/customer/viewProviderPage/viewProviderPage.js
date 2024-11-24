document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    const scrollThreshold = 5; // Minimum scroll amount to trigger hide/show

    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Only trigger if we've scrolled more than the threshold
        if (Math.abs(scrollTop - lastScrollTop) > scrollThreshold) {
            if (scrollTop > lastScrollTop && scrollTop > 50) {
                // Scrolling down & not at top
                navbar.style.top = '-80px';
            } else {
                // Scrolling up or at top
                navbar.style.top = '0';
            }
            lastScrollTop = scrollTop;
        }
    });

    initMap();
});

// Add to favorites functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle favorite provider button clicks
    const favoriteButton = document.querySelector('.favorite-provider-btn');
    if (favoriteButton) {
        favoriteButton.addEventListener('click', function() {
            const providerId = this.dataset.providerId;
            // Toggle favorite status
            this.classList.toggle('favorited');
            // Update icon
            const icon = this.querySelector('i');
            if (this.classList.contains('favorited')) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
            } else {
                icon.classList.remove('fa-solid'); 
                icon.classList.add('fa-regular');
            }
        });
    }

    // Handle favorite item button clicks 
    const favoriteItemButtons = document.querySelectorAll('.favorite-item-btn');
    favoriteItemButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.dataset.itemId;
            // Toggle favorite status
            this.classList.toggle('favorited');
            // Update icon
            const icon = this.querySelector('i');
            if (this.classList.contains('favorited')) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
            } else {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
            }
        });
    });
});

// Review form validation
// const reviewForm = document.querySelector('.review-form');
// if (reviewForm) {
//     reviewForm.addEventListener('submit', function(e) {
//         const rating = document.querySelector('input[name="rating"]:checked');
//         const reviewText = document.querySelector('textarea[name="review-text"]');
        
//         if (!rating) {
//             e.preventDefault();
//             alert('Please select a rating');
//             return;
//         }

//         if (!reviewText.value.trim()) {
//             e.preventDefault(); 
//             alert('Please enter a review');
//             return;
//         }
//     });
// }
// Initialize map
function initMap() {
    // Get coordinates from page
    const locationCoords = document.querySelector('.location-details p i.fa-location-dot')
        .parentElement.textContent.trim().split(',');
    const locationLat = parseFloat(locationCoords[0]);
    const locationLng = parseFloat(locationCoords[1]);

    // Create map centered on location
    const map = L.map('map', {
        center: [locationLat, locationLng],
        zoom: 13,
        dragging: true, // Enable map dragging
        touchZoom: true, // Enable touch zoom
        scrollWheelZoom: true, // Enable scroll wheel zoom
        doubleClickZoom: true, // Enable double click zoom
        boxZoom: true, // Enable box zoom
        keyboard: true, // Enable keyboard navigation
        zoomControl: true // Show zoom controls
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = `
            <div style="background: white; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">
                <div style="margin-bottom: 5px;">
                    <img class="marker-icon" src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" 
                         style="width: 15px; filter: hue-rotate(-35deg) brightness(0.8) saturate(1.5);"> Provider Location
                </div>
                <div>
                    <i class="fas fa-location-crosshairs" style="color: #00796b;"></i> Your Location
                </div>
            </div>
        `;
        return div;
    };
    legend.addTo(map);
    // Add location marker with custom green color
    const locationMarker = L.marker([locationLat, locationLng], {
        draggable: false,
        icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
            className: 'green-marker' // Custom class to make it green via CSS
        })
    }).addTo(map);

    // Get user's current location
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Add user location marker with location crosshairs icon
            const userMarker = L.marker([userLat, userLng], {
                draggable: false,
                icon: L.divIcon({
                    html: '<i class="fas fa-location-crosshairs" style="color: #00796b;"></i>',
                    className: 'user-location-marker',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(map);
        });
    }
}
