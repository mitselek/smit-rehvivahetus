import 'whatwg-fetch' // Ensure fetch is available in the test environment
import BookingApp from '../booking.js'
import { mockDOM, mockFetch, fillFormData } from './setupTests.js'

describe('BookingApp Booking Submission', () => {
  let bookingApp
  let fetchMock

  beforeEach(() => {
    // Use reusable mock DOM elements
    mockDOM()
    
    // Initialize BookingApp
    bookingApp = new BookingApp().init()

    // Mock fetch
    fetchMock = mockFetch([{ success: true, booking_id: '12345', message: 'Booking successful' }])
    global.fetch = fetchMock
  })
  
  afterEach(() => {
    document.body.innerHTML = ''
    fetchMock.mockRestore()
  })

  test('submitBooking should validate form and submit valid data', async () => {
    const formData = new FormData(bookingApp.elements.bookingForm)
    fillFormData(formData)

    // Mock form submission event
    const submitEvent = new Event('submit')
    jest.spyOn(submitEvent, 'preventDefault')
    bookingApp.elements.bookingForm.dispatchEvent(submitEvent)

    // Wait for async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Verify submission
    expect(submitEvent.preventDefault).toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledWith('/api/book', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringMatching(/John Doe/)
    }))
  })

  test('submitBooking should show error message for invalid form', async () => {
    // Make form invalid by clearing required field
    document.getElementById('booking-name').value = ''
    
    // Submit form
    await bookingApp.submitBooking({ preventDefault: jest.fn() })
    
    // Check that fetch was not called after form submission
    expect(fetchMock.mock.calls.length).toBe(0)
    
    // Check error message
    expect(bookingApp.elements.errorMessage.classList.contains('hidden')).toBe(false)
    expect(bookingApp.elements.errorMessage.textContent).toContain('Please enter your name')
  })
  
  test('submitBooking should handle server errors', async () => {
    // Fill form with valid data first
    const formData = new FormData(bookingApp.elements.bookingForm)
    fillFormData(formData)

    formData.forEach((value, key) => {
      const input = bookingApp.elements.bookingForm.querySelector(`[name="${key}"]`)
      if (input) input.value = value
    }
    )

    // Mock server error
    fetchMock = mockFetch([], false)
    global.fetch = fetchMock

    // Submit form
    await bookingApp.submitBooking({ preventDefault: jest.fn() })
    
    // Verify error message
    expect(bookingApp.elements.errorMessage.textContent).toContain('Server error')
  })

  test('submitBooking should handle API response with error message', async () => {
    // Set up valid form data
    const formData = {
      'timeslotId': '123',
      'location': 'Downtown',
      'name': 'John Doe',
      'email': 'john@example.com',
      'phone': '123-456-7890',
      'vehicle': 'Toyota Corolla',
      'serviceType': 'Regular'
    }
    
    // Fill form with valid data
    Object.entries(formData).forEach(([name, value]) => {
      const input = bookingApp.elements.bookingForm.querySelector(`[name="${name}"]`)
      if (input) input.value = value
    })
    
    // Mock error response
    fetchMock = mockFetch([{ success: false, error: 'Time slot no longer available' }])
    global.fetch = fetchMock

    // Submit form and wait for all promises
    await bookingApp.submitBooking({ preventDefault: jest.fn() })
    await Promise.resolve() // Wait for next tick

    // Verify error message
    expect(bookingApp.elements.errorMessage.textContent).toContain('Time slot no longer available')
  })
})
