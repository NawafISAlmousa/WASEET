document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('profileForm');
    const saveButton = document.querySelector('.save-button');
    const checkboxes = document.querySelectorAll('.edit-checkbox');
    const inputs = {
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        email: document.getElementById('email'),
        dob: document.getElementById('dob')
    };

    // Store original values
    const originalValues = {
        firstName: inputs.firstName.value,
        lastName: inputs.lastName.value,
        email: inputs.email.value,
        dob: inputs.dob.value
    };

    // Function to check if any changes were made
    function checkForChanges() {
        const hasChanges = Object.keys(inputs).some(key => 
            inputs[key].value !== originalValues[key] && !inputs[key].disabled
        );
        saveButton.disabled = !hasChanges;
    }

    // Handle checkbox changes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const inputId = this.id.replace('edit', '');
            const inputField = document.getElementById(inputId.charAt(0).toLowerCase() + inputId.slice(1));
            
            inputField.disabled = !this.checked;
            
            if (!this.checked) {
                // Reset value when disabling the field
                inputField.value = originalValues[inputId.charAt(0).toLowerCase() + inputId.slice(1)];
            }
            
            checkForChanges();
        });
    });

    // Monitor input changes
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', checkForChanges);
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Only include enabled fields in the update
        const formData = {};
        if (!inputs.firstName.disabled) formData.firstName = inputs.firstName.value;
        if (!inputs.lastName.disabled) formData.lastName = inputs.lastName.value;
        if (!inputs.email.disabled) formData.email = inputs.email.value;
        if (!inputs.dob.disabled) formData.dob = inputs.dob.value;

        try {
            const response = await fetch(`/customer/${customerId}/update-profile/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Update original values for changed fields
                Object.keys(formData).forEach(key => {
                    originalValues[key] = formData[key];
                });
                
                // Disable all checkboxes and inputs
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    const inputId = checkbox.id.replace('edit', '');
                    const inputField = document.getElementById(inputId.charAt(0).toLowerCase() + inputId.slice(1));
                    inputField.disabled = true;
                });

                saveButton.disabled = true;
                alert('Profile updated successfully!');
            } else {
                alert("Email already exists" || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the profile');
        }
    });
}); 