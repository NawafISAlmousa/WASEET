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

// Review System
document.addEventListener('DOMContentLoaded', function() {
    const starRating = document.querySelector('.star-rating');
    const stars = starRating.querySelectorAll('i');
    const ratingInput = document.getElementById('ratingInput');
    const reviewForm = document.getElementById('reviewForm');
    const reviewsContainer = document.getElementById('reviewsContainer');
    const locationId = reviewForm.dataset.locationId;

    // Load initial reviews
    loadReviews();

    // Function to load reviews
    async function loadReviews() {
        try {
            const response = await fetch(`/customer/location/${locationId}/reviews/`);
            const data = await response.json();
            
            if (response.ok) {
                renderReviews(data.reviews);
            } else {
                console.error('Error loading reviews:', data.error);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    // Function to render reviews
    function renderReviews(reviews) {
        reviewsContainer.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="reviewer-info">
                        <span class="reviewer-name">${review.customer_name}</span>
                        <span class="review-date">${review.date}</span>
                    </div>
                    <div class="review-rating">
                        ${generateStars(review.rating)}
                    </div>
                </div>
                <p class="review-text">${review.text}</p>
            </div>
        `).join('');
    }

    // Function to generate star HTML
    function generateStars(rating) {
        return Array(5).fill(0).map((_, index) => 
            `<i class="fa-${index < rating ? 'solid' : 'regular'} fa-star"></i>`
        ).join('');
    }

    // Handle star rating selection
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = this.dataset.rating;
            updateStars(rating);
        });

        star.addEventListener('click', function() {
            const rating = this.dataset.rating;
            ratingInput.value = rating;
            updateStars(rating);
            stars.forEach(s => s.classList.remove('fa-regular'));
            for (let i = 0; i < rating; i++) {
                stars[i].classList.add('fa-solid');
            }
        });
    });

    starRating.addEventListener('mouseleave', function() {
        if (!ratingInput.value) {
            updateStars(0);
        } else {
            updateStars(ratingInput.value);
        }
    });

    function updateStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('fa-regular');
                star.classList.add('fa-solid');
            } else {
                star.classList.remove('fa-solid');
                star.classList.add('fa-regular');
            }
        });
    }

    // Handle form submission
    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            rating: document.getElementById('ratingInput').value,
            review_text: document.getElementById('reviewText').value
        };

        try {
            const response = await fetch(`/customer/location/${locationId}/submit-review/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Clear form
                reviewForm.reset();
                ratingInput.value = '';
                updateStars(0);
                
                // Reload reviews
                loadReviews();
            } else {
                console.error('Error submitting review:', data.error);
                // Handle error (show error message to user)
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            // Handle error (show error message to user)
        }
    });
});

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
        navigator.geolocation.getCurrentPosition(
            // Success callback
            function(position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                addUserMarker(userLat, userLng);
            },
            // Error callback
            function(error) {
                // Default to Riyadh coordinates
                const defaultLat = 24.7253;
                const defaultLng = 46.6310;
                addUserMarker(defaultLat, defaultLng);
                console.log('Geolocation error:', error.message);
            }
        );
    } else {
        // Geolocation not supported, use default coordinates
        const defaultLat = 24.7136;
        const defaultLng = 46.6753;
        addUserMarker(defaultLat, defaultLng);
        console.log('Geolocation not supported');
    }

    // Helper function to add user marker
    function addUserMarker(lat, lng) {
        const userMarker = L.marker([lat, lng], {
            draggable: false,
            icon: L.divIcon({
                html: '<i class="fas fa-location-crosshairs" style="color: #00796b;"></i>',
                className: 'user-location-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(map);
    }
}
