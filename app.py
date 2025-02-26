from flask import Flask, render_template, jsonify
import requests
import xmltodict
from datetime import datetime, timedelta
from dateutil.parser import parse
import os
from services import load_services

app = Flask(__name__)

# Load services from API documentation (removed config argument)
services = load_services(os.path.join(os.path.dirname(__file__), 'services'))

def get_service_times(service):
    today = datetime.now().strftime('%Y-%m-%d')
    future = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
    
    headers = {'Accept': service.content_type, 'Content-Type': service.content_type}
    params = {
        'from': today,
        'amount': 100,
        'page': 0
    }
    
    # Add specific parameters for different API versions
    if 'until' in service.available_times_path:
        params['until'] = future
    
    response = requests.get(
        f"{service.base_url}{service.available_times_path}",
        params=params,
        headers=headers
    )
    
    if response.status_code != 200:
        return []
        
    if service.content_type == 'text/xml':
        data = xmltodict.parse(response.text)
        times = data.get('tireChangeTimesResponse', {}).get('availableTimes', [])
        if isinstance(times, dict):
            times = [times]
        return [{'time': t['time'], 'id': t['uuid'], 'location': service.name} for t in times]
    else:
        times = response.json()
        if isinstance(times, list):
            return [{'time': t['time'], 'id': t['id'], 'location': service.name} 
                   for t in times if t.get('available', True)]
        elif isinstance(times, dict) and 'availableTimes' in times:
            return [{'time': t['time'], 'id': t['id'], 'location': service.name} 
                   for t in times['availableTimes']]
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
            all_times.extend(service_times)
        except Exception as e:
            app.logger.error(f"Error fetching times from {service.name}: {e}")
    
    all_times.sort(key=lambda x: parse(x['time']))
    return jsonify(all_times)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
