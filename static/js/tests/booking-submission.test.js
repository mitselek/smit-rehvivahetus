describe('BookingApp Booking Submission', () => {
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
      <div id="loading" class="hidden"></div>
      <div id="error-message" class="hidden"></div>
      <div id="success-message" class="hidden"></div>
      <div id="times-container"></div>
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
