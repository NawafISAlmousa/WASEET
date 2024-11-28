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

  function previewEventLogo(event) {
    const [file] = event.target.files;
    if (file) {
      const preview = document.getElementById('add-event-logo');
      preview.src = URL.createObjectURL(file);
    }
  }
  // console.error(document.getElementById("add-event-change-logo"))
  document.getElementById("add-event-upload-logo").addEventListener("change", previewEventLogo)

  document.getElementById("add-event-change-logo").addEventListener("click", triggerAddEventFileInput)


  function triggerAddEventFileInput() {
    document.getElementById('add-event-upload-logo').click();
  }






  // ======================== edit logo


  function previewEditEventLogo(event) {
    const [file] = event.target.files;
    if (file) {
      const preview = document.getElementById('edit-event-logo');
      preview.src = URL.createObjectURL(file);
    }
  }
  // console.error(document.getElementById("add-event-change-logo"))
  document.getElementById("edit-event-upload-logo").addEventListener("change", previewEditEventLogo)

  document.getElementById("edit-event-change-logo").addEventListener("click", triggerEditEventFileInput)


  function triggerEditEventFileInput() {
    document.getElementById('edit-event-upload-logo').click();
  }





  // ===============  add event ====================


  document.getElementById("add-event-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    let startTime = document.getElementById("add-event-start-time").value
    let endTime = document.getElementById("add-event-end-time").value
    let startDate = document.getElementById("add-event-start-date").value
    let endDate = document.getElementById("add-event-end-date").value
    if (validateEventDates(startDate, endDate, startTime, endTime)) {

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





  // =================== ai button call ============================================================

  document.getElementById("eventAIbutton").onclick = () => getGPTResponseForEvent();

  document.getElementById("add-event-AIbutton").onclick = () => getGPTResponseForAddEvent();




  // ========================= edit event ============================================================

  document.getElementById("edit-event-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    let startTime = document.getElementById("edit-event-start-time").value
    let endTime = document.getElementById("edit-event-end-time").value
    let startDate = document.getElementById("edit-event-start-date").value
    let endDate = document.getElementById("edit-event-end-date").value
    if (validateEventDates(startDate, endDate, startTime, endTime)) {

      const formData = new FormData(e.target); // Collect form data
      formData.append('providerid', providerid)
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

      try {
        const response = await fetch('/provider/editEvent/', {
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
          alert('Event Updated successfully!');
          document.querySelector('.edit-event-form .form-curtain').style.display = 'none'
          document.querySelector('.edit-event-form .form-placeholder').style.display = 'block'
          document.querySelector('.edit-event-form').style.display = 'flex'

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
      console.log(events)
      let html = ""
      let eventImagePath = `/media/${providerUsername}/events/event&.png`;
      
      events.forEach(event => {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const imageFilePath = `${eventImagePath.replace("&", event.eventid)}?t=${timestamp}`;

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
                  <div>
                    <p class="event-description-card">${event.description}</p>
                  </div>
                  <div class = 'event-schedule'>
                    <div class="event-date">
                      <i class="fa-regular fa-calendar"></i>
                      <p>${event.startdate} - ${event.enddate}</p>
                    </div>
                    <div class="event-time">
                      <i class="fa-regular fa-clock"></i>
                      <p>${event.starttime.slice(0, 5)} - ${event.endtime.slice(0, 5)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="edit-delete-btn">
                <i class="fa-solid fa-trash" ondblclick=deleteEvent(${event.eventid})></i>
                <i class="fa-solid fa-pen-to-square" onclick=fetchEventDetails(${event.eventid})></i>
              </div>
            </div>
          </li>
        `;
      });
      
      document.getElementById('event-unordered-list').innerHTML = html;
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

  document.querySelector('.edit-event-form .form-curtain').style.display = 'block'
  document.querySelector('.edit-event-form .form-placeholder').style.display = 'none'
  document.querySelector('.edit-event-form').style.display = 'block'

  const eventName = document.getElementById("edit-event-name")
  const eventStartDate = document.getElementById("edit-event-start-date")
  const eventEndDate = document.getElementById('edit-event-end-date')
  const eventImage = document.getElementById('edit-event-upload-logo')
  const eventStartTime = document.getElementById('edit-event-start-time')
  const eventIDinput = document.getElementById('editeventid')
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
      eventName.value = data.name;
      eventStartDate.value = data.startdate;
      eventEndDate.value = data.enddate;
      eventStartTime.value = data.starttime;
      eventEndTime.value = data.endtime;
      console.log(eventIDinput)
      eventIDinput.value = data.eventid;
      // eventLocationId.value = data.locationid
      console.log(data.locationid)
      // for(let locId of document.querySelectorAll('#event-location-name option'))
      //     if(locId.value == data.locationid)
      //       locId.selected = true
      document.querySelector(`#event-location-name option[value="${data.locationid}"]`).selected = true;


      eventDescription.value = data.description
      eventImagePreview.src = imageFilePath
      eventImage.src = imageFilePath

    } else {

      alert('Error fetching item details.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}




async function getGPTResponseForEvent() {
  const descEvent = document.getElementById("edit-event-description").value
  const nameEvent = document.getElementById("edit-event-name").value
  const apiKey = '';  // Replace with your actual API key
  const modUserInput = `Generate a new short description about 300 characters long for an event based on: 1-name: (${nameEvent}) 2-current description: (${descEvent}) without anything but the generated description please so no 'ofcourse' or 'got it' just the description alone `;
  if (descEvent.trim() !== "") {
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
            { "role": "system", "content": "You are assisting a service provider or a merchant to describe an event they are advertising." },
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
        document.getElementById("edit-event-description").value = data.choices[0].message.content;
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



async function getGPTResponseForAddEvent() {
  const descEvent = document.getElementById("add-event-description").value
  const nameEvent = document.getElementById("add-event-name").value
  const apiKey = '';  // Replace with your actual API key
  const modUserInput = `Generate a new short description about 300 characters long for an event based on: 1-name: (${nameEvent}) 2-current description: (${descEvent}) without anything but the generated description please so no 'ofcourse' or 'got it' just the description alone `;
  if (descEvent.trim() !== "") {
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
            { "role": "system", "content": "You are assisting a service provider or a merchant to describe an event they are advertising." },
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
        document.getElementById("add-event-description").value = data.choices[0].message.content;
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