import BookingApp from '../booking.js'
import { mockDOM } from './setupTests.js'

describe('BookingApp Modal Functionality', () => {
  let bookingApp
  let fetchMock

  beforeEach(() => {
    // Mock fetch
    fetchMock = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    )
    global.fetch = fetchMock

    // Use reusable mock DOM elements
    mockDOM()

    // Initialize BookingApp and call init explicitly
    bookingApp = new BookingApp()
    bookingApp.init()

    // Mock scrollTo
    window.scrollTo = jest.fn()
    
    // Mock setTimeout
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    document.body.innerHTML = ''
    jest.resetAllMocks()
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
