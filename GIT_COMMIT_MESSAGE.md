# 🚀 Git Commit Message

## Commit Title
```
feat: Add comprehensive tunnel management system with web interface
```

## Commit Description
```
🚀 Add comprehensive tunnel management system with web interface

### ✨ New Features
- **Tunnel Management System**: Complete backend implementation for managing tunnels between Marzban nodes
- **Web Interface**: Modern React-based dashboard for tunnel configuration and monitoring
- **Multiple Tunnel Types**: Support for WireGuard, OpenVPN, and IPSec tunnels
- **Real-time Status**: Live monitoring of tunnel status and statistics
- **Node Integration**: API endpoints for Marzban-node communication

### 🏗️ Backend Changes
- **Database Models**: New Tunnel model with relationships to Node entities
- **API Endpoints**: RESTful API for CRUD operations on tunnels
- **Tunnel Manager**: Utility class for WireGuard key generation and node communication
- **Database Migration**: Alembic migration for tunnels table
- **Pydantic Schemas**: Request/response validation for tunnel operations

### 🎨 Frontend Changes
- **Tunnel Dashboard**: Complete management interface with statistics
- **Modern UI**: Chakra UI components with Heroicons for consistency
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Internationalization**: Full i18n support for English and Russian
- **Real-time Updates**: Live status monitoring and statistics

### 📁 New Files
- `app/models/tunnel.py` - Tunnel database model and enums
- `app/schemas/tunnel.py` - Pydantic schemas for API validation
- `app/routers/tunnel.py` - FastAPI routes for tunnel management
- `app/utils/tunnel_manager.py` - Tunnel configuration utilities
- `app/dashboard/src/pages/Tunnels.tsx` - Main tunnel management page
- `app/dashboard/src/components/Tunnel*.tsx` - React components for tunnel UI
- `app/dashboard/src/types/Tunnel.ts` - TypeScript type definitions
- `app/db/migrations/versions/tunnel_migration_*.py` - Database migration

### 🔧 Modified Files
- `app/routers/__init__.py` - Added tunnel router to API
- `app/db/models.py` - Integrated tunnel model
- `app/dashboard/src/pages/Router.tsx` - Added tunnel route
- `app/dashboard/src/components/Header.tsx` - Added tunnel navigation
- `app/dashboard/src/pages/Dashboard.tsx` - Added tunnel statistics
- `app/dashboard/build/statics/locales/*.json` - Added translations

### 🎯 Key Features
- **WireGuard Integration**: Automatic key generation and configuration
- **Node Communication**: HTTP API for remote tunnel setup
- **Status Monitoring**: Real-time tunnel status tracking
- **Statistics Dashboard**: Comprehensive tunnel analytics
- **Modern Design**: Consistent with Marzban's design system
- **Multi-language**: English and Russian localization

### 🚀 Usage
1. Access tunnel management via `/tunnels` route
2. Create tunnels between any two nodes
3. Monitor real-time status and statistics
4. Manage tunnel configurations through web interface

### 📋 Requirements for Marzban-node
- WireGuard installation and configuration
- API endpoint `/api/tunnel` for tunnel management
- System privileges for network interface management
- Docker configuration with NET_ADMIN capabilities

### 🔒 Security
- API key authentication for node communication
- Secure key generation and storage
- Input validation and sanitization

### 📊 Statistics
- Total tunnels count
- Active/inactive tunnel status
- Tunnel type distribution
- Real-time monitoring

This implementation provides a complete tunnel management solution that integrates seamlessly with the existing Marzban architecture while maintaining security and performance standards.

Closes #tunnel-management
```

## Short Commit Message (for quick commits)
```
feat: Add tunnel management system with web interface

- Complete backend API for tunnel CRUD operations
- Modern React dashboard with statistics and monitoring
- Support for WireGuard, OpenVPN, and IPSec tunnels
- Real-time status tracking and node communication
- Full internationalization and responsive design
- Database migration and Pydantic schemas
- Integration with existing Marzban architecture
```

## Alternative Commit Messages

### Option 1: Feature-focused
```
feat(tunnels): Add comprehensive tunnel management system

- Backend: Models, API routes, tunnel manager utility
- Frontend: React dashboard with statistics and monitoring
- Support: WireGuard, OpenVPN, IPSec tunnel types
- Features: Real-time status, node communication, i18n
```

### Option 2: Technical-focused
```
feat: Implement tunnel management with React dashboard

- Add Tunnel model with Node relationships
- Create RESTful API endpoints for tunnel operations
- Build modern web interface with Chakra UI + Heroicons
- Add WireGuard integration and node communication
- Include database migration and TypeScript types
```

### Option 3: User-focused
```
feat: Add tunnel management dashboard

- Create tunnels between Marzban nodes
- Monitor tunnel status and statistics
- Support multiple tunnel types (WireGuard, OpenVPN, IPSec)
- Modern web interface with real-time updates
- Full internationalization support
```

## 🎯 Recommended Commit Message
Use the **main commit message** above as it provides the most comprehensive description of all changes and is suitable for a major feature addition.
