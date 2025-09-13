# Tunnel Functionality for Marzban

This document describes the tunnel functionality implementation for the Marzban fork, allowing you to create secure tunnels between nodes.

## Overview

The tunnel functionality enables you to:
- Create secure tunnels between Marzban nodes
- Support multiple tunnel types (WireGuard, OpenVPN, IPSec)
- Manage tunnel configurations through REST API
- Monitor tunnel status and health
- Automatically apply and remove tunnel configurations

## Architecture

### Components

1. **Models** (`app/models/tunnel.py`)
   - Pydantic schemas for API requests/responses
   - Tunnel types and status enums

2. **Database Model** (`app/db/models.py`)
   - SQLAlchemy model for tunnel persistence
   - Relationships with Node model

3. **Tunnel Manager** (`app/utils/tunnel_manager.py`)
   - Handles tunnel configuration generation
   - Manages communication with remote nodes
   - Generates WireGuard keys

4. **API Router** (`app/routers/tunnel.py`)
   - REST API endpoints for tunnel management
   - CRUD operations for tunnels

## API Endpoints

### Get Tunnels
```
GET /api/tunnels
```
Query parameters:
- `skip`: Number of tunnels to skip (default: 0)
- `limit`: Maximum number of tunnels to return (default: 100, max: 1000)

### Create Tunnel
```
POST /api/tunnels
```
Request body:
```json
{
  "source_node_id": 1,
  "target_node_id": 2,
  "tunnel_type": "wireguard",
  "name": "My Tunnel",
  "config": "{}",
  "is_active": true
}
```

### Get Tunnel by ID
```
GET /api/tunnels/{tunnel_id}
```

### Update Tunnel
```
PUT /api/tunnels/{tunnel_id}
```
Request body (all fields optional):
```json
{
  "source_node_id": 1,
  "target_node_id": 2,
  "tunnel_type": "wireguard",
  "name": "Updated Tunnel Name",
  "config": "{}",
  "is_active": false
}
```

### Delete Tunnel
```
DELETE /api/tunnels/{tunnel_id}
```

### Activate Tunnel
```
POST /api/tunnels/{tunnel_id}/activate
```

### Deactivate Tunnel
```
POST /api/tunnels/{tunnel_id}/deactivate
```

### Get Tunnel Status
```
GET /api/tunnels/{tunnel_id}/status
```

## Database Migration

To add the tunnels table to your database, run:

```bash
# If using Alembic
alembic upgrade head

# Or manually apply the migration
python -c "from app.db.base import engine; from app.db.models import Base; Base.metadata.create_all(bind=engine)"
```

## Configuration

### WireGuard Setup

For WireGuard tunnels to work, you need:

1. **WireGuard installed on nodes**:
   ```bash
   # Ubuntu/Debian
   sudo apt install wireguard-tools
   
   # CentOS/RHEL
   sudo yum install wireguard-tools
   ```

2. **Node API endpoints**: Each node should expose tunnel management endpoints:
   - `POST /api/tunnel` - Create tunnel
   - `DELETE /api/tunnel/{tunnel_id}` - Remove tunnel
   - `GET /api/tunnel/{tunnel_id}/status` - Get tunnel status

### Environment Variables

Add these to your environment or configuration:

```bash
# Tunnel configuration directory
TUNNEL_CONFIG_DIR=/etc/marzban/tunnels

# Node API key (for communication with nodes)
NODE_API_KEY=your-secret-key
```

## Usage Examples

### Creating a WireGuard Tunnel

```python
import requests

# Create a tunnel between node 1 and node 2
response = requests.post("http://localhost:8000/api/tunnels", json={
    "source_node_id": 1,
    "target_node_id": 2,
    "tunnel_type": "wireguard",
    "name": "Node1 to Node2 Tunnel",
    "is_active": True
})

tunnel = response.json()
print(f"Created tunnel {tunnel['id']}")
```

### Monitoring Tunnel Status

```python
import requests

# Get tunnel status
response = requests.get("http://localhost:8000/api/tunnels/1/status")
status = response.json()
print(f"Tunnel status: {status['status']}")
```

## Security Considerations

1. **Key Management**: WireGuard keys are generated automatically but should be stored securely
2. **Node Communication**: Ensure secure communication between Marzban and nodes
3. **Access Control**: Implement proper authentication for tunnel management
4. **Network Isolation**: Use proper firewall rules for tunnel traffic

## Troubleshooting

### Common Issues

1. **WireGuard not installed**: Install wireguard-tools on all nodes
2. **Node API not responding**: Check node connectivity and API endpoints
3. **Key generation fails**: Ensure proper permissions for key generation
4. **Tunnel status stuck on "connecting"**: Check node logs and network connectivity

### Logs

Check the following logs for troubleshooting:
- Marzban application logs
- Node system logs
- WireGuard logs: `journalctl -u wg-quick@<interface>`

## Future Enhancements

1. **Additional Tunnel Types**: OpenVPN, IPSec support
2. **Tunnel Monitoring**: Real-time status monitoring
3. **Load Balancing**: Multiple tunnels for redundancy
4. **GUI Integration**: Web interface for tunnel management
5. **Automated Recovery**: Automatic tunnel restoration on failures

## Contributing

When contributing to the tunnel functionality:

1. Follow the existing code style
2. Add proper error handling
3. Include tests for new features
4. Update documentation
5. Consider security implications

## License

This tunnel functionality follows the same license as the main Marzban project.
