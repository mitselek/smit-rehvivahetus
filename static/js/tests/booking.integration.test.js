import BookingApp from '../booking.js'
import { mockDOM, setupTimersAndScroll } from './setupTests.js'

describe('Booking Flow Integration Tests', () => {
  let bookingApp
  
  // Define mock data that will be used across tests
  const mockTimeSlot = {
    id: '123',
    time: '2025-03-15T14:30:00',
    location: 'Test Location',
    vehicleTypes: ['Car', 'SUV']
  }
  
  beforeEach(() => {
    mockDOM()
    setupTimersAndScroll()
    bookingApp = new BookingApp().init()
    
    // Mock fetch using the mockTimeSlot data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockTimeSlot])
      })
    )
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.useRealTimers()
    jest.restoreAllMocks()
  })


  test('handles booking errors gracefully', async () => {
    await bookingApp.fetchTimes()
    
    // Mock booking error response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Time slot no longer available'
        })
      })
    )

    // Fill form data using mockTimeSlot
    const form = bookingApp.uiElements.bookingForm
    form.querySelector('#booking-timeslot-id').value = mockTimeSlot.id
    form.querySelector('#booking-location').value = mockTimeSlot.location
    form.querySelector('#booking-name').value = 'John Doe'
    form.querySelector('#booking-email').value = 'john@example.com'
    form.querySelector('#booking-phone').value = '+37212345678'
    form.querySelector('#booking-vehicle').value = 'Toyota Corolla'
    form.querySelector('#booking-service-type').value = 'Regular'

    // Submit form and check error handling
    const result = await bookingApp.submitBooking(new Event('submit'))
    expect(result).toBe(false)
    expect(bookingApp.uiElements.errorMessage.textContent)
      .toContain('no longer available')
  })
})
