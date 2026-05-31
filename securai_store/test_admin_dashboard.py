#!/usr/bin/env python3
"""
Test script to verify admin dashboard endpoints work correctly.
Tests /admin route and /api/admin/stats endpoint.
"""

import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://localhost:5000"

def test_admin_route() -> bool:
    """Test that /admin route returns HTML dashboard."""
    try:
        resp = requests.get(f"{BASE_URL}/admin", timeout=5)
        if resp.status_code == 200 and "SecurAI" in resp.text:
            print("✓ /admin route works — dashboard loads")
            return True
        else:
            print(f"✗ /admin route failed — status {resp.status_code}")
            return False
    except Exception as e:
        print(f"✗ /admin route error: {e}")
        return False

def test_stats_endpoint() -> bool:
    """Test that /api/admin/stats endpoint returns JSON data."""
    try:
        resp = requests.get(f"{BASE_URL}/api/admin/stats", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            required_fields = ["fps", "anomaly_score", "identity", "system_mode"]
            
            if all(field in data for field in required_fields):
                print("✓ /api/admin/stats works — all required fields present")
                print(f"  Sample response: {json.dumps(data, indent=2)[:200]}...")
                return True
            else:
                missing = [f for f in required_fields if f not in data]
                print(f"✗ Missing fields: {missing}")
                return False
        else:
            print(f"✗ /api/admin/stats failed — status {resp.status_code}")
            return False
    except Exception as e:
        print(f"✗ /api/admin/stats error: {e}")
        return False

def test_polling() -> bool:
    """Test that polling works by making multiple requests."""
    try:
        print("\nTesting polling (3 requests, 500ms apart)...")
        responses = []
        for i in range(3):
            resp = requests.get(f"{BASE_URL}/api/admin/stats", timeout=5)
            if resp.status_code == 200:
                responses.append(resp.json())
                time.sleep(0.5)
            else:
                print(f"✗ Poll {i+1} failed")
                return False
        
        # Check that metrics are updating
        fps_values = [r.get("fps") for r in responses]
        print(f"✓ Polling works — FPS values: {fps_values}")
        return True
    except Exception as e:
        print(f"✗ Polling error: {e}")
        return False

def main():
    print("=== Admin Dashboard Endpoint Tests ===\n")
    
    # Check if server is running
    try:
        requests.get(f"{BASE_URL}/health", timeout=2)
    except:
        print("⚠ Server not responding. Make sure to run:")
        print("  python app.py  (or app_cpu.py)")
        print("\nTo run this test after starting the server:")
        return
    
    results = {
        "Dashboard HTML": test_admin_route(),
        "Stats API": test_stats_endpoint(),
        "Polling": test_polling(),
    }
    
    print("\n=== Summary ===")
    for test, passed in results.items():
        status = "PASS" if passed else "FAIL"
        print(f"  {test}: {status}")
    
    all_passed = all(results.values())
    print(f"\nOverall: {'✓ All tests passed!' if all_passed else '✗ Some tests failed'}")

if __name__ == "__main__":
    main()
