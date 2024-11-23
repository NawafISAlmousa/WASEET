// Sticky navbar scroll behavior
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

    document.getElementById("sort").addEventListener("change", fetchProviders)
    //Fetch providers from API and render cards
    async function fetchProviders() {
        try {

            await fetch(`/provider/providers/`)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    renderProviderCards(data)
                })

        } catch (error) {
            console.error('Error fetching providers:', error);
        }
    }

    // Render provider cards
    function renderProviderCards(providers) {
        providerContent.innerHTML = "";
        let selectedSort = document.getElementById('sort').value

        if(selectedSort == 'distance'){
            providers.sort((a,b) => {
                coordA = a.coordinates.split(',')
                coordB = b.coordinates.split(',')
                return calculateDistance(userlocation[0], userlocation[1], coordA[0], coordA[1]) - calculateDistance(userlocation[0], userlocation[1], coordB[0], coordB[1])
            })
        }else{
            providers.sort((a,b) => a.providerrating - b.providerrating)
        }







        providers.forEach(provider => { 
            const card = document.createElement('div');
            card.classList.add('card');
            providerCoord = provider.coordinates.split(',')
            const userDistance = calculateDistance(userlocation[0], userlocation[1], providerCoord[0], providerCoord[1])
            card.innerHTML = `
            
            <div class="card-header">
                <img src="/media/${provider.providerid__username}/logo.png" alt="Provider Logo" class="provider-logo">
                <div class="top-right">
                    <div> <i class="fa-regular fa-bookmark fa-xl" style="color: #00796b; margin-bottom: 25px;"></i>
                    </div>                                                            
                    <div class="card-distance"><span class="span-km">${userDistance > 0.05 ? `${userDistance} Km` : ""}</span> ${userDistance > 0.05 ? 'away from you' : "Right next to you"}</div>
                </div>
            </div>
            <div class="card-info">
                <h2 class='provider-name'>${provider.providerid__name}</h2>
                <h3>${provider.name}</h3>
                <p class="card-description">${provider.providerid__description}</p>
                <p class="card-rating">${Math.round(provider.providerrating * 100) / 100}<i class="fa-solid fa-star" style="color:  #00796b;"></i></p>
                <div class="provider-buttons" id="that">
                    <button class="map-button">Check on map</button>
                    <button class="more-button" onclick="window.location.href='${providerURL.replace('0', provider.locationid)}'">See more</button>
                </div>
            </div>
            

            `;
            // Add mouseenter event listener to each card
            card.addEventListener('mouseenter', () => {
                // Find the specific description and button container within the hovered card
                const description = card.querySelector('.card-description');
                const buttons = card.querySelector('.provider-buttons');

                // Show and animate the description
                description.style.display = 'block';
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

            providerContent.appendChild(card);
        });
        if (providerContent.childElementCount === 0) {
            const message = document.createElement('h1');
            message.classList.add('error-message')
            message.innerHTML = "Sorry, we could not find anything!"
            providerContent.appendChild(message);
        }
    }

    


    // Infinite scroll to load more cards
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
            // Fetch more providers when scrolled to the bottom
            fetchProviders();
        }
    });

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
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        output.textContent = "Permission denied. Please allow location access.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        output.textContent = "Location unavailable.";
                        break;
                    case error.TIMEOUT:
                        output.textContent = "Request timed out.";
                        break;
                    default:
                        output.textContent = "An unknown error occurred.";
                }
            }
        );
    } else {
        output.textContent = "Geolocation is not supported by your browser.";
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

})