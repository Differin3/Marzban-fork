from enum import Enum
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field


class TunnelType(str, Enum):
    wireguard = "wireguard"
    openvpn = "openvpn"
    ipsec = "ipsec"


class TunnelStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    error = "error"
    connecting = "connecting"


class TunnelBase(BaseModel):
    source_node_id: int
    target_node_id: int
    tunnel_type: TunnelType = TunnelType.wireguard
    config: str = "{}"
    is_active: bool = True
    name: Optional[str] = None


class TunnelCreate(TunnelBase):
    pass


class TunnelUpdate(BaseModel):
    source_node_id: Optional[int] = None
    target_node_id: Optional[int] = None
    tunnel_type: Optional[TunnelType] = None
    config: Optional[str] = None
    is_active: Optional[bool] = None
    name: Optional[str] = None


class Tunnel(TunnelBase):
    id: int
    status: TunnelStatus = TunnelStatus.connecting
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TunnelResponse(Tunnel):
    source_node_name: Optional[str] = None
    target_node_name: Optional[str] = None
