---
sidebar_position: 5
title: solid-panes
description: The pane registry and built-in panes
---

# solid-panes

solid-panes provides the pane registry system and a collection of built-in panes for rendering Solid data.

## Installation

```bash
npm install solid-panes
```

## Pane Registry

The pane registry manages pane registration and selection:

```javascript
import { paneRegistry } from 'solid-panes'

// Register a custom pane
paneRegistry.register(myPane)

// Get a pane by name
const folderPane = paneRegistry.byName('folder')

// Find panes for a subject
const applicablePanes = paneRegistry.bySubject(subject)

// Get the best pane for a subject
const bestPane = paneRegistry.findBest(subject)
```

### Registration

```javascript
import { paneRegistry } from 'solid-panes'

const myPane = {
  name: 'my-custom-pane',
  icon: '📋',

  label: (subject) => {
    // Return label if this pane can render the subject
    if (canHandle(subject)) {
      return 'My Custom View'
    }
    return null
  },

  render: (subject, dom, context) => {
    const container = dom.createElement('div')
    // Build UI
    return container
  }
}

// Register the pane
paneRegistry.register(myPane)

// Unregister if needed
paneRegistry.unregister('my-custom-pane')
```

### Priority and Selection

When multiple panes can render a subject, the registry selects based on specificity:

```javascript
// More specific panes win
contactPane.label(aliceContact)  // "Contact" (specific type)
tablePane.label(aliceContact)    // "Data" (generic)
// contactPane is selected

// The label string doesn't affect priority
// Specificity is determined by how narrow the type match is
```

## Built-in Panes

solid-panes includes these panes:

| Pane | RDF Type | Purpose |
|------|----------|---------|
| `folder` | `ldp:Container` | File/folder browser |
| `contacts` | `vcard:Individual` | Contact cards |
| `addressBook` | `vcard:AddressBook` | Contact collections |
| `chat` | `meeting:LongChat` | Real-time messaging |
| `meeting` | `meeting:Meeting` | Meeting agendas |
| `profile` | WebID profiles | User profiles |
| `source` | Any | Raw source viewer |
| `internal` | Any | Debug internals |
| `table` | Any | Generic RDF table |
| `image` | Images | Photo viewer |
| `video` | Videos | Video player |
| `audio` | Audio | Audio player |
| `issue` | `wf:Issue` | Issue tracker |
| `trip` | `trip:Trip` | Trip planning |

### Using Built-in Panes

```javascript
import { paneRegistry } from 'solid-panes'

// Get a specific pane
const folderPane = paneRegistry.byName('folder')

// Render it manually
const element = folderPane.render(
  sym('https://alice.example/documents/'),
  document,
  { solo: true }
)
container.appendChild(element)
```

## Registering All Panes

To register all built-in panes:

```javascript
import { registerPanes } from 'solid-panes'

// Register all built-in panes
registerPanes()

// Now the registry has all standard panes
```

This is typically called during app initialization.

## Context Object

Panes receive a context object with useful properties:

```javascript
render: (subject, dom, context) => {
  // Available in context
  context.dom           // The DOM document
  context.div           // Container element (optional)
  context.store         // The RDF store
  context.session       // Auth session info
  context.noun          // Readable name for subject
  context.solo          // Is this the only pane showing?
  context.paneRegistry  // Reference to the registry

  // Use context.store instead of importing
  const name = context.store.any(subject, foaf('name'))
}
```

## Nested Panes

Panes can embed other panes:

```javascript
render: (subject, dom, context) => {
  const container = dom.createElement('div')

  // Get author resource
  const author = store.any(subject, dc('creator'), null, null)

  if (author) {
    // Find and render the appropriate pane for the author
    const authorPane = context.paneRegistry.findBest(author)
    if (authorPane) {
      const authorElement = authorPane.render(author, dom, {
        ...context,
        solo: false  // Not the main pane
      })
      container.appendChild(authorElement)
    }
  }

  return container
}
```

## Pane Options

Some panes accept options:

```javascript
// Source pane with syntax highlighting
const sourceElement = sourcePane.render(subject, dom, {
  ...context,
  options: {
    language: 'turtle',
    readOnly: true
  }
})

// Folder pane with filters
const folderElement = folderPane.render(container, dom, {
  ...context,
  options: {
    showHidden: false,
    filter: (item) => item.type !== 'acl'
  }
})
```

## Creating a Pane Package

Structure a pane as a separate package:

```
my-pane/
├── package.json
├── src/
│   ├── index.ts
│   └── myPane.ts
└── dist/
    └── myPane.js
```

```json
// package.json
{
  "name": "solidos-my-pane",
  "main": "dist/myPane.js",
  "peerDependencies": {
    "solid-panes": "^3.0.0",
    "solid-ui": "^2.0.0",
    "solid-logic": "^1.0.0",
    "rdflib": "^2.0.0"
  }
}
```

```typescript
// src/index.ts
import { paneRegistry } from 'solid-panes'
import myPane from './myPane'

export function register() {
  paneRegistry.register(myPane)
}

export default myPane
```

## Testing Panes

```javascript
import { graph, sym, lit } from 'rdflib'
import myPane from './myPane'

describe('myPane', () => {
  let store

  beforeEach(() => {
    store = graph()
  })

  test('label returns null for non-matching types', () => {
    const subject = sym('https://example.org/other')
    store.add(subject, rdf('type'), sym('http://other.org/Type'))

    const label = myPane.label(subject, { store })
    expect(label).toBeNull()
  })

  test('label returns string for matching types', () => {
    const subject = sym('https://example.org/thing')
    store.add(subject, rdf('type'), MY_TYPE)

    const label = myPane.label(subject, { store })
    expect(label).toBe('My Thing')
  })

  test('render creates proper DOM', () => {
    const subject = sym('https://example.org/thing')
    store.add(subject, rdfs('label'), lit('Test'))

    const element = myPane.render(subject, document, { store })

    expect(element.querySelector('h2').textContent).toBe('Test')
  })
})
```

## TypeScript Types

```typescript
import type { PaneDefinition, PaneContext } from 'pane-registry'

interface PaneDefinition {
  name: string
  icon?: string
  dev?: {
    name: string
    repo?: string
  }
  label: (subject: NamedNode, context: PaneContext) => string | null
  render: (subject: NamedNode, dom: Document, context: PaneContext) => HTMLElement
}

interface PaneContext {
  dom: Document
  div?: HTMLElement
  store: IndexedFormula
  session?: any
  noun?: string
  solo?: boolean
  paneRegistry?: PaneRegistry
  options?: Record<string, any>
}
```

## See Also

- [solid-panes GitHub](https://github.com/SolidOS/solid-panes)
- [Panes Overview](/docs/panes/overview) — how panes work
- [Creating Panes](/docs/panes/creating-panes) — step-by-step guide
- [Built-in Panes](/docs/panes/folder-pane) — documentation for each pane
