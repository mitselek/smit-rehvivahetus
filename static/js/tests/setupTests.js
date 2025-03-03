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

export const testApiHost = 'http://localhost:5000'