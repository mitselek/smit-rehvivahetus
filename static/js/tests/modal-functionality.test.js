import BookingApp from '../booking.js'

describe('BookingApp Modal Functionality', () => {
  let bookingApp

  beforeEach(() => {
    // Create mock DOM elements
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
        <button type="submit">Book</button>
      </form>
      <button id="close-modal"></button>
      <div id="booking-appointment-details"></div>
    `
    
    // Initialize BookingApp
    bookingApp = new BookingApp()
  })
  
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('openBookingModal should populate form fields and show modal', () => {
    // Create button with dataset
    const button = document.createElement('button')
    button.dataset.id = '123'
    button.dataset.time = '2025-03-15T14:30:00Z'
    button.dataset.location = 'Downtown'
    button.dataset.vehicleTypes = 'Car,SUV'
    
    const event = { target: button }
    
    bookingApp.openBookingModal(event)
    
    // Check form fields
    expect(bookingApp.elements.timeslotIdInput.value).toBe('123')
    expect(bookingApp.elements.locationIdInput.value).toBe('Downtown')
    
    // Check appointment details
    const appointmentDetails = bookingApp.elements.appointmentDetailsElement.innerHTML
    expect(appointmentDetails).toContain('Downtown')
    expect(appointmentDetails).toContain('Car, SUV')
    
    // Check modal visibility
    expect(bookingApp.elements.bookingModal.classList.contains('hidden')).toBe(false)
    expect(bookingApp.elements.bookingModal.classList.contains('visible')).toBe(true)
  })
  
  test('closeModal should hide modal and reset form', () => {
    // Set up form with values
    bookingApp.elements.timeslotIdInput.value = '123'
    bookingApp.elements.locationIdInput.value = 'Downtown'
    bookingApp.elements.bookingModal.classList.add('visible')
    bookingApp.elements.bookingModal.classList.remove('hidden')
    
    // Spy on form reset
    const resetSpy = jest.spyOn(bookingApp.elements.bookingForm, 'reset')
    
    bookingApp.closeModal()
    
    // Check modal visibility
    expect(bookingApp.elements.bookingModal.classList.contains('hidden')).toBe(true)
    expect(bookingApp.elements.bookingModal.classList.contains('visible')).toBe(false)
    
    // Check form reset
    expect(resetSpy).toHaveBeenCalled()
  })
})
