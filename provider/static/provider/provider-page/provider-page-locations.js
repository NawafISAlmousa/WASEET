document.addEventListener("DOMContentLoaded", function () {
  // ======================= Map Functions ===============================
  const fallbackLatitude = 24.7136;  // Riyadh's latitude
  const fallbackLongitude = 46.6753; // Riyadh's longitude
  const mapZoomLevel = 13;           // Default zoom level

  // Function to initialize the map and add a draggable marker
  function initializeMap(latitude, longitude) {
    // Initialize map centered on given coordinates
    const map = L.map('location-map').setView([latitude, longitude], mapZoomLevel);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a draggable marker and set its initial position
    const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);

    // Update hidden fields with initial position
    document.getElementById('location-latitude').value = latitude;
    document.getElementById('location-longitude').value = longitude;

    // Event listener for marker movement
    marker.on('dragend', function (event) {
      const { lat, lng } = event.target.getLatLng();
      document.getElementById('location-latitude').value = lat;
      document.getElementById('location-longitude').value = lng;
      console.log(`Marker moved to: ${lat}, ${lng}`);
    });
  }

  // Try to get the user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        initializeMap(latitude, longitude); // Use user's current location
      },
      error => {
        console.warn("Geolocation error:", error);
        alert("Could not access your location. Defaulting to Riyadh.");
        initializeMap(fallbackLatitude, fallbackLongitude); // Fallback to Riyadh
      }
    );
  } else {
    alert("Geolocation is not supported by this browser. Defaulting to Riyadh.");
    initializeMap(fallbackLatitude, fallbackLongitude); // Fallback to Riyadh
  }





  // ============ add location map ====================


  function initializeAddMap(latitude, longitude) {
    // Initialize map centered on given coordinates
    const map = L.map('add-location-map').setView([latitude, longitude], mapZoomLevel);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a draggable marker and set its initial position
    const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);

    // Update hidden fields with initial position
    document.getElementById('add-location-latitude').value = latitude;
    document.getElementById('add-location-longitude').value = longitude;

    // Event listener for marker movement
    marker.on('dragend', function (event) {
      const { lat, lng } = event.target.getLatLng();
      document.getElementById('add-location-latitude').value = lat;
      document.getElementById('add-location-longitude').value = lng;
      console.log(`Marker moved to: ${lat}, ${lng}`);
    });
  }

  // Try to get the user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        initializeAddMap(latitude, longitude); // Use user's current location
      },
      error => {
        console.warn("Geolocation error:", error);
        alert("Could not access your location. Defaulting to Riyadh.");
        initializeAddMap(fallbackLatitude, fallbackLongitude); // Fallback to Riyadh
      }
    );
  } else {
    alert("Geolocation is not supported by this browser. Defaulting to Riyadh.");
    initializeAddMap(fallbackLatitude, fallbackLongitude); // Fallback to Riyadh
  }


  // ============ pop up ==============


  const locationPopUpShadow = document.getElementById("location-pop-up-shadow");
  const locationPopUp = document.getElementById("location-pop-up");
  const locationAddButton = document.getElementById("location-add-button")
  locationPopUpShadow.addEventListener("click", function () {
    locationPopUpShadow.style.display = 'none';
    locationPopUp.style.display = 'none';
  })



  locationAddButton.addEventListener("click", function () {
    locationPopUpShadow.style.display = 'block';
    fetchProviderItems(providerid)
    locationPopUp.style.display = 'block';
  })






  // ============ fetch items for location =================
  const selectbutton = document.getElementById("select-all")
  const deselectbutton = document.getElementById("deselect-all")

  selectbutton.addEventListener("click", function () {
    let checklist = document.querySelectorAll('.checkbox-item')
    for (let item of checklist)
      item.checked = true
  })

  deselectbutton.addEventListener("click", function () {
    let checklist = document.querySelectorAll('.checkbox-item')
    for (let item of checklist)
      item.checked = false
  })

  async function fetchProviderItems(providerId) {
    try {
      const response = await fetch(`/provider/fetchItems/${providerId}/`)
      if (response.ok) {
        const items = await response.json();
        let checklistHTML = ""
        items.forEach(item => {
          checklistHTML += `

              <div class="checklist-item">
                <input class= "checkbox-item" type="checkbox" id="item-${item.itemid}" name="items" value="${item.itemid}">
                <label for="item-${item.itemid}">${item.name}</label>
              </div>

            `});
        // Insert the generated HTML into the checklist container
        document.getElementById('add-items-checklist').innerHTML = checklistHTML;
        document.getElementById('edit-items-checklist').innerHTML = checklistHTML;
      } else {
        alert(`Error fetching provider items ${response.status}`)
      }
    } catch (error) {
      alert(`Error fetching provider items ${error}`)
    }
  }

  fetchProviderItems(providerid);

  fetchLocationsForProvider(providerid);


  function getChecked(checkList) {
    let list = []
    for (let item of checkList)
      if (item.checked)
        list.push(item.value)
    return list
  }

  // ====================  add location ======================
  document.getElementById("add-location-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('providerid', providerid)
    const checkItems = getChecked(document.querySelectorAll('.checkbox-item'))
    formData.append('checkedItems', checkItems)
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    try {
      const response = await fetch('/provider/addLocation/', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': csrfToken, // Add the CSRF token to the headers
        },
      });

      if (response.ok) {
        e.target.reset();
        fetchLocationsForProvider(providerid);
        alert('Location Added successfully!');

      } else {
        alert('Error Submitting Location Information.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });




});


