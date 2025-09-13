#!/usr/bin/env python3
"""Example script demonstrating tunnel functionality"""

import requests
import json
import time


def main():
    base_url = "http://localhost:8000"
    
    print("=== Marzban Tunnel Example ===\n")
    
    # 1. List existing tunnels
    print("1. Listing existing tunnels...")
    try:
        response = requests.get(f"{base_url}/api/tunnels")
        response.raise_for_status()
        tunnels = response.json()
        print(f"Found {len(tunnels)} existing tunnels")
        for tunnel in tunnels:
            print(f"  - Tunnel {tunnel['id']}: {tunnel.get('name', 'Unnamed')} ({tunnel['status']})")
    except requests.RequestException as e:
        print(f"Error listing tunnels: {e}")
        return
    
    print()
    
    # 2. List available nodes
    print("2. Listing available nodes...")
    try:
        response = requests.get(f"{base_url}/api/nodes")
        response.raise_for_status()
        nodes = response.json()
        print(f"Found {len(nodes)} nodes:")
        for node in nodes:
            print(f"  - Node {node['id']}: {node['name']} ({node['address']})")
    except requests.RequestException as e:
        print(f"Error listing nodes: {e}")
        return
    
    if len(nodes) < 2:
        print("Need at least 2 nodes to create a tunnel")
        return
    
    print()
    
    # 3. Create a tunnel between first two nodes
    print("3. Creating tunnel between first two nodes...")
    source_node_id = nodes[0]['id']
    target_node_id = nodes[1]['id']
    
    tunnel_data = {
        "source_node_id": source_node_id,
        "target_node_id": target_node_id,
        "tunnel_type": "wireguard",
        "name": f"Tunnel {source_node_id} -> {target_node_id}",
        "is_active": True
    }
    
    try:
        response = requests.post(f"{base_url}/api/tunnels", json=tunnel_data)
        response.raise_for_status()
        tunnel = response.json()
        print(f"Created tunnel {tunnel['id']}: {tunnel['name']}")
        print(f"  Status: {tunnel['status']}")
        print(f"  Type: {tunnel['tunnel_type']}")
    except requests.RequestException as e:
        print(f"Error creating tunnel: {e}")
        return
    
    print()
    
    # 4. Check tunnel status
    print("4. Checking tunnel status...")
    tunnel_id = tunnel['id']
    
    try:
        response = requests.get(f"{base_url}/api/tunnels/{tunnel_id}/status")
        response.raise_for_status()
        status = response.json()
        print(f"Tunnel {tunnel_id} status: {status['status']}")
        print(f"  Active: {status['is_active']}")
        print(f"  Last updated: {status['last_updated']}")
    except requests.RequestException as e:
        print(f"Error getting tunnel status: {e}")
    
    print()
    
    # 5. Wait a bit and check status again
    print("5. Waiting 5 seconds and checking status again...")
    time.sleep(5)
    
    try:
        response = requests.get(f"{base_url}/api/tunnels/{tunnel_id}/status")
        response.raise_for_status()
        status = response.json()
        print(f"Tunnel {tunnel_id} status: {status['status']}")
    except requests.RequestException as e:
        print(f"Error getting tunnel status: {e}")
    
    print()
    
    # 6. Deactivate tunnel
    print("6. Deactivating tunnel...")
    try:
        response = requests.post(f"{base_url}/api/tunnels/{tunnel_id}/deactivate")
        response.raise_for_status()
        result = response.json()
        print(f"Deactivation result: {result['message']}")
    except requests.RequestException as e:
        print(f"Error deactivating tunnel: {e}")
    
    print()
    
    # 7. Check final status
    print("7. Checking final status...")
    try:
        response = requests.get(f"{base_url}/api/tunnels/{tunnel_id}/status")
        response.raise_for_status()
        status = response.json()
        print(f"Final tunnel status: {status['status']}")
        print(f"  Active: {status['is_active']}")
    except requests.RequestException as e:
        print(f"Error getting tunnel status: {e}")
    
    print()
    
    # 8. Clean up - delete tunnel
    print("8. Cleaning up - deleting tunnel...")
    try:
        response = requests.delete(f"{base_url}/api/tunnels/{tunnel_id}")
        response.raise_for_status()
        result = response.json()
        print(f"Deletion result: {result['message']}")
    except requests.RequestException as e:
        print(f"Error deleting tunnel: {e}")
    
    print("\n=== Example completed ===")


if __name__ == "__main__":
    main()
