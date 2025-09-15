"""
Tunnel Service for Marzban-node
Управление туннелями на узле Marzban
"""

import subprocess
import json
import os
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from logger import logger

# Создаем роутер для туннелей
tunnel_router = APIRouter(prefix="/api/tunnel", tags=["Tunnels"])

# Директория для конфигураций WireGuard
WIREGUARD_CONFIG_DIR = Path("/etc/wireguard")
WIREGUARD_CONFIG_DIR.mkdir(parents=True, exist_ok=True)

class TunnelConfig(BaseModel):
    """Конфигурация туннеля"""
    interface: Dict[str, Any]
    peer: Dict[str, Any]

class TunnelResponse(BaseModel):
    """Ответ API туннеля"""
    status: str
    message: str
    tunnel_id: Optional[int] = None

def verify_x_key(x_key: str = Header(None, alias="X-Key")):
    """Проверка API ключа"""
    # TODO: Реализовать проверку ключа
    # Пока что принимаем любой ключ
    if not x_key:
        raise HTTPException(status_code=401, detail="X-Key header required")
    return x_key

def generate_wireguard_config(config: TunnelConfig, tunnel_id: int) -> str:
    """Генерирует конфигурацию WireGuard"""
    wg_config = f"""[Interface]
PrivateKey = {config.interface['privateKey']}
Address = {config.interface['address']}
ListenPort = {config.interface['listenPort']}

[Peer]
PublicKey = {config.peer['publicKey']}
Endpoint = {config.peer['endpoint']}
AllowedIPs = {', '.join(config.peer['allowedIPs'])}
PersistentKeepalive = {config.peer.get('persistentKeepalive', 25)}
"""
    return wg_config

def is_wireguard_available() -> bool:
    """Проверяет доступность WireGuard"""
    try:
        result = subprocess.run(['wg', '--version'], 
                              capture_output=True, text=True, timeout=5)
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False

def get_tunnel_status(tunnel_id: int) -> str:
    """Получает статус туннеля"""
    try:
        result = subprocess.run(['wg', 'show', f'tunnel_{tunnel_id}'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0 and result.stdout.strip():
            return "active"
        else:
            return "inactive"
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return "error"

@tunnel_router.post("/", response_model=TunnelResponse)
async def setup_tunnel(
    config: TunnelConfig, 
    x_key: str = Depends(verify_x_key)
):
    """Настройка туннеля на узле"""
    try:
        # Проверяем доступность WireGuard
        if not is_wireguard_available():
            raise HTTPException(
                status_code=500, 
                detail="WireGuard not available on this node"
            )
        
        # Получаем ID туннеля из порта
        tunnel_id = config.interface.get('listenPort', 51820) - 51820 + 1
        
        # Генерируем конфигурацию
        wg_config = generate_wireguard_config(config, tunnel_id)
        
        # Сохраняем конфигурацию
        config_path = WIREGUARD_CONFIG_DIR / f"tunnel_{tunnel_id}.conf"
        with open(config_path, 'w') as f:
            f.write(wg_config)
        
        # Устанавливаем права доступа
        os.chmod(config_path, 0o600)
        
        # Запускаем WireGuard
        result = subprocess.run([
            'wg-quick', 'up', f'tunnel_{tunnel_id}'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            logger.info(f"Tunnel {tunnel_id} configured successfully")
            return TunnelResponse(
                status="success", 
                message="Tunnel configured successfully",
                tunnel_id=tunnel_id
            )
        else:
            logger.error(f"Failed to configure tunnel {tunnel_id}: {result.stderr}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to configure tunnel: {result.stderr}"
            )
            
    except Exception as e:
        logger.error(f"Error setting up tunnel: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@tunnel_router.delete("/{tunnel_id}", response_model=TunnelResponse)
async def remove_tunnel(
    tunnel_id: int, 
    x_key: str = Depends(verify_x_key)
):
    """Удаление туннеля с узла"""
    try:
        # Останавливаем WireGuard
        result = subprocess.run([
            'wg-quick', 'down', f'tunnel_{tunnel_id}'
        ], capture_output=True, text=True, timeout=30)
        
        # Удаляем конфигурацию
        config_path = WIREGUARD_CONFIG_DIR / f"tunnel_{tunnel_id}.conf"
        if config_path.exists():
            config_path.unlink()
        
        logger.info(f"Tunnel {tunnel_id} removed successfully")
        return TunnelResponse(
            status="success", 
            message="Tunnel removed successfully",
            tunnel_id=tunnel_id
        )
        
    except Exception as e:
        logger.error(f"Error removing tunnel {tunnel_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@tunnel_router.get("/{tunnel_id}/status", response_model=TunnelResponse)
async def get_tunnel_status_endpoint(
    tunnel_id: int, 
    x_key: str = Depends(verify_x_key)
):
    """Получение статуса туннеля"""
    try:
        status = get_tunnel_status(tunnel_id)
        return TunnelResponse(
            status="success",
            message=f"Tunnel status: {status}",
            tunnel_id=tunnel_id
        )
    except Exception as e:
        logger.error(f"Error getting tunnel status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@tunnel_router.get("/", response_model=Dict[str, Any])
async def list_tunnels(x_key: str = Depends(verify_x_key)):
    """Получение списка всех туннелей"""
    try:
        tunnels = []
        
        # Получаем список всех конфигураций
        for config_file in WIREGUARD_CONFIG_DIR.glob("tunnel_*.conf"):
            tunnel_id = int(config_file.stem.split('_')[1])
            status = get_tunnel_status(tunnel_id)
            
            tunnels.append({
                "tunnel_id": tunnel_id,
                "status": status,
                "config_file": str(config_file)
            })
        
        return {
            "status": "success",
            "tunnels": tunnels,
            "total": len(tunnels)
        }
        
    except Exception as e:
        logger.error(f"Error listing tunnels: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@tunnel_router.post("/{tunnel_id}/restart", response_model=TunnelResponse)
async def restart_tunnel(
    tunnel_id: int, 
    x_key: str = Depends(verify_x_key)
):
    """Перезапуск туннеля"""
    try:
        # Останавливаем туннель
        subprocess.run(['wg-quick', 'down', f'tunnel_{tunnel_id}'], 
                      capture_output=True, text=True, timeout=30)
        
        # Запускаем туннель
        result = subprocess.run([
            'wg-quick', 'up', f'tunnel_{tunnel_id}'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            logger.info(f"Tunnel {tunnel_id} restarted successfully")
            return TunnelResponse(
                status="success", 
                message="Tunnel restarted successfully",
                tunnel_id=tunnel_id
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to restart tunnel: {result.stderr}"
            )
            
    except Exception as e:
        logger.error(f"Error restarting tunnel {tunnel_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@tunnel_router.get("/health", response_model=Dict[str, Any])
async def health_check():
    """Проверка здоровья сервиса туннелей"""
    try:
        wireguard_available = is_wireguard_available()
        
        return {
            "status": "healthy" if wireguard_available else "degraded",
            "wireguard_available": wireguard_available,
            "config_directory": str(WIREGUARD_CONFIG_DIR),
            "tunnels_count": len(list(WIREGUARD_CONFIG_DIR.glob("tunnel_*.conf")))
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

