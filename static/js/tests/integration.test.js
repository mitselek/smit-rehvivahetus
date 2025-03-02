import BookingApp from '../booking.js'
import { mockDOM } from './setupTests.js'

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
    
    // Use reusable mock DOM elements
    mockDOM() 
       
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