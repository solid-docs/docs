---
sidebar_position: 3
title: Deployment
description: Deploying SolidOS in different environments
---

# Deployment

Options for deploying SolidOS in production and development environments.

## Deployment Models

### 1. Static Hosting

The simplest deployment — serve mashlib from a static host.

**Best for:** Quick demos, development, testing

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Solid App</title>
  <script src="https://cdn.jsdelivr.net/npm/mashlib/dist/mashlib.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/mashlib/dist/mash.css" rel="stylesheet">
</head>
<body>
  <div id="PageBody"></div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      panes.runDataBrowser(document)
    })
  </script>
</body>
</html>
```

**Hosting options:**
- GitHub Pages
- Netlify
- Vercel
- Any static file server

### 2. Embedded in Solid Server

Many Solid servers can serve SolidOS as the default UI.

#### Community Solid Server (CSS)

```bash
npm install -g @solid/community-server mashlib

# Create config extending default
cat > config.json << 'EOF'
{
  "@context": "https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server/^7.0.0/components/context.jsonld",
  "import": [
    "css:config/app/main/default.json",
    "css:config/app/init/initialize-root.json"
  ]
}
EOF

# Run with mashlib
community-solid-server -c config.json
```

#### Node Solid Server (NSS)

NSS includes SolidOS by default:

```bash
npm install -g solid-server

# Run with default config
solid-server --port 8443
```

### 3. Standalone Application

Build a custom SolidOS-based application.

```bash
# Create new project
mkdir my-solid-app && cd my-solid-app
npm init -y

# Install dependencies
npm install mashlib

# Copy assets
cp node_modules/mashlib/dist/mashlib.min.js public/
cp node_modules/mashlib/dist/mash.css public/
```

```javascript
// public/app.js
document.addEventListener('DOMContentLoaded', () => {
  // Custom initialization
  const startUri = 'https://your-pod.example/'
  const subject = panes.UI.store.sym(startUri)
  panes.runDataBrowser(document, subject)
})
```

### 4. Desktop Application (Data Kitchen)

Electron wrapper for desktop use.

```bash
git clone https://github.com/SolidOS/data-kitchen
cd data-kitchen
npm install
npm start
```

Build distributable:
```bash
npm run package
# Creates platform-specific installers
```

## Production Considerations

### CDN vs Self-Hosting

**CDN (jsDelivr, unpkg)**
- ✅ Easy setup
- ✅ Fast global delivery
- ✅ No maintenance
- ❌ Depends on third-party
- ❌ Version updates can break things

**Self-Hosting**
- ✅ Full control
- ✅ No external dependencies
- ✅ Lock to specific version
- ❌ Need to manage hosting
- ❌ Handle caching yourself

### Pinning Versions

Always pin to a specific version in production:

```html
<!-- Pinned to specific version -->
<script src="https://cdn.jsdelivr.net/npm/mashlib@1.8.5/dist/mashlib.min.js"></script>

<!-- Or host the exact version yourself -->
<script src="/assets/mashlib-1.8.5.min.js"></script>
```

### HTTPS Requirement

Solid requires HTTPS for:
- WebID authentication
- Secure cookie handling
- CORS with credentials

**Development options:**
```bash
# Local CSS with self-signed cert
community-solid-server --https

# Or use localhost (browsers allow HTTP)
community-solid-server --port 3000
```

**Production:**
- Use Let's Encrypt for free certificates
- Configure your reverse proxy for HTTPS

### Reverse Proxy Setup

#### Nginx

```nginx
server {
    listen 443 ssl;
    server_name pod.example.org;

    ssl_certificate /etc/letsencrypt/live/pod.example.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pod.example.org/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### Caddy

```caddyfile
pod.example.org {
    reverse_proxy localhost:3000
}
```

## Docker Deployment

### Basic Docker Setup

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install CSS
RUN npm install -g @solid/community-server

# Copy mashlib
COPY node_modules/mashlib/dist /app/mashlib

EXPOSE 3000

CMD ["community-solid-server", "-p", "3000"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3'

services:
  solid:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - CSS_BASE_URL=https://pod.example.org
```

## Performance Optimization

### Code Splitting

If building a custom app, split mashlib:

```javascript
// Load only what you need
import { graph, Fetcher, sym } from 'rdflib'
import { store, authn } from 'solid-logic'
import * as UI from 'solid-ui'
```

### Caching Headers

Configure your server for optimal caching:

```nginx
# Static assets - long cache
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML - no cache
location / {
    add_header Cache-Control "no-cache";
}
```

### Preloading

Preload critical resources:

```html
<link rel="preload" href="mashlib.min.js" as="script">
<link rel="preload" href="mash.css" as="style">
```

## Monitoring

### Health Checks

```javascript
// Simple health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.npm_package_version,
    uptime: process.uptime()
  })
})
```

### Error Tracking

```javascript
// Global error handler
window.onerror = (message, source, line, col, error) => {
  // Send to your logging service
  console.error('SolidOS Error:', { message, source, line, error })
}
```

## Environment-Specific Configuration

### Development

```javascript
const config = {
  debug: true,
  logLevel: 'verbose',
  apiUrl: 'http://localhost:3000'
}
```

### Production

```javascript
const config = {
  debug: false,
  logLevel: 'error',
  apiUrl: 'https://pod.example.org'
}
```

### Feature Flags

```javascript
const features = {
  experimentalPanes: process.env.ENABLE_EXPERIMENTAL === 'true',
  analytics: process.env.ENABLE_ANALYTICS === 'true'
}

if (features.experimentalPanes) {
  paneRegistry.register(experimentalPane)
}
```

## Upgrading

### Checking for Updates

```bash
npm outdated mashlib
```

### Upgrade Process

1. Review changelog for breaking changes
2. Update in staging environment first
3. Run your test suite
4. Deploy to production
5. Monitor for issues

## See Also

- [Quick Start](/docs/getting-started/quick-start) — development setup
- [CSS Documentation](https://communitysolidserver.github.io/CommunitySolidServer/)
- [Docker Hub - Solid](https://hub.docker.com/u/solidproject)
