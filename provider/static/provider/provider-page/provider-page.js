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
    // ======================= Map Functions ===============================
    const fallbackLatitude = 24.7136;  // Riyadh's latitude
    const fallbackLongitude = 46.6753; // Riyadh's longitude
    const mapZoomLevel = 13;           // Default zoom level

    // Function to initialize the map and add a draggable marker
    function initializeMap(latitude, longitude) {
        // Initialize map centered on given coordinates
        const map = L.map('map').setView([latitude, longitude], mapZoomLevel);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add a draggable marker and set its initial position
        const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);

        // Update hidden fields with initial position
        document.getElementById('latitude').value = latitude;
        document.getElementById('longitude').value = longitude;

        // Event listener for marker movement
        marker.on('dragend', function(event) {
            const { lat, lng } = event.target.getLatLng();
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;
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


// =================== checkboxes ==================================================


document.addEventListener("DOMContentLoaded", function() {
    // Function to toggle input enable/disable based on checkbox
    function toggleInput(checkboxId, inputId) {
        const checkbox = document.getElementById(checkboxId);
        const input = document.getElementById(inputId);

        // Initial state based on checkbox
        input.disabled = !checkbox.checked;

        // Add event listener for changes
        checkbox.addEventListener("change", function() {
            input.disabled = !checkbox.checked;
        });
    }

    // Toggle each input based on its checkbox
    toggleInput("edit-provider-name", "provider-name");
    toggleInput("edit-provider-number", "provider-number");
    toggleInput("edit-description", "description");
});




// ====================================== AI button ==================================================

providerDesc = document.getElementById("description")
providerName = document.getElementById("provider-name")


async function getGPTResponse() {
    // const apiKey = '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';  // Replace with your actual API key
    const modUserInput = `Generate a new short description about 300 characters long based on: 1-name: (${providerName.value}) 2-current description: (${providerDesc.value}) 3-tags: (${selectedTags}) without anything but the generated description please so no 'ofcourse' or 'got it' just the description alone and talk in first-person prespective. if it looks like a business is asking for the description use 'we' else if it looks like a singular provider, say a freelancer, is asking for the description use 'I'`;
    if(providerDesc.value.trim() !== ""){
        try {
            // Set up the request to OpenAI API
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4o",  // Switching to the more basic gpt-3.5-turbo model
                    messages: [
                        { "role": "system", "content": "You are assisting a service provider or a merchant to generally describe what they are." },
                        { "role": "user", "content": modUserInput }
                    ]
                })
            });
    
            // Check if the response was successful
            if (!response.ok) {
                console.error(`Error: API request failed with status ${response.status}`);
                alert(`Could not fetch from AI Model: Status ${response.status}`);
                return `Error: API request failed with status ${response.status}`;
            }
    
            // Parse the JSON response
            const data = await response.json();
            console.log("API Response Data:", data);  // For debugging, log the entire response
    
            // Extract and return the text content of the response
            if (data.choices && data.choices.length > 0) {
                providerDesc.value = data.choices[0].message.content;
            } else {
                console.error("Unexpected response format:", data);
                alert("Could not fetch from AI Model: Invalid response structure.");
            }
        } catch (error) {
            console.error("Error fetching response:", error);
            alert("There was an error fetching the response.");
        }
    }else{
        alert("Please Provide a Description to be Modified.")
    }
    
}


document.getElementById("AIbutton").onclick = () => getGPTResponse();
