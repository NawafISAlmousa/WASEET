document.addEventListener("DOMContentLoaded", function () {
    const itemPopUpShadow = document.getElementById("event-pop-up-shadow");
    const itemPopUp = document.getElementById("event-pop-up");
    const itemAddButton = document.getElementById("event-add-button")
    itemPopUpShadow.addEventListener("click", function () {
      itemPopUpShadow.style.display = 'none';
      itemPopUp.style.display = 'none';
    })
  
  
  
    itemAddButton.addEventListener("click", function () {
      itemPopUpShadow.style.display = 'block';
      itemPopUp.style.display = 'block';
    })

    fetchProviderEditLocations(providerid)
    fetchEvent(providerid)
    


      // ======================= add logo ==================================

    function previewItemLogo(event) {
        const [file] = event.target.files;
        if (file) {
            const preview = document.getElementById('add-event-logo');
            preview.src = URL.createObjectURL(file);
        }
    }
    // console.error(document.getElementById("add-event-change-logo"))
    document.getElementById("add-event-upload-logo").addEventListener("change", previewItemLogo)

    document.getElementById("add-event-change-logo").addEventListener("click", triggerAddEventFileInput)


    function triggerAddEventFileInput() {
        document.getElementById('add-event-upload-logo').click();
    }







    // ===============  add event ====================


    document.getElementById("add-event-form").addEventListener("submit",  async (e) =>{
        e.preventDefault();
        let startTime = document.getElementById("add-event-start-time").value
        let endTime = document.getElementById("add-event-end-time").value
        let startDate = document.getElementById("add-event-start-date").value
        let endDate = document.getElementById("add-event-end-date").value
        if (validateEventDates(startDate, endDate, startTime, endTime)){
            
            const formData = new FormData(e.target); // Collect form data
            formData.append('providerid', providerid)
            // if (!file || file.size === 0) {
            //     // If no file was uploaded, assign the default static image
            //     try {
            //       const defaultImageFile = await fetch(defaultImage); // Adjust path if necessary
            //       const imageBlob = await defaultImageFile.blob(); // Convert to Blob
            //       const defaultFile = new File([imageBlob], 'BigLogo.png', { type: imageBlob.type });
            //       formData.set('add-event-upload-logo', defaultFile); // Set the default image as a file in FormData
            //     } catch (error) {
            //       console.error('Error loading default image:', error);
            //     }
            //   }
              const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
          
                try {
                    const response = await fetch('/provider/addEvent/', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': csrfToken, // Add the CSRF token to the headers
                    },
                    });
          
                    if (response.ok) {
                        document.getElementById('add-event-logo').src = defaultImage
                        e.target.reset();
                        // fetchItemsForProvider(providerid);
                        // fetchProviderItems(providerid);
                        fetchEvent(providerid)
                        alert('Event Added successfully!');
          
                    } else {
                  alert('Error Submitting Event Information.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
        }
    })
})






function validateEventDates(startDate, endDate, startTime, endTime) {
    // Convert input strings to Date objects for validation
    const now = new Date(); // Current date and time
    const startDateOnly = new Date(startDate);
    const endDateOnly = new Date(endDate);

    // Check if start date is after end date
    if (endDateOnly < startDateOnly) {
        alert("End date cannot be before start date.");
        return false;
    }

    // Validate the event's end date and time is not in the past
    const endDateTime = new Date(`${endDate}T${endTime}`);
    if (endDateTime < now) {
        alert("The event's end date and time cannot be in the past.");
        return false;
    }

    return compareTimes(startTime, endTime)
}


function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}



function compareTimes(startTime, endTime) {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes > endMinutes) {
        alert("Start time is later than end time.");
        return false;
    }

    return true;
}


async function fetchProviderEditLocations(providerId) {
    try {
      const response = await fetch(`/provider/fetchLocations/${providerId}/`)
      if (response.ok) {
        const locations = await response.json();
        console.log(locations)
        let HTML = ""
        locations.forEach(location => {
          HTML += `
              <option value="${location.locationid}">${location.name}</option>"
            `});
        // Insert the generated HTML into the checklist container
        document.getElementById('add-event-location-name').innerHTML = HTML;
        document.getElementById('event-location-name').innerHTML = HTML;
      } else {
        alert(`Error fetching provider Locations ${response.status}`)
      }
    } catch (error) {
      alert(`Error fetching provider locations ${error}`)
    }
  }

