// Description: Main booking app script for the booking page.
// Path: static/js/booking.js
// Dependencies: dataHandler.js, utils.js

import { fetchTimesData, updateLocationFilter } from './dataHandler.js'
import { validateForm, getVehicleIcon, formatDateTime } from './utils.js'

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

const millisecondsPerDay = 24 * 60 * 60 * 1e3      // 86400000
const millisecondsPerWeek = millisecondsPerDay * 7 // 604800000

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
    this.cacheElements()
    this.uiElements.bookingModal.classList.add('hidden')
    this.bindEvents()
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
      const data = await fetchTimesData(this.apiHost)
      this.allTimes = data
      updateLocationFilter(this.uiElements.locationSelect, data)
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

  filterTimes() {
    const { vehicleTypeSelect, locationSelect, dateRangeSelect } = this.uiElements
    
    const vehicleType = vehicleTypeSelect.value
    const location = locationSelect.value
    const dateRange = dateRangeSelect.value
    
    let filteredTimes = this.allTimes.filter(time => {
      if (vehicleType !== 'all' && !time.vehicleTypes.includes(vehicleType)) {
        return false
      }
      if (location !== 'all' && time.location !== location) {
        return false
      }
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
        return dateDay.getTime() === today.getTime() + millisecondsPerDay
      case 'week':
        return dateDay.getTime() >= today.getTime() && dateDay.getTime() <= today.getTime() + millisecondsPerWeek
      case 'all':
      default:
        return true
    }
  }

  displayTimes(times) {
    const container = this.uiElements.timesContainer
    container.innerHTML = ''
    
    if (times.length === 0) {
      const noTimesMessage = document.createElement('p')
      noTimesMessage.textContent = 'No available times match your filters. Please try different criteria.'
      container.appendChild(noTimesMessage)
      return
    }
    
    const fragment = document.createDocumentFragment()
    
    times.forEach(time => {
      const timeDate = new Date(time.time)
      const formattedDate = formatDateTime(timeDate, CONFIG.DATE_FORMAT.full)
      const formattedTime = formatDateTime(timeDate, CONFIG.DATE_FORMAT.time)
      
      const vehicleIcon = getVehicleIcon(time.vehicleTypes, CONFIG.VEHICLE_ICONS)
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
    
    container.appendChild(fragment)
  }

  async submitBooking(event) {
    event.preventDefault()

    const formElements = this.uiElements.bookingForm.elements
    const getValue = (name) => formElements[name].value.trim() || formElements[`booking-${name}`].value.trim()
    
    const bookingData = {
      timeslotId: getValue('timeslotId'),
      location: getValue('location'),
      name: getValue('name'),
      email: getValue('email'),
      phone: getValue('phone'),
      vehicle: getValue('vehicle'),
      serviceType: getValue('serviceType')
    }

    const validation = validateForm(bookingData)
    if (!validation.valid) {
      this.showMessage('error', validation.message)
      return false
    }

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()

      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error(data.error || 'Bad Request')
          case 401:
            throw new Error(data.error || 'Unauthorized')
          case 403:
            throw new Error(data.error || 'Forbidden')
          case 404:
            throw new Error(data.error || 'Not Found')
          case 500:
            throw new Error(data.error || 'Internal Server Error')
          default:
            throw new Error(data.error || 'Unknown Error')
        }
      }

      if (data.success) {
        this.showMessage('success', `Booking confirmed! Your booking ID is ${data.booking_id}. ${data.message}`)
        this.closeModal()
        await this.fetchTimes()
        window.scrollTo({ top: 0, behavior: 'smooth' }) // Scroll to top smoothly
        return true
      } else {
        throw new Error(data.error || 'Booking failed')
      }
    } catch (error) {
      this.showMessage('error', error.message)
      return false
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

    this.uiElements.timeslotIdInput.value = timeslot.id
    this.uiElements.locationIdInput.value = timeslot.location
    this.uiElements.appointmentDetailsElement.textContent = 
      `${formatDateTime(new Date(timeslot.time), CONFIG.DATE_FORMAT.full)} at ${timeslot.location} (${timeslot.vehicleTypes.join(', ')})`

    this.uiElements.bookingModal.classList.remove('hidden')
    this.uiElements.bookingModal.classList.add('visible')

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal()
      }
    }, { once: true })
  }

  getVehicleIcon(vehicleTypes) {
    return getVehicleIcon(vehicleTypes, CONFIG.VEHICLE_ICONS)
  }

  formatDateTime(dateTimeStr, format) {
    return formatDateTime(dateTimeStr, format)
  }
}

if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new BookingApp().init()
    app.fetchTimes()
    setInterval(() => app.fetchTimes(), 60000)
  })
}

export { CONFIG }
export default BookingApp
