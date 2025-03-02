import BookingApp from '../booking.js'

describe('BookingApp Filtering', () => {
  let bookingApp

  beforeEach(() => {
    // Create mock DOM elements
    document.body.innerHTML = `
      <select id="vehicle-type-filter">
        <option value="all">All Vehicle Types</option>
        <option value="Car">Car</option>
        <option value="SUV">SUV</option>
        <option value="Truck">Truck</option>
      </select>
      <select id="location-filter">
        <option value="all">All Locations</option>
      </select>
      <select id="date-range-filter">
        <option value="today">Today</option>
        <option value="tomorrow">Tomorrow</option>
        <option value="week">Next 7 Days</option>
      </select>
      <div id="times-container"></div>
    `
    
    // Initialize BookingApp
    bookingApp = new BookingApp()
    
    // Set up test data
    bookingApp.allTimes = [
      {
        id: '1',
        time: new Date().toISOString(), // Today
        location: 'Downtown',
        vehicleTypes: ['Car', 'SUV']
      },
      {
        id: '2',
        time: (() => {
          const date = new Date()
          date.setDate(date.getDate() + 1) // Tomorrow
          return date.toISOString()
        })(),
        location: 'Uptown',
        vehicleTypes: ['Truck']
      },
      {
        id: '3',
        time: (() => {
          const date = new Date()
          date.setDate(date.getDate() + 5) // Within week
          return date.toISOString()
        })(),
        location: 'Downtown',
        vehicleTypes: ['Car']
      }
    ]
  })
  
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('filterTimes should filter by vehicle type', () => {
    // Spy on displayTimes
    const displayTimesSpy = jest.spyOn(bookingApp, 'displayTimes')
    
    // Set filter values
    bookingApp.elements.vehicleTypeSelect.value = 'Car'
    bookingApp.elements.locationSelect.value = 'all'
    bookingApp.elements.dateRangeSelect.value = 'all'
    
    // Filter
    bookingApp.filterTimes()
    
    // Check that displayTimes was called with filtered data
    expect(displayTimesSpy).toHaveBeenCalledWith([
      bookingApp.allTimes[0], // Downtown Car+SUV
      bookingApp.allTimes[2]  // Downtown Car
    ])
  })
  
  test('filterTimes should filter by location', () => {
    const displayTimesSpy = jest.spyOn(bookingApp, 'displayTimes')
    
    bookingApp.elements.vehicleTypeSelect.value = 'all'
    bookingApp.elements.locationSelect.value = 'Uptown'
    bookingApp.elements.dateRangeSelect.value = 'all'
    
    bookingApp.filterTimes()
    
    expect(displayTimesSpy).toHaveBeenCalledWith([
      bookingApp.allTimes[1] // Uptown Truck
    ])
  })
  
  test('filterTimes should filter by date range', () => {
    const displayTimesSpy = jest.spyOn(bookingApp, 'displayTimes')
    
    bookingApp.elements.vehicleTypeSelect.value = 'all'
    bookingApp.elements.locationSelect.value = 'all'
    bookingApp.elements.dateRangeSelect.value = 'today'
    
    bookingApp.filterTimes()
    
    expect(displayTimesSpy).toHaveBeenCalledWith([
      bookingApp.allTimes[0] // Today's slot
    ])
  })
  
  test('filterTimes should apply multiple filters simultaneously', () => {
    const displayTimesSpy = jest.spyOn(bookingApp, 'displayTimes')
    
    bookingApp.elements.vehicleTypeSelect.value = 'Car'
    bookingApp.elements.locationSelect.value = 'Downtown'
    bookingApp.elements.dateRangeSelect.value = 'today'
    
    bookingApp.filterTimes()
    
    expect(displayTimesSpy).toHaveBeenCalledWith([
      bookingApp.allTimes[0] // Today's Downtown Car+SUV slot
    ])
  })
})
