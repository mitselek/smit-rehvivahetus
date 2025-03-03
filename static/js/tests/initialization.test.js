import 'whatwg-fetch' // Ensure fetch is available in the test environment
import BookingApp, { CONFIG } from '../booking.js'
import { mockDOM, setupTimersAndScroll } from './setupTests.js'

describe('BookingApp Initialization and Utility Methods', () => {
  let bookingApp

  beforeEach(() => {
    // Use reusable mock DOM elements 
    mockDOM()

    // Initialize BookingApp and call init() explicitly
    bookingApp = new BookingApp().init()

    // Setup timers and scroll
    setupTimersAndScroll()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.useRealTimers()
  })

  describe('Initialization', () => {
    test('should cache DOM elements', () => {
      expect(bookingApp.elements.bookingModal).toBeDefined()
      expect(bookingApp.elements.vehicleTypeSelect).toBeDefined()
      expect(bookingApp.elements.locationSelect).toBeDefined()
      expect(bookingApp.elements.dateRangeSelect).toBeDefined()
      expect(bookingApp.elements.timesContainer).toBeDefined()
      expect(bookingApp.elements.loadingElement).toBeDefined()
      expect(bookingApp.elements.errorMessage).toBeDefined()
      expect(bookingApp.elements.successMessage).toBeDefined()
      expect(bookingApp.elements.bookingForm).toBeDefined()  
      expect(bookingApp.elements.closeModalButton).toBeDefined()
      expect(bookingApp.elements.timeslotIdInput).toBeDefined()
      expect(bookingApp.elements.locationIdInput).toBeDefined()
      expect(bookingApp.elements.appointmentDetailsElement).toBeDefined()
    })
  })

  describe('Utility Methods', () => {
    test('showLoading should toggle the loading element visibility', () => {
      bookingApp.showLoading(true)
      expect(bookingApp.elements.loadingElement.classList.contains('hidden')).toBe(false)

      bookingApp.showLoading(false)
      expect(bookingApp.elements.loadingElement.classList.contains('hidden')).toBe(true)
    })

    test('showMessage should display error message', () => {
      const errorMessage = 'This is an error'
      bookingApp.showMessage('error', errorMessage)

      expect(bookingApp.elements.errorMessage.textContent).toBe(errorMessage)
      expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
      expect(bookingApp.elements.successMessage.classList.contains('hidden')).toBe(true)

      // Test auto-hide
      jest.advanceTimersByTime(CONFIG.FEEDBACK_DELAY)
      expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(true)
    })

    test('showMessage should display success message', () => {
      const successMessage = 'This is a success'
      bookingApp.showMessage('success', successMessage)

      expect(bookingApp.elements.successMessage.textContent).toBe(successMessage)
      expect(bookingApp.elements.successMessage.classList.contains('hidden')).toBe(false)
      expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(true)

      // Test auto-hide
      jest.advanceTimersByTime(CONFIG.FEEDBACK_DELAY)
      expect(bookingApp.elements.successMessage.classList.contains('hidden')).toBe(true)
    })

    test('formatDateTime should format dates correctly', () => {
      const testDate = new Date(2025, 2, 15, 14, 30)

      const fullFormat = bookingApp.formatDateTime(testDate, CONFIG.DATE_FORMAT.full)
      const timeFormat = bookingApp.formatDateTime(testDate, CONFIG.DATE_FORMAT.time)

      expect(fullFormat).toContain('March')
      expect(fullFormat).toContain('2025')
      expect(fullFormat).toContain('15')
      expect(timeFormat).toMatch(/\d{1,2}:\d{2}/)
    })

    test('formatDateTime should handle invalid dates', () => {
      expect(bookingApp.formatDateTime(null, CONFIG.DATE_FORMAT.full)).toBe('Invalid date')
      expect(bookingApp.formatDateTime('', CONFIG.DATE_FORMAT.full)).toBe('Invalid date') 
      expect(bookingApp.formatDateTime('not-a-date', CONFIG.DATE_FORMAT.full)).toBe('Invalid date')
    })

    test('getVehicleIcon should return correct icons', () => {
      expect(bookingApp.getVehicleIcon(['Truck', 'Car'])).toBe(CONFIG.VEHICLE_ICONS.Truck)
      expect(bookingApp.getVehicleIcon(['SUV'])).toBe(CONFIG.VEHICLE_ICONS.SUV)
      expect(bookingApp.getVehicleIcon(['Car'])).toBe(CONFIG.VEHICLE_ICONS.Car)
      expect(bookingApp.getVehicleIcon(['Car', 'SUV'])).toBe(CONFIG.VEHICLE_ICONS.SUV)
    })

    test('isDateInRange should filter dates correctly', () => {
      const today = new Date()
      today.setHours(0,0,0,0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const nextWeek = new Date(today) 
      nextWeek.setDate(nextWeek.getDate() + 6)

      const twoWeeksLater = new Date(today)
      twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)

      expect(bookingApp.isDateInRange(today, 'all')).toBe(true)
      expect(bookingApp.isDateInRange(today, 'today')).toBe(true)
      expect(bookingApp.isDateInRange(today, 'tomorrow')).toBe(false)
      expect(bookingApp.isDateInRange(today, 'week')).toBe(true)

      expect(bookingApp.isDateInRange(tomorrow, 'today')).toBe(false)
      expect(bookingApp.isDateInRange(tomorrow, 'tomorrow')).toBe(true)
      expect(bookingApp.isDateInRange(tomorrow, 'week')).toBe(true)

      expect(bookingApp.isDateInRange(nextWeek, 'today')).toBe(false)
      expect(bookingApp.isDateInRange(nextWeek, 'tomorrow')).toBe(false)
      expect(bookingApp.isDateInRange(nextWeek, 'week')).toBe(true)

      expect(bookingApp.isDateInRange(twoWeeksLater, 'today')).toBe(false)
      expect(bookingApp.isDateInRange(twoWeeksLater, 'tomorrow')).toBe(false)
      expect(bookingApp.isDateInRange(twoWeeksLater, 'week')).toBe(false)
    })
  })
})
