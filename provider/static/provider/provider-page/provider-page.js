document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-option');
    const sections = document.querySelectorAll('.content-section');
    const slider = document.querySelector('.toggle-slider');

    function previewLogo(event) {
        const [file] = event.target.files;
        if (file) {
            const preview = document.getElementById('logo');
            preview.src = URL.createObjectURL(file);
        }
    }

    document.querySelector(".logo-input").addEventListener("change", previewLogo)

    document.querySelector(".change-logo").addEventListener("click", triggerFileInput)
    

    function triggerFileInput() {
        document.getElementById('upload-logo').click();
    }

    toggleButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            toggleButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to the clicked button
            button.classList.add('active');

            // Move the slider
            slider.style.left = `calc(${index * 25}% + 3px)`; // Adjust left position based on index

            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));

            // Show the section related to the clicked button
            const sectionId = button.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
    // Initialize the map and set the view to Riyadh's coordinates
    var map = L.map('map').setView([48.858222, 2.294500], 10); // Coordinates for Riyadh

    // Add OpenStreetMap tiles to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a marker for Riyadh
    L.marker([48.858222, 2.294500]).addTo(map).bindPopup('Riyadh, Saudi Arabia').openPopup();
});


const availableTagsContainer = document.getElementById('available-tags');
const selectedTagsContainer = document.getElementById('selected-tags');
const tagSearchInput = document.getElementById('tag-search');
let selectedTags = [];



let allTags = []; // Store all tags here for easy filtering

// Fetch tags from the backend only once
async function fetchTags() {
    try {
        const response = await fetch(`/provider/tags/`);
        if (!response.ok) throw new Error('Failed to fetch tags');
        const tagsData = await response.json();
        allTags = tagsData; // Store the fetched tags
        displayAvailableTags(allTags); // Display all tags initially
    } catch (error) {
        console.error('Error fetching tags:', error);
    }
}

// Filter and display tags based on search input
tagSearchInput.addEventListener('input', () => {
    const searchValue = tagSearchInput.value.toLowerCase();
    const filteredTags = allTags.filter(tag =>
        tag.name.toLowerCase().includes(searchValue)
    );
    displayAvailableTags(filteredTags);
});

// Display tags in the available tags container
function displayAvailableTags(tags) {
    availableTagsContainer.innerHTML = '';
    tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.classList.add('tag');
        tagElement.textContent = tag.name;
        tagElement.addEventListener('click', () => selectTag(tag.name));
        availableTagsContainer.appendChild(tagElement);
    });
}

// Initialize by fetching tags on page load
fetchTags();


function selectTag(tagName) {
    if (selectedTags.includes(tagName)) return;
    if (selectedTags.length >= 6) {
        alert('You can only select up to 6 tags.');
        return;
    }
    
    selectedTags.push(tagName);
    
    displaySelectedTags();
}

function displaySelectedTags() {
    selectedTagsContainer.innerHTML = '';
    selectedTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.classList.add('selected-tag');
        tagElement.textContent = tag;

        const closeIcon = document.createElement('span');
        closeIcon.classList.add('close-icon');
        closeIcon.textContent = '×';
        closeIcon.addEventListener('click', () => removeTag(tag));

        tagElement.appendChild(closeIcon);
        selectedTagsContainer.appendChild(tagElement);
    });
}

function removeTag(tag) {
   
    selectedTags = selectedTags.filter(t => t !== tag);
    displaySelectedTags();
}

// checkbox.addEventListener('click', () => {
//     const type = checkbox.checked ? 'text' : 'password';
//     pass.type = type;
//     confirmpass.type = type;
// });

async function fetchProviderData(providerid){
    try {
        const response = await fetch(`/provider/fetchData/${providerid}`);
        if (response.ok) {  
            data = await response.json()
            for(let tag of data[3]){
                selectTag(tag.name)
            }
            displaySelectedTags()
             
            console.log()
        } else {
          alert('Error Fetching provider information.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
}




fetchProviderData(providerid)

document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target); // Collect form data
    formData.append('tags', JSON.stringify(selectedTags));  // Add selected tags to form data

    // Check if a new logo file has been uploaded
    const fileInput = document.getElementById('upload-logo');
    if (fileInput.files.length > 0) {
        formData.append('upload-logo', fileInput.files[0]);
    }

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
        const response = await fetch(`/provider/${providerid}/`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken,
            },
        });

        if (response.ok) {
            alert('Provider information submitted successfully!');
            e.target.reset();
            window.location.reload(); // Reloads the page to reflect updates
        } else {
            const errorMessage = await response.text();
            console.error('Error submitting provider information:', errorMessage);
            alert('Error submitting provider information.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
