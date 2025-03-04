import 'whatwg-fetch'
import BookingApp from '../booking.js'
import { mockDOM, setupTimersAndScroll } from './setupTests.js'
import mockData from './mock.data.json'

describe('BookingApp Data Fetching', () => {
  let bookingApp
  let originalFetch

  beforeAll(() => {
    // Cache original fetch
    originalFetch = global.fetch
    
    // Mock fetch to return mock data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    )

    mockDOM()
    bookingApp = new BookingApp().init()
  })

  afterAll(() => {
    // Restore original fetch
    global.fetch = originalFetch
  })

  test('fetchTimes should fetch times from API', async () => {
    const result = await bookingApp.fetchTimes()
    
    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalled()
    
    // Verify response structure matches mock data
    expect(bookingApp.allTimes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String || Number),
          location: expect.stringMatching(/London|Manchester/),
          time: expect.any(String),
          vehicleTypes: expect.arrayContaining(['Car'])
        })
      ])
    )

    // Verify data length matches mock data
    expect(bookingApp.allTimes.length).toBe(mockData.length)
    
    // Verify locations are present
    const locations = new Set(bookingApp.allTimes.map(t => t.location))
    expect(locations).toContain('London')
    expect(locations).toContain('Manchester')
  })
})
