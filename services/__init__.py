"""
This package provides functionality for loading service configurations from API documentation files.
It parses Swagger/OpenAPI JSON documents found in this directory and creates Service objects
which are later used to communicate with different tire workshop APIs.

Modules:
    service_loader: Contains the Service dataclass and load_services() function.
"""

from .service_loader import load_services, Service

__all__ = ['load_services', 'Service']
