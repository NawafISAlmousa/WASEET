
async function fetchItemDetails(itemid) {
  document.querySelector('.form-curtain').style.display = 'block'
  document.querySelector('.form-placeholder').style.display = 'none'
  document.querySelector('.edit-item-form').style.display = 'block'

  const itemName = document.getElementById("item-name")
  const itemPrice = document.getElementById("item-price")
  const itemDescription = document.getElementById('item-description')
  const itemImage = document.getElementById('item-logo-input')
  const itemImagePreview = document.getElementById('item-logo')
  const itemIDinput = document.getElementById('itemid')
  try {
    const response = await fetch(`/provider/fetchItemDetails/${itemid}`);

    if (response.ok) {
      const data = await response.json();
      let itemImagePath = `/media/${providerUsername}/items/item&.png`;
      let imageFilePath = itemImagePath.replace("&", data.itemid);
      itemName.value = data.name
      itemDescription.value = data.description
      itemPrice.value = data.price
      itemImagePreview.src = imageFilePath
      itemImage.src = imageFilePath
      itemIDinput.value = data.itemid

    } else {

      alert('Error fetching item details.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


async function deleteItem(itemID) {
  try {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const response = await fetch('/provider/deleteItem/', {
      method: 'POST',
      body: JSON.stringify({ itemID: itemID, providerID: providerid }),
      headers: {
        'Content-Type': 'application/json',  // Add this to specify JSON content type
        'X-CSRFToken': csrfToken,  // Add CSRF token
      },
    });

    if (response.ok) {
      fetchItemsForProvider(providerid);

      alert('Item Deleted successfully!');
    } else {
      alert('Error Deleting Item.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};





async function fetchItemsForProvider(providerid) {
  try {
    const response = await fetch(`/provider/fetchItems/${providerid}`);

    if (response.ok) {
      const items = await response.json();
      let itemsHTML = '';  // Initialize itemsHTML as an empty string to accumulate HTML for each item
      let itemImagePath = `/media/${providerUsername}/items/item&.png`;

      items.forEach(item => {
        // Set the path for the item image, with a fallback to the default image if it doesn’t exist
        const imageFilePath = itemImagePath.replace("&", item.itemid);
        // Add HTML for each item
        console.log(item.itemid)
        itemsHTML += `
                            <li>
                                <div class="item-container">
                                    <div class="item-logo-holder">
                                        <img src="${imageFilePath}" alt="item image" class="item-logo" onerror="this.src='${defaultImage}'">
                                    </div>
                                    <div class="item-info">
                                        <div class="item-info-header">
                                            <h1>${item.name}</h1> 
                                            <p class="price" style="color: #296879; font-weight:bold">${item.price} <span>SAR</span></p>
                                        </div>
                                        <p class= 'item-description-card'>${item.description}</p>
                                    </div>
                                    <div class="edit-delete-btn">
                                        <i class="fa-solid fa-trash" ondblclick=deleteItem(${item.itemid})></i>
                                        <i class="fa-solid fa-pen-to-square" onclick="fetchItemDetails(${item.itemid})"></i>
                                    </div>
                                </div>
                            </li>
                        `;

      });

      // Display items in the specified container
      document.querySelector(".item-unordered-list").innerHTML = itemsHTML;
    } else {
      alert('Error fetching items.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}



document.addEventListener("DOMContentLoaded", function () {
  const itemPopUpShadow = document.getElementById("item-pop-up-shadow");
  const itemPopUp = document.getElementById("item-pop-up");
  const itemAddButton = document.getElementById("item-add-button")
  itemPopUpShadow.addEventListener("click", function () {
    itemPopUpShadow.style.display = 'none';
    itemPopUp.style.display = 'none';
  })



  itemAddButton.addEventListener("click", function () {
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
  console.error(document.getElementById("item-change-logo"))
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
  console.error(document.getElementById("add-item-change-logo"))
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
        const defaultImageFile = await fetch(defaultImage); // Adjust path if necessary
        const imageBlob = await defaultImageFile.blob(); // Convert to Blob
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
        document.getElementById('add-item-logo').src = defaultImage
        e.target.reset();
        fetchItemsForProvider(providerid);
        fetchProviderItems(providerid);
        alert('Item Added successfully!');

      } else {
        alert('Error Submitting Item Information.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });


  // =============== fetch items api ==========================






  async function fetchItemsForProvider(providerid) {
    try {
      const response = await fetch(`/provider/fetchItems/${providerid}`);

      if (response.ok) {
        const items = await response.json();
        let itemsHTML = '';  // Initialize itemsHTML as an empty string to accumulate HTML for each item
        let itemImagePath = `/media/${providerUsername}/items/item&.png`;

        items.forEach(item => {
          // Set the path for the item image, with a fallback to the default image if it doesn’t exist
          const imageFilePath = itemImagePath.replace("&", item.itemid);
          // Add HTML for each item
          console.log(item.itemid)
          itemsHTML += `
                            <li>
                                <div class="item-container">
                                    <div class="item-logo-holder">
                                        <img src="${imageFilePath}" alt="item image" class="item-logo" onerror="this.src='${defaultImage}'">
                                    </div>
                                    <div class="item-info">
                                        <div class="item-info-header">
                                            <h1>${item.name}</h1> 
                                            <p class="price" style="color: #296879; font-weight:bold">${item.price} <span>SAR</span></p>
                                        </div>
                                        <p class= 'item-description-card'>${item.description}</p>
                                    </div>
                                    <div class="edit-delete-btn">
                                        <i class="fa-solid fa-trash" ondblclick=deleteItem(${item.itemid})></i>
                                        <i class="fa-solid fa-pen-to-square" onclick="fetchItemDetails(${item.itemid})"></i>
                                    </div>
                                </div>
                            </li>
                        `;

        });

        // Display items in the specified container
        document.querySelector(".item-unordered-list").innerHTML = itemsHTML;
      } else {
        alert('Error fetching items.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Example usage
  fetchItemsForProvider(providerid);



  document.querySelector('.item-form-container').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target); // Collect form data
    const file = formData.get('item-logo-input')
    formData.append('providerid', providerid)
    if (!file || file.size === 0) {
      // If no file was uploaded, assign the default static image
      try {
        const defaultImageFile = await fetch(defaultImage); // Adjust path if necessary
        const imageBlob = await defaultImageFile.blob(); // Convert to Blob
        const defaultFile = new File([imageBlob], 'BigLogo.png', { type: imageBlob.type });
        formData.set('upload-logo', defaultFile); // Set the default image as a file in FormData
      } catch (error) {
        console.error('Error loading default image:', error);
      }
    }
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
      const response = await fetch('/provider/editItem/', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': csrfToken, // Add the CSRF token to the headers
        },
      });

      if (response.ok) {
        document.getElementById('item-logo').src = defaultImage
        e.target.reset();
        fetchItemsForProvider(providerid);
        fetchProviderItems(providerid);
        fetchProviderEditItems(providerid);
        document.querySelector('.form-curtain').style.display = 'none'
        document.querySelector('.form-placeholder').style.display = 'block'
        document.querySelector('.edit-item-form').style.display = 'flex'
        alert('Item updated successfully!');

      } else {
        alert('Error Submitting Item Information.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });





  // ====================================== AI button ==================================================




  async function getGPTResponseForItem() {
      let itemDesc = document.getElementById("item-description")
      let itemName = document.getElementById("item-name")
      const apiKey = '';  // Replace with your actual API key
      const modUserInput = `Generate a new short description about 300 characters long for an item based on: 1-name: (${itemName.value}) 2-current description: (${itemDesc.value}) without anything but the generated description please so no 'ofcourse' or 'got it' just the description alone `;
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
                          { "role": "system", "content": "You are assisting a service provider or a merchant to describe a service or a product." },
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
                  itemDesc.value = data.choices[0].message.content;
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


  document.getElementById("itemAIbutton").onclick = () => getGPTResponseForItem();
})


