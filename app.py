from flask import Flask, render_template, jsonify
import requests
import xmltodict
from datetime import datetime, timedelta
from dateutil.parser import parse
import os
from services import load_services
from urllib.parse import quote

app = Flask(__name__)

# Load services from API documentation (removed config argument)
services = load_services(os.path.join(os.path.dirname(__file__), 'services'))

def handle_xml_response(response, service):
    data = xmltodict.parse(response.text)
    # TODO: inform London API team about the incorrect key name
    times = data.get('tireChangeTimesResponse', {}).get('availableTime', []) # changed from 'availableTimes'
    if isinstance(times, dict):
        times = [times]
    return [{'time': t['time'], 'id': t['uuid'], 'location': service.name} for t in times]

def handle_json_list_response(times, service):
    return [{'time': t['time'], 'id': t['id'], 'location': service.name} 
            for t in times if t.get('available', True)]

def handle_json_dict_response(times, service):
    return [{'time': t['time'], 'id': t['id'], 'location': service.name} 
            for t in times['availableTimes']]

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
