// Sticky navbar scroll behavior
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
const toggleButtons = document.querySelectorAll('.toggle-option');
const toggleSlider = document.querySelector('.toggle-slider');
const dynamicContent = document.getElementById('dynamicContent');
const providerCardsContainer = document.getElementById('providerCards');
const cards = document.querySelectorAll('.card');

console.log(dynamicContent.childElementCount)


//Fetch providers from API and render cards
async function fetchProviders() {
    try {
        // Replace with your API endpoint
        const response = await fetch('https://api.example.com/providers');
        const data = await response.json();
        renderProviderCards(data);
        
    } catch (error) {
        console.error('Error fetching providers:', error);
    }
}

// Render provider cards
function renderProviderCards(providers) {
    dynamicContent.innerHTML = "";
    providers.forEach(provider => {
        const card = document.createElement('div');
        card.classList.add('provider-card');
        card.innerHTML = `
               <div class="card" >
            <div class="card-header">
                <img src="${provider.logo}" alt="Provider Logo" class="provider-logo">
               <div class="top-right">
                    <div> <i class="fa-regular fa-bookmark fa-xl" style="color: #00796b; margin-bottom: 25px;"></i></div>
                     <div class="card-distance"><span class="span-km">${provider.distance}km</span> away from you</div>
                 </div>
            </div>
            <div class="card-info">
                <h2>${provider.name}</h2>
                <p class="card-description">${provider.description}</p>
                <p class="card-rating">${provider.rating} <i class="fa-solid fa-star" style="color:  #00796b;"></i></p>
                <div class="provider-buttons" id="that">
                    <button class="map-button">Check on map</button>
                    <button class="more-button">See more</button>
                </div>
            </div>
        </div>
        `;
        providerCardsContainer.appendChild(card);
    });
    if(dynamicContent.childElementCount === 0){
        const message = document.createElement('h1');
        message.classList.add('error-message')
        message.innerHTML = "Sorry, we could not find anything!"
        dynamicContent.appendChild(message);
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
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        toggleSlider.style.left = `calc(${index * 32}% + 3px)`;

        if (index === 0) {
            dynamicContent.innerHTML = '<div class="provider-cards" id="providerCards"></div>';
            fetchProviders();
        } else if (index === 1) {
            dynamicContent.innerHTML = '<!-- Events Content -->';
        } else {
            dynamicContent.innerHTML = '<!-- Map Content -->';
        }
    });
});




// card property  


// Iterate through each card
cards.forEach(card => {
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
    });
});
