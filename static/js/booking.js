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
    TRUCK: '🚚',
    SUV: '🚙',
    CAR: '🚗',
    getIcon(type) {
      switch (type) {
        case 'Truck': return this.TRUCK;
        case 'SUV': return this.SUV;
        case 'Car': return this.CAR;
        default: return this.CAR; // Default icon
      }
    }
  }
}

class BookingApp {
  constructor() {
    this.allTimes = []
    this.uiElements = {}
    this.env = (typeof process !== 'undefined' && process.env.NODE_ENV) ? process.env.NODE_ENV : 'development'
    this.apiHost = (this.env === 'test') ? 'http://localhost:5000' : ''
  }

  init() {
    this.setupApp()
    return this
  }

  setupApp() {
    // Cache DOM elements first
    this.cacheElements()
    
    // Then set up initial state
    this.uiElements.bookingModal.classList.add('hidden')
    
    // Bind event handlers
    this.bindEvents()
    
    // Initial data load
    // this.fetchTimes()
  }

  cacheElements() {
    const getElement = (selector) => {
      const element = document.querySelector(selector)
      if (!element) {
        console.warn(`Element not found: ${selector}`)
      }
      return element
    }

    this.uiElements = {
      bookingModal: getElement('#booking-modal'),
      vehicleTypeSelect: getElement('#vehicle-type-filter'),
      locationSelect: getElement('#location-filter'),
      dateRangeSelect: getElement('#date-range-filter'),
      timesContainer: getElement('#times-container'),
      loadingElement: getElement('#loading'),
      errorMessage: getElement('#error-message'),
      successMessage: getElement('#success-message'),
      bookingForm: getElement('#booking-form'),
      closeModalButton: getElement('#close-modal'),
      timeslotIdInput: getElement('#booking-timeslot-id'),
      locationIdInput: getElement('#booking-location'),
      appointmentDetailsElement: getElement('#booking-appointment-details')
    }
  }

  bindEvents() {
    const { vehicleTypeSelect, locationSelect, dateRangeSelect, closeModalButton, bookingForm, timesContainer, bookingModal } = this.uiElements

    vehicleTypeSelect.addEventListener('change', () => this.filterTimes())
    locationSelect.addEventListener('change', () => this.filterTimes())
    dateRangeSelect.addEventListener('change', () => this.filterTimes())
    closeModalButton.addEventListener('click', () => this.closeModal())
    bookingForm.addEventListener('submit', (e) => this.submitBooking(e))

    timesContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('book-button')) {
        this.openBookingModal(e)
      }
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal()
      }
    })

    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        this.closeModal()
      }
    })
  }

  async fetchTimes() {
    this.showLoading(true)
    try {
      const url = `${this.apiHost}/api/times`
      if (this.env === 'test') {
        console.log('Fetching times from:', url)
      }
      const response = await fetch(url)
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch available times: ${response ? response.status : 'No response'}`)
      }
      const data = await response.json()
      this.allTimes = data
      // if (this.env === 'test') {
      // }
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
    this.uiElements.loadingElement.classList.toggle('hidden', !show)
  }

  showMessage(type, message) {
    const { errorMessage, successMessage } = this.uiElements
    
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
    if (vehicleTypes.includes('Truck')) return CONFIG.VEHICLE_ICONS.getIcon('Truck')
    if (vehicleTypes.includes('SUV')) return CONFIG.VEHICLE_ICONS.getIcon('SUV')
    return CONFIG.VEHICLE_ICONS.getIcon('Car')
  }

  updateLocationFilter(times) {
    const locationSelect = this.uiElements.locationSelect
    
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
    const { vehicleTypeSelect, locationSelect, dateRangeSelect } = this.uiElements
    
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dateDay = new Date(date)
    dateDay.setHours(0, 0, 0, 0)

    switch (range) {
      case 'today':
        return dateDay.getTime() === today.getTime()
      case 'tomorrow':
        return dateDay.getTime() === today.getTime() + 86400000
      case 'week':
        return dateDay.getTime() >= today.getTime() && dateDay.getTime() <= today.getTime() + 604800000
      case 'all':
      default:
        return true
    }
  }

  displayTimes(times) {
    const container = this.uiElements.timesContainer
    
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
      const timeDate = new Date(time.time)
      const formattedDate = this.formatDateTime(timeDate, CONFIG.DATE_FORMAT.full)
      const formattedTime = this.formatDateTime(timeDate, CONFIG.DATE_FORMAT.time)
      
      const vehicleIcon = this.getVehicleIcon(time.vehicleTypes)
      const vehicleTypesText = time.vehicleTypes.join(', ')
      
      const timeCard = document.createElement('div')
      timeCard.className = 'time-card'
      timeCard.dataset.id = time.id
      timeCard.innerHTML = `
        <h3>${vehicleIcon} ${formattedDate}</h3>
        <p>Time: ${formattedTime}</p>
        <p>Vehicle Types: ${vehicleTypesText}</p>
        <p>Location: ${time.location} <span class="location-badge">${time.location.substring(0, 3).toUpperCase()}</span></p>
        <button class="book-button" data-id="${time.id}" data-time="${time.time}" data-location="${time.location}" data-vehicle-types="${time.vehicleTypes.join(',')}">Book This Slot</button>
      `
      
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
    const formData = new FormData(this.uiElements.bookingForm)
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
          'Content-Type': 'application/json; charset=utf-8' // Ensure UTF-8 encoding
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
    const getValue = (name) => (formData.get(name) || formData.get(`booking-${name}`) || '').trim()
    
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

    // Additional validation only if field has value
    const name = getValue('name')
    const email = getValue('email')
    const phone = getValue('phone')

    if (name && name.length < 2) {
      errors.push('Name must be at least 2 characters')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) {
      errors.push('Please enter a valid email address')
    }

    const phoneRegex = /^\+?[0-9\s-]{7,}$/
    if (phone && !phoneRegex.test(phone)) {
      errors.push('Please enter a valid phone number')
    }

    return {
      valid: errors.length === 0,
      message: errors.join('. ')
    }
  }

  closeModal() {
    const { bookingModal, bookingForm } = this.uiElements
    bookingModal.classList.add('hidden')
    bookingModal.classList.remove('visible')
    bookingForm.reset()
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
    this.uiElements.timeslotIdInput.value = timeslot.id
    this.uiElements.locationIdInput.value = timeslot.location
    this.uiElements.appointmentDetailsElement.textContent = 
      `${this.formatDateTime(new Date(timeslot.time), CONFIG.DATE_FORMAT.full)} at ${timeslot.location} (${timeslot.vehicleTypes.join(', ')})`

    // Show modal
    this.uiElements.bookingModal.classList.remove('hidden')
    this.uiElements.bookingModal.classList.add('visible')

    // Add event listener for closing modal on Escape key press, only once
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal()
      }
    }, { once: true })
  }
}

// Initialize only in production, not in tests
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    const app = new BookingApp().init()
    app.fetchTimes()
    // Refresh every minute
    setInterval(() => app.fetchTimes(), 60000)
  })
}

export { CONFIG }
export default BookingApp
