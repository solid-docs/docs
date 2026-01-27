---
sidebar_position: 2
title: Pane Anatomy
description: Structure and lifecycle of a SolidOS pane
---

# Pane Anatomy

Every pane in SolidOS follows a consistent structure that enables the databrowser to discover, activate, and render it appropriately.

## Core Structure

A pane is a JavaScript object with these essential properties:

```javascript
const myPane = {
  // Unique identifier
  name: 'myPane',

  // Icon shown in pane selector
  icon: icons.iconBase + 'noun_Document.svg',

  // Determines if pane can render this subject
  label: (subject, context) => {
    // Return string label if applicable, null otherwise
    if (store.holds(subject, RDF('type'), FOAF('Person'))) {
      return 'View Person'
    }
    return null
  },

  // Renders the pane content
  render: (subject, context) => {
    const div = context.dom.createElement('div')
    // Build your UI here
    return div
  }
}
```

## Required Properties

### `name`

A unique string identifier for the pane. Used internally for registration and debugging.

```javascript
name: 'profilePane'
```

### `icon`

URL to an SVG icon displayed in the pane selector. Usually references icons from solid-ui:

```javascript
icon: icons.iconBase + 'noun_15059.svg'
```

### `label(subject, context)`

A function that determines whether this pane can render the given subject.

**Parameters:**
- `subject` - The RDF node to potentially render
- `context` - Object containing `dom`, `session`, and other context

**Returns:**
- `string` - Label to show in pane selector (pane is applicable)
- `null` - Pane cannot render this subject

```javascript
label: (subject, context) => {
  // Check if subject is a Person
  if (store.holds(subject, RDF('type'), FOAF('Person'))) {
    return 'Profile'
  }
  // Check if subject is a chat
  if (store.holds(subject, RDF('type'), MEETING('LongChat'))) {
    return 'Chat'
  }
  return null
}
```

### `render(subject, context)`

Creates and returns the DOM element for this pane.

**Parameters:**
- `subject` - The RDF node to render
- `context` - Object containing:
  - `dom` - Document object for creating elements
  - `session` - Current user session
  - `div` - Container div (optional)

**Returns:**
- `HTMLElement` - The rendered pane content

```javascript
render: (subject, context) => {
  const { dom } = context
  const div = dom.createElement('div')
  div.className = 'myPane'

  const name = store.any(subject, FOAF('name'))
  if (name) {
    const h1 = dom.createElement('h1')
    h1.textContent = name.value
    div.appendChild(h1)
  }

  return div
}
```

## Optional Properties

### `mintClass`

RDF class that this pane can create new instances of:

```javascript
mintClass: FOAF('Person')
```

### `mintNew(context, options)`

Function to create a new instance of the pane's data type:

```javascript
mintNew: async (context, options) => {
  const newDoc = options.newBase + 'profile.ttl'
  // Create the resource
  return { newInstance: sym(newDoc + '#me') }
}
```

### `global`

If `true`, pane appears in global menu rather than per-resource:

```javascript
global: true
```

## Lifecycle

1. **Registration** - Pane is registered with `paneRegistry.register(myPane)`
2. **Discovery** - When user navigates to a resource, all panes' `label()` functions are called
3. **Selection** - Applicable panes appear in the pane selector
4. **Rendering** - When selected, `render()` is called to build the UI
5. **Updates** - Pane can subscribe to store changes to update reactively

## Context Object

The context passed to `label()` and `render()` contains:

| Property | Type | Description |
|----------|------|-------------|
| `dom` | Document | For creating DOM elements |
| `session` | Object | Current authentication session |
| `div` | HTMLElement | Container element (in render) |
| `statusArea` | HTMLElement | Area for status messages |
| `getOutliner` | Function | Gets the outliner instance |

## Example: Complete Pane

```javascript
import { store, sym } from 'solid-logic'
import { icons, widgets } from 'solid-ui'
import { Namespace } from 'rdflib'

const FOAF = Namespace('http://xmlns.com/foaf/0.1/')
const RDF = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')

export const personPane = {
  name: 'person',

  icon: icons.iconBase + 'noun_15059.svg',

  label: (subject, context) => {
    if (store.holds(subject, RDF('type'), FOAF('Person'))) {
      return 'Person'
    }
    return null
  },

  render: (subject, context) => {
    const { dom } = context
    const container = dom.createElement('div')
    container.className = 'personPane'

    // Name
    const name = store.any(subject, FOAF('name'))
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name.value
      container.appendChild(h1)
    }

    // Photo
    const photo = store.any(subject, FOAF('img'))
    if (photo) {
      const img = dom.createElement('img')
      img.src = photo.uri
      img.style.maxWidth = '200px'
      container.appendChild(img)
    }

    // Friends
    const friends = store.each(subject, FOAF('knows'))
    if (friends.length > 0) {
      const h2 = dom.createElement('h2')
      h2.textContent = `Friends (${friends.length})`
      container.appendChild(h2)

      const ul = dom.createElement('ul')
      friends.forEach(friend => {
        const li = dom.createElement('li')
        li.textContent = friend.uri
        ul.appendChild(li)
      })
      container.appendChild(ul)
    }

    return container
  }
}
```

## See Also

- [Creating Panes](/panes/creating-panes) - Step-by-step guide
- [Pane Overview](/panes/overview) - Available panes
- [solid-ui Widgets](/libraries/solid-ui) - UI components for panes
