import BookingApp from '../booking.js'
import { mockDOM, setupTimersAndScroll } from './setupTests.js'

describe('Booking Flow Integration Tests', () => {
  let bookingApp
  
  beforeEach(() => {
    mockDOM()
    setupTimersAndScroll()
    bookingApp = new BookingApp().init()
    
    // Mock fetch for API calls
    global.fetch = jest.fn()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  test('complete booking flow', async () => {
    // Mock available times response
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: '123',
            time: '2025-03-15T14:30:00',
            location: 'Test Location',
            vehicleTypes: ['Car', 'SUV']
          }
        ])
      })
    )

    // Fetch and display times
    await bookingApp.fetchTimes()
    expect(bookingApp.allTimes.length).toBe(1)
    expect(document.querySelector('.time-card')).toBeTruthy()

    // Click book button
    const bookButton = document.querySelector('.book-button')
    bookButton.click()
    expect(bookingApp.uiElements.bookingModal.classList.contains('hidden')).toBe(false)

    // Fill and submit form
    const form = bookingApp.uiElements.bookingForm
    form.querySelector('#booking-name').value = 'John Doe'
    form.querySelector('#booking-email').value = 'john@example.com'
    form.querySelector('#booking-phone').value = '+37212345678'
    form.querySelector('#booking-vehicle').value = 'Toyota Corolla'
    form.querySelector('#booking-service-type').value = 'Regular'

    // Mock successful booking response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          booking_id: 'ABC123',
          message: 'Booking successful'
        })
      })
    )

    // Submit form
    const submitEvent = new Event('submit')
    form.dispatchEvent(submitEvent)

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))

    // Verify success message
    expect(bookingApp.uiElements.successMessage.textContent).toContain('ABC123')
    expect(bookingApp.uiElements.bookingModal.classList.contains('hidden')).toBe(true)
  })

  test('handles booking errors gracefully', async () => {
    // Mock available times
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: '123',
            time: '2025-03-15T14:30:00',
            location: 'Test Location',
            vehicleTypes: ['Car']
          }
        ])
      })
    )

    await bookingApp.fetchTimes()

    // Mock booking error
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Time slot no longer available'
        })
      })
    )

    // Attempt booking
    const result = await bookingApp.submitBooking(new Event('submit'))
    expect(result).toBe(false)
    expect(bookingApp.uiElements.errorMessage.textContent).toContain('no longer available')
  })
})
