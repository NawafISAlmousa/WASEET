document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadFavorites();
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
    }
});

async function loadFavorites() {
    try {
        const response = await fetch(`/customer/api/${customerId}/favorites/`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'X-CSRFToken': csrfToken,
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Favorites data:', data);
        
        const container = document.getElementById('favorites-container');
        container.innerHTML = '';

        if (!data.favorites || data.favorites.length === 0) {
            container.innerHTML = '<p class="error-message">No favorite locations yet!</p>';
            return;
        }

        data.favorites.forEach(location => {
            const card = createLocationCard(location);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading favorites:', error);
        const container = document.getElementById('favorites-container');
        container.innerHTML = '<p class="error-message">Error loading favorites. Please try again later.</p>';
    }
}

function createLocationCard(location) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Construct the image path based on provider username
    const imagePath = location.provider_username ? 
        `/media/${location.provider_username}/logo.png` : 
        '/static/default-location.png';

    card.innerHTML = `
        <div class="card-header">
            <img src="${imagePath}" alt="Provider Logo" class="provider-logo">
            <div class="top-right">
                <div class="card-rating">Rating: ${location.rating || 'N/A'} ${location.rating ? '<i class="fa-solid fa-star" style="color: #00796b;"></i>' : ''}</div>
            </div>
        </div>
        <div class="card-info">
            <h2 class='provider-name'>${location.provider_name || 'Provider Name'}</h2>
            <h3>${location.name}</h3>
            <p class="card-description">${location.description || 'No description available'}</p>
            <div class="provider-buttons">
                <button onclick="viewLocation(${location.locationid})" class="more-button">View Details</button>
                <button onclick="removeFavorite(${location.locationid})" class="remove-favorite">Remove</button>
            </div>
        </div>
    `;

    // Add hover effects matching the main page
    card.addEventListener('mouseenter', () => {
        const description = card.querySelector('.card-description');
        const buttons = card.querySelector('.provider-buttons');
        
        description.style.display = 'block';
        description.style.animation = 'description 0.5s forwards';
        buttons.style.marginTop = '5px';
        card.style.margin = 'auto';
    });

    card.addEventListener('mouseleave', () => {
        const description = card.querySelector('.card-description');
        const buttons = card.querySelector('.provider-buttons');
        
        description.style.display = 'none';
        buttons.style.marginTop = '45px';
        card.style.margin = '20px auto';
    });

    return card;
}

function viewLocation(locationId) {
    window.location.href = `/customer/${customerId}/view-provider/${locationId}/`;
}

async function removeFavorite(locationId) {
    try {
        const response = await fetch(`/customer/favorites/${customerId}/${locationId}/remove/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken,
            },
        });

        if (response.ok) {
            loadFavorites(); // Reload the favorites list
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to remove favorite');
        }
    } catch (error) {
        console.error('Error removing favorite:', error);
        alert('Failed to remove favorite');
    }
} 