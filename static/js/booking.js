// Configuration constants
const CONFIG = {
    FEEDBACK_DELAY: 5000,
    DATE_FORMAT: {
      full: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      },
      time: {
        hour: '2-digit',
        minute: '2-digit'
      }
    },
    VEHICLE_ICONS: {
      'Truck': '🚚',
      'SUV': '🚙',
      'Car': '🚗'
    }
  };
  
  // BookingApp class to handle all functionality
  class BookingApp {
    constructor() {
      this.allTimes = [];
      this.elements = {};
      this.init();
    }
  
    init() {
      // Wait for DOM to be loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupApp());
      } else {
        this.setupApp();
      }
    }
  
    setupApp() {
      // Cache DOM elements
      this.cacheElements();
      
      // Setup initial state
      this.elements.bookingModal.classList.add('hidden');
      
      // Bind event handlers
      this.bindEvents();
      
      // Initial data load
      this.fetchTimes();
    }
  
    cacheElements() {
      this.elements = {
        bookingModal: document.getElementById('booking-modal'),
        vehicleTypeSelect: document.getElementById('vehicle-type-filter'),
        locationSelect: document.getElementById('location-filter'),
        dateRangeSelect: document.getElementById('date-range-filter'),
        timesContainer: document.getElementById('times-container'),
        loadingElement: document.getElementById('loading'),
        errorMessage: document.getElementById('error-message'),
        successMessage: document.getElementById('success-message'),
        bookingForm: document.getElementById('booking-form'),
        closeModalButton: document.getElementById('close-modal'),
        timeslotIdInput: document.getElementById('booking-timeslot-id'),
        locationIdInput: document.getElementById('booking-location'),
        appointmentDetailsElement: document.getElementById('booking-appointment-details')
      };
    }
  
    bindEvents() {
      this.elements.vehicleTypeSelect.addEventListener('change', () => this.filterTimes());
      this.elements.locationSelect.addEventListener('change', () => this.filterTimes());
      this.elements.dateRangeSelect.addEventListener('change', () => this.filterTimes());
      this.elements.closeModalButton.addEventListener('click', () => this.closeModal());
      this.elements.bookingForm.addEventListener('submit', (e) => this.submitBooking(e));
      
      // Event delegation for booking buttons
      this.elements.timesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('book-button')) {
          this.openBookingModal(e);
        }
      });
    }
  
    // UI Helper methods
    showLoading(show) {
      this.elements.loadingElement.classList.toggle('hidden', !show);
    }
  
    showMessage(type, message) {
      const { errorMessage, successMessage } = this.elements;
      
      // Hide both messages first
      errorMessage.classList.add('hidden');
      successMessage.classList.add('hidden');
      
      // Show requested message
      if (type === 'error') {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
      } else if (type === 'success') {
        successMessage.textContent = message;
        successMessage.classList.remove('hidden');
      }
      
      // Auto-hide after delay
      if (message) {
        setTimeout(() => {
          if (type === 'error') {
            errorMessage.classList.add('hidden');
          } else if (type === 'success') {
            successMessage.classList.add('hidden');
          }
        }, CONFIG.FEEDBACK_DELAY);
      }
    }
  
    formatDateTime(dateTimeStr, format) {
      try {
        const dt = new Date(dateTimeStr);
        if (isNaN(dt.getTime())) {
          throw new Error('Invalid date');
        }
        return dt.toLocaleString('en-US', format);
      } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid date';
      }
    }
  
    // Data fetching and manipulation
    async fetchTimes() {
      this.showLoading(true);
      
      try {
        const response = await fetch('/api/times');
        if (!response.ok) {
          throw new Error(`Failed to fetch available times: ${response.status}`);
        }
        
        const data = await response.json();
        this.allTimes = data;
        this.updateLocationFilter(data);
        this.filterTimes();
      } catch (error) {
        this.showMessage('error', error.message);
        console.error('Fetch error:', error);
      } finally {
        this.showLoading(false);
      }
    }
  
    updateLocationFilter(times) {
      const locationSelect = this.elements.locationSelect;
      
      // Clear existing options except the first one
      while (locationSelect.options.length > 1) {
        locationSelect.remove(1);
      }
      
      // Get unique locations and create options
      const locations = [...new Set(times.map(time => time.location))].sort();
      
      // Create document fragment for better performance
      const fragment = document.createDocumentFragment();
      
      locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        fragment.appendChild(option);
      });
      
      locationSelect.appendChild(fragment);
    }
  
    filterTimes() {
      const { vehicleTypeSelect, locationSelect, dateRangeSelect } = this.elements;
      
      const vehicleType = vehicleTypeSelect.value;
      const location = locationSelect.value;
      const dateRange = dateRangeSelect.value;
      
      let filteredTimes = this.allTimes.filter(time => {
        // Filter by vehicle type
        if (vehicleType !== 'all' && !time.vehicleTypes.includes(vehicleType)) {
          return false;
        }
        
        // Filter by location
        if (location !== 'all' && time.location !== location) {
          return false;
        }
        
        // Filter by date range
        const timeDate = new Date(time.time);
        if (!this.isDateInRange(timeDate, dateRange)) {
          return false;
        }
        
        return true;
      });
      
      this.displayTimes(filteredTimes);
    }
  
    isDateInRange(date, range) {
      if (range === 'all') return true;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const oneWeekLater = new Date(today);
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      
      const dateDay = new Date(date);
      dateDay.setHours(0, 0, 0, 0);
      
      if (range === 'today' && dateDay.getTime() === today.getTime()) {
        return true;
      }
      
      if (range === 'tomorrow' && dateDay.getTime() === tomorrow.getTime()) {
        return true;
      }
      
      if (range === 'week' && dateDay.getTime() >= today.getTime() && dateDay.getTime() <= oneWeekLater.getTime()) {
        return true;
      }
      
      return false;
    }
  
    getVehicleIcon(vehicleTypes) {
      if (vehicleTypes.includes('Truck')) {
        return CONFIG.VEHICLE_ICONS.Truck;
      } else if (vehicleTypes.includes('SUV') && !vehicleTypes.includes('Car')) {
        return CONFIG.VEHICLE_ICONS.SUV;
      }
      return CONFIG.VEHICLE_ICONS.Car;
    }
  
    displayTimes(times) {
      const container = this.elements.timesContainer;
      
      // Clear current content
      container.innerHTML = '';
      
      // Check if we have any times
      if (times.length === 0) {
        const noTimesMessage = document.createElement('p');
        noTimesMessage.textContent = 'No available times match your filters. Please try different criteria.';
        container.appendChild(noTimesMessage);
        return;
      }
      
      // Create document fragment for better performance
      const fragment = document.createDocumentFragment();
      
      // Create time cards
      times.forEach(time => {
        const timeCard = document.createElement('div');
        timeCard.className = 'time-card';
        timeCard.dataset.id = time.id;
        
        const timeDate = new Date(time.time);
        const formattedDate = this.formatDateTime(timeDate, CONFIG.DATE_FORMAT.full);
        const formattedTime = this.formatDateTime(timeDate, CONFIG.DATE_FORMAT.time);
        
        const vehicleIcon = this.getVehicleIcon(time.vehicleTypes);
        const vehicleTypesText = time.vehicleTypes.join(', ');
        
        // Create location badge
        const locationBadge = document.createElement('span');
        locationBadge.className = 'location-badge';
        locationBadge.textContent = time.location.substring(0, 3).toUpperCase();
        
        // Create booking button
        const bookButton = document.createElement('button');
        bookButton.className = 'book-button';
        bookButton.dataset.id = time.id;
        bookButton.dataset.time = time.time;
        bookButton.dataset.location = time.location;
        bookButton.dataset.vehicleTypes = time.vehicleTypes.join(',');
        bookButton.textContent = 'Book This Slot';
        
        // Build the card
        timeCard.innerHTML = `
          <h3>${vehicleIcon} ${formattedDate}</h3>
          <p>Time: ${formattedTime}</p>
          <p>Vehicle Types: ${vehicleTypesText}</p>
          <p>Location: ${time.location}</p>
        `;
        
        // Add location badge to the location paragraph
        const locationParagraph = timeCard.querySelector('p:nth-child(4)');
        locationParagraph.appendChild(locationBadge);
        
        // Add booking button
        timeCard.appendChild(bookButton);
        
        fragment.appendChild(timeCard);
      });
      
      // Add all cards to container
      container.appendChild(fragment);
    }
  
    // Modal and booking functionality
    openBookingModal(event) {
      const button = event.target;
      const timeId = button.dataset.id;
      const timeValue = button.dataset.time;
      const location = button.dataset.location;
      const vehicleTypes = button.dataset.vehicleTypes.split(',');
      
      const timeDate = new Date(timeValue);
      const formattedDate = this.formatDateTime(timeDate, CONFIG.DATE_FORMAT.full);
      const formattedTime = this.formatDateTime(timeDate, CONFIG.DATE_FORMAT.time);
      
      // Set form values
      this.elements.timeslotIdInput.value = timeId;
      this.elements.locationIdInput.value = location;
      
      // Set appointment details
      this.elements.appointmentDetailsElement.innerHTML = `
        <strong>Date:</strong> ${formattedDate}<br>
        <strong>Time:</strong> ${formattedTime}<br>
        <strong>Location:</strong> ${location}<br>
        <strong>Supported Vehicles:</strong> ${vehicleTypes.join(', ')}
      `;
      
      // Show modal
      this.elements.bookingModal.classList.remove('hidden');
      this.elements.bookingModal.classList.add('visible');
      
      // Focus on name field
      const nameInput = document.getElementById('booking-name');
      if (nameInput) {
        nameInput.focus();
      }
    }
  
    closeModal() {
      this.elements.bookingModal.classList.add('hidden');
      this.elements.bookingModal.classList.remove('visible');
      this.elements.bookingForm.reset();
    }
  
    validateForm(formData) {
      const errors = [];
      
      // Validate name (required, min length 2 characters)
      const name = formData.get('name');
      if (!name || name.trim() === '') {
        errors.push('Please enter your name.');
      } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long.');
      }
      
      // Validate email (required, must be valid format)
      const email = formData.get('email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || email.trim() === '') {
        errors.push('Please enter your email address.');
      } else if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address.');
      }
      
      // Validate phone (optional, but must be valid if provided)
      const phone = formData.get('phone');
      const phoneRegex = /^(\+?\d{1,4}[\s-]?)?(\(?\d{3}\)?[\s-]?)?[\d\s-]{7,10}$/;
      if (phone && phone.trim() !== '' && !phoneRegex.test(phone)) {
        errors.push('Please enter a valid phone number.');
        console.log(`Not a valid phone number: ${phone}`);
      }
      
      // Validate vehicle (required)
      const vehicle = formData.get('vehicle');
      if (!vehicle || vehicle.trim() === '') {
        errors.push('Please enter your vehicle details.');
      }
      
      // Validate service type (required)
      const serviceType = formData.get('serviceType');
      if (!serviceType || serviceType === '') {
        errors.push('Please select a service type.');
      }
      
      // Return validation result
      if (errors.length > 0) {
        return { 
          valid: false, 
          message: errors.join(' ')
        };
      }
      
      return { valid: true };
    }
  
    async submitBooking(event) {
      event.preventDefault();
      this.showLoading(true);
      
      // Get form data
      const formData = new FormData(this.elements.bookingForm);
      
      // Validate form
      const validation = this.validateForm(formData);
      if (!validation.valid) {
        this.showMessage('error', validation.message);
        this.showLoading(false);
        return;
      }
      
      // Convert form data to JSON
      const bookingData = {};
      formData.forEach((value, key) => {
        bookingData[key] = value;
      });
      
      try {
        const response = await fetch('/api/book', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Close modal
          this.closeModal();
          
          // Show success message
          this.showMessage('success', `Booking confirmed! Your booking ID is ${data.booking_id}. ${data.message}`);
          
          // Handle the booked time slot
          this.handleBookedTimeSlot(data.booking_id);
          
          // Refresh time data after delay
          setTimeout(() => this.fetchTimes(), CONFIG.FEEDBACK_DELAY);
        } else {
          this.showMessage('error', data.message || data.error || 'Booking failed. Please try again.');
        }
      } catch (error) {
        this.showMessage('error', 'An error occurred while processing your booking.');
        console.error('Booking error:', error);
      } finally {
        this.showLoading(false);
      }
    }
  
    handleBookedTimeSlot(bookingId) {
      const reservedTimeSlot = document.querySelector(`.time-card[data-id="${bookingId}"]`);
      if (reservedTimeSlot) {
        // Add fade-out effect
        reservedTimeSlot.classList.add('fade-out');
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Remove element after animation completes
        setTimeout(() => {
          reservedTimeSlot.remove();
        }, 1000);
      }
    }
  }
  
  // Initialize the app
  const bookingApp = new BookingApp();