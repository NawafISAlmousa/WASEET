document.addEventListener("DOMContentLoaded",function(){
    const itemPopUpShadow = document.getElementById("item-pop-up-shadow");
    const itemPopUp = document.getElementById("item-pop-up");
    const itemAddButton = document.getElementById("item-add-button")
    itemPopUpShadow.addEventListener("click",function(){
        itemPopUpShadow.style.display = 'none';
        itemPopUp.style.display = 'none'; 
    })
    
    
    itemAddButton.addEventListener("click", function(){
        itemPopUpShadow.style.display = 'block';
        itemPopUp.style.display = 'block'; 
    })

    // ================== edit logo ===================================
    function previewLogo(event) {
        const [file] = event.target.files;
        if (file) {
            const preview = document.getElementById('item-logo');
            preview.src = URL.createObjectURL(file);
        }
    }
    console.error( document.getElementById("item-change-logo"))
    document.getElementById("item-logo-input").addEventListener("change", previewLogo)
    
    document.getElementById("item-change-logo").addEventListener("click", triggerFileInput)
    
    
    function triggerFileInput() {
        document.getElementById('item-logo-input').click();
    }

    // ======================= add logo ==================================

    function previewItemLogo(event) {
        const [file] = event.target.files;
        if (file) {
            const preview = document.getElementById('add-item-logo');
            preview.src = URL.createObjectURL(file);
        }
    }
    console.error( document.getElementById("add-item-change-logo"))
    document.getElementById("add-item-logo-input").addEventListener("change", previewItemLogo)
    
    document.getElementById("add-item-change-logo").addEventListener("click", triggerAddItemFileInput)
    
    
    function triggerAddItemFileInput() {
        document.getElementById('add-item-logo-input').click();
    }



    // ====================== add item =========================================

    document.getElementById('add-item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
          const formData = new FormData(e.target); // Collect form data
          formData.append('providerid', providerid)
          const file = formData.get('add-item-logo-input')
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
            const response = await fetch('/provider/addItem/', {
              method: 'POST',
              body: formData,
              headers: {
                'X-CSRFToken': csrfToken, // Add the CSRF token to the headers
            },
            });
          
            if (response.ok) {
              alert('Item Added successfully!');
              e.target.reset();
            } else {
              alert('Error Submitting Item Information.');
            }
          } catch (error) {
            console.error('Error:', error);
          }
    });   
})
