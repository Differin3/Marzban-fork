import subprocess
import json
import requests
from pathlib import Path
from typing import Optional, Tuple
from app.db.models import Node, Tunnel


class TunnelManager:
    def __init__(self, config_dir="/etc/marzban/tunnels"):
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(parents=True, exist_ok=True)
    
    def setup_wireguard_tunnel(self, config: dict, tunnel_id: int, node: Node) -> bool:
        """Настраивает WireGuard туннель на удаленном узле"""
        try:
            # Отправляем конфигурацию на узел через API
            node_url = f"http://{node.address}:{node.api_port}/api/tunnel"
            response = requests.post(
                node_url,
                json=config,
                headers={"X-Key": getattr(node, 'xkey', 'default-key')},
                timeout=30
            )
            
            if response.status_code == 200:
                return True
            else:
                print(f"Ошибка при настройке туннеля: {response.text}")
                return False
                
        except requests.RequestException as e:
            print(f"Ошибка подключения к узлу {node.name}: {e}")
            return False
    
    def remove_wireguard_tunnel(self, tunnel_id: int, node: Node) -> bool:
        """Удаляет WireGuard туннель с удаленного узла"""
        try:
            node_url = f"http://{node.address}:{node.api_port}/api/tunnel/{tunnel_id}"
            response = requests.delete(
                node_url,
                headers={"X-Key": getattr(node, 'xkey', 'default-key')},
                timeout=30
            )
            
            if response.status_code == 200:
                return True
            else:
                print(f"Ошибка при удалении туннеля: {response.text}")
                return False
                
        except requests.RequestException as e:
            print(f"Ошибка подключения к узлу {node.name}: {e}")
            return False
    
    def generate_wireguard_keys(self) -> Tuple[Optional[str], Optional[str]]:
        """Генерирует пару ключей WireGuard"""
        try:
            # Генерируем приватный ключ
            private_key = subprocess.run(
                ["wg", "genkey"],
                capture_output=True, text=True, check=True
            ).stdout.strip()
            
            # Генерируем публичный ключ из приватного
            public_key = subprocess.run(
                ["wg", "pubkey"],
                input=private_key, capture_output=True, text=True, check=True
            ).stdout.strip()
            
            return private_key, public_key
            
        except subprocess.CalledProcessError as e:
            print(f"Ошибка генерации ключей: {e}")
            return None, None
        except FileNotFoundError:
            print("WireGuard не установлен. Установите wireguard-tools")
            return None, None
    
    def generate_wireguard_config(self, tunnel: Tunnel, source_node: Node, target_node: Node) -> dict:
        """Генерирует конфигурацию WireGuard туннеля"""
        # Генерируем ключи
        private_key, public_key = self.generate_wireguard_keys()
        
        if not private_key or not public_key:
            raise Exception("Не удалось сгенерировать ключи WireGuard")
        
        config = {
            "id": tunnel.id,
            "type": "wireguard",
            "name": tunnel.name or f"tunnel-{tunnel.id}",
            "config": {
                "interface": {
                    "privateKey": private_key,
                    "address": f"10.0.{tunnel.id}.1/24",
                    "listenPort": 51820 + tunnel.id
                },
                "peer": {
                    "publicKey": "<TARGET_PUBLIC_KEY>",  # Нужно получить с целевого узла
                    "endpoint": f"{target_node.address}:{51820 + tunnel.id}",
                    "allowedIPs": ["0.0.0.0/0"],
                    "persistentKeepalive": 25
                }
            }
        }
        return config
    
    def get_tunnel_status(self, tunnel_id: int, node: Node) -> Optional[str]:
        """Получает статус туннеля с узла"""
        try:
            node_url = f"http://{node.address}:{node.api_port}/api/tunnel/{tunnel_id}/status"
            response = requests.get(
                node_url,
                headers={"X-Key": getattr(node, 'xkey', 'default-key')},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json().get("status", "unknown")
            else:
                return "error"
                
        except requests.RequestException:
            return "error"
