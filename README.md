# Tire Change Booking System

A web application for browsing available tire change time slots from multiple workshops.

## Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

#### On Unix-like systems (Linux/MacOS):
```bash
# Make setup script executable
chmod +x setup.sh

# Run setup script
./setup.sh
```

#### On Windows:
```batch
setup.bat
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

## License

MIT
