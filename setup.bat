@echo off

REM Create virtual environment if it doesn't exist
if not exist venv (
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements
pip install -r requirements.txt

REM Print success message
echo Setup complete! To start the application:
echo 1. Activate the virtual environment: venv\Scripts\activate.bat
echo 2. Run the application: python app.py
