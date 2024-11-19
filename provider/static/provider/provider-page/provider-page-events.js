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
            // continue later




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

    if (startMinutes < endMinutes) {
        alert("Start time is earlier than end time.");
        return false;
    }

    return true;
}