# Tire Change Booking System

A web application for browsing available tire change time slots from multiple workshops.

## Features

-   Browse available tire change time slots from multiple workshops.
-   Filter time slots by vehicle type, location, and date range.
-   Book appointments online.
-   Receive confirmation emails.

## Quick Start
```bash
# Clone and enter directory
git clone https://github.com/your-username/smit-rehvivahetus.git
cd smit-rehvivahetus

# One-line setup (Unix/Linux/Mac)
./setup.sh && npm install && source venv/bin/activate && python app.py

# Or on Windows (PowerShell)
.\setup.bat; npm install; .\venv\Scripts\activate; python app.py
```
Then open http://localhost:5000 in your browser.

Need Docker containers for testing:
```bash
docker run -d -p 9003:80 surmus/london-tire-workshop:2.0.1
docker run -d -p 9004:80 surmus/manchester-tire-workshop:2.0.1
```

## Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- Node.js 16 or higher (for running tests)
- npm (Node.js package manager)

### Installation

#### On Unix-like systems (Linux/MacOS):
```bash
# Make setup script executable
chmod +x setup.sh

# Run setup script
./setup.sh

# Install Node.js dependencies
npm install

# Upgrade setuptools and wheel
pip install --upgrade setuptools wheel

# Install Python dependencies
pip install -r requirements.txt
```

#### On Windows:
```batch
setup.bat
npm install

# Upgrade setuptools and wheel
pip install --upgrade setuptools wheel

pip install -r requirements.txt
```

### Running the Application

1. Activate the virtual environment:
   - Unix-like systems: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate.bat`

2. Run the application:
   ```bash
   python app.py
   ```

3. Open your web browser and navigate to: `http://localhost:5000`

### Development

The application expects the following services to be running:
- London API at http://localhost:9003
  - docker run -d -p 9003:80 surmus/london-tire-workshop:2.0.1
- Manchester API at http://localhost:9004
  - docker run -d -p 9004:80 surmus/manchester-tire-workshop:2.0.1

To add a new API:
1. Create a new JSON file in the `services` folder named `{service_name}_doc.json`
2. Add service configuration to `services/service_info.yaml`
3. Update the tests if necessary

### API Testing
You can test the APIs directly using the `api.http` file:
1. Install REST Client extension for VS Code
2. Open `api.http`
3. Click "Send Request" above each request

## Tests

### Frontend Tests

**Test Coverage**
- Core functionality
  - Initialization (`initialization.test.js`)
    - DOM element caching
    - Event listener setup
    - Utility methods (message display, date formatting)
  - Utility functions (`utils.test.js`)
    - Form validation
    - Date formatting
    - Vehicle icon selection
  - Integration tests (`booking.integration.test.js`)
    - Complete booking flow
    - Error handling
    - Time slot interaction

See [Vague ideas for Test Cases](static/js/tests/TODO.md) for possible test coverage improvements.

**Running Tests**
```bash
npm test
```

**Test Files Structure**
```
static/js/tests/
├── booking.integration.test.js  # End-to-end booking flow tests
├── initialization.test.js       # App initialization tests
├── setupTests.js               # Test setup and mock DOM
├── TODO.md                     # Pending test cases
└── utils.test.js              # Utility function tests
```

**Watch Mode**
```bash
npm run test:watch
```

Watch mode commands:
- `a` - run all tests
- `f` - run only failed tests
- `o` - run only modified files
- `q` - quit watch mode

**Coverage Report**
```bash
npm test -- --coverage
```

### Backend Tests

Run Python tests:
```bash
# Activate virtual environment first
python -m pytest

# With coverage
python -m pytest --cov=.

# Generate coverage report
python -m pytest --cov=. --cov-report=html
```

## Project Structure

```
smit-rehvivahetus/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies
├── static/
│   ├── css/styles.css     # Application styles
│   └── js/
│       ├── booking.js     # Main booking application
│       ├── utils.js       # Utility functions
│       ├── dataHandler.js # API interaction functions
│       └── tests/         # Frontend tests
├── templates/
│   └── index.html         # Main application template
├── services/
│   ├── service_info.yaml  # API service configuration
│   └── *_doc.json         # API documentation files
├── tests/                 # Backend tests
├── setup.sh               # Unix setup script
├── setup.bat              # Windows setup script
└── venv/                  # Python virtual environment
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT