---
description: Proxy server configuration and usage guide
globs: proxy_server/**/*,scripts/dev.js
alwaysApply: false
---

# Proxy Server Configuration Guide

This guide explains how to configure and use the project's proxy server for proxying backend API requests in the development environment.

## 🎯 **Feature Overview**

The proxy server allows the frontend development environment to:
- Proxy API requests to different backend services
- Avoid CORS cross-origin issues
- Support path rewriting and multi-service proxying
- Provide detailed request/response logging

## 📁 **File Structure**

```
proxy_server/
├── config.js          # Proxy configuration file
├── index.js           # Proxy server main file
└── check-config.js    # Configuration checking tool

scripts/
└── dev.js             # Smart development startup script
```

## ⚙️ **Configuration Methods**

### Basic Configuration

Configure the `PROXY_ROUTES` array in `proxy_server/config.js`:

```javascript
const PROXY_ROUTES = [
  {
    // API route
    path: "/api",
    host: process.env.API_HOST || "localhost",
    port: process.env.API_PORT || 8088,
    target: process.env.API_URL || `http://${process.env.API_HOST || "localhost"}:${process.env.API_PORT || 8088}`,
    pathRewrite: {
      "^/api": "" // Remove /api prefix
    },
    description: "Backend API service"
  },
  {
    // File upload/download service
    path: "/files",
    host: process.env.FILE_HOST || "localhost",
    port: process.env.FILE_PORT || 9000,
    target: process.env.FILE_SERVER_URL || `http://${process.env.FILE_HOST || "localhost"}:${process.env.FILE_PORT || 9000}`,
    pathRewrite: {
      "^/files": "" // Remove /files prefix
    },
    description: "File server"
  }
];
```

### Configuration Field Description

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | ✅ | Proxy path prefix (e.g., "/api") |
| `host` | string | ✅ | Target server hostname |
| `port` | number | ✅ | Target server port |
| `target` | string | ✅ | Complete target server address |
| `pathRewrite` | object | ❌ | Path rewriting rules |
| `description` | string | ✅ | Service description |

## 🚀 **Startup Methods**

### Smart Startup (Recommended)

```bash
pnpm dev
```

The smart startup script automatically detects:
- **With proxy configuration**: Start both proxy server and Next.js
- **Without proxy configuration**: Start only Next.js development server

### Manual Startup

```bash
# Start Next.js only
pnpm dev:next

# Start proxy server only
pnpm dev:proxy

# Start both (requires proxy configuration)
concurrently "pnpm dev:proxy" "pnpm dev:next"
```

## 📝 **Configuration Examples**

### 1. Empty Configuration (Default)

```javascript
const PROXY_ROUTES = [];
```

**Behavior**: Do not start proxy server, only run Next.js

### 2. Single API Proxy

```javascript
const PROXY_ROUTES = [
  {
    path: "/api",
    target: "http://localhost:8088",
    pathRewrite: {
      "^/api": "" // /api/users -> /users
    },
    description: "Backend API service"
  }
];
```

**Behavior**:
- Frontend requests `http://localhost:3000/api/users`
- Proxy to `http://localhost:8088/users`

### 3. Multi-Service Proxy

```javascript
const PROXY_ROUTES = [
  {
    path: "/api/v1",
    target: "http://localhost:8088",
    pathRewrite: {
      "^/api/v1": "/api"
    },
    description: "Main API service"
  },
  {
    path: "/api/v2",
    target: "http://localhost:8089",
    pathRewrite: {
      "^/api/v2": "/api"
    },
    description: "New API service"
  },
  {
    path: "/files",
    target: "http://localhost:9000",
    description: "File service"
  }
];
```

## 🌍 **Environment Variable Configuration**

Configure environment variables in `.env.local`:

```bash
# Proxy server configuration
PROXY_PORT=6001

# Backend API service
API_HOST=localhost
API_PORT=8088
API_URL=http://localhost:8088

# File server
FILE_HOST=localhost
FILE_PORT=9000
FILE_SERVER_URL=http://localhost:9000

# CORS configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🔧 **Debug Mode**

Enable detailed debugging information:

```bash
DEBUG_PROXY=true pnpm dev:proxy
```

Debug mode shows:
- Detailed request header information
- Complete error stack traces
- More detailed proxy logs

## 📊 **Health Check**

The proxy server provides a health check endpoint:

```bash
curl http://localhost:6001/health
```

Returns proxy server status and route configuration information.

## ⚠️ **Common Issues**

### 1. Proxy Server Not Starting

**Symptom**: Running `pnpm dev` only starts Next.js

**Cause**: `PROXY_ROUTES` is an empty array

**Solution**: Add proxy configuration in `proxy_server/config.js`

### 2. CORS Errors

**Symptom**: Browser shows cross-origin errors

**Solution**:
- Check the `origin` configuration in `CORS_CONFIG`
- Ensure frontend address is in the allowed list

### 3. Target Service Connection Failed

**Symptom**: Proxy requests return 502 error

**Solution**:
- Confirm target service is started
- Check if `target` address and port are correct
- View proxy server error logs

### 4. Path Rewriting Not Working

**Symptom**: Request paths are not rewritten as expected

**Solution**:
- Check `pathRewrite` regular expressions
- Ensure path matching rules are correct

## 🎨 **Best Practices**

### 1. Configuration Management

```javascript
// ✅ Recommended: Use environment variables
const PROXY_ROUTES = [
  {
    path: "/api",
    target: process.env.API_URL || "http://localhost:8088",
    description: "Backend API service"
  }
];

// ❌ Avoid: Hardcoded addresses
const PROXY_ROUTES = [
  {
    path: "/api",
    target: "http://192.168.1.100:8088", // Hardcoded
    description: "Backend API service"
  }
];
```

### 2. Path Design

```javascript
// ✅ Recommended: Clear path separation
const PROXY_ROUTES = [
  { path: "/api", target: "http://localhost:8088" },      // API service
  { path: "/files", target: "http://localhost:9000" },   // File service
  { path: "/auth", target: "http://localhost:8089" }     // Auth service
];

// ❌ Avoid: Path conflicts
const PROXY_ROUTES = [
  { path: "/api", target: "http://localhost:8088" },
  { path: "/api/v2", target: "http://localhost:8089" }   // Will be intercepted by first rule
];
```

### 3. Description Information

```javascript
// ✅ Recommended: Detailed descriptions
{
  path: "/api",
  target: "http://localhost:8088",
  description: "User management and business logic API service"
}

// ❌ Avoid: Vague descriptions
{
  path: "/api",
  target: "http://localhost:8088",
  description: "API"
}
```

## 🔄 **Development Workflow**

### 1. New Project Setup

1. Copy example configuration to `PROXY_ROUTES`
2. Adjust `target` addresses according to backend services
3. Configure environment variables
4. Run `pnpm dev` to verify

### 2. Adding New Services

1. Add new configuration in `PROXY_ROUTES`
2. Add corresponding environment variables
3. Restart development server
4. Test new proxy paths

### 3. Production Deployment

Production environment does not need a proxy server; frontend communicates directly with backend APIs. Ensure:
- Backend APIs are configured with correct CORS
- Frontend API addresses point to production environment
- Remove all proxy-related configurations

This proxy server configuration provides flexible, easy-to-use, and feature-complete development environment support.