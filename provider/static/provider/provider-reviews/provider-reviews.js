document.addEventListener('DOMContentLoaded', () => {
    fetchReviews();
});

async function fetchReviews() {
    try {
        const response = await fetch(`/provider/api/reviews/${providerid}/`);
        const data = await response.json();
        
        const locationsGrid = document.querySelector('.locations-grid');
        const locationTemplate = document.getElementById('location-template');
        const reviewTemplate = document.getElementById('review-template');
        
        // Clear existing location cards
        locationsGrid.innerHTML = '';
        
        data.forEach(location => {
            const locationCard = locationTemplate.content.cloneNode(true);
            
            // Calculate counts
            const unrepliedCount = location.reviews.filter(review => !review.response).length;
            const positiveCount = location.reviews.filter(review => review.rating >= 3).length;
            const negativeCount = location.reviews.filter(review => review.rating <= 2).length;
            
            locationCard.querySelector('.location-name').textContent = location.name;
            
            // Create rating group div
            const ratingGroup = document.createElement('div');
            ratingGroup.className = 'location-rating-group';
            
            // Add unreplied count if there are any
            if (unrepliedCount > 0) {
                const unrepliedBadge = document.createElement('span');
                unrepliedBadge.className = 'unreplied-count';
                unrepliedBadge.textContent = `${unrepliedCount} unreplied`;
                ratingGroup.appendChild(unrepliedBadge);
            }
            
            // Add rating
            const ratingSpan = document.createElement('span');
            ratingSpan.className = 'location-rating';
            ratingSpan.textContent = `Rating: ${location.rating.toFixed(1)}`;
            ratingGroup.appendChild(ratingSpan);
            
            // Add sentiment badges
            const sentimentDiv = document.createElement('div');
            sentimentDiv.className = 'sentiment-badges';
            
            const positiveBadge = document.createElement('span');
            positiveBadge.className = 'sentiment-badge positive';
            positiveBadge.textContent = `${positiveCount} positive`;
            positiveBadge.title = 'Reviews with 3 stars or more';
            
            const negativeBadge = document.createElement('span');
            negativeBadge.className = 'sentiment-badge negative';
            negativeBadge.textContent = `${negativeCount} negative`;
            negativeBadge.title = 'Reviews with 2 stars or less';
            
            sentimentDiv.appendChild(positiveBadge);
            sentimentDiv.appendChild(negativeBadge);
            
            // Add all elements to header
            const locationHeader = locationCard.querySelector('.location-header');
            locationHeader.appendChild(sentimentDiv);
            locationHeader.appendChild(ratingGroup);
            
            const reviewsList = locationCard.querySelector('.reviews-list');
            
            location.reviews.forEach(review => {
                const reviewCard = reviewTemplate.content.cloneNode(true);
                
                reviewCard.querySelector('.review-customer').textContent = review.customer_name;
                reviewCard.querySelector('.review-rating').textContent = `${review.rating}/5`;
                reviewCard.querySelector('.review-date').textContent = review.date;
                reviewCard.querySelector('.review-text').textContent = review.text;
                reviewCard.querySelector('.review-id').value = review.reviewId;
                
                // Add report button
                const reportButton = document.createElement('button');
                reportButton.className = 'report-button';
                reportButton.innerHTML = '<i class="fas fa-flag"></i> Report Review';
                reportButton.addEventListener('click', () => {
                    if (review.customer_id) {
                        window.location.href = `/provider/report/${providerid}/PROVIDER/${providerid}/CUSTOMER/${review.customer_id}/`;
                    } else {
                        console.error('Customer ID not found for review');
                    }
                });
                
                // Add report button to review header
                const reviewHeader = reviewCard.querySelector('.review-header');
                reviewHeader.appendChild(reportButton);
                
                const replyButton = reviewCard.querySelector('.reply-button');
                const responseForm = reviewCard.querySelector('.response-form');
                const responseTextarea = responseForm.querySelector('textarea');
                const submitButton = responseForm.querySelector('.submit-response');

                if (review.response) {
                    responseTextarea.value = review.response.text;
                    submitButton.textContent = 'Update Response';
                    replyButton.textContent = 'Edit Response';
                    
                    // Add response date
                    const responseDate = document.createElement('div');
                    responseDate.className = 'response-date';
                    responseDate.textContent = `Responded on: ${review.response.date}`;
                    responseForm.insertBefore(responseDate, responseForm.firstChild);
                }

                // Add click handlers for reply and cancel buttons
                replyButton.addEventListener('click', () => {
                    responseForm.style.display = 'block';
                    replyButton.style.display = 'none';
                });

                responseForm.querySelector('.cancel-button').addEventListener('click', () => {
                    responseForm.style.display = 'none';
                    replyButton.style.display = 'block';
                });
                
                reviewsList.appendChild(reviewCard);
            });
            
            locationsGrid.appendChild(locationCard);
        });
        
        // Add event listeners to all response forms
        document.querySelectorAll('.response-form').forEach(form => {
            form.addEventListener('submit', handleResponseSubmit);
        });
        
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

async function handleResponseSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const reviewId = form.querySelector('.review-id').value;
    const responseText = form.querySelector('textarea').value;
    
    try {
        const response = await fetch('/provider/api/review-response/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify({
                reviewId: reviewId,
                responseText: responseText
            })
        });
        
        if (response.ok) {
            alert('Response submitted successfully!');
            // Hide form and update button text
            form.style.display = 'none';
            const replyButton = form.previousElementSibling;
            replyButton.style.display = 'block';
            replyButton.textContent = 'Edit Response';
            // Refresh the reviews to show the updated response
            fetchReviews();
        } else {
            alert('Error submitting response');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting response');
    }
} 