---
sidebar_position: 3
title: Quick Start
description: Run SolidOS locally in 5 minutes
---

# Quick Start

Get SolidOS running locally in 5 minutes.

## Prerequisites

- Node.js 18+
- npm or yarn
- A Solid pod (or we'll create a local one)

## Option 1: Clone the Monorepo

The fastest way to get the full development environment:

```bash
# Clone SolidOS
git clone https://github.com/SolidOS/solidos.git
cd solidos

# Install dependencies (uses Lerna)
npm install
npm run setup

# Start the development server
npm start
```

Visit `http://localhost:8080` — you're running SolidOS!

## Option 2: Use mashlib Directly

For a simpler setup, use the pre-built mashlib:

```bash
# Create a project
mkdir my-solid-app && cd my-solid-app
npm init -y

# Install mashlib
npm install mashlib

# Create an HTML file
```

Create `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Solid App</title>
  <script src="node_modules/mashlib/dist/mashlib.min.js"></script>
  <link href="node_modules/mashlib/dist/mash.css" rel="stylesheet">
</head>
<body>
  <div id="PageBody"></div>
  <script>
    const subject = panes.UI.store.sym('https://solidcommunity.net/')
    panes.runDataBrowser(document, subject)
  </script>
</body>
</html>
```

Serve it:

```bash
npx serve .
```

## Option 3: Data Kitchen (Desktop App)

For a standalone desktop experience:

```bash
# Clone Data Kitchen
git clone https://github.com/SolidOS/data-kitchen.git
cd data-kitchen

# Install and run
npm install
npm start
```

This gives you an Electron-based SolidOS app.

## Get a Solid Pod

If you don't have a pod, get one free:

| Provider | URL |
|----------|-----|
| solidcommunity.net | https://solidcommunity.net/ |
| Inrupt Pod Spaces | https://start.inrupt.com/ |
| Self-hosted CSS | https://github.com/CommunitySolidServer/CommunitySolidServer |

## Local Development Pod

For development, run a local Community Solid Server:

```bash
# Install CSS
npm install -g @solid/community-server

# Run with in-memory storage
community-solid-server -p 3000

# Or with file-based storage
community-solid-server -p 3000 -c @css:config/file.json -f ./data
```

Now you have a local pod at `http://localhost:3000/`.

## Project Structure

After cloning the monorepo:

```
solidos/
├── packages/
│   ├── mashlib/           # Main bundle
│   ├── solid-panes/       # Pane collection
│   ├── solid-ui/          # UI widgets
│   └── solid-logic/       # Core logic
├── lerna.json             # Monorepo config
├── package.json
└── documentation/         # Dev guides
```

## Development Workflow

```bash
# Watch for changes across all packages
npm run watch

# Run tests
npm test

# Build for production
npm run build

# Start local server with hot reload
npm start
```

## Verify It's Working

1. Open `http://localhost:8080`
2. You should see the SolidOS data browser
3. Navigate to a Solid pod URL
4. Try logging in with your WebID
5. Browse your data!

## Common Issues

### "Cannot find module 'rdflib'"

```bash
npm run setup  # Re-run Lerna bootstrap
```

### Port already in use

```bash
# Use a different port
PORT=9000 npm start
```

### CORS errors

When developing locally against remote pods, you may need to configure CORS. Use a local CSS server for development.

## Next Steps

- [Your First Pane](/docs/getting-started/your-first-pane) — build something!
- [Architecture Overview](/docs/architecture/overview) — understand the system
- [solid-ui Components](/docs/libraries/solid-ui) — available widgets
