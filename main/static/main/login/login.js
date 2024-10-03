
// Get the toggle buttons, slider, and form elements
const customerBtn = document.getElementById('customerBtn');
const providerBtn = document.getElementById('providerBtn');
const toggleSlider = document.querySelector('.toggle-slider');
const submitButton = document.getElementById('submitButton');
const usernameInput = document.getElementById("username")
const passwordInput = document.getElementById("password")
const registerLink = document.querySelector(".register-link a")

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
    registerLink.href = "https://www.google.com/search?q=customer&sca_esv=12afcb07d421cd6c&sca_upv=1&hl=en&sxsrf=ADLYWIJL7dF_CrxiJAyhWgvUBbqmaVZNaQ%3A1725565103064&source=hp&ei=rwjaZt7mAcy6hbIPtKmR8Qg&iflsig=AL9hbdgAAAAAZtoWv-cWclyr6rKhfC-OxG3PR2YwwmRD&ved=0ahUKEwie-oL4xqyIAxVMXUEAHbRUJI4Q4dUDCBc&uact=5&oq=customer&gs_lp=Egdnd3Mtd2l6IghjdXN0b21lcjINEAAYgAQYsQMYQxiKBTINEAAYgAQYsQMYQxiKBTIQEAAYgAQYsQMYQxiDARiKBTIKEAAYgAQYQxiKBTIFEAAYgAQyCBAAGIAEGLEDMggQABiABBixAzIFEAAYgAQyBRAAGIAEMgUQABiABEibEFClBliTDnABeACQAQCYAdoBoAGmDqoBBTAuOC4yuAEDyAEA-AEBmAIKoAKKDagCCsICBxAjGCcY6gLCAgcQLhgnGOoCwgIKECMYgAQYJxiKBcICChAuGIAEGCcYigXCAhYQLhiABBixAxjRAxhDGIMBGMcBGIoFwgIOEAAYgAQYsQMYgwEYigXCAgsQABiABBixAxiDAcICBRAuGIAEwgIQEC4YgAQY0QMYQxjHARiKBcICChAuGIAEGEMYigXCAggQLhiABBixA8ICCxAuGIAEGNEDGMcBwgINEC4YgAQYsQMYQxiKBcICExAuGIAEGLEDGEMYgwEY1AIYigWYAwaSBwUxLjcuMqAHxVA&sclient=gws-wiz"
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
    registerLink.href = "https://www.google.com/search?q=provider&sca_esv=12afcb07d421cd6c&sca_upv=1&hl=en&sxsrf=ADLYWILd1TBxVCxlDFObPGaL1lSXAWghTA%3A1725565106973&ei=sgjaZqSHO-6vkdUPi4C8qAQ&ved=0ahUKEwikqPP5xqyIAxXuV6QEHQsAD0UQ4dUDCBA&uact=5&oq=provider&gs_lp=Egxnd3Mtd2l6LXNlcnAiCHByb3ZpZGVyMgsQABiABBiRAhiKBTIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyCBAAGIAEGMsBMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABEjxHlCyDFiYHXAFeAGQAQCYAecBoAGMEaoBBTAuNi41uAEDyAEA-AEBmAIPoAKDEMICChAAGLADGNYEGEfCAg0QABiABBiwAxhDGIoFwgIKEAAYgAQYQxiKBcICBBAAGAPCAgsQABiABBixAxiDAcICDhAAGIAEGLEDGIMBGIoFwgIIEC4YgAQYsQPCAgQQIxgnwgIKECMYgAQYJxiKBcICEBAuGIAEGNEDGEMYxwEYigXCAhAQABiABBixAxhDGIMBGIoFwgIIEAAYgAQYsQPCAgUQLhiABMICEBAAGIAEGLEDGIMBGMkDGArCAgcQABiABBgKwgIHEC4YgAQYCsICCxAAGIAEGJIDGIoFwgITEC4YgAQYxwEYmAUYmQUYChivAcICFRAAGIAEGLEDGEMYgwEYigUYRhj5AcICCxAuGIAEGMcBGK8BwgIvEAAYgAQYsQMYQxiDARiKBRhGGPkBGJcFGIwFGN0EGEYY-QEY9AMY9QMY9gPYAQGYAwCIBgGQBgq6BgYIARABGBOSBwU1LjUuNaAH-m8&sclient=gws-wiz-serp"
});
