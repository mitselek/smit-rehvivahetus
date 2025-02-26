import pytest
import os
import json
import yaml
from services.service_loader import load_services, _find_endpoint, Service

@pytest.fixture
def test_services_dir(tmp_path):
    """Create a temporary directory with test API documentation files."""
    services_dir = tmp_path / "services"
    services_dir.mkdir()
    
    # Create mock London API doc
    london_doc = {
        "info": {"title": "London API", "version": "1.0"},
        "host": "api.london.test",
        "basePath": "/v1",
        "paths": {
            "/available-times": {"get": {"consumes": ["application/json"]}},
            "/booking": {"post": {}}
        }
    }
    
    # Create mock Manchester API doc
    manchester_doc = {
        "info": {"title": "Manchester API", "version": "2.0"},
        "host": "api.manchester.test",
        "basePath": "/v2",
        "paths": {
            "/availableTimes": {"get": {"consumes": ["application/json"]}},
            "/make-booking": {"post": {}}
        }
    }
    
    # Create service info file
    service_info = {
        "london": {
            "address": "Test London Address",
            "vehicle_types": ["Sõiduauto"]
        },
        "manchester": {
            "address": "Test Manchester Address",
            "vehicle_types": ["Sõiduauto", "Veoauto"]
        }
    }
    
    # Write test files
    (services_dir / "london_doc.json").write_text(json.dumps(london_doc))
    (services_dir / "manchester_doc.json").write_text(json.dumps(manchester_doc))
    (services_dir / "service_info.yaml").write_text(yaml.dump(service_info))
    
    return services_dir

def test_load_services(test_services_dir):
    """Test loading multiple services from documentation files."""
    services = load_services(str(test_services_dir))
    
    assert len(services) == 2
    
    # Test London service
    london = next(s for s in services if s.name == "London")
    assert london.base_url == "api.london.test/v1"
    assert london.available_times_path == "/available-times"
    assert london.booking_path == "/booking"
    assert london.vehicle_types == ["Sõiduauto"]
    
    # Test Manchester service
    manchester = next(s for s in services if s.name == "Manchester")
    assert manchester.base_url == "api.manchester.test/v2"
    assert manchester.available_times_path == "/availableTimes"
    assert manchester.booking_path == "/make-booking"
    assert manchester.vehicle_types == ["Sõiduauto", "Veoauto"]

def test_find_endpoint():
    """Test endpoint finding logic."""
    paths = {
        "/available-times": {"get": {}},
        "/booking": {"post": {}},
        "/other": {"get": {}}
    }
    
    assert _find_endpoint(paths, "get", "available") == "/available-times"
    assert _find_endpoint(paths, "post", "booking") == "/booking"
    assert _find_endpoint(paths, "get", "nonexistent") is None

def test_missing_services_dir():
    """Test handling of missing services directory."""
    with pytest.raises(FileNotFoundError):
        load_services("/nonexistent/path")

def test_malformed_service_doc(test_services_dir):
    """Test handling of malformed service documentation."""
    # Create various malformed API docs
    malformed_docs = [
        {
            "info": {"title": ""}  # Empty title
        },
        {
            "info": {"title": "Broken API"}  # Missing paths
        },
        {
            "paths": {}  # Missing info
        }
    ]
    
    for i, doc in enumerate(malformed_docs):
        malformed_path = test_services_dir / f"malformed_doc_{i}.json"
        malformed_path.write_text(json.dumps(doc))
    
    services = load_services(str(test_services_dir))
    # Should only load the valid services (London and Manchester)
    assert len(services) == 2
    service_names = {s.name for s in services}
    assert service_names == {"London", "Manchester"}

def test_service_without_info(test_services_dir):
    """Test loading service with missing info file entry."""
    # Add a new service without corresponding info
    new_doc = {
        "info": {"title": "Cardiff API", "version": "1.0"},
        "host": "api.cardiff.test",
        "basePath": "/v1",
        "paths": {
            "/available": {"get": {}},
            "/book": {"post": {}}
        }
    }
    
    (test_services_dir / "cardiff_doc.json").write_text(json.dumps(new_doc))
    
    services = load_services(str(test_services_dir))
    cardiff = next(s for s in services if s.name == "Cardiff")
    assert cardiff.address == "Address not available"
    assert cardiff.vehicle_types == []

def test_xml_content_type(test_services_dir):
    """Test loading a service that uses XML content type."""
    xml_doc = {
        "info": {"title": "XML API", "version": "1.0"},
        "host": "api.xml.test",
        "basePath": "/v1",
        "paths": {
            "/available": {
                "get": {"consumes": ["application/xml"]}
            },
            "/booking": {
                "post": {"consumes": ["application/xml"]}
            }
        }
    }
    
    (test_services_dir / "xml_doc.json").write_text(json.dumps(xml_doc))
    
    services = load_services(str(test_services_dir))
    xml_service = next(s for s in services if s.name == "XML")
    assert xml_service.content_type == "application/xml"
    assert xml_service.available_times_path == "/available"
    assert xml_service.booking_path == "/booking"
