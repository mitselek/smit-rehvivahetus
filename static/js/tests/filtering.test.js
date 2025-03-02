import BookingApp from '../booking.js'
import { mockDOM } from './setupTests.js'

describe('BookingApp Filtering', () => {
  let bookingApp
  let fetchMock
  let originalFetch

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch

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
    
    // Initialize BookingApp and wait for fetch
    bookingApp = new BookingApp().init()
    
    // Set up test data after initialization
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
    global.fetch = originalFetch
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
