import 'whatwg-fetch'
import BookingApp from '../booking.js'
import { mockDOM, setupTimersAndScroll, testApiHost } from './setupTests.js'

describe('BookingApp Data Fetching', () => {
  let bookingApp
  let server

  beforeAll(async () => {
    jest.setTimeout(10000)
    server = require('./testServer')
    
    await new Promise((resolve, reject) => {
      const checkServer = () => {
        fetch(`${testApiHost}/api/times`)
          .then(res => res.ok ? resolve() : setTimeout(checkServer, 100))
          .catch(() => setTimeout(checkServer, 100))
      }
      checkServer()
    })
    console.log('Test server ready at:', testApiHost)
  })

  // Change to async/await instead of done callback
  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log('Test server closed')
          resolve()
        })
      })
    }
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
