import BookingApp from '../booking.js'

describe('BookingApp Displaying Times', () => {
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
    
    // Create mock DOM elements with ALL required elements
    document.body.innerHTML = `
      <div id="booking-modal" class="hidden"></div>
      <select id="vehicle-type-filter">
        <option value="all">All Vehicle Types</option>
      </select>
      <select id="location-filter">
        <option value="all">All Locations</option>
      </select>
      <select id="date-range-filter">
        <option value="today">Today</option>
      </select>
      <div id="times-container"></div>
      <div id="loading" class="hidden"></div>
      <div id="error-message" class="hidden"></div>
      <div id="success-message" class="hidden"></div>
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
    
    // Initialize BookingApp and call init() explicitly
    bookingApp = new BookingApp().init()

    // Clear fetch mock calls
    fetchMock.mockClear()
  })
  
  afterEach(() => {
    document.body.innerHTML = ''
    jest.restoreAllMocks()
  })

  test('displayTimes should create time cards for each time slot', () => {
    const times = [
      {
        id: '1',
        time: '2025-03-15T14:30:00Z',
        location: 'Downtown',
        vehicleTypes: ['Car', 'SUV']
      },
      {
        id: '2',
        time: '2025-03-16T10:00:00Z',
        location: 'Uptown',
        vehicleTypes: ['Truck']
      }
    ]
    
    bookingApp.displayTimes(times)
    
    const timeCards = document.querySelectorAll('.time-card')
    expect(timeCards.length).toBe(2)
    
    const bookButtons = document.querySelectorAll('.book-button')
    expect(bookButtons.length).toBe(2)
    
    // Check first card content
    expect(timeCards[0].dataset.id).toBe('1')
    expect(timeCards[0].innerHTML).toContain('Downtown')
    expect(timeCards[0].innerHTML).toContain('Car, SUV')
    
    // Check second card content
    expect(timeCards[1].dataset.id).toBe('2')
    expect(timeCards[1].innerHTML).toContain('Uptown')
    expect(timeCards[1].innerHTML).toContain('Truck')
  })
  
  test('displayTimes should show message when no times match', () => {
    bookingApp.displayTimes([])
    
    expect(bookingApp.elements.timesContainer.textContent).toContain('No available times match your filters. Please try different criteria.')
    expect(document.querySelectorAll('.time-card').length).toBe(0)
  })
})