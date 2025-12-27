---
sidebar_position: 6
title: mashlib
description: The bundled SolidOS data browser
---

# mashlib

mashlib is the complete SolidOS data browser bundle — it combines all libraries and panes into a single distributable package.

## What's New in mashlib 2.0

**Released:** November 29, 2025 ([v2.0.0](https://github.com/SolidOS/mashlib/releases/tag/v2.0.0))

mashlib 2.0 is a major release with breaking API changes. See [PR #220](https://github.com/SolidOS/mashlib/pull/220) for full details.

### Breaking Changes

#### New `SolidLogic` Global

The way you access core functionality has changed:

| v1.x (Old) | v2.0 (New) |
|------------|------------|
| `panes.UI` | `UI` |
| `store` / `UI.store` / `panes.UI.store` | `SolidLogic.store` |
| `authSession` / `UI.authn.authSession` | `SolidLogic.authSession` |
| `UI.rdf` / `panes.UI.rdf` | `$rdf` |
| `authn.currentUser()` / `UI.authn.currentUser()` | `SolidLogic.authn.currentUser()` |

#### Node.js Requirements

- **Dropped:** Node 18
- **Required:** Node 20.x or 22.x

### New Features

- **`SolidLogic` global** — consolidated access to store, authentication, and session
- **`mashlib.versionInfo`** — runtime version information
- **Dual bundles** — both `mashlib.js` (development) and `mashlib.min.js` (production)
- **rdflib 2.3.0** — updated RDF library

### Migration Example

**Before (v1.x):**
```javascript
// Accessing the store
const store = panes.UI.store
// Or
const store = UI.store

// Authentication
const user = panes.UI.authn.currentUser()

// RDF operations
const sym = panes.UI.rdf.sym('https://example.org/')
```

**After (v2.0):**
```javascript
// Accessing the store
const store = SolidLogic.store

// Authentication
const user = SolidLogic.authn.currentUser()

// RDF operations
const sym = $rdf.sym('https://example.org/')
```

### Quick Check

Verify your mashlib version at runtime:

```javascript
console.log(mashlib.versionInfo)
// { version: '2.0.0', ... }
```

---

## Installation

### npm

```bash
npm install mashlib
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/mashlib/dist/mashlib.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/mashlib/dist/mash.css" rel="stylesheet">
```

## Quick Start

The simplest way to run SolidOS:

```html
<!DOCTYPE html>
<html>
<head>
  <title>SolidOS Data Browser</title>
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

## Global Objects

mashlib 2.0 exposes several global objects:

```javascript
// The main entry point
panes.runDataBrowser(document)

// Access to solid-ui (v2.0: use UI directly, not panes.UI)
UI.widgets.button(...)
UI.forms.buildForm(...)
UI.style.styleElement(...)

// Access to the store (v2.0: use SolidLogic)
SolidLogic.store           // The rdflib store
SolidLogic.store.fetcher   // Fetcher
SolidLogic.store.updater   // UpdateManager

// Authentication (v2.0: use SolidLogic.authn)
SolidLogic.authn.currentUser()
SolidLogic.authn.login()
SolidLogic.authn.logout()

// RDF operations (v2.0: use $rdf directly)
$rdf.sym('https://example.org/')
$rdf.lit('Hello')
$rdf.Namespace('http://xmlns.com/foaf/0.1/')

// Pane registry
panes.paneRegistry.register(myPane)
panes.paneRegistry.byName('folder')

// Version info (new in v2.0)
console.log(mashlib.versionInfo)
```

## Configuration

### Starting URL

Open a specific resource on load:

```javascript
const subject = $rdf.sym('https://alice.example/profile/card#me')
panes.runDataBrowser(document, subject)
```

### URL Parameters

mashlib reads URL parameters:

```
https://example.org/browse?uri=https://alice.example/profile/card
```

```javascript
// Or set programmatically
const params = new URLSearchParams(window.location.search)
const uri = params.get('uri')
if (uri) {
  panes.runDataBrowser(document, $rdf.sym(uri))
}
```

## DOM Structure

mashlib creates this DOM structure:

```html
<body>
  <header id="PageHeader">
    <!-- Login status, navigation -->
  </header>

  <div id="PageBody">
    <div id="outline">
      <!-- Breadcrumb, tabs -->
    </div>
    <div id="main">
      <!-- Pane content -->
    </div>
  </div>

  <footer id="PageFooter">
    <!-- Footer links -->
  </footer>
</body>
```

### Required Elements

At minimum, you need:

```html
<div id="PageBody"></div>
```

mashlib will create other elements as needed.

## Custom Integration

### With React

```jsx
import { useEffect, useRef } from 'react'

function SolidOSBrowser({ uri }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current && window.panes) {
      const subject = window.$rdf.sym(uri)
      window.panes.runDataBrowser(document, subject)
    }
  }, [uri])

  return <div id="PageBody" ref={containerRef} />
}
```

### With Vue

```vue
<template>
  <div id="PageBody" ref="container"></div>
