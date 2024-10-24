const checkbox = document.getElementById('showpass');
const pass = document.getElementById('password');
const confirmpass = document.getElementById('confirm-password');

function previewLogo(event) {
    const [file] = event.target.files;
    if (file) {
        const preview = document.getElementById('logo-preview');
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
}


document.getElementById('provider-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if(document.getElementById('password').value === document.getElementById('confirm-password').value){
    
      const formData = new FormData(e.target); // Collect form data
      formData.append('tags', JSON.stringify(selectedTags));  // Add selected tags to form data

      const file = formData.get('upload-logo')
      if (!file || file.size === 0) {
        // If no file was uploaded, assign the default static image
        try {
            const defaultImage = await fetch('/static/main/assets/BigLogo.png'); // Adjust path if necessary
            const imageBlob = await defaultImage.blob(); // Convert to Blob
            const defaultFile = new File([imageBlob], 'BigLogo.png', { type: imageBlob.type });
            formData.set('upload-logo', defaultFile); // Set the default image as a file in FormData
        } catch (error) {
            console.error('Error loading default image:', error);
        }
    }
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      
      try {
        const response = await fetch('/provider/registerProvider/', {
          method: 'POST',
          body: formData,
          headers: {
            'X-CSRFToken': csrfToken, // Add the CSRF token to the headers
        },
        });
      
        if (response.ok) {
          alert('Provider information submitted successfully!');
          e.target.reset();
          window.location.href = loginurl;
        } else {
          alert('Error submitting provider information.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
  }else {
    alert('Password and Confirm Passord Do Not Match!')
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

checkbox.addEventListener('click', () => {
    const type = checkbox.checked ? 'text' : 'password';
    pass.type = type;
    confirmpass.type = type;
});