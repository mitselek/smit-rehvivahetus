import BookingApp from '../booking.js'

describe('BookingApp Booking Submission', () => {
  let bookingApp
  let fetchMock
  let originalFetch

  beforeEach(async () => {
    // Save original fetch
    originalFetch = global.fetch
    
    // Create fresh fetch mock for each test
    fetchMock = jest.fn()
    global.fetch = fetchMock

    // Initial fetchTimes response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })
    
    // Create mock DOM elements with ALL required elements
    document.body.innerHTML = `
      <div id="booking-modal" class="hidden"></div>
      <select id="vehicle-type-filter">
        <option value="all">All Vehicle Types</option>
      </select>
      <select id="location-filter">
        <option value="all">All Locations</option>
      </select>
      <select id="date-range-filter">
        <option value="today">Today</option>
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
    
    // Initialize BookingApp and wait for initial fetchTimes to complete
    bookingApp = new BookingApp().init()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Reset fetch mock after initialization
    fetchMock.mockReset()
  })
  
  afterEach(() => {
    document.body.innerHTML = ''
    global.fetch = originalFetch
    jest.useRealTimers()
  })

  test('submitBooking should validate form and submit valid data', async () => {
    // Fill form with valid data
    const formInputs = {
      'timeslotId': '123',
      'location': 'Downtown',
      'name': 'John Doe',
      'email': 'john@example.com',
      'phone': '123-456-7890',
      'vehicle': 'Toyota Corolla',
      'serviceType': 'Regular'
    }

    // Set form values
    Object.entries(formInputs).forEach(([name, value]) => {
      const input = bookingApp.elements.bookingForm.querySelector(`[name="${name}"]`)
      if (input) input.value = value
    })

    // Mock successful booking response
    fetchMock.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          booking_id: '123',
          message: 'Booking confirmed.'
        })
      })
    )

    // Submit form
    const submitEvent = { preventDefault: jest.fn() }
    await bookingApp.submitBooking(submitEvent)
    
    // Verify submission
    expect(submitEvent.preventDefault).toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledWith('/api/book', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringMatching(/John Doe/)
    }))
  })

  test('submitBooking should show error message for invalid form', async () => {
    // Make form invalid by clearing required field
    document.getElementById('booking-name').value = ''
    
    // Submit form
    await bookingApp.submitBooking({ preventDefault: jest.fn() })
    
    // Check that fetch was not called after form submission
    expect(fetchMock.mock.calls.length).toBe(0)
    
    // Check error message
    expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
    expect(bookingApp.elements.errorMessage.textContent).toContain('Please enter your name')
  })
  
  test('submitBooking should handle server errors', async () => {
    // Fill form with valid data first
    Object.entries({
      'timeslotId': '123',
      'location': 'Downtown',
      'name': 'John Doe',
      'email': 'john@example.com',
      'phone': '123-456-7890',
      'vehicle': 'Toyota Corolla',
      'serviceType': 'Regular'
    }).forEach(([name, value]) => {
      const input = bookingApp.elements.bookingForm.querySelector(`[name="${name}"]`)
      if (input) input.value = value
    })

    // Mock server error
    fetchMock.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      })
    )

    // Submit form
    await bookingApp.submitBooking({ preventDefault: jest.fn() })
    
    // Verify error message
    expect(bookingApp.elements.errorMessage.textContent).toContain('Server error')
  })

  test('submitBooking should handle API response with error message', async () => {
    // Set up valid form data
    const formData = {
      'timeslotId': '123',
      'location': 'Downtown',
      'name': 'John Doe',
      'email': 'john@example.com',
      'phone': '123-456-7890',
      'vehicle': 'Toyota Corolla',
      'serviceType': 'Regular'
    }
    
    // Fill form with valid data
    Object.entries(formData).forEach(([name, value]) => {
      const input = bookingApp.elements.bookingForm.querySelector(`[name="${name}"]`)
      if (input) input.value = value
    })
    
    // Mock error response
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          error: 'Time slot no longer available'
        })
      })
    )

    // Submit form and wait for all promises
    await bookingApp.submitBooking({ preventDefault: jest.fn() })
    await Promise.resolve() // Wait for next tick

    // Verify error message
    expect(bookingApp.elements.errorMessage.textContent).toContain('Time slot no longer available')
  })
})
