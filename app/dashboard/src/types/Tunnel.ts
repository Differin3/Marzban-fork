export interface Tunnel {
  id: number;
  source_node_id: number;
  target_node_id: number;
  tunnel_type: 'wireguard' | 'openvpn' | 'ipsec';
  config: string;
  is_active: boolean;
  name?: string;
  status: 'active' | 'inactive' | 'error' | 'connecting';
  created_at: string;
  updated_at: string;
  source_node_name?: string;
  target_node_name?: string;
}

export interface TunnelCreate {
  source_node_id: number;
  target_node_id: number;
  tunnel_type: 'wireguard' | 'openvpn' | 'ipsec';
  config?: string;
  is_active?: boolean;
  name?: string;
}

export interface TunnelUpdate {
  source_node_id?: number;
  target_node_id?: number;
  tunnel_type?: 'wireguard' | 'openvpn' | 'ipsec';
  config?: string;
  is_active?: boolean;
  name?: string;
}

export interface TunnelStatus {
  tunnel_id: number;
  status: 'active' | 'inactive' | 'error' | 'connecting';
  is_active: boolean;
  last_updated: string;
}

export interface Node {
  id: number;
  name: string;
  address: string;
  port: number;
  api_port: number;
  status: 'connected' | 'connecting' | 'error' | 'disabled';
}
