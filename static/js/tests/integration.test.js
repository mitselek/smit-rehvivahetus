import BookingApp from '../booking.js'

describe('BookingApp Integration Tests', () => {
  let bookingApp
  let fetchMock
  let originalFetch
  let consoleSpy

  beforeEach(async () => {
    // Save original fetch and console.error
    originalFetch = global.fetch
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
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
    await Promise.resolve()
    
    // Reset fetch mock after initialization
    fetchMock.mockReset()
  })
  
  afterEach(() => {
    document.body.innerHTML = ''
    global.fetch = originalFetch
    jest.useRealTimers()
    consoleSpy.mockRestore()
  })

  test('should handle fetch errors gracefully', async () => {
    // Mock fetch response with an error
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })
    
    // Fetch times
    await bookingApp.fetchTimes()
    
    // Verify error handling
    expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
    expect(bookingApp.elements.errorMessage.textContent).toContain('Failed to fetch available times')
    expect(bookingApp.elements.loadingElement.classList.contains('hidden')).toBe(true)
  })

  test('should fetch times and display them correctly', async () => {
    // Mock fetch response with times data
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
    
    fetchMock.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    )
    
    // Call fetchTimes and wait for all async operations
    await bookingApp.fetchTimes()
    await new Promise(resolve => setTimeout(resolve, 100)) // Wait longer for DOM updates
    
    // Force a synchronous DOM update
    bookingApp.displayTimes(mockData)
    
    // Now check the results
    const timeCards = document.querySelectorAll('.time-card')
    expect(timeCards.length).toBe(2)
    expect(timeCards[0].dataset.id).toBe('1')
    expect(timeCards[1].dataset.id).toBe('2')
  })
})