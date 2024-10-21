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
      
      const formData = new FormData(e.target);
      
      try {
        const response = await fetch('/provider/registerProvider/', {
          method: 'POST',
          body: formData,
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




checkbox.addEventListener('click', function(){
  if (checkbox.checked){
    pass.type = 'text';
    confirmpass.type = 'text';
  } else{
    pass.type = 'password';
    confirmpass.type = 'password';
  }
})