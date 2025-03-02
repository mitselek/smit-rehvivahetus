describe('BookingApp Form Validation', () => {
  let bookingApp

  beforeEach(() => {
    // Create mock DOM elements
    document.body.innerHTML = `
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
        <button type="submit">Book</button>
      </form>
    `
    
    // Initialize BookingApp
    bookingApp = new BookingApp()
  })
  
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('validateForm should validate name field', () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('vehicle', 'Toyota Corolla')
    formData.append('serviceType', 'maintenance')
    
    // Empty name
    let validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('Please enter your name')
    
    // Short name
    formData.append('name', 'A')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('Name must be at least 2 characters')
    
    // Valid name
    formData.set('name', 'John Doe')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
  })
  
  test('validateForm should validate email field', () => {
    const formData = new FormData()
    formData.append('name', 'John Doe')
    formData.append('vehicle', 'Toyota Corolla')
    formData.append('serviceType', 'maintenance')
    
    // Empty email
    let validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('Please enter your email')
    
    // Invalid email
    formData.append('email', 'invalid-email')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('valid email')
    
    // Valid email
    formData.set('email', 'john@example.com')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
  })
  
  test('validateForm should validate phone field if provided', () => {
    const formData = new FormData()
    formData.append('name', 'John Doe')
    formData.append('email', 'john@example.com')
    formData.append('vehicle', 'Toyota Corolla')
    formData.append('serviceType', 'maintenance')
    
    // Empty phone (optional)
    let validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
    
    // Invalid phone
    formData.append('phone', 'invalid-phone')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('valid phone')
    
    // Valid phone formats
    formData.set('phone', '123-456-7890')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
    
    formData.set('phone', '+1 123 456 7890')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
  })
  
  test('validateForm should validate vehicle field', () => {
    const formData = new FormData()
    formData.append('name', 'John Doe')
    formData.append('email', 'john@example.com')
    formData.append('serviceType', 'maintenance')
    
    // Empty vehicle
    let validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('vehicle details')
    
    // Valid vehicle
    formData.append('vehicle', 'Toyota Corolla')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
  })
  
  test('validateForm should validate serviceType field', () => {
    const formData = new FormData()
    formData.append('name', 'John Doe')
    formData.append('email', 'john@example.com')
    formData.append('vehicle', 'Toyota Corolla')
    
    // Empty service type
    let validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(false)
    expect(validation.message).toContain('service type')
    
    // Valid service type
    formData.append('serviceType', 'maintenance')
    validation = bookingApp.validateForm(formData)
    expect(validation.valid).toBe(true)
  })
})
