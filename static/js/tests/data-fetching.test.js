import BookingApp from '../booking.js'
import { mockDOM, mockFetch } from './setupTests.js'

describe('BookingApp Data Fetching', () => {
  let bookingApp
  let fetchMock
  let originalFetch

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch
    
    // Mock fetch
    fetchMock = mockFetch()
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

    fetchMock = mockFetch(mockData)
    global.fetch = fetchMock

    await bookingApp.fetchTimes()
    await Promise.resolve() // Wait for next tick

    expect(bookingApp.allTimes).toEqual(mockData)
  })
  
  test('fetchTimes should handle API errors', async () => {
    fetchMock = mockFetch([], false)
    global.fetch = fetchMock
    
    await bookingApp.fetchTimes()
    await Promise.resolve() // Wait for next tick
    
    expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
    expect(bookingApp.elements.errorMessage.textContent).toContain('Failed to fetch available times')
  })
  
  test('fetchTimes should handle network errors', async () => {
    fetchMock = jest.fn(() => Promise.reject(new Error('Network error')))
    global.fetch = fetchMock
    
    await bookingApp.fetchTimes()
    
    expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
    expect(bookingApp.elements.errorMessage.textContent).toContain('Network error')
    expect(bookingApp.elements.loadingElement.classList.contains('hidden')).toBe(true)
  })
})
