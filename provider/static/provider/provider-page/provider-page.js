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