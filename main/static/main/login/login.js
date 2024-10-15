
// Get the toggle buttons, slider, and form elements
const customerBtn = document.getElementById('customerBtn');
const providerBtn = document.getElementById('providerBtn');
const toggleSlider = document.querySelector('.toggle-slider');
const submitButton = document.getElementById('submitButton');
const usernameInput = document.getElementById("username")
const passwordInput = document.getElementById("password")
const registerLink = document.querySelector(".register-link a")
const userType = document.getElementById('userType')


// Function to activate Customer option
customerBtn.addEventListener('click', function () {
    toggleSlider.style.left = '3px'; // Move slider to the left
    toggleSlider.style.backgroundColor = '#00796b'; // Highlight color for Customer
    customerBtn.classList.add('active');
    providerBtn.classList.remove('active');
    customerBtn.style.color = 'white'; // Make text white for contrast
    providerBtn.style.color = '#333'; // Reset text color of inactive option
    submitButton.style.backgroundColor = '#00796b'; // Change button color for Customer
    submitButton.textContent = 'Login as Customer'; // Optional: change button text
    usernameInput.placeholder = 'Enter customer username'
    passwordInput.placeholder = 'Enter customer password'
    registerLink.style.color = '#00796b'
    registerLink.href = customerUrl
    userType.value = 'customer';
});

// Function to activate Provider option
providerBtn.addEventListener('click', function () {
    toggleSlider.style.left = 'calc(50% + 3px)'; // Move slider to the right with accurate positioning
    toggleSlider.style.backgroundColor = '#296879'; // Highlight color for Provider
    providerBtn.classList.add('active');
    customerBtn.classList.remove('active');
    providerBtn.style.color = 'white'; // Make text white for contrast
    customerBtn.style.color = '#333'; // Reset text color of inactive option
    submitButton.style.backgroundColor = '#296879'; // Change button color for Provider
    submitButton.textContent = 'Login as Provider'; // Optional: change button text
    usernameInput.placeholder = 'Enter provider username'
    passwordInput.placeholder = 'Enter provider password'
    registerLink.style.color = '#296879'
    registerLink.href = providerUrl
    userType.value = 'provider';
});
