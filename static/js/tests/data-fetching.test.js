import BookingApp from '../booking.js'
import { mockDOM } from './setupTests.js'

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
    
    // Use reusable mock DOM elements
    mockDOM()
    
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
