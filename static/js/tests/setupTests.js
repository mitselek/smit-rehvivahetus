export const mockDOM = () => {
  document.body.innerHTML = `
    <!-- Filter Controls -->
    <div class="filter-controls">
      <select id="vehicle-type-filter" name="vehicleType">
        <option value="all">All Vehicle Types</option>
        <option value="Car">Car</option>
        <option value="Truck">Truck</option>
      </select>
      
      <select id="location-filter" name="location">
        <option value="all">All Locations</option>
        <option value="London">London</option>
        <option value="Manchester">Manchester</option>
      </select>
      
      <select id="date-range-filter" name="dateRange">
        <option value="today">Today</option>
        <option value="tomorrow">Tomorrow</option>
        <option value="week">This Week</option>
      </select>
    </div>

    <!-- Loading and Message Elements -->
    <div id="loading" class="loading hidden">Loading...</div>
    <div id="error-message" class="message error hidden"></div>
    <div id="success-message" class="message success hidden"></div>
    
    <!-- Times Container with Sample Time Card -->
    <div id="times-container">
      <div class="time-card" data-id="123">
        <h3>🚗 Saturday, March 15, 2025</h3>
        <p>Time: 2:30 PM</p>
        <p>Vehicle Types: Car, SUV</p>
        <p>Location: Test Location <span class="location-badge">TES</span></p>
        <button class="book-button" 
          data-id="123" 
          data-time="2025-03-15T14:30:00" 
          data-location="Test Location" 
          data-vehicle-types="Car,SUV">
          Book This Slot
        </button>
      </div>
    </div>

    <!-- Booking Modal -->
    <div id="booking-modal" class="modal-overlay hidden">
      <div class="modal">
        <h2>Book Appointment</h2>
        <form id="booking-form">
          <input type="hidden" id="booking-timeslot-id" name="timeslotId">
          <input type="hidden" id="booking-location" name="location">
          <div id="booking-appointment-details"></div>
          
          <div class="form-group">
            <label for="booking-name">Full Name:</label>
            <input type="text" id="booking-name" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="booking-email">Email:</label>
            <input type="email" id="booking-email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="booking-phone">Phone:</label>
            <input type="tel" id="booking-phone" name="phone" required>
          </div>
          
          <div class="form-group">
            <label for="booking-vehicle">Vehicle:</label>
            <input type="text" id="booking-vehicle" name="vehicle" required>
          </div>
          
          <div class="form-group">
            <label for="booking-service-type">Service Type:</label>
            <select id="booking-service-type" name="serviceType" required>
              <option value="">Select a service</option>
              <option value="Regular">Regular Tire Change</option>
              <option value="Premium">Premium Tire Change</option>
              <option value="Emergency">Emergency Tire Service</option>
            </select>
          </div>
          
          <button type="submit">Book</button>
        </form>
        <button id="close-modal">Close</button>
      </div>
    </div>
  `

  // Verify required elements exist
  const requiredElements = [
    'booking-form',
    'booking-modal',
    'vehicle-type-filter',
    'location-filter',
    'date-range-filter',
    'times-container',
    'loading',
    'error-message',
    'success-message',
    'close-modal'
  ]

  requiredElements.forEach(id => {
    if (!document.getElementById(id)) {
      throw new Error(`Required element #${id} not found in mock DOM`)
    }
  })

  return document.body
}

// Setup timers and scroll for tests
export const setupTimersAndScroll = () => {
  jest.useFakeTimers()
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {})
}