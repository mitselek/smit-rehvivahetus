import pytest
from app import app, validate_booking_data, get_service_times, handle_xml_response, handle_json_list_response, handle_json_dict_response
import requests
import requests_mock
import json
from datetime import datetime, timedelta

class MockService:
    def __init__(self, name, base_url, available_times_path, content_type):
        self.name = name
        self.base_url = base_url
        self.available_times_path = available_times_path
        self.content_type = content_type

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_index(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'Tire Change Service Booking' in response.data

def test_validate_booking_data():
    valid_data = {
        'timeslotId': '123',
        'location': 'London',
        'name': 'John Doe',
        'email': 'john@example.com',
        'phone': '+37256560978',
        'vehicle': 'Toyota Corolla',
        'serviceType': 'Regular'
    }
    invalid_data = {
        'timeslotId': '123',
        'location': 'London',
        'name': 'John Doe'
        # Missing other fields
    }
    assert validate_booking_data(valid_data) == True
    assert validate_booking_data(invalid_data) == False

def test_get_service_times(requests_mock):
    service = MockService(
        name='London',
        base_url='http://localhost:9003',
        available_times_path='/api/v1/tire-change-times/available',
        content_type='text/xml'
    )
    today = datetime.now().strftime('%Y-%m-%d')
    future = (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')
    xml_response = """
    <tireChangeTimesResponse>
        <availableTime>
            <time>2025-03-15T14:30:00Z</time>
            <uuid>1</uuid>
        </availableTime>
    </tireChangeTimesResponse>
    """
    requests_mock.get(f'http://localhost:9003/api/v1/tire-change-times/available?from={today}&until={future}', text=xml_response)
    times = get_service_times(service)
    assert len(times) == 1
    assert times[0]['id'] == '1'
    assert times[0]['location'] == 'London'

def test_handle_xml_response():
    xml_response = """
    <tireChangeTimesResponse>
        <availableTime>
            <time>2025-03-15T14:30:00Z</time>
            <uuid>1</uuid>
        </availableTime>
    </tireChangeTimesResponse>
    """
    response = requests.Response()
    response._content = xml_response.encode('utf-8')
    response.status_code = 200
    service = MockService(
        name='London',
        base_url='http://localhost:9003',
        available_times_path='/api/v1/tire-change-times/available',
        content_type='text/xml'
    )
    times = handle_xml_response(response, service)
    assert len(times) == 1
    assert times[0]['id'] == '1'
    assert times[0]['location'] == 'London'

def test_handle_json_list_response():
    json_response = [
        {
            'time': '2025-03-15T14:30:00Z',
            'id': '1',
            'available': True
        }
    ]
    service = MockService(
        name='Manchester',
        base_url='http://localhost:9004',
        available_times_path='/api/v2/tire-change-times',
        content_type='application/json'
    )
    times = handle_json_list_response(json_response, service)
    assert len(times) == 1
    assert times[0]['id'] == '1'
    assert times[0]['location'] == 'Manchester'

def test_handle_json_dict_response():
    json_response = {
        'availableTimes': [
            {
                'time': '2025-03-15T14:30:00Z',
                'id': '1'
            }
        ]
    }
    service = MockService(
        name='Manchester',
        base_url='http://localhost:9004',
        available_times_path='/api/v2/tire-change-times',
        content_type='application/json'
    )
    times = handle_json_dict_response(json_response, service)
    assert len(times) == 1
    assert times[0]['id'] == '1'
    assert times[0]['location'] == 'Manchester'

def test_get_times(client, requests_mock):
    today = datetime.now().strftime('%Y-%m-%d')
    future = (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')
    london_response = """
    <tireChangeTimesResponse>
        <availableTime>
            <time>2025-03-15T14:30:00Z</time>
            <uuid>1</uuid>
        </availableTime>
    </tireChangeTimesResponse>
    """
    manchester_response = [
        {
            'time': '2025-03-16T10:00:00Z',
            'id': '2',
            'available': True
        }
    ]
    requests_mock.get(f'http://localhost:9003/api/v1/tire-change-times/available?from={today}&until={future}', text=london_response)
    requests_mock.get(f'http://localhost:9004/api/v2/tire-change-times?amount=100&page=0&from={today}&until={future}', json=manchester_response)
    
    response = client.get('/api/times')
    assert response.status_code == 200
    times = response.get_json()
    assert len(times) == 2
    assert times[0]['location'] == 'London'
    assert times[1]['location'] == 'Manchester'

def test_book_appointment(client, requests_mock):
    booking_data = {
        'timeslotId': '1',
        'location': 'London',
        'name': 'John Doe',
        'email': 'john@example.com',
        'phone': '+37256560978',
        'vehicle': 'Toyota Corolla',
        'serviceType': 'Regular'
    }
    requests_mock.put('http://localhost:9003/tire-change-times/1/booking', text='<response><status>confirmed</status></response>')
    
    response = client.post('/api/book', json=booking_data)
    assert response.status_code == 200
    result = response.get_json()
    assert result['success'] == True
    assert result['booking_id'] == '1'
    assert result['status'] == 'confirmed'

def test_book_appointment_invalid_data(client):
    booking_data = {
        'timeslotId': '1',
        'location': 'London'
        # Missing other fields
    }
    response = client.post('/api/book', json=booking_data)
    assert response.status_code == 400
    result = response.get_json()
    assert result['success'] == False
    assert 'Missing required fields' in result['error']

def test_book_appointment_invalid_location(client):
    booking_data = {
        'timeslotId': '1',
        'location': 'InvalidLocation',
        'name': 'John Doe',
        'email': 'john@example.com',
        'phone': '+37256560978',
        'vehicle': 'Toyota Corolla',
        'serviceType': 'Regular'
    }
    response = client.post('/api/book', json=booking_data)
    assert response.status_code == 400
    result = response.get_json()
    assert result['success'] == False
    assert 'Invalid location' in result['error']
