
async function fetchItemDetails(itemid) {
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
                                            <p class="price" style="color: #6ee665;">${item.price} SAR</p>
                                        </div>
                                        <p>${item.description}</p>
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
                                            <p class="price" style="color: #6ee665;">${item.price} SAR</p>
                                        </div>
                                        <p>${item.description}</p>
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
        alert('Item Added successfully!');

      } else {
        alert('Error Submitting Item Information.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

})
