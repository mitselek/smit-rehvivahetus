export const mockDOM = () => {
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
}

export const mockFetch = (response = [], ok = true) => {
  return jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(response)
    })
  )
}

export const setupTimersAndScroll = () => {
  // Mock scrollTo
  window.scrollTo = jest.fn()
  
  // Mock setTimeout
  jest.useFakeTimers()
}

// Adds default valid values to formData
export const fillFormData = (formData) => {
  formData.set('timeslotId', '1')
  formData.set('location', 'London')
  formData.set('name', 'John Doe')
  formData.set('email', 'john.doe@gmail.com')
  formData.set('phone', '123-456-7890')
  formData.set('vehicle', 'Toyota Corolla')
  formData.set('serviceType', 'Regular')
}
