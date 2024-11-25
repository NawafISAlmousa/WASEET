document.addEventListener('DOMContentLoaded', () => {
    setupEditCheckboxes();
    fetchProviderDetails();
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
})

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

async function fetchProvidertags(providerid) {
    try {
        const response = await fetch(`/provider/fetchData/${providerid}`);
        if (response.ok) {
            data = await response.json()
            for (let tag of data) {
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




fetchProvidertags(providerid)

// Function to handle checkbox functionality
function setupEditCheckboxes() {
    const checkboxes = ['edit-provider-name', 'edit-provider-number', 'edit-description'];
    
    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        const inputId = id.replace('edit-', '');
        const input = document.getElementById(inputId);
        
        // Set initial state
        input.disabled = true;
        
        // Add change listener to each checkbox
        checkbox.addEventListener('change', function() {
            input.disabled = !this.checked;
        });
    });
}

// Function to fetch and display provider details
async function fetchProviderDetails() {
    try {
        const response = await fetch(`/provider/fetchData/${providerid}`);
        if (response.ok) {
            const data = await response.json();
            
            // Update form fields with fetched data
            document.getElementById('provider-name').value = data.name;
            document.getElementById('provider-number').value = data.phonenumber;
            document.getElementById('description').value = data.description;
            console.log(document.getElementById('description').value)

            // Fetch and display tags
            selectedTags = []; // Clear existing tags
            for (let tag of data.tags) {
                selectTag(tag.name);
            }
            displaySelectedTags();
        } else {
            console.error('Error fetching provider details');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Form submission handler
document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    formData.append('tags', JSON.stringify(selectedTags));

    // Temporarily enable all fields to include their values
    const disabledFields = e.target.querySelectorAll('input:disabled, textarea:disabled');
    disabledFields.forEach(field => field.disabled = false);

    // Recreate the FormData after enabling fields
    const updatedFormData = new FormData(e.target);
    
    // Disable the fields again
    disabledFields.forEach(field => field.disabled = true);

    // Add the tags and logo
    updatedFormData.append('tags', JSON.stringify(selectedTags));
    const fileInput = document.getElementById('upload-logo');
    if (fileInput.files.length > 0) {
        updatedFormData.append('upload-logo', fileInput.files[0]);
    }

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
        const response = await fetch(`/provider/${providerid}/`, {
            method: 'POST',
            body: updatedFormData,  // Use the updated FormData
            headers: {
                'X-CSRFToken': csrfToken,
            },
        });

        if (response.ok) {
            alert('Provider information updated successfully!');
            // Add a small delay before fetching updated details
            setTimeout(() => {
                fetchProviderDetails();
            }, 100);
        } else {
            const errorMessage = await response.text();
            console.error('Error submitting provider information:', errorMessage);
            alert('Error submitting provider information.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


