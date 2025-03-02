import BookingApp from '../booking.js'

describe('BookingApp Data Fetching', () => {
  let bookingApp
  let fetchMock
  let originalFetch

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch
    
    // Mock fetch
    fetchMock = jest.fn()
    global.fetch = fetchMock
    
    // Create complete mock DOM with all required elements
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
    
    // Initialize BookingApp after DOM is set up
    bookingApp = new BookingApp().init()
    
    // Mock setTimeout
    jest.useFakeTimers()

    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  
  afterEach(() => {
    document.body.innerHTML = ''
    global.fetch = originalFetch
    jest.useRealTimers()
  })

  test('fetchTimes should handle API response correctly', async () => {
    const mockData = [
      {
        id: '1',
        time: '2025-03-15T14:30:00Z',
        location: 'Downtown',
        vehicleTypes: ['Car', 'SUV']
      }
    ]

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    })

    await bookingApp.fetchTimes()
    await Promise.resolve() // Wait for next tick

    expect(bookingApp.allTimes).toEqual(mockData)
  })
  
  test('fetchTimes should handle API errors', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })
    
    await bookingApp.fetchTimes()
    await Promise.resolve() // Wait for next tick
    
    expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
    expect(bookingApp.elements.errorMessage.textContent).toContain('Failed to fetch available times')
  })
  
  test('fetchTimes should handle network errors', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'))
    
    await bookingApp.fetchTimes()
    
    expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
    expect(bookingApp.elements.errorMessage.textContent).toContain('Network error')
    expect(bookingApp.elements.loadingElement.classList.contains('hidden')).toBe(true)
  })
})
