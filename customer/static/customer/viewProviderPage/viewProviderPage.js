// Navigation bar functionality
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop) {
            // Scrolling down
            navbar.style.top = '-80px'; // Hide navbar
        } else {
            // Scrolling up
            navbar.style.top = '0'; // Show navbar
        }
        lastScrollTop = scrollTop;
    });
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
const reviewForm = document.querySelector('.review-form');
if (reviewForm) {
    reviewForm.addEventListener('submit', function(e) {
        const rating = document.querySelector('input[name="rating"]:checked');
        const reviewText = document.querySelector('textarea[name="review-text"]');
        
        if (!rating) {
            e.preventDefault();
            alert('Please select a rating');
            return;
        }

        if (!reviewText.value.trim()) {
            e.preventDefault(); 
            alert('Please enter a review');
            return;
        }
    });
}
