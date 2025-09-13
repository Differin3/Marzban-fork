#!/usr/bin/env python3
"""CLI tool for managing Marzban tunnels"""

import argparse
import requests
import json
import sys
from typing import Optional


class TunnelCLI:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
    
    def list_tunnels(self, skip: int = 0, limit: int = 100):
        """List all tunnels"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/tunnels",
                params={"skip": skip, "limit": limit}
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error listing tunnels: {e}")
            return None
    
    def create_tunnel(self, source_node_id: int, target_node_id: int, 
                     tunnel_type: str = "wireguard", name: Optional[str] = None):
        """Create a new tunnel"""
        data = {
            "source_node_id": source_node_id,
            "target_node_id": target_node_id,
            "tunnel_type": tunnel_type,
            "is_active": True
        }
        if name:
            data["name"] = name
        
        try:
            response = self.session.post(f"{self.base_url}/api/tunnels", json=data)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error creating tunnel: {e}")
            return None
    
    def get_tunnel(self, tunnel_id: int):
        """Get tunnel by ID"""
        try:
            response = self.session.get(f"{self.base_url}/api/tunnels/{tunnel_id}")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error getting tunnel: {e}")
            return None
    
    def update_tunnel(self, tunnel_id: int, **kwargs):
        """Update tunnel"""
        try:
            response = self.session.put(f"{self.base_url}/api/tunnels/{tunnel_id}", json=kwargs)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error updating tunnel: {e}")
            return None
    
    def delete_tunnel(self, tunnel_id: int):
        """Delete tunnel"""
        try:
            response = self.session.delete(f"{self.base_url}/api/tunnels/{tunnel_id}")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error deleting tunnel: {e}")
            return None
    
    def activate_tunnel(self, tunnel_id: int):
        """Activate tunnel"""
        try:
            response = self.session.post(f"{self.base_url}/api/tunnels/{tunnel_id}/activate")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error activating tunnel: {e}")
            return None
    
    def deactivate_tunnel(self, tunnel_id: int):
        """Deactivate tunnel"""
        try:
            response = self.session.post(f"{self.base_url}/api/tunnels/{tunnel_id}/deactivate")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error deactivating tunnel: {e}")
            return None
    
    def get_tunnel_status(self, tunnel_id: int):
        """Get tunnel status"""
        try:
            response = self.session.get(f"{self.base_url}/api/tunnels/{tunnel_id}/status")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error getting tunnel status: {e}")
            return None


def main():
    parser = argparse.ArgumentParser(description="Marzban Tunnel CLI")
    parser.add_argument("--url", default="http://localhost:8000", help="Marzban API URL")
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # List tunnels
    list_parser = subparsers.add_parser("list", help="List tunnels")
    list_parser.add_argument("--skip", type=int, default=0, help="Number of tunnels to skip")
    list_parser.add_argument("--limit", type=int, default=100, help="Maximum number of tunnels to return")
    
    # Create tunnel
    create_parser = subparsers.add_parser("create", help="Create a tunnel")
    create_parser.add_argument("source_node_id", type=int, help="Source node ID")
    create_parser.add_argument("target_node_id", type=int, help="Target node ID")
    create_parser.add_argument("--type", default="wireguard", choices=["wireguard", "openvpn", "ipsec"], help="Tunnel type")
    create_parser.add_argument("--name", help="Tunnel name")
    
    # Get tunnel
    get_parser = subparsers.add_parser("get", help="Get tunnel by ID")
    get_parser.add_argument("tunnel_id", type=int, help="Tunnel ID")
    
    # Update tunnel
    update_parser = subparsers.add_parser("update", help="Update tunnel")
    update_parser.add_argument("tunnel_id", type=int, help="Tunnel ID")
    update_parser.add_argument("--name", help="Tunnel name")
    update_parser.add_argument("--active", type=bool, help="Tunnel active status")
    
    # Delete tunnel
    delete_parser = subparsers.add_parser("delete", help="Delete tunnel")
    delete_parser.add_argument("tunnel_id", type=int, help="Tunnel ID")
    
    # Activate tunnel
    activate_parser = subparsers.add_parser("activate", help="Activate tunnel")
    activate_parser.add_argument("tunnel_id", type=int, help="Tunnel ID")
    
    # Deactivate tunnel
    deactivate_parser = subparsers.add_parser("deactivate", help="Deactivate tunnel")
    deactivate_parser.add_argument("tunnel_id", type=int, help="Tunnel ID")
    
    # Get status
    status_parser = subparsers.add_parser("status", help="Get tunnel status")
    status_parser.add_argument("tunnel_id", type=int, help="Tunnel ID")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    cli = TunnelCLI(args.url)
    
    if args.command == "list":
        tunnels = cli.list_tunnels(args.skip, args.limit)
        if tunnels:
            print(json.dumps(tunnels, indent=2))
    
    elif args.command == "create":
        tunnel = cli.create_tunnel(
            args.source_node_id, 
            args.target_node_id, 
            args.type, 
            args.name
        )
        if tunnel:
            print(json.dumps(tunnel, indent=2))
    
    elif args.command == "get":
        tunnel = cli.get_tunnel(args.tunnel_id)
        if tunnel:
            print(json.dumps(tunnel, indent=2))
    
    elif args.command == "update":
        update_data = {}
        if args.name is not None:
            update_data["name"] = args.name
        if args.active is not None:
            update_data["is_active"] = args.active
        
        tunnel = cli.update_tunnel(args.tunnel_id, **update_data)
        if tunnel:
            print(json.dumps(tunnel, indent=2))
    
    elif args.command == "delete":
        result = cli.delete_tunnel(args.tunnel_id)
        if result:
            print(json.dumps(result, indent=2))
    
    elif args.command == "activate":
        result = cli.activate_tunnel(args.tunnel_id)
        if result:
            print(json.dumps(result, indent=2))
    
    elif args.command == "deactivate":
        result = cli.deactivate_tunnel(args.tunnel_id)
        if result:
            print(json.dumps(result, indent=2))
    
    elif args.command == "status":
        status = cli.get_tunnel_status(args.tunnel_id)
        if status:
            print(json.dumps(status, indent=2))


if __name__ == "__main__":
    main()