async function deleteLocation(locationID) {
  try {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const response = await fetch('/provider/deleteLocation/', {
      method: 'POST',
      body: JSON.stringify({ locationID: locationID, providerID: providerid }),
      headers: {
        'Content-Type': 'application/json',  // Add this to specify JSON content type
        'X-CSRFToken': csrfToken,  // Add CSRF token
      },
    });

    if (response.ok) {
      fetchLocationsForProvider(providerid);
      alert('Location Deleted successfully!');
    } else {
      alert('Error Deleting Location.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};


async function fetchLocationDetails(LocationID) {
  try {
    const reponse = await fetch(`/provider/fetchLocationDetails/${LocationID}/`)
    const locationName = document.getElementById('edit-location-name')
    const latitude = document.getElementById('edit-location-latitude')
    const longitude = document.getElementById('edit-location-longitude')
    const locationPhoneNumber = document.getElementById('edit-location-number')
    const itemCheckList = document.querySelectorAll('.checkbox-item')
    itemCheckList.forEach(function (i) {
      i.checked = false
    })
    if (reponse.ok) {
      data = await reponse.json()
      console.log(data)
      console.log(data[0][0].name)
      console.log(data[1])
      locationName.value = data[0][0].name
      locationPhoneNumber.value = data[0][0].phonenumber
      coord = data[0][0].coordinates.split(',')
      latitude.value = coord[0]
      longitude.value = coord[1]
      console.log(data[1][0])
      for (let item of data[1])
        for (let itemEl of itemCheckList)
          if (itemEl.value == item.itemid)
            itemEl.checked = true

    } else {
      alert('Error fetching location information.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


async function fetchLocationsForProvider(providerid) {
  try {
    const response = await fetch(`/provider/fetchLocations/${providerid}`);

    if (response.ok) {
      const locations = await response.json();
      let locationsHTML = '';

      locations.forEach(location => {
        console.log(location.locationid)
        locationsHTML += `
                            <li>
                              <div class="loc-container">
                                  <div class="loc-logo-holder">
                                      <img src="${locationSymbol}" alt="" class="loc-logo">
                                  </div>
                                  <div class="loc-info">
                                      
                                      <h1>${location.name}</h1>
                                      <p class='loc-phonenumber'>${location.phonenumber}</p>
                                  </div>
                                  <div class="edit-delete-btn">
                                      <i class="fa-solid fa-trash" ondblclick="console.log('deleteLocation triggered'); deleteLocation(${location.locationid})"></i>
                                      <i class="fa-solid fa-pen-to-square" onclick="fetchLocationDetails(${location.locationid})"></i>
                                  </div>
                              </div>
                            </li>
                      `;

      });

      // Display items in the specified container
      document.querySelector(".location-unordered-list").innerHTML = locationsHTML;
    } else {
      alert('Error fetching locations.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}