</template>

<script>
export default {
  props: ['uri'],
  mounted() {
    if (window.panes) {
      const subject = window.$rdf.sym(this.uri)
      window.panes.runDataBrowser(document, subject)
    }
  }
}
</script>
```

## Registering Custom Panes

Add custom panes before running the browser:

```javascript
// Define your pane
const myPane = {
  name: 'my-custom-pane',
  icon: '🎯',
  label: (subject) => { /* ... */ },
  render: (subject, dom, context) => { /* ... */ }
}

// Register it
panes.paneRegistry.register(myPane)

// Then run the browser
panes.runDataBrowser(document)
```

## Styling

### CSS Variables

Customize appearance with CSS variables:

```css
:root {
  --solid-primary-color: #7C4DFF;
  --solid-secondary-color: #536DFE;
  --solid-background-color: #FAFAFA;
  --solid-text-color: #212121;
  --solid-border-radius: 4px;
  --solid-font-family: system-ui, sans-serif;
}
```

### Custom Stylesheet

Override specific elements:

```css
/* Custom header styling */
#PageHeader {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

/* Custom pane cards */
.solid-panel {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

/* Custom buttons */
.solid-button {
  border-radius: 20px;
}
```

## Events

mashlib emits events you can listen for:

```javascript
// Navigation events
document.addEventListener('solid-navigate', (event) => {
  console.log('Navigated to:', event.detail.uri)
})

// Login/logout events (v2.0: use SolidLogic.authn)
SolidLogic.authn.onLogin((webId) => {
  console.log('User logged in:', webId)
})

SolidLogic.authn.onLogout(() => {
  console.log('User logged out')
})
```

## Building from Source

```bash
# Clone the monorepo
git clone https://github.com/SolidOS/solidos.git
cd solidos

# Install and build
npm install
npm run setup
npm run build

# The bundle is in packages/mashlib/dist/
```

### Development Mode

```bash
# Watch for changes
npm run watch

# Start dev server
npm start
```

## Bundle Contents

mashlib includes:

- **rdflib.js** — RDF operations
- **solid-logic** — authentication, ACL, utilities
- **solid-ui** — UI components
- **solid-panes** — all built-in panes
- **pane-registry** — pane management

### Bundle Size

| File | Size (gzipped) |
|------|----------------|
| mashlib.min.js | ~400 KB |
| mash.css | ~50 KB |

## Server Integration

### Node Solid Server (NSS)

NSS includes mashlib by default. It serves the data browser for HTML requests.

### Community Solid Server (CSS)

Configure CSS to serve mashlib:

```json
{
  "@context": "https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server/^7.0.0/components/context.jsonld",
  "import": [
    "css:config/app/main/default.json",
    "css:config/app/init/static-root.json"
  ],
  "staticPath": "./node_modules/mashlib/dist/"
}
```

## Troubleshooting

### "panes is not defined"

Ensure mashlib is loaded before your script:

```html
<script src="mashlib.min.js"></script>
<script>
  // panes is now available
</script>
```

### CORS Errors

When accessing remote pods, ensure CORS is configured. For development, use a local Solid server.

### Styling Issues

Make sure mash.css is loaded:

```html
<link href="mash.css" rel="stylesheet">
```

## See Also

- [mashlib GitHub](https://github.com/SolidOS/mashlib)
- [SolidOS Monorepo](https://github.com/SolidOS/solidos)
- [Deployment Guide](/docs/reference/deployment) — hosting options
- [Theming](/docs/reference/theming) — customization
