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
    
    const formData = new FormData(e.target);

    try {
      const response = await fetch('/provider/registerProvider/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Provider information submitted successfully!');
        e.target.reset();
      } else {
        alert('Error submitting provider information.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });