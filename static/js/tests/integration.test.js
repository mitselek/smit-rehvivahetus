import BookingApp from '../booking.js'

describe('BookingApp Integration', () => {
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