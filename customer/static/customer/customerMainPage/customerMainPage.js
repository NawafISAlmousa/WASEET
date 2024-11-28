document.addEventListener("DOMContentLoaded", function () {
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > lastScrollY) {
            // Scroll down
            navbar.style.top = '-60px'; // Adjust based on navbar height
        } else {
            // Scroll up
            navbar.style.top = '0';
        }
        lastScrollY = window.scrollY;
    });

    // Toggle functionality
    let userlocation = [];
    const toggleButtons = document.querySelectorAll('.toggle-option');
    const toggleSlider = document.querySelector('.toggle-slider');
    const providerContent = document.getElementById('provider-cards');
    // const providerCardsContainer = document.getElementById('providerCards');

    // Add this variable at the top of your DOMContentLoaded function
    let currentSearchResults = null;
    let currentEventSearchResults = null;

    // Modify the sort event listener
    document.getElementById("sort").addEventListener("change", () => {
        if (currentSearchResults) {
            // If we have search results, sort those instead of fetching new data
            const favorites = currentSearchResults.favorites || [];
            const providers = currentSearchResults.locations || [];
            renderProviderCards(providers, favorites);
        } else {
            // If no search is active, fetch all providers
            fetchProviders();
        }
    });

    // Add event listener for event sorting
    document.getElementById("sort-events").addEventListener("change", () => {
        if (currentEventSearchResults) {
            // If we have search results, sort those instead of fetching new data
            renderEventCards(currentEventSearchResults);
        } else {
            // If no search is active, fetch all events
            fetchEvents();
        }
    });

    //Fetch providers from API and render cards
    async function fetchProviders() {
        try {
            // come back here to complete the book mark checks
            await fetch(`/provider/providers/${customerId}`)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    renderProviderCards(data.locations, data.favorites)
                })

        } catch (error) {
            console.error('Error fetching providers:', error);
        }
    }

    // Render provider cards
    async function renderProviderCards(providers, favorites) {
        providerContent.innerHTML = "";
        let selectedSort = document.getElementById('sort').value

        // Create a new array to avoid modifying the original
        let sortedProviders = [...providers];

        if (selectedSort == 'distance') {
            sortedProviders.sort((a, b) => {
                coordA = a.coordinates.split(',')
                coordB = b.coordinates.split(',')
                return calculateDistance(userlocation[0], userlocation[1], coordA[0], coordA[1]) - calculateDistance(userlocation[0], userlocation[1], coordB[0], coordB[1])
            })
        } else {
            sortedProviders.sort((a, b) => b.locationrating - a.locationrating)
        }







        sortedProviders.forEach(provider => {
            const card = document.createElement('div');
            card.classList.add('card');
            providerCoord = provider.coordinates.split(',')
            const userDistance = calculateDistance(userlocation[0], userlocation[1], providerCoord[0], providerCoord[1])


            card.innerHTML = `

            <div class="card-header">
                <img src="/media/${provider.providerid__username}/logo.png" alt="Provider Logo" class="provider-logo">
                <div class="top-right">
                    <div> <i class="fa-regular fa-bookmark fa-xl" style="color: #00796b; margin-bottom: 25px;" data-location="${provider.locationid}"></i>
                    </div>                                                            
                    <div class="card-distance"><span class="span-km">${userDistance > 0.05 ? `${userDistance} Km` : ""}</span> ${userDistance > 0.05 ? 'away from you' : "Right next to you"}</div>
                </div>
            </div>
            <div class="card-info">
                <p class="provider-name">${provider.providerid__name}</p>
                <h3>${provider.name}</h3>
                <p class="card-description">${provider.providerid__description}</p>
                <p class="card-rating">${Math.round(provider.locationrating * 10) / 10}<i class="fa-solid fa-star" style="color:  #00796b;"></i></p>
                <div class="provider-buttons" id="that">
                    <button class="map-button" data-coordinates="${provider.coordinates}" data-provider-name="${provider.providerid__name}" data-location-name="${provider.name}">Check on map</button>
                    <button class="more-button" onclick="window.location.href='${providerURL.replace('0', provider.locationid)}'">See more</button>
                </div>
            </div>
            

            `;

            let isFavorite = searchLocations(provider.locationid, favorites)
            // Move the bookmark event listeners inside the loop and target the specific card
            const bookmarkIcon = card.querySelector('.fa-bookmark');
            bookmarkIcon.addEventListener('mouseenter', () => {
                bookmarkIcon.style.cursor = 'pointer'   
                if (!isFavorite) {
                    bookmarkIcon.classList.remove('fa-regular');
                    bookmarkIcon.classList.add('fa-solid');
                } else {
                    bookmarkIcon.classList.remove('fa-solid');
                    bookmarkIcon.classList.add('fa-regular');
                }
            });
            bookmarkIcon.addEventListener('mouseleave', () => {
                if (!isFavorite) {
                    bookmarkIcon.classList.remove('fa-solid');
                    bookmarkIcon.classList.add('fa-regular');
                } else {
                    bookmarkIcon.classList.remove('fa-regular');
                    bookmarkIcon.classList.add('fa-solid');
                }
            });

            bookmarkIcon.addEventListener('click', async () => {
                console.log(customerId);
                if (!isFavorite) {
                    try {
                        await addBookmark(customerId, provider.locationid);
                        // You could add visual feedback here, like:

                        bookmarkIcon.classList.remove('fa-regular');
                        bookmarkIcon.classList.add('fa-solid');
                        isFavorite = true
                        console.log("Added to favorites")
                    } catch (error) {
                        console.error('Error adding bookmark:', error);
                        // Handle error (maybe show user feedback)
                    }
                } else {
                    alert("Already in favorites")
                }


            });
            if (isFavorite) {
                bookmarkIcon.classList.remove('fa-regular');
                bookmarkIcon.classList.add('fa-solid');
            } else {
                bookmarkIcon.classList.remove('fa-solid');
                bookmarkIcon.classList.add('fa-regular');
            }

            // Add mouseenter event listener to each card
            card.addEventListener('mouseenter', () => {
                // Find the specific description and button container within the hovered card

                const description = card.querySelector('.card-description');
                const buttons = card.querySelector('.provider-buttons');

                // Show and animate the description
                description.style.display = '-webkit-box';
                description.style.animation = 'description 0.5s forwards';

                // Adjust the margin of the buttons container
                buttons.style.marginTop = '5px';
                card.style.margin = 'auto';
            });

            // Add mouseleave event listener to each card
            card.addEventListener('mouseleave', () => {
                // Find the specific description and button container within the hovered card
                const description = card.querySelector('.card-description');
                const buttons = card.querySelector('.provider-buttons');

                // Hide the description
                description.style.display = 'none';

                // Reset the margin of the buttons container
                buttons.style.marginTop = '45px';
                card.style.margin = '20px auto';
            });

            // Add click handler for map button
            const mapButton = card.querySelector('.map-button');
            mapButton.addEventListener('click', () => {
                // Switch to map tab
                document.getElementById('map').click();
                
                // Get coordinates from data attribute
                const coords = mapButton.dataset.coordinates.split(',');
                const providerName = mapButton.dataset.providerName;
                const locationName = mapButton.dataset.locationName;
                
                // Wait a brief moment for the map to initialize if needed
                setTimeout(() => {
                    // Center map on the provider location
                    map.setView([coords[0], coords[1]], 15);
                    
                    // Find and open the corresponding marker's popup
                    markers.forEach(marker => {
                        const markerLatLng = marker.getLatLng();
                        if (markerLatLng.lat === parseFloat(coords[0]) && 
                            markerLatLng.lng === parseFloat(coords[1])) {
                            marker.openPopup();
                        }
                    });
                }, 300);
            });

            providerContent.appendChild(card);
        });
        if (providerContent.childElementCount === 0) {
            const message = document.createElement('h1');
            message.classList.add('error-message')
            message.innerHTML = "Sorry, we could not find anything!"
            providerContent.appendChild(message);
        }
    }

    // Initialize
    fetchProviders();

    // Toggle buttons behavior
    toggleButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            toggleButtons.forEach(btn => btn.classList.remove('active-toggle'));
            button.classList.add('active-toggle');
            toggleSlider.style.left = `calc(${index * 32}% + 3px)`;

            this.querySelectorAll(".dynamic-content").forEach(part => {
                part.classList.remove('active')
            })
            if (index === 0) {
                document.getElementById("dynamic-providers").classList.add('active');
                fetchProviders();
            } else if (index === 1) {
                document.getElementById("dynamic-events").classList.add('active');
            } else {
                document.getElementById("dynamic-map").classList.add('active');
                initializeMap();
            }
        });
    });


    // card property 


    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                userlocation = [latitude, longitude];
                fetchProviders(); // Refresh providers with new location
            },
            (error) => {
                // Default to Riyadh coordinates
                userlocation = [24.7253, 46.6310];
                console.log('Using default location (CCIS)');
                fetchProviders(); // Refresh providers with default location

                // Log the specific error for debugging
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        console.log("Permission denied. Using default location.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        console.log("Location unavailable. Using default location.");
                        break;
                    case error.TIMEOUT:
                        console.log("Request timed out. Using default location.");
                        break;
                    default:
                        console.log("An unknown error occurred. Using default location.");
                }
            }
        );
    } else {
        // Geolocation not supported, use default coordinates
        userlocation = [24.7136, 46.6753];
        console.log('Geolocation not supported. Using default location (Riyadh)');
        fetchProviders(); // Refresh providers with default location
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const toRadians = (degree) => (degree * Math.PI) / 180;

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in kilometers
        return (distance.toFixed(2));
    }

    // Add this near your other event listeners
    document.getElementById('events').addEventListener('click', fetchEvents);

    async function fetchEvents() {
        try {
            const response = await fetch(`/provider/events/${customerId}`);
            const data = await response.json();
            renderEventCards(data.events);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    // Modify the renderEventCards function to include sorting
    function renderEventCards(events) {
        const eventContent = document.getElementById('event-cards');
        eventContent.innerHTML = '';

        if (events.length === 0) {
            const message = document.createElement('h1');
            message.classList.add('error-message');
            message.innerHTML = "No events found!";
            eventContent.appendChild(message);
            return;
        }

        // Create a copy of events array for sorting
        let sortedEvents = [...events];
        const selectedSort = document.getElementById('sort-events').value;

        // Sort events based on selected criteria
        if (selectedSort === 'distance') {
            sortedEvents.sort((a, b) => {
                if (!a.coordinates || !b.coordinates) return 0;
                const coordA = a.coordinates.split(',');
                const coordB = b.coordinates.split(',');
                return calculateDistance(userlocation[0], userlocation[1], coordA[0], coordA[1]) -
                       calculateDistance(userlocation[0], userlocation[1], coordB[0], coordB[1]);
            });
        } else if (selectedSort === 'startingtime') {
            sortedEvents.sort((a, b) => {
                const dateA = new Date(a.startdate + 'T' + a.starttime);
                const dateB = new Date(b.startdate + 'T' + b.starttime);
                return dateA - dateB;
            });
        }

        // Render the sorted events
        sortedEvents.forEach(event => {
            const card = document.createElement('div');
            card.classList.add('event-card');

            // Calculate distance if coordinates are available
            let distanceText = '';
            if (event.coordinates) {
                const coords = event.coordinates.split(',');
                const distance = calculateDistance(userlocation[0], userlocation[1], coords[0], coords[1]);
                distanceText = distance > 0.05 ? 
                    `<div class="event-distance">${distance} Km away from you</div>` : 
                    `<div class="event-distance">Right next to you</div>`;
            }

            // Format dates and times
            const startDate = new Date(event.startdate).toLocaleDateString();
            const endDate = new Date(event.enddate).toLocaleDateString();
            const startTime = event.starttime.slice(0, 5);
            const endTime = event.endtime.slice(0, 5);

            card.innerHTML = `
                <div class="event-header">
                    <img src="/media/${event.provider_username}/events/event${event.eventid}.png" 
                         alt="Event Logo" 
                         class="event-logo"
                         onerror="this.src='/static/main/assets/BigLogo.png'">
                    <div class="event-title">
                        <h2>${event.name}</h2>
                        <p class="provider-name">by ${event.provider_name}</p>
                        <p class="location-name">at ${event.location_name}</p>
                        ${distanceText}
                    </div>
                </div>
                <div class="event-details">
                    <div class="event-info">
                        <div class="event-dates">
                            <span><i class="far fa-calendar"></i> ${startDate}</span>
                            <span> - </span>
                            <span><i class="far fa-calendar"></i> ${endDate}</span>
                        </div>
                        <div class="event-times">
                            <span><i class="far fa-clock"></i> ${startTime}</span>
                            <span> - </span>
                            <span><i class="far fa-clock"></i> ${endTime}</span>
                        </div>
                    </div>
                    <p class="event-description">${event.description}</p>
                    <button class="view-location-btn" 
                            onclick="window.location.href='${providerURL.replace('0', event.locationid)}'">
                        View Location
                    </button>
                </div>
            `;

            eventContent.appendChild(card);
        });
    }

    // Add these variables at the top of your file, after the DOMContentLoaded event
    let map = null;
    let markers = [];

    // Add this function to initialize the map
    function initializeMap() {
        const mapLoadingOverlay = document.querySelector('.map-loading-overlay');
        
        // Initialize the map if it hasn't been initialized yet
        if (!map) {
            map = L.map('leaflet-map').setView(userlocation, 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Add a marker for user's location
            L.marker(userlocation)
                .bindPopup('Your Location')
                .addTo(map);
        }

        // Hide loading overlay
        if (mapLoadingOverlay) {
            mapLoadingOverlay.style.display = 'none';
        }

        // Fetch and display provider markers
        fetchAndDisplayMarkers();
    }

    // Add this function to fetch and display markers
    async function fetchAndDisplayMarkers() {
        try {
            const response = await fetch(`/provider/providers/${customerId}`);
            const data = await response.json();
            
            // Clear existing markers
            markers.forEach(marker => marker.remove());
            markers = [];

            // Add markers for each provider
            data.locations.forEach(provider => {
                const coords = provider.coordinates.split(',');
                
                // Create custom icon using provider's logo
                const customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `
                        <div class="marker-container">
                            <img src="/media/${provider.providerid__username}/logo.png" 
                                 alt="${provider.name}"
                                 onerror="this.src='/static/main/assets/BigLogo.png'">
                        </div>
                    `,
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40]
                });

                // Create marker with custom icon
                const marker = L.marker([coords[0], coords[1]], { icon: customIcon })
                    .bindPopup(`
                        <div class="custom-popup">
                            <strong>${provider.providerid__name}</strong><br>
                            ${provider.name}<br>
                            Rating: ${Math.round(provider.locationrating * 10) / 10}⭐<br>
                            <a class="custom-popup-link" href="${providerURL.replace('0', provider.locationid)}">See more</a>
                        </div>
                    `)
                    .addTo(map);
                markers.push(marker);
            });
        } catch (error) {
            console.error('Error fetching providers for map:', error);
        }
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // Add these new elements
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.classList.add('search-suggestions');
    searchInput.parentNode.insertBefore(suggestionsContainer, searchInput.nextSibling);

    // Add new function to get unique tags from providers and events
    async function getAllTags() {
        try {
            const [providersResponse, eventsResponse] = await Promise.all([
                fetch(`/provider/providers/${customerId}`),
                fetch(`/provider/events/${customerId}`)
            ]);
            
            const [providersData, eventsData] = await Promise.all([
                providersResponse.json(),
                eventsResponse.json()
            ]);

            const uniqueTags = new Set();

            // Collect tags from providers
            providersData.locations.forEach(provider => {
                if (provider.providerid__tags) {
                    provider.providerid__tags.forEach(tag => uniqueTags.add(tag.name));
                }
                if (provider.tags) {
                    provider.tags.forEach(tag => uniqueTags.add(tag.name));
                }
            });

            // Collect tags from events (if they have tags)
            if (eventsData.events) {
                eventsData.events.forEach(event => {
                    if (event.tags) {
                        event.tags.forEach(tag => uniqueTags.add(tag.name));
                    }
                });
            }

            return Array.from(uniqueTags);
        } catch (error) {
            console.error('Error fetching tags:', error);
            return [];
        }
    }

    // Add function to show suggestions
    function showSuggestions(searchTerm, tags) {
        suggestionsContainer.innerHTML = '';
        
        if (searchTerm.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        const matchingTags = tags.filter(tag => 
            tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (matchingTags.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        matchingTags.forEach(tag => {
            const suggestion = document.createElement('div');
            suggestion.classList.add('suggestion-item');
            suggestion.textContent = tag;
            suggestion.addEventListener('click', () => {
                searchInput.value = tag;
                suggestionsContainer.style.display = 'none';
                handleSearch();
            });
            suggestionsContainer.appendChild(suggestion);
        });

        suggestionsContainer.style.display = 'block';
    }

    // Modify the search input event listener
    let allTags = [];
    getAllTags().then(tags => {
        allTags = tags;
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        showSuggestions(searchTerm, allTags);
    });

    // Add click event listener to document to close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });

    // Function to normalize search text
    function normalizeText(text) {
        return text.toLowerCase().replace(/\s+/g, '');
    }

    // Function to check if text matches search term (with and without spaces)
    function textMatches(text, searchTerm, normalizedSearchTerm) {
        if (!text) return false;
        const normalizedText = normalizeText(text);
        return text.toLowerCase().includes(searchTerm) || 
               normalizedText.includes(normalizedSearchTerm);
    }

    // Modified search providers function
    async function searchProviders(searchTerm) {
        try {
            const response = await fetch(`/provider/providers/${customerId}`);
            const data = await response.json();
            let filteredProviders = data.locations;

            if (searchTerm) {
                const normalizedSearchTerm = normalizeText(searchTerm);
                
                filteredProviders = filteredProviders.filter(provider => {
                    // Check basic provider information
                    const basicMatch = 
                        textMatches(provider.name, searchTerm, normalizedSearchTerm) ||
                        textMatches(provider.providerid__name, searchTerm, normalizedSearchTerm) ||
                        textMatches(provider.providerid__description, searchTerm, normalizedSearchTerm);

                    // Check all provider tags (including location tags)
                    const providerTags = [
                        ...(Array.isArray(provider.providerid__tags) ? provider.providerid__tags : []),
                        ...(Array.isArray(provider.tags) ? provider.tags : [])
                    ];

                    const tagMatch = providerTags.some(tag => {
                        return textMatches(tag.name, searchTerm, normalizedSearchTerm);
                    });

                    return basicMatch || tagMatch;
                });
            }

            // Store the filtered results
            currentSearchResults = {
                locations: filteredProviders,
                favorites: data.favorites
            };

            renderProviderCards(filteredProviders, data.favorites);
        } catch (error) {
            console.error('Error searching providers:', error);
        }
    }

    // Modified search events function
    async function searchEvents(searchTerm) {
        try {
            const response = await fetch(`/provider/events/${customerId}`);
            const data = await response.json();
            let filteredEvents = data.events;

            if (searchTerm) {
                const normalizedSearchTerm = normalizeText(searchTerm);
                
                filteredEvents = filteredEvents.filter(event => {
                    return textMatches(event.name, searchTerm, normalizedSearchTerm) ||
                           textMatches(event.description, searchTerm, normalizedSearchTerm) ||
                           textMatches(event.provider_name, searchTerm, normalizedSearchTerm) ||
                           textMatches(event.location_name, searchTerm, normalizedSearchTerm);
                });
            }

            // Store the filtered results
            currentEventSearchResults = filteredEvents;
            renderEventCards(filteredEvents);
        } catch (error) {
            console.error('Error searching events:', error);
        }
    }

    // Modified search map function
    async function searchMap(searchTerm) {
        try {
            const response = await fetch(`/provider/providers/${customerId}`);
            const data = await response.json();
            let filteredLocations = data.locations;

            if (searchTerm) {
                const normalizedSearchTerm = normalizeText(searchTerm);
                
                filteredLocations = filteredLocations.filter(location => {
                    const basicMatch = 
                        textMatches(location.name, searchTerm, normalizedSearchTerm) ||
                        textMatches(location.providerid__name, searchTerm, normalizedSearchTerm);

                    // Check all location tags (including provider tags)
                    const allTags = [...(location.providerid__tags || []), ...(location.tags || [])];
                    const tagMatch = allTags.some(tag => 
                        textMatches(tag.name, searchTerm, normalizedSearchTerm)
                    );

                    const itemMatch = location.items?.some(item =>
                        textMatches(item.name, searchTerm, normalizedSearchTerm)
                    );

                    return basicMatch || tagMatch || itemMatch;
                });
            }

            // Clear existing markers
            markers.forEach(marker => marker.remove());
            markers = [];

            // Add filtered markers
            filteredLocations.forEach(provider => {
                const coords = provider.coordinates.split(',');
                
                const customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `
                        <div class="marker-container">
                            <img src="/media/${provider.providerid__username}/logo.png" 
                                 alt="${provider.name}"
                                 onerror="this.src='/static/main/assets/BigLogo.png'">
                        </div>
                    `,
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40]
                });

                const marker = L.marker([coords[0], coords[1]], { icon: customIcon })
                    .bindPopup(`
                        <div class="custom-popup">
                            <strong>${provider.providerid__name}</strong><br>
                            ${provider.name}<br>
                            Rating: ${Math.round(provider.locationrating * 10) / 10}⭐<br>
                            <a class="custom-popup-link" href="${providerURL.replace('0', provider.locationid)}">See more</a>
                        </div>
                    `)
                    .addTo(map);
                markers.push(marker);
            });

        } catch (error) {
            console.error('Error searching map:', error);
        }
    }

    // Function to handle search
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const activeSection = document.querySelector('.toggle-option.active-toggle').id;

        switch (activeSection) {
            case 'providers':
                searchProviders(searchTerm);
                break;
            case 'events':
                searchEvents(searchTerm);
                break;
            case 'map':
                searchMap(searchTerm);
                break;
        }
    }

    // Add keyboard support for search (Enter key)
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Add click event listener for search button
    searchButton.addEventListener('click', handleSearch);

    // Add this to clear the search results when changing sections
    toggleButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Clear the search input and results when changing sections
            searchInput.value = '';
            currentSearchResults = null;
            currentEventSearchResults = null;
        });
    });

})

async function addBookmark(customerid, locationid) {
    try {
        const response = await fetch(`/customer/${customerid}/${locationid}/add-bookmark/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                customerid: customerid,
                locationid: locationid
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Bookmark added successfully');
        } else {
            console.error(`Failed to add bookmark: ${data.error}`);
        }
    } catch (error) {
        console.error('Error adding bookmark:', error);
    }
}



function searchLocations(locid, favorites) {
    for (let i = 0; i < favorites.length; i++) {
        if (favorites[i].locationid == locid) {
            return true
        }
    }
    return false
}

