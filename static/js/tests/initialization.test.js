describe('BookingApp Initialization and Utility Methods', () => {
  let bookingApp
  let fetchMock
  let originalFetch

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch
    
    // Mock fetch
    fetchMock = jest.fn()
    global.fetch = fetchMock
    
    // Create mock DOM elements
    document.body.innerHTML = `
      <div id="booking-modal" class="hidden"></div>
      <select id="vehicle-type-filter">
        <option value="all">All Vehicle Types</option>
        <option value="Car">Car</option>
        <option value="SUV">SUV</option>
        <option value="Truck">Truck</option>
      </select>
      <select id="location-filter">
        <option value="all">All Locations</option>
      </select>
      <select id="date-range-filter">
        <option value="today">Today</option>
        <option value="tomorrow">Tomorrow</option>
        <option value="week">Next 7 Days</option>
      </select>
      <div id="times-container"></div>
      <div id="loading" class="hidden"></div>
      <div id="error-message" class="hidden"></div>
      <div id="success-message" class="hidden"></div>
      <form id="booking-form">
        <input id="booking-timeslot-id" name="timeslotId">
        <input id="booking-location" name="location">
        <input id="booking-name" name="name">
        <input id="booking-email" name="email">
        <input id="booking-phone" name="phone">
        <input id="booking-vehicle" name="vehicle">
        <select id="booking-service-type" name="serviceType">
          <option value="">Select a service</option>
          <option value="Regular">Regular Tire Change</option>
          <option value="Premium">Premium Tire Change</option>
          <option value="Emergency">Emergency Tire Service</option>
        </select>
        <button type="submit">Book</button>
      </form>
      <button id="close-modal"></button>
      <div id="booking-appointment-details"></div>
    `
    
    // Initialize BookingApp
    bookingApp = new BookingApp()
    
    // Mock scrollTo
    window.scrollTo = jest.fn()
    
    // Mock setTimeout
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    document.body.innerHTML = ''
    global.fetch = originalFetch
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
    
    test('should fetch times when initialized', () => {
      expect(fetchMock).toHaveBeenCalledWith('/api/times')
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
      const testDate = '2025-03-15T14:30:00Z'
      const fullFormat = bookingApp.formatDateTime(testDate, CONFIG.DATE_FORMAT.full)
      const timeFormat = bookingApp.formatDateTime(testDate, CONFIG.DATE_FORMAT.time)
      
      expect(fullFormat).toContain('March')
      expect(fullFormat).toContain('15')
      expect(fullFormat).toContain('2025')
      
      // The exact time format will depend on the timezone where the test runs
      expect(timeFormat).toMatch(/\d{1,2}:\d{2}/)
    })
    
    test('formatDateTime should handle invalid dates', () => {
      const result = bookingApp.formatDateTime('invalid-date', CONFIG.DATE_FORMAT.full)
      expect(result).toBe('Invalid date')
    })
    
    test('getVehicleIcon should return correct icon', () => {
      expect(bookingApp.getVehicleIcon(['Truck', 'Car'])).toBe('🚚')
      expect(bookingApp.getVehicleIcon(['SUV'])).toBe('🚙')
      expect(bookingApp.getVehicleIcon(['Car'])).toBe('🚗')
      expect(bookingApp.getVehicleIcon(['Car', 'SUV'])).toBe('🚙')
    })
    
    test('isDateInRange should filter dates correctly', () => {
      // Setup dates for testing
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const dayAfterTomorrow = new Date(today)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
      
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 6)
      
      const twoWeeksLater = new Date(today)
      twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)
      
      // Test cases
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
