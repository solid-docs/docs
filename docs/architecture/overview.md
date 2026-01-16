---
sidebar_position: 1
title: Architecture Overview
description: How SolidOS components fit together
---

# Architecture Overview

SolidOS is a modular system built from composable libraries.

## The Stack

![SolidOS Architecture Stack](/img/architecture-stack.svg)

## Component Responsibilities

### rdflib.js

The foundation. Handles all RDF operations:

- **Store** — in-memory RDF graph database
- **Fetcher** — loads data from URIs into the store
- **UpdateManager** — writes changes back to pods
- **Query** — SPARQL-like querying

```javascript
import { graph, Fetcher, UpdateManager } from 'rdflib'

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)

await fetcher.load('https://alice.example/profile/card')
```

### solid-logic

Business logic layer on top of rdflib:

- **Authentication** — Solid-OIDC login/logout
- **ACL Logic** — permission checking
- **Type Index** — resource type discovery
- **Singleton store** — shared across the app

```javascript
import { store, authn } from 'solid-logic'

const user = authn.currentUser()
await store.fetcher.load(user)
```

### solid-ui

Reusable UI components for Solid data:

- **Widgets** — buttons, fields, tables
- **Forms** — auto-generated from ontologies
- **Styles** — consistent theming

```javascript
import * as UI from 'solid-ui'

const button = UI.widgets.button(
  document,
  'Click me',
  () => console.log('clicked')
)
```

### solid-panes

The pane registry and built-in panes:

- **Pane Registry** — registers and selects panes
- **Built-in Panes** — contacts, chat, folder, etc.
- **Pane API** — standard interface for panes

```javascript
import { paneRegistry } from 'solid-panes'

paneRegistry.register(myCustomPane)
const pane = paneRegistry.byName('folder')
```

### mashlib

The final bundle that pulls it all together:

- Exports `panes` global
- Includes all built-in panes
- Provides `runDataBrowser()` entry point
- Builds to `mashlib.js` + `mash.css`

```html
<script src="mashlib.min.js"></script>
<script>
  panes.runDataBrowser(document)
</script>
```

## Data Flow

![SolidOS Data Flow - Reading and Writing](/img/architecture-dataflow.svg)

## The Singleton Pattern

SolidOS uses singletons for shared state:

```javascript
// solid-logic exports a singleton store
import { store } from 'solid-logic'

// All panes use the same store
// Changes in one pane are visible to others
```

This enables:
- Shared authentication state
- Single cache for fetched data
- Coordinated updates

## Deployment Models

### Embedded in Solid Server

```
Solid Server (CSS, NSS)
├── serves pod data
└── serves SolidOS UI
    └── mashlib.js intercepts navigation
```

### Standalone Web App

```
Static Host (GitHub Pages, Netlify)
├── index.html loads mashlib
└── Accesses remote pods via CORS
```

### Desktop App (Data Kitchen)

```
Electron
├── Chromium renders mashlib
└── Node.js handles system integration
```

## Module Boundaries

![SolidOS Module Dependencies](/img/architecture-modules.svg)

## See Also

- [Pane System](/docs/architecture/pane-system) — how panes work
- [Data Flow](/docs/architecture/data-flow) — detailed data lifecycle
- [Monorepo Structure](/docs/architecture/monorepo-structure) — code organization
