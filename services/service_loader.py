"""
This module provides functionality to load service configurations from API documentation files.

It parses Swagger/OpenAPI JSON documents in the given directory and returns a list of Service
objects, each representing an API service with its base URL, content type, and endpoint paths.

Module Contents:
    - Service: A dataclass representing the service configuration.
    - _find_endpoint: Helper function for finding endpoints by HTTP method and keyword.
    - load_services: Function to load and parse API documentation files.
"""

import json
import os
import yaml
import logging
from dataclasses import dataclass
from typing import List, Dict, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Service:
    """
    Represents a service configuration extracted from an API documentation file.

    Attributes:
        name (str): The service name (e.g., London, Manchester).
        version (str): The API version.
        base_url (str): The base URL combining "host" and "basePath" fields.
        content_type (str): The content type used for API calls (e.g., application/json, text/xml).
        available_times_path (str): The endpoint path to fetch available times.
        booking_path (str): The endpoint path for booking a tire change time.
        address (str): The address of the service.
        vehicle_types (List[str]): The types of vehicles supported by the service.
    """
    name: str
    version: str
    base_url: str
    content_type: str
    available_times_path: str
    booking_path: str
    address: str
    vehicle_types: List[str]

def _find_endpoint(paths: Dict, method: str, keyword: str) -> Optional[str]:
    """
    Searches for an endpoint in the provided paths dictionary that contains the specified keyword.

    Args:
        paths (Dict): A dictionary of endpoint paths from the API doc.
        method (str): The HTTP method to search for (e.g., 'get', 'post', 'put').
        keyword (str): A keyword that should appear in the path (e.g., 'availableTimes', 'booking').

    Returns:
        Optional[str]: The matching endpoint path if found; otherwise, None.
    """
    for path, operations in paths.items():
        if method in operations and keyword in path:
            return path
    return None

def _load_service_info(services_dir: str) -> Dict:
    """
    Load additional service information from YAML file.

    Args:
        services_dir (str): The directory containing the service information file.

    Returns:
        Dict: A dictionary containing additional service information.
    """
    info_path = os.path.join(services_dir, 'service_info.yaml')
    if not os.path.exists(info_path):
        return {}
    
    with open(info_path, 'r') as f:
        return yaml.safe_load(f)

def _validate_service_doc(doc: Dict, filename: str) -> bool:
    """Validate that the service documentation has all required fields."""
    required_fields = {
        'info': {'title'},
        'paths': dict
    }
    
    if not isinstance(doc.get('info'), dict):
        logger.error(f"Missing or invalid 'info' object in {filename}")
        return False
        
    if not doc['info'].get('title'):
        logger.error(f"Missing service title in {filename}")
        return False
        
    if not isinstance(doc.get('paths'), dict):
        logger.error(f"Missing or invalid 'paths' object in {filename}")
        return False
        
    return True

def load_services(services_dir: str) -> List[Service]:
    """
    Loads and parses API documentation files from the specified directory to build service configurations.

    The function searches for files ending with '_doc.json', extracts required information such as
    service name, version, base URL (using "host" and "basePath"), content type, and endpoint paths.

    Args:
        services_dir (str): The directory containing API documentation files.

    Raises:
        FileNotFoundError: If the provided services directory does not exist.

    Returns:
        List[Service]: A list of Service objects configured based on the parsed documentation.
    """
    services = []
    service_info = _load_service_info(services_dir)
    
    if not os.path.exists(services_dir):
        raise FileNotFoundError(f"Services directory not found: {services_dir}")
    
    logger.info(f"Scanning directory: {services_dir}")
    
    for filename in os.listdir(services_dir):
        if not filename.endswith('_doc.json'):
            continue
        
        logger.info(f"Processing service file: {filename}")
        filepath = os.path.join(services_dir, filename)
        
        try:
            with open(filepath, 'r') as f:
                doc = json.load(f)
            
            if not _validate_service_doc(doc, filename):
                logger.warning(f"Skipping invalid service doc: {filename}")
                continue

            name = doc.get('info', {}).get('title', '').split()[0]
            if not name:
                logger.error(f"Service name not found in {filename}")
                continue

            # Extract service name and version
            name = doc.get('info', {}).get('title', '').split()[0]
            version = doc.get('info', {}).get('version', '1.0')
            
            # Determine base URL from API docs (using "host" and "basePath")
            host = doc.get('host', '').strip()
            base_path = doc.get('basePath', '').strip()
            if host:
                base_url = host + base_path
            else:
                base_url = "http://localhost" + base_path
            
            # Get content type from the first available endpoint
            first_path = next(iter(doc.get('paths', {}).values()), {})
            first_method = next(iter(first_path.values()), {})
            content_type = first_method.get('consumes', ['application/json'])[0]
            
            # Identify available times endpoint
            available_times_path = _find_endpoint(doc.get('paths', {}), 'get', 'availableTimes')
            if available_times_path is None:
                # Fallback: try with "available" as keyword
                available_times_path = _find_endpoint(doc.get('paths', {}), 'get', 'available')
            if available_times_path is None:
                # Fallback: choose the first GET endpoint available
                for path, operations in doc.get('paths', {}).items():
                    if 'get' in operations:
                        available_times_path = path
                        break
            
            # Identify booking endpoint: try 'post' then fallback to 'put'
            booking_path = _find_endpoint(doc.get('paths', {}), 'post', 'booking')
            if booking_path is None:
                booking_path = _find_endpoint(doc.get('paths', {}), 'put', 'booking')

            if not available_times_path:
                logger.warning(f"Available times endpoint not found for {name}")
            if not booking_path:
                logger.warning(f"Booking endpoint not found for {name}")

            # Get additional info from service_info.yaml
            name_lower = name.lower()
            info = service_info.get(name_lower, {})
            if not info:
                logger.warning(f"No additional info found for {name} in service_info.yaml")
            address = info.get('address', 'Address not available')
            vehicle_types = info.get('vehicle_types', [])

            service = Service(
                name=name,
                version=version,
                base_url=base_url,
                content_type=content_type,
                available_times_path=available_times_path,
                booking_path=booking_path,
                address=address,
                vehicle_types=vehicle_types
            )
            services.append(service)
            logger.info(f"Successfully loaded service: {name} with base URL: {base_url}")
            
        except Exception as e:
            logger.error(f"Error processing {filename}: {str(e)}")

    logger.info(f"Total services loaded: {len(services)}")
    return services


