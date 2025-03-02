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
    
    // Create mock DOM elements
    document.body.innerHTML = `
      <div id="loading" class="hidden"></div>
      <div id="error-message" class="hidden"></div>
      <div id="success-message" class="hidden"></div>
      <select id="location-filter">
        <option value="all">All Locations</option>
      </select>
      <div id="times-container"></div>
    `
    
    // Initialize BookingApp
    bookingApp = new BookingApp()
    
    // Mock setTimeout
    jest.useFakeTimers()
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
