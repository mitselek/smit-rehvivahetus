// Configuration constants
const CONFIG = {
  FEEDBACK_DELAY: 5000,
  DATE_FORMAT: {
    full: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit'
    }
  },
  VEHICLE_ICONS: {
    'Truck': '🚚',
    'SUV': '🚙',
    'Car': '🚗'
  }
}

class BookingApp {
  constructor() {
    this.allTimes = []
    this.elements = {}
  }

  init() {
    this.setupApp()
    return this
  }

  setupApp() {
    // Cache DOM elements first
    this.cacheElements()
    
    // Then set up initial state
    this.elements.bookingModal.classList.add('hidden')
    
    // Bind event handlers
    this.bindEvents()
    
    // Initial data load
    this.fetchTimes()
  }

  cacheElements() {
    this.elements = {
      bookingModal: document.getElementById('booking-modal'),
      vehicleTypeSelect: document.getElementById('vehicle-type-filter'),
      locationSelect: document.getElementById('location-filter'),
      dateRangeSelect: document.getElementById('date-range-filter'),
      timesContainer: document.getElementById('times-container'),
      loadingElement: document.getElementById('loading'),
      errorMessage: document.getElementById('error-message'),
      successMessage: document.getElementById('success-message'),
      bookingForm: document.getElementById('booking-form'),
      closeModalButton: document.getElementById('close-modal'),
      timeslotIdInput: document.getElementById('booking-timeslot-id'),
      locationIdInput: document.getElementById('booking-location'),
      appointmentDetailsElement: document.getElementById('booking-appointment-details')
    }
  }

