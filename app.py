from flask import Flask, render_template, jsonify, request
import requests
import xmltodict
import yaml
from datetime import datetime, timedelta
from dateutil.parser import parse
import os
from services import load_services
from urllib.parse import quote

def load_service_info():
    """Load service information from YAML file"""
    with open(os.path.join(os.path.dirname(__file__), 'services/service_info.yaml')) as f:
        return yaml.safe_load(f)

app = Flask(__name__)

# Load services from API documentation (removed config argument)
services = load_services(os.path.join(os.path.dirname(__file__), 'services'))
service_info = load_service_info()

def get_vehicle_types(service_name):
    """Get supported vehicle types for a service"""
    service_data = service_info.get(service_name.lower(), {})
    return service_data.get('vehicle_types', ['Car'])  # Default to Car if not specified

def handle_xml_response(response, service):
    data = xmltodict.parse(response.text)
    # TODO: inform London API team about the incorrect key name
    times = data.get('tireChangeTimesResponse', {}).get('availableTime', []) # changed from 'availableTimes'
    if isinstance(times, dict):
        times = [times]
    vehicle_types = get_vehicle_types(service.name)
    return [{
        'time': t['time'], 
        'id': t['uuid'], 
        'location': service.name,
        'vehicleTypes': vehicle_types
    } for t in times]

def handle_json_list_response(times, service):
    vehicle_types = get_vehicle_types(service.name)
    return [{
        'time': t['time'], 
        'id': t['id'], 
        'location': service.name,
        'vehicleTypes': vehicle_types
    } for t in times if t.get('available', True)]

def handle_json_dict_response(times, service):
    vehicle_types = get_vehicle_types(service.name)
    return [{
        'time': t['time'], 
        'id': t['id'], 
        'location': service.name,
        'vehicleTypes': vehicle_types
    } for t in times['availableTimes']]

def get_api_params(service):
    today = datetime.now().strftime('%Y-%m-%d')
    future = (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')
    
    if 'v1' in service.available_times_path or service.content_type == 'text/xml':
        return {
            'from': today,
            'until': future
        }
    else:
        return {
            'from': today,
            'amount': 100,
            'page': 0,
            'until': future
        }

def build_url_with_params(base_url, path, params):
    """Construct full URL with parameters"""
    url = f"{base_url}{path}"
    # URL encode all parameter values
    param_strings = [f"{key}={quote(str(value))}" for key, value in params.items()]
    if param_strings:
        url += '?' + '&'.join(param_strings)
    return url

def get_service_times(service):
    print(f"Fetching times from {service.name}")
    
    headers = {'Accept': service.content_type, 'Content-Type': service.content_type}
    params = get_api_params(service)
    
    url = build_url_with_params(service.base_url, service.available_times_path, params)
    print(f"Fetching from {url}")
    
    response = requests.get(url, headers=headers)
    print(f"Response from {service.name}: {response.status_code}")
    if response.status_code != 200:
        print(f"Error fetching times from {service.name}: {response.text}")
        return []

    try:
        if service.content_type == 'text/xml':
            return handle_xml_response(response, service)
        else:  # JSON handling
            times = response.json()
            if isinstance(times, list):
                return handle_json_list_response(times, service)
            elif isinstance(times, dict) and 'availableTimes' in times:
                return handle_json_dict_response(times, service)
        return []
    except Exception as e:
        app.logger.error(f"Error parsing response from {service.name}: {e}")
        return []

def validate_booking_data(data):
    required = ['timeslotId', 'location', 'name', 'email', 'phone', 'vehicle', 'serviceType']
    if not all(field in data for field in required):
        print("Missing fields in request:", data)
        return False
    return True

def book_v1_timeslot(service, booking_data, timeslot_id):
    """Book a timeslot using V1 API"""
    url = f"{service.base_url}/v1/book"
    
    xml_data = f"""<?xml version="1.0" encoding="UTF-8"?>
    <bookingRequest>
        <uuid>{timeslot_id}</uuid>
        <customerName>{booking_data['name']}</customerName>
        <customerEmail>{booking_data['email']}</customerEmail>
        <customerPhone>{booking_data['phone']}</customerPhone>
        <vehicle>{booking_data['vehicle']}</vehicle>
        <serviceType>{booking_data['serviceType']}</serviceType>
    </bookingRequest>"""
    
    headers = {'Content-Type': 'text/xml'}
    response = requests.post(url, data=xml_data, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"Booking failed: {response.text}")
    
    result = xmltodict.parse(response.text)
    return {
        'booking_id': result['bookingResponse']['bookingId'],
        'status': 'confirmed'
    }

def book_v2_timeslot(service, booking_data, timeslot_id):
    """Book a timeslot using V2 API"""
    url = f"{service.base_url}/api/book/{timeslot_id}"
    
    json_data = {
        'customer': {
            'name': booking_data['name'],
            'email': booking_data['email'],
            'phone': booking_data['phone']
        },
        'vehicle': booking_data['vehicle'],
        'serviceType': booking_data['serviceType']
    }
    
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, json=json_data, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"Booking failed: {response.status_code}")
    
    result = response.json()
    return {
        'booking_id': result['id'],
        'status': result['status']
    }

@app.route('/api/book', methods=['POST'])
def book_appointment():
    data = request.get_json()
    print("Received booking request:", data)  # Debug print
    
    if not validate_booking_data(data):
        return jsonify({
            'success': False,
            'error': 'Missing required fields',
            'received_data': data  # Include received data in error response
        }), 400
    
    # Find the service for this location
    service = next((s for s in services if s.name == data['location']), None)
    if not service:
        return jsonify({
            'success': False,
            'error': f"Invalid location: {data['location']}"
        }), 400
    
    try:
        # Choose booking function based on API version
        if service.content_type == 'text/xml' or 'v1' in service.available_times_path:
            result = book_v1_timeslot(service, data, data['timeslotId'])
        else:
            result = book_v2_timeslot(service, data, data['timeslotId'])
        
        return jsonify({
            'success': True,
            'booking_id': result['booking_id'],
            'status': result['status'],
            'message': 'Booking confirmed successfully'
        })
        
    except Exception as e:
        app.logger.error(f"Booking error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to process booking',
            'message': str(e)
        }), 500

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/times')
def get_times():
    all_times = []
    
    for service in services:
        try:
            service_times = get_service_times(service)
            print(f"Number of times from {service.name}: {len(service_times)}")
            all_times.extend(service_times)
        except Exception as e:
            app.logger.error(f"Error fetching times from {service.name}: {e}")
    
    all_times.sort(key=lambda x: parse(x['time']))
    return jsonify(all_times)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
