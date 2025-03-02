import BookingApp from '../booking.js'
import { mockDOM } from './setupTests.js'

describe('BookingApp Form Validation', () => {
  let bookingApp

  beforeEach(() => {
    // Use reusable mock DOM elements
    mockDOM()
    
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
