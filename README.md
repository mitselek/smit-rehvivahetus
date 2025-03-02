# Tire Change Booking System

A web application for browsing available tire change time slots from multiple workshops.

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
```

#### On Windows:
```batch
setup.bat
npm install
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
- Manchester API at http://localhost:9004

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

**Structure**
- Initialization and Utility Methods: Tests related to initialization and utility methods.
- Form Validation: Tests related to form validation.
- Data Fetching: Tests related to fetching data from the API.
- Displaying Times: Tests related to displaying time slots.
- Filtering: Tests related to filtering time slots.
- Modal Functionality: Tests related to the booking modal.
- Booking Submission: Tests related to submitting bookings.
- Integration Tests: Comprehensive tests that cover multiple functionalities.

Run tests once:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Testing commands:
- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `o` to run only modified files
- Press `q` to quit watch mode

View test coverage:
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
├── app.py              # Main Flask application
├── static/
│   ├── css/           # Stylesheets
│   └── js/            # JavaScript files
├── templates/         # HTML templates
├── services/         # API service configurations
├── tests/           # Test files
└── venv/            # Python virtual environment
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT