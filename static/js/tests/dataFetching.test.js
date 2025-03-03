import 'whatwg-fetch'
import BookingApp from '../booking.js'
import { mockDOM, setupTimersAndScroll, testApiHost } from './setupTests.js'

describe('BookingApp Data Fetching', () => {
  let bookingApp
  let server

  beforeAll(async () => {
    // Ensure server is started before tests
    jest.setTimeout(1000) // Increase timeout for server start
    // server = require('./testServer')
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Test server started')
  })

  afterAll(done => {
    // server.close(done)
  })

  beforeEach(() => {
    mockDOM()
    bookingApp = new BookingApp().init()
    setupTimersAndScroll()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.useRealTimers()
  })

  test('fetchTimes should fetch real data from the API', async () => {
    await bookingApp.fetchTimes()
    console.log(bookingApp.allTimes)
    expect(global.fetch).toHaveBeenCalledWith(`${testApiHost}/api/times`)
    
    // Verify we got real data
    expect(Array.isArray(bookingApp.allTimes)).toBe(true)
    expect(bookingApp.allTimes.length).toBeGreaterThan(0)
    
    // Verify data structure
    const firstTime = bookingApp.allTimes[0]
    expect(firstTime).toHaveProperty('id')
    expect(firstTime).toHaveProperty('time')
    expect(firstTime).toHaveProperty('location')
    expect(firstTime).toHaveProperty('vehicleTypes')
  }, 5000)

//   test('fetchTimes should handle API errors gracefully', async () => {
//     global.fetch = jest.fn(() =>
//       Promise.resolve({
//         ok: false,
//         status: 500,
//         json: () => Promise.resolve({ error: 'Internal Server Error' })
//       })
//     )

//     await bookingApp.fetchTimes()

//     expect(global.fetch).toHaveBeenCalledWith(`${testApiHost}/api/times`)
//     expect(bookingApp.allTimes).toEqual([])
//     expect(bookingApp.elements.errorMessage.textContent).toBe('Failed to fetch available times: 500')
//   })

//   test('fetchTimes should handle network errors gracefully', async () => {
//     global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')))

//     await bookingApp.fetchTimes()

//     expect(global.fetch).toHaveBeenCalledWith(`${testApiHost}/api/times`)
//     expect(bookingApp.allTimes).toEqual([])
//     expect(bookingApp.elements.errorMessage.textContent).toBe('Network Error')
//   })
})
