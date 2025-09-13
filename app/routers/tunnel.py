from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.db.base import get_db
from app.db.models import Tunnel, Node
from app.models.tunnel import TunnelCreate, TunnelUpdate, TunnelResponse, TunnelStatus
from app.utils.tunnel_manager import TunnelManager

router = APIRouter()
tunnel_manager = TunnelManager()


@router.get("/tunnels", response_model=List[TunnelResponse])
def read_tunnels(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Получить список туннелей"""
    tunnels = db.query(Tunnel).offset(skip).limit(limit).all()
    
    # Добавляем имена узлов для ответа
    result = []
    for tunnel in tunnels:
        tunnel_dict = tunnel.__dict__.copy()
        tunnel_dict['source_node_name'] = tunnel.source_node.name if tunnel.source_node else None
        tunnel_dict['target_node_name'] = tunnel.target_node.name if tunnel.target_node else None
        result.append(TunnelResponse(**tunnel_dict))
    
    return result


@router.post("/tunnels", response_model=TunnelResponse)
def create_tunnel(tunnel: TunnelCreate, db: Session = Depends(get_db)):
    """Создать новый туннель"""
    # Проверяем существование узлов
    source_node = db.query(Node).filter(Node.id == tunnel.source_node_id).first()
    target_node = db.query(Node).filter(Node.id == tunnel.target_node_id).first()
    
    if not source_node:
        raise HTTPException(status_code=404, detail="Source node not found")
    if not target_node:
        raise HTTPException(status_code=404, detail="Target node not found")
    
    if source_node.id == target_node.id:
        raise HTTPException(status_code=400, detail="Source and target nodes cannot be the same")
    
    # Создаем туннель
    db_tunnel = Tunnel(**tunnel.dict())
    db.add(db_tunnel)
    db.commit()
    db.refresh(db_tunnel)
    
    # Применяем конфигурацию туннеля
    try:
        apply_tunnel_config(db_tunnel, db)
    except Exception as e:
        # Если не удалось применить конфигурацию, удаляем туннель
        db.delete(db_tunnel)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to apply tunnel config: {str(e)}")
    
    # Формируем ответ
    tunnel_dict = db_tunnel.__dict__.copy()
    tunnel_dict['source_node_name'] = source_node.name
    tunnel_dict['target_node_name'] = target_node.name
    
    return TunnelResponse(**tunnel_dict)


@router.get("/tunnels/{tunnel_id}", response_model=TunnelResponse)
def read_tunnel(tunnel_id: int, db: Session = Depends(get_db)):
    """Получить туннель по ID"""
    tunnel = db.query(Tunnel).filter(Tunnel.id == tunnel_id).first()
    if tunnel is None:
        raise HTTPException(status_code=404, detail="Tunnel not found")
    
    tunnel_dict = tunnel.__dict__.copy()
    tunnel_dict['source_node_name'] = tunnel.source_node.name if tunnel.source_node else None
    tunnel_dict['target_node_name'] = tunnel.target_node.name if tunnel.target_node else None
    
    return TunnelResponse(**tunnel_dict)


@router.put("/tunnels/{tunnel_id}", response_model=TunnelResponse)
def update_tunnel(tunnel_id: int, tunnel: TunnelUpdate, db: Session = Depends(get_db)):
    """Обновить туннель"""
    db_tunnel = db.query(Tunnel).filter(Tunnel.id == tunnel_id).first()
    if db_tunnel is None:
        raise HTTPException(status_code=404, detail="Tunnel not found")
    
    # Проверяем существование узлов если они указаны
    if tunnel.source_node_id is not None:
        source_node = db.query(Node).filter(Node.id == tunnel.source_node_id).first()
        if not source_node:
            raise HTTPException(status_code=404, detail="Source node not found")
    
    if tunnel.target_node_id is not None:
        target_node = db.query(Node).filter(Node.id == tunnel.target_node_id).first()
        if not target_node:
            raise HTTPException(status_code=404, detail="Target node not found")
    
    # Обновляем поля
    update_data = tunnel.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tunnel, field, value)
    
    db.add(db_tunnel)
    db.commit()
    db.refresh(db_tunnel)
    
    # Обновляем конфигурацию туннеля
    try:
        apply_tunnel_config(db_tunnel, db)
    except Exception as e:
        print(f"Failed to update tunnel config: {e}")
    
    # Формируем ответ
    tunnel_dict = db_tunnel.__dict__.copy()
    tunnel_dict['source_node_name'] = db_tunnel.source_node.name if db_tunnel.source_node else None
    tunnel_dict['target_node_name'] = db_tunnel.target_node.name if db_tunnel.target_node else None
    
    return TunnelResponse(**tunnel_dict)


@router.delete("/tunnels/{tunnel_id}")
def delete_tunnel(tunnel_id: int, db: Session = Depends(get_db)):
    """Удалить туннель"""
    tunnel = db.query(Tunnel).filter(Tunnel.id == tunnel_id).first()
    if tunnel is None:
        raise HTTPException(status_code=404, detail="Tunnel not found")
    
    # Удаляем конфигурацию туннеля
    try:
        remove_tunnel_config(tunnel, db)
    except Exception as e:
        print(f"Failed to remove tunnel config: {e}")
    
    db.delete(tunnel)
    db.commit()
    return {"message": "Tunnel deleted successfully"}


@router.post("/tunnels/{tunnel_id}/activate")
def activate_tunnel(tunnel_id: int, db: Session = Depends(get_db)):
    """Активировать туннель"""
    tunnel = db.query(Tunnel).filter(Tunnel.id == tunnel_id).first()
    if tunnel is None:
        raise HTTPException(status_code=404, detail="Tunnel not found")
    
    tunnel.is_active = True
    tunnel.status = TunnelStatus.connecting
    db.commit()
    
    try:
        apply_tunnel_config(tunnel, db)
        return {"message": "Tunnel activated successfully"}
    except Exception as e:
        tunnel.status = TunnelStatus.error
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to activate tunnel: {str(e)}")


@router.post("/tunnels/{tunnel_id}/deactivate")
def deactivate_tunnel(tunnel_id: int, db: Session = Depends(get_db)):
    """Деактивировать туннель"""
    tunnel = db.query(Tunnel).filter(Tunnel.id == tunnel_id).first()
    if tunnel is None:
        raise HTTPException(status_code=404, detail="Tunnel not found")
    
    tunnel.is_active = False
    tunnel.status = TunnelStatus.inactive
    db.commit()
    
    try:
        remove_tunnel_config(tunnel, db)
        return {"message": "Tunnel deactivated successfully"}
    except Exception as e:
        print(f"Failed to deactivate tunnel: {e}")
        return {"message": "Tunnel deactivated but config removal failed"}


@router.get("/tunnels/{tunnel_id}/status")
def get_tunnel_status(tunnel_id: int, db: Session = Depends(get_db)):
    """Получить статус туннеля"""
    tunnel = db.query(Tunnel).filter(Tunnel.id == tunnel_id).first()
    if tunnel is None:
        raise HTTPException(status_code=404, detail="Tunnel not found")
    
    # Получаем актуальный статус с узла
    if tunnel.source_node:
        node_status = tunnel_manager.get_tunnel_status(tunnel_id, tunnel.source_node)
        if node_status:
            tunnel.status = TunnelStatus(node_status) if node_status in [s.value for s in TunnelStatus] else TunnelStatus.error
            db.commit()
    
    return {
        "tunnel_id": tunnel_id,
        "status": tunnel.status,
        "is_active": tunnel.is_active,
        "last_updated": tunnel.updated_at
    }


def apply_tunnel_config(tunnel: Tunnel, db: Session):
    """Применить конфигурацию туннеля"""
    source_node = db.query(Node).filter(Node.id == tunnel.source_node_id).first()
    target_node = db.query(Node).filter(Node.id == tunnel.target_node_id).first()
    
    if not source_node or not target_node:
        raise Exception("Source or target node not found")
    
    if tunnel.tunnel_type.value == "wireguard":
        config = tunnel_manager.generate_wireguard_config(tunnel, source_node, target_node)
        success = tunnel_manager.setup_wireguard_tunnel(config, tunnel.id, source_node)
        
        if success:
            tunnel.status = TunnelStatus.active
        else:
            tunnel.status = TunnelStatus.error
            raise Exception("Failed to setup WireGuard tunnel")
    else:
        raise Exception(f"Unsupported tunnel type: {tunnel.tunnel_type}")


def remove_tunnel_config(tunnel: Tunnel, db: Session):
    """Удалить конфигурацию туннеля"""
    source_node = db.query(Node).filter(Node.id == tunnel.source_node_id).first()
    
    if not source_node:
        return
    
    if tunnel.tunnel_type.value == "wireguard":
        success = tunnel_manager.remove_wireguard_tunnel(tunnel.id, source_node)
        if not success:
            print(f"Failed to remove WireGuard tunnel {tunnel.id} from node {source_node.name}")
    else:
        print(f"Unsupported tunnel type for removal: {tunnel.tunnel_type}")
