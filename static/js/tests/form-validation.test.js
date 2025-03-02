import BookingApp from '../booking.js'

describe('BookingApp Form Validation', () => {
  let bookingApp

  beforeEach(() => {
    // Create mock DOM elements with ALL required elements
    document.body.innerHTML = `
      <div id="booking-modal" class="hidden"></div>
      <form id="booking-form">
        <input id="booking-timeslot-id" name="timeslotId">
        <input id="booking-location" name="location">
        <input id="booking-name" name="name">
        <input id="booking-email" name="email">
        <input id="booking-phone" name="phone">
        <input id="booking-vehicle" name="vehicle">
        <select id="booking-service-type" name="serviceType">
          <option value="">Select a service</option>
          <option value="Regular">Regular Tire Change</option>
          <option value="Premium">Premium Tire Change</option>
          <option value="Emergency">Emergency Tire Service</option>
        </select>
      </form>
      <div id="loading" class="hidden"></div>
      <div id="error-message" class="hidden"></div>
      <div id="success-message" class="hidden"></div>
      <button id="close-modal"></button>
      <div id="booking-appointment-details"></div>
    `
    
    // Initialize BookingApp
    bookingApp = new BookingApp().init()
  })
  
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('validateForm should validate name field', () => {
    const formData = new FormData(bookingApp.elements.bookingForm)
    
    // Empty name
    formData.set('name', '')
    let validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('Please enter your name')
    
    // Short name
    formData.set('name', 'A')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('Name must be at least 2 characters')
    
    // Valid name
    formData.set('name', 'John Doe')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
  })
  
  test('validateForm should validate email field', () => {
    const formData = new FormData(bookingApp.elements.bookingForm)
    
    // Empty email
    formData.set('email', '')
    let validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('Please enter your email')
    
    // Invalid email
    formData.set('email', 'invalid-email')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('Please enter a valid email address')
    
    // Valid email
    formData.set('email', 'john@example.com')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
  })
  
  test('validateForm should validate phone field if provided', () => {
    const formData = new FormData(bookingApp.elements.bookingForm)
    
    // Empty phone (optional)
    let validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
    
    // Invalid phone
    formData.set('phone', 'invalid-phone')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('Please enter a valid phone number')
    
    // Valid phone formats
    formData.set('phone', '123-456-7890')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
    
    formData.set('phone', '+1 123 456 7890')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
  })
  
  test('validateForm should validate vehicle field', () => {
    const formData = new FormData(bookingApp.elements.bookingForm)
    
    // Empty vehicle
    formData.set('vehicle', '')
    let validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('Please enter your vehicle details')
    
    // Valid vehicle
    formData.set('vehicle', 'Toyota Corolla')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
  })
  
  test('validateForm should validate serviceType field', () => {
    const formData = new FormData(bookingApp.elements.bookingForm)
    
    // Empty serviceType
    formData.set('serviceType', '')
    let validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('Please select a service type')
    
    // Valid serviceType
    formData.set('serviceType', 'Regular')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
  })
})
