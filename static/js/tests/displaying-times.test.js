import BookingApp from '../booking.js'

describe('BookingApp Displaying Times', () => {
  let bookingApp

  beforeEach(() => {
    // Create mock DOM elements
    document.body.innerHTML = `
      <div id="times-container"></div>
    `
    
    // Initialize BookingApp
    bookingApp = new BookingApp()
  })
  
  afterEach(() => {
    document.body.innerHTML = ''
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