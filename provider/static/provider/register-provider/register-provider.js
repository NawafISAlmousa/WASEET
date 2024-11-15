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

    // Check if password and confirm password match
    if (document.getElementById('password').value !== document.getElementById('confirm-password').value) {
        alert('Password and Confirm Password Do Not Match!');
        return;
    }

    const formData = new FormData(e.target); // Collect form data
    formData.append('tags', JSON.stringify(selectedTags));  // Add selected tags to form data

    const file = formData.get('upload-logo');
    if (!file || file.size === 0) {
        try {
            const defaultImage = await fetch('/static/main/assets/BigLogo.png');
            const imageBlob = await defaultImage.blob();
            const defaultFile = new File([imageBlob], 'BigLogo.png', { type: imageBlob.type });
            formData.set('upload-logo', defaultFile);
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
                'X-CSRFToken': csrfToken,
            },
        });

        const data = await response.json();

        if (data.status === 'error') {
            // Display validation errors
            if (data.errors.username)
                alert(data.errors.username);
            if (data.errors.email)
                alert(data.errors.email);

        } else if (data.status === 'success') {
            // Clear the form or redirect on success
            e.target.reset();
            window.location.href = loginurl;  // Uncomment to redirect
        }
    } catch (error) {
        console.error('Error:', error);
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

providerDesc = document.getElementById("description")
providerName = document.getElementById("provider-name")

async function getGPTResponse() {
    const apiKey = '';  // Replace with your actual API key
    const modUserInput = `Generate a new short description about 300 characters long based on: 1-name: (${providerName.value}) 2-current description: (${providerDesc.value}) 3-tags: (${selectedTags}) without anything but the generated description please so no 'ofcourse' or 'got it' just the description alone and talk in first-person prespective. if it looks like a business is asking for the description use 'we' else if it looks like a singular provider, say a freelancer, is asking for the description use 'I'`;
    if (providerDesc.value.trim() !== "") {
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
    } else {
        alert("Please Provide a Description to be Modified.")
    }

}


document.getElementById("AIbutton").onclick = () => getGPTResponse();