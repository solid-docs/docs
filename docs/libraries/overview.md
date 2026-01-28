---
sidebar_position: 1
title: Libraries Overview
description: The core SolidOS libraries and their roles
---

# Libraries Overview

SolidOS is built from several interconnected libraries.

## Core Libraries

![SolidOS Library Stack](/img/architecture-stack.svg)

## Library Comparison

| Library | Purpose | Use When |
|---------|---------|----------|
| **rdflib** | RDF operations | You need raw RDF manipulation |
| **solid-logic** | Auth, ACL, store | You need Solid business logic |
| **solid-ui** | UI components | You're building a Solid UI |
| **solid-panes** | Pane collection | You want to add/modify panes |
| **mashlib** | Everything bundled | You want the full data browser |

## Dependency Graph

```
mashlib
├── solid-panes
│   ├── solid-ui
│   │   ├── solid-logic
│   │   │   └── rdflib
│   │   └── rdflib
│   └── solid-logic
└── solid-logic
    └── rdflib
```

## Quick Reference

### rdflib.js

```javascript
import { graph, Fetcher, sym, lit } from 'rdflib'

const store = graph()
const fetcher = new Fetcher(store)

// Fetch data
await fetcher.load('https://alice.example/profile/card')

// Query
const name = store.any(sym('...#me'), foaf('name'), null)

// Update
store.add(subject, predicate, object, document)
```

### solid-logic

```javascript
import { store, authn, solidLogicSingleton } from 'solid-logic'

// The shared store
await store.fetcher.load(uri)

// Authentication
const webId = authn.currentUser()
await authn.login()
await authn.logout()

// ACL
const canWrite = await solidLogicSingleton.checkAccess(uri, 'write')
```

### solid-ui

```javascript
import * as UI from 'solid-ui'

// Widgets
const btn = UI.widgets.button(dom, 'Click', callback)
const field = UI.widgets.textField(dom, options)
const table = UI.widgets.table(dom, subjects, columns)

// Forms
const form = UI.forms.buildForm(dom, store, subject, formSpec)

// Styles
UI.style.styleElement(element, 'button')
```

### solid-panes

```javascript
import { paneRegistry } from 'solid-panes'

// Register a pane
paneRegistry.register(myPane)

// Get pane by name
const pane = paneRegistry.byName('contacts')

// Find pane for a subject
const pane = paneRegistry.bySubject(subject)
```

### mashlib

```html
<script src="mashlib.min.js"></script>
<script>
  // Global entry point
  panes.runDataBrowser(document)

  // Access internals
  panes.UI        // solid-ui
  panes.store     // rdflib store
  panes.authn     // authentication
</script>
```

## Installation

### npm

```bash
# Individual packages
npm install rdflib
npm install solid-logic
npm install solid-ui
npm install solid-panes
npm install mashlib

# Or clone the monorepo
git clone https://github.com/SolidOS/solidos
npm run setup
```

### CDN

```html
<!-- Full bundle -->
<script src="https://cdn.jsdelivr.net/npm/mashlib/dist/mashlib.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/mashlib/dist/mash.css" rel="stylesheet">

<!-- Individual -->
<script src="https://cdn.jsdelivr.net/npm/rdflib/dist/rdflib.min.js"></script>
```

## TypeScript Support

All libraries include TypeScript definitions:

```typescript
import type { NamedNode, IndexedFormula } from 'rdflib'
import type { PaneDefinition } from 'pane-registry'
```

## See Also

- [rdflib.js](/docs/libraries/rdflib) — RDF foundation
- [solid-logic](/docs/libraries/solid-logic) — business logic
- [solid-ui](/docs/libraries/solid-ui) — UI widgets
- [mashlib](/docs/libraries/mashlib) — bundled browser
