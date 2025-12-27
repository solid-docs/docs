---
sidebar_position: 1
title: Architecture Overview
description: How SolidOS components fit together
---

# Architecture Overview

SolidOS is a modular system built from composable libraries.

## The Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                        │
├─────────────────────────────────────────────────────────────┤
│                        mashlib                              │
│              (bundles everything together)                  │
├───────────────────┬───────────────────┬─────────────────────┤
│   solid-panes     │    solid-ui       │    solid-logic      │
│  (pane registry)  │   (UI widgets)    │  (business logic)   │
├───────────────────┴───────────────────┴─────────────────────┤
│                       rdflib.js                             │
│                   (RDF store & fetcher)                     │
├─────────────────────────────────────────────────────────────┤
│                    Solid Pod (data)                         │
│              (via LDP / Solid Protocol)                     │
└─────────────────────────────────────────────────────────────┘
```

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

### Reading Data

```
User navigates to /contacts/alice.ttl
            ↓
mashlib intercepts navigation
            ↓
fetcher.load('/contacts/alice.ttl')
            ↓
Data added to store
            ↓
Pane registry: "Who handles vcard:Individual?"
            ↓
contacts-pane.render()
            ↓
DOM updated with contact card
```

### Writing Data

```
User edits contact name
            ↓
solid-ui input onChange
            ↓
updater.update(deletions, insertions)
            ↓
PATCH request to pod
            ↓
Store updated locally
            ↓
UI reflects change
```

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

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  mashlib (entry point)                                           │
│  - Depends on: solid-panes, solid-ui, solid-logic               │
│  - Exports: panes global, runDataBrowser                         │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  solid-panes (pane collection)                                   │
│  - Depends on: solid-ui, solid-logic, pane-registry              │
│  - Exports: registerPanes, individual panes                      │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  solid-ui (widgets)                                              │
│  - Depends on: solid-logic, rdflib                               │
│  - Exports: UI.widgets, UI.forms, UI.style                       │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  solid-logic (business logic)                                    │
│  - Depends on: rdflib                                            │
│  - Exports: store, authn, acl                                    │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  rdflib (RDF core)                                               │
│  - No Solid-specific dependencies                                │
│  - Exports: graph, Fetcher, UpdateManager, etc.                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## See Also

- [Pane System](/docs/architecture/pane-system) — how panes work
- [Data Flow](/docs/architecture/data-flow) — detailed data lifecycle
- [Monorepo Structure](/docs/architecture/monorepo-structure) — code organization
