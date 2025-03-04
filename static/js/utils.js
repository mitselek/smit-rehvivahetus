// Description: Utility functions for the booking app
// Path: static/js/utils.js

export function validateForm(bookingData) {
  const errors = []

  const requiredFields = {
    name: 'Please enter your name',
    email: 'Please enter your email',
    vehicle: 'Please enter your vehicle details',
    serviceType: 'Please select a service type',
    timeslotId: 'No time slot selected',
    location: 'No location selected'
  }
  
  Object.entries(requiredFields).forEach(([field, message]) => {
    if (!bookingData[field]) {
      errors.push(message)
    }
  })

  const { name, email, phone } = bookingData

  if (name && name.length < 2) {
    errors.push('Name must be at least 2 characters')
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (email && !emailRegex.test(email)) {
    errors.push('Please enter a valid email address')
  }

  const phoneRegex = /^\+?[0-9\s-]{7,}$/
  if (phone && !phoneRegex.test(phone)) {
    errors.push('Please enter a valid phone number')
  }

  return {
    valid: errors.length === 0,
    message: errors.join('. ')
  }
}

export function getVehicleIcon(vehicleTypes, VEHICLE_ICONS) {
  if (vehicleTypes.includes('Truck')) return VEHICLE_ICONS.getIcon('Truck')
  if (vehicleTypes.includes('SUV')) return VEHICLE_ICONS.getIcon('SUV')
  return VEHICLE_ICONS.getIcon('Car')
}

export function formatDateTime(dateTimeStr, format) {
  try {
    let dt
    if (dateTimeStr instanceof Date) {
      dt = dateTimeStr
    } else if (!dateTimeStr) {
      throw new Error('Invalid date')
    } else {
      dt = new Date(dateTimeStr)
    }

    if (isNaN(dt.getTime())) {
      throw new Error('Invalid date')
    }

    return dt.toLocaleString('en-US', format)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Date formatting error:', error)
    }
    return 'Invalid date'
  }
}
