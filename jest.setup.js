// Mock window.scrollTo
window.scrollTo = jest.fn()

// Mock FormData with all required methods
global.FormData = class FormData {
    constructor(form) {
        this.data = {}
    }
    
    append(key, value) {
        this.data[key] = value
    }
    
    get(key) {
        return this.data[key]
    }
    
    set(key, value) {
        this.data[key] = value
    }
    
    forEach(callback) {
        Object.entries(this.data).forEach(([key, value]) => callback(value, key))
    }
}

// Example setup file
// You can add any global setup code here
