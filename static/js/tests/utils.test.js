import { validateForm, getVehicleIcon, formatDateTime } from '../utils.js'

describe('Utility Functions', () => {
  describe('validateForm', () => {
    const validBookingData = {
      timeslotId: '123',
      location: 'Test Location',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+37212345678',
      vehicle: 'Toyota Corolla',
      serviceType: 'Regular'
    }

    test('should validate valid booking data', () => {
      const result = validateForm(validBookingData)
      expect(result.valid).toBe(true)
      expect(result.message).toBe('')
    })

    test('should validate required fields', () => {
      const result = validateForm({})
      expect(result.valid).toBe(false)
      expect(result.message).toContain('name')
      expect(result.message).toContain('email')
    })

    test('should validate email format', () => {
      const result = validateForm({
        ...validBookingData,
        email: 'invalid-email'
      })
      expect(result.valid).toBe(false)
      expect(result.message).toContain('valid email')
    })

    test('should validate phone format', () => {
      const result = validateForm({
        ...validBookingData,
        phone: '123'
      })
      expect(result.valid).toBe(false)
      expect(result.message).toContain('phone number')
    })
  })

  describe('formatDateTime', () => {
    test('should format date correctly', () => {
      const date = new Date('2025-03-15T14:30:00')
      const format = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
      expect(formatDateTime(date, format)).toContain('2025')
      expect(formatDateTime(date, format)).toContain('March')
    })

    test('should handle invalid dates', () => {
      expect(formatDateTime(null, {})).toBe('Invalid date')
      expect(formatDateTime('invalid', {})).toBe('Invalid date')
    })
  })

  describe('getVehicleIcon', () => {
    const VEHICLE_ICONS = {
      TRUCK: 'truck',
      SUV: 'suv',
      CAR: 'car',
      getIcon(type) {
        return this[type] || this.CAR
      }
    }
  
    beforeEach(() => {
      // Mock the original icons to use strings instead
      jest.spyOn(VEHICLE_ICONS, 'getIcon').mockImplementation((type) => {
        const mapping = {
          'Truck': 'truck',
          'SUV': 'suv',
          'Car': 'car'
        }
        return mapping[type] || 'car'
      })
    })
  
    afterEach(() => {
      jest.restoreAllMocks()
    })
  
    test('should return correct icons', () => {
      const result = getVehicleIcon(['Truck'], VEHICLE_ICONS)
      expect(result).toBe('truck')
    })
  
    test('should handle multiple vehicle types', () => {
      const result1 = getVehicleIcon(['Car', 'Truck'], VEHICLE_ICONS)
      const result2 = getVehicleIcon(['Car', 'SUV'], VEHICLE_ICONS)
      
      expect(result1).toBe('truck')
      expect(result2).toBe('suv')
    })
  
    test('should default to car icon', () => {
      const result1 = getVehicleIcon(['Unknown'], VEHICLE_ICONS)
      const result2 = getVehicleIcon([], VEHICLE_ICONS)
      
      expect(result1).toBe('car')
      expect(result2).toBe('car')
    })
  })  
})