  bindEvents() {
    this.elements.vehicleTypeSelect.addEventListener('change', () => this.filterTimes())
    this.elements.locationSelect.addEventListener('change', () => this.filterTimes())
    this.elements.dateRangeSelect.addEventListener('change', () => this.filterTimes())
    this.elements.closeModalButton.addEventListener('click', () => this.closeModal())
    this.elements.bookingForm.addEventListener('submit', (e) => this.submitBooking(e))
    
    this.elements.timesContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('book-button')) {
        this.openBookingModal(e)
      }
    })
  }

  async fetchTimes() {
    this.showLoading(true)
    try {
      const response = await fetch('/api/times')
      if (!response.ok) {
        throw new Error(`Failed to fetch available times: ${response.status}`)
      }
      const data = await response.json()
      this.allTimes = data
      this.updateLocationFilter(data)
      this.filterTimes()
    } catch (error) {
      this.showMessage('error', error.message)
      console.error('Fetch error:', error)
    } finally {
      this.showLoading(false)
    }
  }

  showLoading(show) {
    this.elements.loadingElement.classList.toggle('hidden', !show)
  }

  showMessage(type, message) {
    const { errorMessage, successMessage } = this.elements
    
    errorMessage.classList.add('hidden')
    successMessage.classList.add('hidden')
    
    if (type === 'error') {
      errorMessage.textContent = message
      errorMessage.classList.remove('hidden')
    } else if (type === 'success') {
      successMessage.textContent = message
      successMessage.classList.remove('hidden')
    }
    
    if (message) {
      setTimeout(() => {
        if (type === 'error') {
          errorMessage.classList.add('hidden')
        } else if (type === 'success') {
          successMessage.classList.add('hidden')
        }
      }, CONFIG.FEEDBACK_DELAY)
    }
  }

  getVehicleIcon(vehicleTypes) {
    if (vehicleTypes.includes('Truck')) return CONFIG.VEHICLE_ICONS.Truck
    if (vehicleTypes.includes('SUV')) return CONFIG.VEHICLE_ICONS.SUV
    return CONFIG.VEHICLE_ICONS.Car
  }

  updateLocationFilter(times) {
    const locationSelect = this.elements.locationSelect
    
    // Clear existing options except the first one
    while (locationSelect.options.length > 1) {
      locationSelect.remove(1)
    }
    
    // Get unique locations and sort them
    const locations = [...new Set(times.map(time => time.location))].sort()
    
    // Create document fragment for better performance
    const fragment = document.createDocumentFragment()
    
    // Add location options
    locations.forEach(location => {
      const option = document.createElement('option')
      option.value = location
      option.textContent = location
      fragment.appendChild(option)
    })
    
    locationSelect.appendChild(fragment)
  }

  filterTimes() {
    const { vehicleTypeSelect, locationSelect, dateRangeSelect } = this.elements
    
    const vehicleType = vehicleTypeSelect.value
    const location = locationSelect.value
    const dateRange = dateRangeSelect.value
    
    let filteredTimes = this.allTimes.filter(time => {
      // Filter by vehicle type
      if (vehicleType !== 'all' && !time.vehicleTypes.includes(vehicleType)) {
        return false
      }
      
      // Filter by location
      if (location !== 'all' && time.location !== location) {
        return false
      }
      
      // Filter by date range
      const timeDate = new Date(time.time)
      if (!this.isDateInRange(timeDate, dateRange)) {
        return false
      }
      
      return true
    })
    
    this.displayTimes(filteredTimes)
  }

  isDateInRange(date, range) {
    if (range === 'all') return true
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const oneWeekLater = new Date(today)
    oneWeekLater.setDate(oneWeekLater.getDate() + 7)
    
    const dateDay = new Date(date)
    dateDay.setHours(0, 0, 0, 0)
    
    if (range === 'today' && dateDay.getTime() === today.getTime()) {
      return true
    }
    
    if (range === 'tomorrow' && dateDay.getTime() === tomorrow.getTime()) {
      return true
    }
    
    if (range === 'week' && 
        dateDay.getTime() >= today.getTime() && 
        dateDay.getTime() <= oneWeekLater.getTime()) {
      return true
    }
    
    return false
  }

  displayTimes(times) {
    const container = this.elements.timesContainer
    
    // Clear current content
    container.innerHTML = ''
    
    // Check if we have any times
    if (times.length === 0) {
      const noTimesMessage = document.createElement('p')
      noTimesMessage.textContent = 'No available times match your filters. Please try different criteria.'
      container.appendChild(noTimesMessage)
      return
    }
    
    // Create document fragment for better performance
    const fragment = document.createDocumentFragment()
    
    // Create time cards
    times.forEach(time => {
      const timeCard = document.createElement('div')
      timeCard.className = 'time-card'
      timeCard.dataset.id = time.id
      
      const timeDate = new Date(time.time)
      const formattedDate = this.formatDateTime(timeDate, CONFIG.DATE_FORMAT.full)
      const formattedTime = this.formatDateTime(timeDate, CONFIG.DATE_FORMAT.time)
      
      const vehicleIcon = this.getVehicleIcon(time.vehicleTypes)
      const vehicleTypesText = time.vehicleTypes.join(', ')
      
      // Create location badge
      const locationBadge = document.createElement('span')
      locationBadge.className = 'location-badge'
      locationBadge.textContent = time.location.substring(0, 3).toUpperCase()
      
      // Create booking button
      const bookButton = document.createElement('button')
      bookButton.className = 'book-button'
      bookButton.dataset.id = time.id
      bookButton.dataset.time = time.time
      bookButton.dataset.location = time.location
      bookButton.dataset.vehicleTypes = time.vehicleTypes.join(',')
      bookButton.textContent = 'Book This Slot'
      
      // Build the card
      timeCard.innerHTML = `
        <h3>${vehicleIcon} ${formattedDate}</h3>
        <p>Time: ${formattedTime}</p>
        <p>Vehicle Types: ${vehicleTypesText}</p>
        <p>Location: ${time.location}</p>
      `
      
      // Add location badge to the location paragraph
      const locationParagraph = timeCard.querySelector('p:nth-child(4)')
      locationParagraph.appendChild(locationBadge)
      
      // Add booking button
      timeCard.appendChild(bookButton)
      
      fragment.appendChild(timeCard)
    })
    
    // Add all cards to container
    container.appendChild(fragment)
  }

  formatDateTime(dateTimeStr, format) {
    try {
      let dt
      if (dateTimeStr instanceof Date) {
        dt = dateTimeStr
      } else if (!dateTimeStr) {
        throw new Error('Invalid date')
      } else {
        dt = new Date(dateTimeStr)
      }

      // Check if the date is valid
      if (isNaN(dt.getTime())) {
        throw new Error('Invalid date')
      }

      return dt.toLocaleString('en-US', format)
    } catch (error) {
      // Only log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Date formatting error:', error)
      }
      return 'Invalid date'
    }
  }

  async submitBooking(event) {
    event.preventDefault()

    // Collect form data with proper field mapping
    const formData = new FormData(this.elements.bookingForm)
    const getValue = (name) => formData.get(name) || formData.get(`booking-${name}`)
    
    const bookingData = {
      timeslotId: getValue('timeslotId'),
      location: getValue('location'),
      name: getValue('name'),
      email: getValue('email'),
      phone: getValue('phone'),
      vehicle: getValue('vehicle'),
      serviceType: getValue('serviceType')
    }

    // Validate form using same data
    const validation = this.validateForm(formData)
    if (!validation.valid) {
      this.showMessage('error', validation.message)
      return false
    }

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Server error')
      }

      if (data.success) {
        this.showMessage('success', `Booking confirmed! Your booking ID is ${data.booking_id}. ${data.message}`)
        this.closeModal()
        await this.fetchTimes()
        return true
      } else {
        throw new Error(data.error || 'Booking failed')
      }
    } catch (error) {
      this.showMessage('error', error.message)
      return false
    }
  }

  validateForm(formData) {
    const errors = []
    const getValue = (name) => formData.get(name) || formData.get(`booking-${name}`)
    
    // Required field validation
    const requiredFields = {
      name: 'Please enter your name',
      email: 'Please enter your email',
      vehicle: 'Please enter your vehicle details',
      serviceType: 'Please select a service type',
      timeslotId: 'No time slot selected',
      location: 'No location selected'
    }
    
    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!getValue(field)) {
        errors.push(message)
      }
    })

    // Only run additional validation if we have values
    const name = getValue('name')
    const email = getValue('email')
    const phone = getValue('phone')

    if (name && name.length < 2) {
      errors.push('Name must be at least 2 characters')
    }

    if (email && (!email.includes('@') || !email.includes('.'))) {
      errors.push('Please enter a valid email address')
    }

    if (phone && !/^\+?[\d\s-]{7,}$/.test(phone)) {
      errors.push('Please enter a valid phone number')
    }

    return {
      valid: errors.length === 0,
      message: errors.join('. ')
    }
  }

  closeModal() {
    this.elements.bookingModal.classList.add('hidden')
    this.elements.bookingModal.classList.remove('visible')
    this.elements.bookingForm.reset()
  }

  openBookingModal(event) {
    const button = event.target
    const timeslot = {
      id: button.dataset.id,
      time: button.dataset.time,
      location: button.dataset.location,
      vehicleTypes: button.dataset.vehicleTypes.split(',')
    }

    // Populate form fields
    this.elements.timeslotIdInput.value = timeslot.id
    this.elements.locationIdInput.value = timeslot.location
    this.elements.appointmentDetailsElement.textContent = 
      `${this.formatDateTime(new Date(timeslot.time), CONFIG.DATE_FORMAT.full)} at ${timeslot.location} (${timeslot.vehicleTypes.join(', ')})`

    // Show modal
    this.elements.bookingModal.classList.remove('hidden')
    this.elements.bookingModal.classList.add('visible')
  }

  // ...rest of the class implementation...
}

// Initialize only in production, not in tests
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    const app = new BookingApp().init()
    // Refresh every minute
    setInterval(() => app.fetchTimes(), 60000)
  })
}

export { CONFIG }
export default BookingApp