// ============================= display events list ===================================
async function fetchEvent(providerid) {
  try {
      const response = await fetch(`/provider/fetchEvents/${providerid}/`)
      if (response.ok) {
          const events = await response.json();
          let html = ""
          let eventImagePath = `/media/${providerUsername}/events/event&.png`;
          events.forEach(event =>{
              const imageFilePath = eventImagePath.replace("&", event.eventid);
              html += `
                      <li>
                          <div class="event-container">
                              <div class="event-logo-holder">
                                  <img src="${imageFilePath}" alt="" class="event-logo" onerror="this.src='${defaultImage}'">
                              </div>
                              <div class="event-info">
                                  <div class="event-info-header">
                                      <h1>${event.name}</h1>
                                  </div>
                                  <div class="event-details">
                                      <div class="event-date">
                                          <i class="fa-regular fa-calendar"></i>
                                          <p>${event.startdate} - ${event.enddate}</p>
                                      </div>
                                      <div class="event-time">
                                          <i class="fa-regular fa-clock"></i>
                                          <p>${event.starttime.slice(0,5)} - ${event.endtime.slice(0,5)}</p>
                                      </div>
                                  </div>
                              </div>
                              <div class="edit-delete-btn">
                                  <i class="fa-solid fa-trash" ondblclick=deleteEvent(${event.eventid})></i>
                                  <i class="fa-solid fa-pen-to-square" onclick=fetchEventDetails(${event.eventid})></i>
                              </div>
                          </div>
                      </li>
                      `
       })
       document.getElementById('event-unordered-list').innerHTML = html
        // Insert the generated HTML into the checklist container
      } else {
        alert(`Error fetching provider Locations ${response.status}`)
      }
    } catch (error) {
      alert(`Error fetching provider locations ${error}`)
    }
}




async function deleteEvent(eventID) {
  try {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const response = await fetch('/provider/deleteEvent/', {
      method: 'POST',
      body: JSON.stringify({ eventID: eventID, providerID: providerid }),
      headers: {
        'Content-Type': 'application/json',  // Add this to specify JSON content type
        'X-CSRFToken': csrfToken,  // Add CSRF token
      },
    });

    if (response.ok) {
      fetchEvent(providerid);

      alert('Event Deleted successfully!');
    } else {
      alert('Error Deleting Event.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};



async function fetchEventDetails(eventid) {
  
  const eventName = document.getElementById("edit-event-name")
  const eventStartDate = document.getElementById("edit-event-start-date")
  const eventEndDate = document.getElementById('edit-event-end-date')
  const eventImage = document.getElementById('edit-event-upload-logo')
  const eventStartTime = document.getElementById('edit-event-start-time')
  const eventIDinput = document.getElementById('eventid')
  const eventEndTime = document.getElementById('edit-event-end-time')
  const eventDescription = document.getElementById('edit-event-description')
  const eventImagePreview = document.getElementById('edit-event-logo')
  const eventLocationId = document.getElementById('locationid')
  try {
    const response = await fetch(`/provider/fetchEventDetails/${eventid}`);

    if (response.ok) {
      
      const data = await response.json();
      
      console.log(data)
      let eventImagePath = `/media/${providerUsername}/events/event&.png`;
      let imageFilePath = eventImagePath.replace("&", data.eventid);
      eventName.value = data.name
      eventStartDate.value = data.startdate
      eventEndDate.value = data.enddate
      eventStartTime.value = data.starttime
      eventEndTime.value = data.endtime
      // eventLocationId.value = data.locationid
      console.log(data.locationid)
      // for(let locId of document.querySelectorAll('#event-location-name option'))
      //     if(locId.value == data.locationid)
      //       locId.selected = true
      document.querySelector(`#event-location-name option[value="${data.locationid}"]`).selected = true;


      eventDescription.value = data.description
      eventImagePreview.src = imageFilePath
      eventImage.src = imageFilePath
      eventIDinput.value = data.itemid

    } else {

      alert('Error fetching item details.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}