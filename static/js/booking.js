const FEEDBACK_DELAY = 5000

function formatDateTime(dateTimeStr) {
    const dt = new Date(dateTimeStr)
    return dt.toLocaleString()
}

function showLoading(loadingElement, show) {
    loadingElement.classList.toggle('hidden', !show)
}

function showError(errorMessage, successMessage, message) {
    errorMessage.textContent = message
    errorMessage.classList.remove('hidden')
    successMessage.classList.add('hidden')
    
    setTimeout(() => {
        errorMessage.classList.add('hidden')
    }, FEEDBACK_DELAY)
}

function showSuccess(errorMessage, successMessage, message) {
    successMessage.textContent = message
    successMessage.classList.remove('hidden')
    errorMessage.classList.add('hidden')
    
    setTimeout(() => {
        successMessage.classList.add('hidden')
    }, FEEDBACK_DELAY)
}

function hideMessages(errorMessage, successMessage) {
    errorMessage.classList.add('hidden')
    successMessage.classList.add('hidden')
}

async function fetchTimes() {
    showLoading(loadingElement, true)
    
    try {
        const response = await fetch('/api/times')
        if (!response.ok) {
            throw new Error('Failed to fetch available times')
        }
        const data = await response.json()
        allTimes = data
        updateLocationFilter(data)
        filterTimes()
        showLoading(loadingElement, false)
    } catch (error) {
        showError(errorMessage, successMessage, error.message)
        showLoading(loadingElement, false)
    }
}

function updateLocationFilter(times) {
    while (locationSelect.options.length > 1) {
        locationSelect.remove(1)
    }
    
    const locations = [...new Set(times.map(time => time.location))]
    locations.forEach(location => {
        const option = document.createElement('option')
        option.value = location
        option.textContent = location
        locationSelect.appendChild(option)
    })
}

function filterTimes() {
    const vehicleType = vehicleTypeSelect.value
    const location = locationSelect.value
    const dateRange = dateRangeSelect.value
    
    let filteredTimes = allTimes.filter(time => {
        if (vehicleType !== 'all' && !time.vehicleTypes.includes(vehicleType)) {
            return false
        }
        
        if (location !== 'all' && time.location !== location) {
            return false
        }
        
        const timeDate = new Date(time.time)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        if (dateRange === 'today' && timeDate.getDate() !== today.getDate()) {
            return false
        }
        if (dateRange === 'tomorrow' && timeDate.getDate() !== tomorrow.getDate()) {
            return false
        }
        
        return true
    })
    
    displayTimes(filteredTimes)
}

function displayTimes(times) {
    timesContainer.innerHTML = ''
    
    if (times.length === 0) {
        timesContainer.innerHTML = '<p>No available times match your filters. Please try different criteria.</p>'
        return
    }
    
    times.forEach(time => {
        const timeCard = document.createElement('div')
        timeCard.className = 'time-card'
        
        const timeDate = new Date(time.time)
        const formattedDate = timeDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        
        const formattedTime = timeDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
        
        let vehicleIcon = '🚗'
        if (time.vehicleTypes.includes('Truck')) {
            vehicleIcon = '🚚'
        } else if (time.vehicleTypes.includes('SUV') && !time.vehicleTypes.includes('Car')) {
            vehicleIcon = '🚙'
        }
        
        const vehicleTypesText = time.vehicleTypes.join(', ')
        
        timeCard.innerHTML = `
            <h3>${vehicleIcon} ${formattedDate}</h3>
            <p>Time: ${formattedTime}</p>
            <p>Vehicle Types: ${vehicleTypesText}</p>
            <p>Location: ${time.location}<span class="location-badge">${time.location.substring(0, 3).toUpperCase()}</span></p>
            <button class="book-button" data-id="${time.id}" data-time="${time.time}" data-location="${time.location}" data-vehicle-types="${time.vehicleTypes.join(',')}">Book This Slot</button>
        `
        
        timesContainer.appendChild(timeCard)
    })
    
    document.querySelectorAll('.book-button').forEach(button => {
        button.addEventListener('click', openBookingModal)
    })
}

function openBookingModal(event) {
    const button = event.target
    const timeId = button.getAttribute('data-id')
    const timeValue = button.getAttribute('data-time')
    const location = button.getAttribute('data-location')
    const vehicleTypes = button.getAttribute('data-vehicle-types').split(',')
    
    const timeDate = new Date(timeValue)
    const formattedDate = timeDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    
    const formattedTime = timeDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })
    
    timeslotIdInput.value = timeId
    locationIdInput.value = location
    
    appointmentDetailsElement.innerHTML = `
        <strong>Date:</strong> ${formattedDate}<br>
        <strong>Time:</strong> ${formattedTime}<br>
        <strong>Location:</strong> ${location}<br>
        <strong>Supported Vehicles:</strong> ${vehicleTypes.join(', ')}
    `
    
    bookingModal.classList.remove('hidden')
    bookingModal.classList.add('visible')
}

function closeModal() {
    bookingModal.classList.add('hidden')
    bookingModal.classList.remove('visible')
    bookingForm.reset()
}

async function submitBooking(event) {
    event.preventDefault()
    showLoading(loadingElement, true)
    
    const formData = new FormData(bookingForm)
    const bookingData = {}
    formData.forEach((value, key) => {
        bookingData[key] = value
    })
    
    try {
        const response = await fetch('/api/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        })
        const data = await response.json()
        
        showLoading(loadingElement, false)
        
        if (data.success) {
            closeModal()
            showSuccess(errorMessage, successMessage, `Booking confirmed! Your booking ID is ${data.booking_id}. ${data.message}`)
            setTimeout(fetchTimes, FEEDBACK_DELAY) // Delay fetching times to allow feedback to be shown
        } else {
            showError(errorMessage, successMessage, data.message || data.error || 'Booking failed. Please try again.')
        }
    } catch (error) {
        showLoading(loadingElement, false)
        showError(errorMessage, successMessage, 'An error occurred while processing your booking.')
        console.error('Booking error:', error)
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Global elements
    window.bookingModal = document.getElementById('booking-modal')
    window.vehicleTypeSelect = document.getElementById('vehicle-type-filter')
    window.locationSelect = document.getElementById('location-filter')
    window.dateRangeSelect = document.getElementById('date-range-filter')
    window.timesContainer = document.getElementById('times-container')
    window.loadingElement = document.getElementById('loading')
    window.errorMessage = document.getElementById('error-message')
    window.successMessage = document.getElementById('success-message')
    window.bookingForm = document.getElementById('booking-form')
    window.closeModalButton = document.getElementById('close-modal')
    window.timeslotIdInput = document.getElementById('booking-timeslot-id')
    window.locationIdInput = document.getElementById('booking-location')
    window.appointmentDetailsElement = document.getElementById('booking-appointment-details')
    
    // Store all times
    window.allTimes = []
    
    // Ensure modal is hidden initially
    bookingModal.classList.add('hidden')
    
    // Initial data load
    fetchTimes()
    
    // Event listeners
    vehicleTypeSelect.addEventListener('change', filterTimes)
    locationSelect.addEventListener('change', filterTimes)
    dateRangeSelect.addEventListener('change', filterTimes)
    closeModalButton.addEventListener('click', closeModal)
    bookingForm.addEventListener('submit', submitBooking)
})
