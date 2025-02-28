// booking-app.test.js
describe('BookingApp', () => {
  let bookingApp
  let fetchMock
  let originalFetch

  // Mock DOM elements
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
        <option value="all">All Dates</option>
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
    // Clean up
    document.body.innerHTML = ''
    global.fetch = originalFetch
    jest.useRealTimers()
  })
  
  // Unit Tests
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
  
  describe('Form Validation', () => {
    test('validateForm should validate name field', () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('vehicle', 'Toyota Corolla')
      formData.append('serviceType', 'maintenance')
      
      // Empty name
      let validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(false)
      expect(validation.message).toContain('Please enter your name')
      
      // Short name
      formData.append('name', 'A')
      validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(false)
      expect(validation.message).toContain('Name must be at least 2 characters')
      
      // Valid name
      formData.set('name', 'John Doe')
      validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(true)
    })
    
    test('validateForm should validate email field', () => {
      const formData = new FormData()
      formData.append('name', 'John Doe')
      formData.append('vehicle', 'Toyota Corolla')
      formData.append('serviceType', 'maintenance')
      
      // Empty email
      let validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(false)
      expect(validation.message).toContain('Please enter your email')
      
      // Invalid email
      formData.append('email', 'invalid-email')
      validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(false)
      expect(validation.message).toContain('valid email')
      
      // Valid email
      formData.set('email', 'john@example.com')
      validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(true)
    })
    
    test('validateForm should validate phone field if provided', () => {
      const formData = new FormData()
      formData.append('name', 'John Doe')
      formData.append('email', 'john@example.com')
      formData.append('vehicle', 'Toyota Corolla')
      formData.append('serviceType', 'maintenance')
      
      // Empty phone (optional)
      let validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(true)
      
      // Invalid phone
      formData.append('phone', 'invalid-phone')
      validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(false)
      expect(validation.message).toContain('valid phone')
      
      // Valid phone formats
      formData.set('phone', '123-456-7890')
      validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(true)
      
      formData.set('phone', '+1 123 456 7890')
      validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(true)
    })
    
    test('validateForm should validate vehicle field', () => {
      const formData = new FormData()
      formData.append('name', 'John Doe')
      formData.append('email', 'john@example.com')
      formData.append('serviceType', 'maintenance')
      
      // Empty vehicle
      let validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(false)
      expect(validation.message).toContain('vehicle details')
      
      // Valid vehicle
      formData.append('vehicle', 'Toyota Corolla')
      validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(true)
    })
    
    test('validateForm should validate serviceType field', () => {
      const formData = new FormData()
      formData.append('name', 'John Doe')
      formData.append('email', 'john@example.com')
      formData.append('vehicle', 'Toyota Corolla')
      
      // Empty service type
      let validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(false)
      expect(validation.message).toContain('service type')
      
      // Valid service type
      formData.append('serviceType', 'maintenance')
      validation = bookingApp.validateForm(formData)
      expect(validation.valid).toBe(true)
    })
  })
  
  describe('Data Fetching', () => {
    test('fetchTimes should handle API response correctly', async () => {
      const mockData = [
        {
          id: '1',
          time: '2025-03-15T14:30:00Z',
          location: 'Downtown',
          vehicleTypes: ['Car', 'SUV']
        },
        {
          id: '2',
          time: '2025-03-16T10:00:00Z',
          location: 'Uptown',
          vehicleTypes: ['Truck']
        }
      ]
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData)
      })
      
      await bookingApp.fetchTimes()
      
      expect(bookingApp.allTimes).toEqual(mockData)
      expect(bookingApp.elements.locationSelect.options.length).toBe(3) // All + 2 locations
      expect(bookingApp.elements.loadingElement.classList.contains('hidden')).toBe(true)
    })
    
    test('fetchTimes should handle API errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500
      })
      
      await bookingApp.fetchTimes()
      
      expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
      expect(bookingApp.elements.errorMessage.textContent).toContain('Failed to fetch')
      expect(bookingApp.elements.loadingElement.classList.contains('hidden')).toBe(true)
    })
    
    test('fetchTimes should handle network errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))
      
      await bookingApp.fetchTimes()
      
      expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
      expect(bookingApp.elements.errorMessage.textContent).toContain('Network error')
      expect(bookingApp.elements.loadingElement.classList.contains('hidden')).toBe(true)
    })
  })
  
  describe('Displaying Times', () => {
    test('displayTimes should create time cards for each time slot', () => {
      const times = [
        {
          id: '1',
          time: '2025-03-15T14:30:00Z',
          location: 'Downtown',
          vehicleTypes: ['Car', 'SUV']
        },
        {
          id: '2',
          time: '2025-03-16T10:00:00Z',
          location: 'Uptown',
          vehicleTypes: ['Truck']
        }
      ]
      
      bookingApp.displayTimes(times)
      
      const timeCards = document.querySelectorAll('.time-card')
      expect(timeCards.length).toBe(2)
      
      const bookButtons = document.querySelectorAll('.book-button')
      expect(bookButtons.length).toBe(2)
      
      // Check first card content
      expect(timeCards[0].dataset.id).toBe('1')
      expect(timeCards[0].innerHTML).toContain('Downtown')
      expect(timeCards[0].innerHTML).toContain('Car, SUV')
      
      // Check second card content
      expect(timeCards[1].dataset.id).toBe('2')
      expect(timeCards[1].innerHTML).toContain('Uptown')
      expect(timeCards[1].innerHTML).toContain('Truck')
    })
    
    test('displayTimes should show message when no times match', () => {
      bookingApp.displayTimes([])
      
      expect(bookingApp.elements.timesContainer.textContent).toContain('No available times')
      expect(document.querySelectorAll('.time-card').length).toBe(0)
    })
  })
  
  describe('Filtering', () => {
    beforeEach(() => {
      // Set up test data
      bookingApp.allTimes = [
        {
          id: '1',
          time: new Date().toISOString(), // Today
          location: 'Downtown',
          vehicleTypes: ['Car', 'SUV']
        },
        {
          id: '2',
          time: (() => {
            const date = new Date()
            date.setDate(date.getDate() + 1) // Tomorrow
            return date.toISOString()
          })(),
          location: 'Uptown',
          vehicleTypes: ['Truck']
        },
        {
          id: '3',
          time: (() => {
            const date = new Date()
            date.setDate(date.getDate() + 5) // Within week
            return date.toISOString()
          })(),
          location: 'Downtown',
          vehicleTypes: ['Car']
        }
      ]
    })
    
    test('filterTimes should filter by vehicle type', () => {
      // Spy on displayTimes
      const displayTimesSpy = jest.spyOn(bookingApp, 'displayTimes')
      
      // Set filter values
      bookingApp.elements.vehicleTypeSelect.value = 'Car'
      bookingApp.elements.locationSelect.value = 'all'
      bookingApp.elements.dateRangeSelect.value = 'all'
      
      // Filter
      bookingApp.filterTimes()
      
      // Check that displayTimes was called with filtered data
      expect(displayTimesSpy).toHaveBeenCalledWith([
        bookingApp.allTimes[0], // Downtown Car+SUV
        bookingApp.allTimes[2]  // Downtown Car
      ])
    })
    
    test('filterTimes should filter by location', () => {
      const displayTimesSpy = jest.spyOn(bookingApp, 'displayTimes')
      
      bookingApp.elements.vehicleTypeSelect.value = 'all'
      bookingApp.elements.locationSelect.value = 'Uptown'
      bookingApp.elements.dateRangeSelect.value = 'all'
      
      bookingApp.filterTimes()
      
      expect(displayTimesSpy).toHaveBeenCalledWith([
        bookingApp.allTimes[1] // Uptown Truck
      ])
    })
    
    test('filterTimes should filter by date range', () => {
      const displayTimesSpy = jest.spyOn(bookingApp, 'displayTimes')
      
      bookingApp.elements.vehicleTypeSelect.value = 'all'
      bookingApp.elements.locationSelect.value = 'all'
      bookingApp.elements.dateRangeSelect.value = 'today'
      
      bookingApp.filterTimes()
      
      expect(displayTimesSpy).toHaveBeenCalledWith([
        bookingApp.allTimes[0] // Today's slot
      ])
    })
    
    test('filterTimes should apply multiple filters simultaneously', () => {
      const displayTimesSpy = jest.spyOn(bookingApp, 'displayTimes')
      
      bookingApp.elements.vehicleTypeSelect.value = 'Car'
      bookingApp.elements.locationSelect.value = 'Downtown'
      bookingApp.elements.dateRangeSelect.value = 'today'
      
      bookingApp.filterTimes()
      
      expect(displayTimesSpy).toHaveBeenCalledWith([
        bookingApp.allTimes[0] // Today's Downtown Car+SUV slot
      ])
    })
  })
  
  describe('Modal Functionality', () => {
    test('openBookingModal should populate form fields and show modal', () => {
      // Create button with dataset
      const button = document.createElement('button')
      button.dataset.id = '123'
      button.dataset.time = '2025-03-15T14:30:00Z'
      button.dataset.location = 'Downtown'
      button.dataset.vehicleTypes = 'Car,SUV'
      
      const event = { target: button }
      
      bookingApp.openBookingModal(event)
      
      // Check form fields
      expect(bookingApp.elements.timeslotIdInput.value).toBe('123')
      expect(bookingApp.elements.locationIdInput.value).toBe('Downtown')
      
      // Check appointment details
      const appointmentDetails = bookingApp.elements.appointmentDetailsElement.innerHTML
      expect(appointmentDetails).toContain('Downtown')
      expect(appointmentDetails).toContain('Car, SUV')
      
      // Check modal visibility
      expect(bookingApp.elements.bookingModal.classList.contains('hidden')).toBe(false)
      expect(bookingApp.elements.bookingModal.classList.contains('visible')).toBe(true)
    })
    
    test('closeModal should hide modal and reset form', () => {
      // Set up form with values
      bookingApp.elements.timeslotIdInput.value = '123'
      bookingApp.elements.locationIdInput.value = 'Downtown'
      bookingApp.elements.bookingModal.classList.add('visible')
      bookingApp.elements.bookingModal.classList.remove('hidden')
      
      // Spy on form reset
      const resetSpy = jest.spyOn(bookingApp.elements.bookingForm, 'reset')
      
      bookingApp.closeModal()
      
      // Check modal visibility
      expect(bookingApp.elements.bookingModal.classList.contains('hidden')).toBe(true)
      expect(bookingApp.elements.bookingModal.classList.contains('visible')).toBe(false)
      
      // Check form reset
      expect(resetSpy).toHaveBeenCalled()
    })
  })
  
  describe('Booking Submission', () => {
    beforeEach(() => {
      // Set up form with values
      const form = bookingApp.elements.bookingForm
      const nameInput = document.getElementById('booking-name')
      const emailInput = document.getElementById('booking-email')
      const vehicleInput = document.getElementById('booking-vehicle')
      const serviceTypeSelect = document.getElementById('booking-service-type')
      
      nameInput.value = 'John Doe'
      emailInput.value = 'john@example.com'
      vehicleInput.value = 'Toyota Corolla'
      serviceTypeSelect.value = 'maintenance'
      
      bookingApp.elements.timeslotIdInput.value = '123'
      bookingApp.elements.locationIdInput.value = 'Downtown'
    })
    
    test('submitBooking should validate form and submit valid data', async () => {
      const mockResponse = {
        success: true,
        booking_id: '123',
        message: 'Booking confirmed.'
      }
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      })
      
      // Spy on closeModal and handleBookedTimeSlot
      const closeModalSpy = jest.spyOn(bookingApp, 'closeModal')
      const handleBookedTimeSlotSpy = jest.spyOn(bookingApp, 'handleBookedTimeSlot')
      
      // Submit form
      await bookingApp.submitBooking({ preventDefault: jest.fn() })
      
      // Check fetch call
      expect(fetchMock).toHaveBeenCalledWith('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.any(String)
      })
      
      // Parse the request body
      const requestBody = JSON.parse(fetchMock.mock.calls[fetchMock.mock.calls.length - 1][1].body)
      expect(requestBody.name).toBe('John Doe')
      expect(requestBody.email).toBe('john@example.com')
      
      // Check that closeModal was called
      expect(closeModalSpy).toHaveBeenCalled()
      
      // Check success message
      expect(bookingApp.elements.successMessage.classList.contains('hidden')).toBe(false)
      expect(bookingApp.elements.successMessage.textContent).toContain('123')
      
      // Check handleBookedTimeSlot call
      expect(handleBookedTimeSlotSpy).toHaveBeenCalledWith('123')
    })
    
    test('submitBooking should show error message for invalid form', async () => {
      // Make form invalid by clearing required field
      document.getElementById('booking-name').value = ''
      
      // Submit form
      await bookingApp.submitBooking({ preventDefault: jest.fn() })
      
      // Check that fetch was not called
      expect(fetchMock).not.toHaveBeenCalled()
      
      // Check error message
      expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
      expect(bookingApp.elements.errorMessage.textContent).toContain('Please enter your name')
    })
    
    test('submitBooking should handle server errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500
      })
      
      // Submit form
      await bookingApp.submitBooking({ preventDefault: jest.fn() })
      
      // Check error message
      expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
      expect(bookingApp.elements.errorMessage.textContent).toContain('Server error')
    })
    
    test('submitBooking should handle API response with error message', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          success: false,
          error: 'Time slot no longer available'
        })
      })
      
      // Submit form
      await bookingApp.submitBooking({ preventDefault: jest.fn() })
      
      // Check error message
      expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
      expect(bookingApp.elements.errorMessage.textContent).toContain('Time slot no longer available')
    })
  })
  
  describe('Handling Booked Time Slots', () => {
    test('handleBookedTimeSlot should add fade-out effect to booked slot', () => {
      // Create a time card with matching ID
      const timeCard = document.createElement('div')
      timeCard.className = 'time-card'
      timeCard.dataset.id = '123'
      bookingApp.elements.timesContainer.appendChild(timeCard)
      
      bookingApp.handleBookedTimeSlot('123')
      
      // Check fade-out class
      expect(timeCard.classList.contains('fade-out')).toBe(true)
      
      // Check window.scrollTo
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      })
      
      // Check removal after animation
      jest.advanceTimersByTime(1000)
      expect(document.querySelector('.time-card[data-id="123"]')).toBeNull()
    })
  })
  
  // Integration Tests
  describe('Integration', () => {
    test('should filter times and open booking modal when book button is clicked', async () => {
      // Set up test data
      const mockData = [
        {
          id: '1',
          time: new Date().toISOString(), // Today
          location: 'Downtown',
          vehicleTypes: ['Car', 'SUV']
        }
      ]
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData)
      })
      
      // Fetch times
      await bookingApp.fetchTimes()
      
      // Set filters
      bookingApp.elements.vehicleTypeSelect.value = 'Car'
      bookingApp.elements.locationSelect.value = 'Downtown'
      bookingApp.elements.dateRangeSelect.value = 'today'
      
      // Apply filters
      bookingApp.filterTimes()
      
      // Find book button and click it
      const bookButton = document.querySelector('.book-button')
      bookButton.click()
      
      // Check that modal is visible
      expect(bookingApp.elements.bookingModal.classList.contains('visible')).toBe(true)
      
      // Check that form is populated
      expect(bookingApp.elements.timeslotIdInput.value).toBe('1')
      expect(bookingApp.elements.locationIdInput.value).toBe('Downtown')
      
      // Fill out form
      document.getElementById('booking-name').value = 'John Doe'
      document.getElementById('booking-email').value = 'john@example.com'
      document.getElementById('booking-vehicle').value = 'Toyota Corolla'
      document.getElementById('booking-service-type').value = 'maintenance'
      
      // Mock successful booking response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          success: true,
          booking_id: '1',
          message: 'Booking confirmed.'
        })
      })
      
      // Submit form
      const submitEvent = new Event('submit')
      submitEvent.preventDefault = jest.fn()
      bookingApp.elements.bookingForm.dispatchEvent(submitEvent)
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // Check that success message is shown
      expect(bookingApp.elements.successMessage.classList.contains('hidden')).toBe(false)
      expect(bookingApp.elements.successMessage.textContent).toContain('Booking confirmed')
      
      // Check that modal is closed
      expect(bookingApp.elements.bookingModal.classList.contains('hidden')).toBe(true)
    })
  })

  // Test phone number validation
  describe('Phone Number Validation', () => {
    test('should accept various Estonian phone number formats', () => {
      const validPhoneNumbers = [
        '+37256560978',
        '+372 5656 0978',
        '+372 56 560 978',
        '56560978',
        '5656-0978',
        '+372-5656-0978'
      ]

      validPhoneNumbers.forEach(phone => {
        const formData = new FormData()
        formData.append('name', 'John Doe')
        formData.append('email', 'john@example.com')
        formData.append('phone', phone)
        formData.append('vehicle', 'Toyota Corolla')
        formData.append('serviceType', 'Regular')
        
        const validation = bookingApp.validateForm(formData)
        expect(validation.valid).toBe(true)
      })
    })

    test('should reject invalid phone numbers', () => {
      const invalidPhoneNumbers = [
        'abc123',
        '123',
        '+372',
        '+372abcdefgh'
      ]

      invalidPhoneNumbers.forEach(phone => {
        const formData = new FormData()
        formData.append('name', 'John Doe')
        formData.append('email', 'john@example.com')
        formData.append('phone', phone)
        formData.append('vehicle', 'Toyota Corolla')
        formData.append('serviceType', 'Regular')
        
        const validation = bookingApp.validateForm(formData)
        expect(validation.valid).toBe(false)
        expect(validation.message).toContain('valid phone number')
      })
    })
  })
})