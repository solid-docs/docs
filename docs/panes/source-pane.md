---
sidebar_position: 7
title: Source Pane
description: Raw data viewer
---

# Source Pane

The source pane shows the raw source of any resource — useful for debugging and understanding data structures.

## What It Renders

- Any RDF resource (Turtle, JSON-LD, RDF/XML)
- Plain text files
- JSON files
- HTML documents
- Any fetchable resource

## Features

- Syntax highlighting
- Multiple serialization formats
- Copy to clipboard
- Download source
- Line numbers
- Search within source
- Format switching

## Screenshot

![Source Pane Mockup](/img/panes/source-pane-mockup.svg)

The source pane provides a code editor view with syntax highlighting for Turtle and other RDF formats.

## Usage

The source pane is always available as a fallback:

```javascript
// Force source view for any resource
const sourcePane = paneRegistry.byName('source')
const element = sourcePane.render(subject, document, context)
```

### URL Parameter

Add `&view=source` to force source view:

```
https://example.org/browse?uri=https://alice.example/data.ttl&view=source
```

## Serialization Formats

Switch between formats for RDF resources:

| Format | MIME Type |
|--------|-----------|
| Turtle | text/turtle |
| JSON-LD | application/ld+json |
| N-Triples | application/n-triples |
| RDF/XML | application/rdf+xml |
| N3 | text/n3 |

```javascript
import { serialize } from 'rdflib'

// Get source in different formats
const turtle = serialize(doc, store, null, 'text/turtle')
const jsonld = serialize(doc, store, null, 'application/ld+json')
const ntriples = serialize(doc, store, null, 'application/n-triples')
```

## Syntax Highlighting

The source pane uses syntax highlighting for:

- **Turtle/N3** — prefixes, URIs, literals
- **JSON-LD** — keys, values, @context
- **JavaScript** — keywords, strings, numbers
- **HTML** — tags, attributes
- **CSS** — selectors, properties
- **Plain text** — no highlighting

## Editing Mode

For resources you have write access to:

```javascript
// The pane provides an edit toggle
// When editing:
// 1. Source becomes editable textarea
// 2. Save button appears
// 3. Changes are validated before save
```

### Programmatic Edit

```javascript
import { store, parse, serialize } from 'rdflib'

async function updateSource(docUri, newTurtle) {
  const doc = sym(docUri)

  // Parse the new content
  const tempStore = graph()
  parse(newTurtle, tempStore, docUri, 'text/turtle')

  // Get old and new statements
  const oldStatements = store.statementsMatching(null, null, null, doc)
  const newStatements = tempStore.statementsMatching(null, null, null, doc)

  // Apply the update
  await store.updater.update(oldStatements, newStatements)
}
```

## Raw HTTP Response

View HTTP headers and response details:

```javascript
// The pane can show HTTP metadata
const response = store.fetcher.requested[docUri]
console.log('Status:', response.status)
console.log('Content-Type:', response.headers.get('content-type'))
console.log('Last-Modified:', response.headers.get('last-modified'))
```

## Integration

### Embedding Source View

```javascript
const myPane = {
  render: (subject, dom, context) => {
    const container = dom.createElement('div')

    // Main content
    // ...

    // Add source view toggle
    const toggleBtn = UI.widgets.button(dom, 'View Source', () => {
      const sourcePane = paneRegistry.byName('source')
      const sourceView = sourcePane.render(subject, dom, {
        ...context,
        solo: false
      })
      container.appendChild(sourceView)
    })
    container.appendChild(toggleBtn)

    return container
  }
}
```

### Debug Panel

```javascript
// Show source for debugging
function showDebugSource(subject) {
  const sourcePane = paneRegistry.byName('source')

  const debugPanel = document.createElement('div')
  debugPanel.className = 'debug-panel'
  debugPanel.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    width: 400px;
    height: 300px;
    overflow: auto;
    background: #1e1e1e;
    color: #d4d4d4;
    font-family: monospace;
    padding: 10px;
    z-index: 9999;
  `

  const sourceElement = sourcePane.render(subject, document, {
    options: { readOnly: true }
  })
  debugPanel.appendChild(sourceElement)

  document.body.appendChild(debugPanel)
}
```

## Copy and Download

### Copy to Clipboard

```javascript
async function copySource(docUri, format = 'text/turtle') {
  const doc = sym(docUri)
  const source = serialize(doc, store, null, format)

  await navigator.clipboard.writeText(source)
}
```

### Download File

```javascript
function downloadSource(docUri, format = 'text/turtle') {
  const doc = sym(docUri)
  const source = serialize(doc, store, null, format)

  const ext = format === 'application/ld+json' ? 'jsonld' : 'ttl'
  const filename = `${doc.uri.split('/').pop()}.${ext}`

  const blob = new Blob([source], { type: format })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}
```

## Validation

The source pane validates RDF before saving:

```javascript
import { parse, graph } from 'rdflib'

function validateTurtle(turtle, baseUri) {
  try {
    const tempStore = graph()
    parse(turtle, tempStore, baseUri, 'text/turtle')
    return { valid: true, statements: tempStore.length }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}
```

## Source

- [source.js in solid-panes](https://github.com/SolidOS/solid-panes/blob/main/src/source/source.js)

## See Also

- [rdflib.js](/docs/libraries/rdflib) — serialization functions
- [Turtle Syntax](https://www.w3.org/TR/turtle/) — W3C specification
- [JSON-LD](https://json-ld.org/) — JSON for Linking Data
