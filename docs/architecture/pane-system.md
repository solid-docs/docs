---
sidebar_position: 2
title: Pane System
description: How the SolidOS pane architecture works
---

# Pane System Architecture

The pane system is the core of SolidOS's extensible UI. It allows different views to be registered and dynamically selected based on the data being displayed.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Browser                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Pane Registry                        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │   │
│  │  │ Profile │ │  Chat   │ │ Folder  │ │ Source  │    │   │
│  │  │  Pane   │ │  Pane   │ │  Pane   │ │  Pane   │    │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Pane Selection Logic                     │   │
│  │   subject + context → applicable panes → render      │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Rendered View                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Pane Registry

The pane registry maintains a list of all available panes:

```javascript
import { paneRegistry } from 'solid-panes'

// Register a pane
paneRegistry.register(myPane)

// Get all panes
const allPanes = paneRegistry.list

// Find pane by name
const profilePane = paneRegistry.byName('profile')
```

## Pane Selection

When navigating to a resource, the system:

1. **Loads the resource** from the Solid Pod
2. **Queries all panes** by calling each pane's `label()` function
3. **Filters applicable panes** (those returning non-null labels)
4. **Ranks panes** by priority/preference
5. **Renders the selected pane**

```javascript
function findApplicablePanes(subject, context) {
  return paneRegistry.list.filter(pane => {
    const label = pane.label(subject, context)
    return label !== null
  })
}
```

## Pane Priority

Panes can specify priority to influence selection order:

```javascript
const myPane = {
  name: 'myPane',
  priority: 10,  // Higher = more preferred

  label: (subject) => { /* ... */ },
  render: (subject, context) => { /* ... */ }
}
```

Default priorities:
- **Specific panes** (profile, chat): 10-20
- **Generic panes** (source, folder): 1-5
- **Fallback panes**: 0

## Data Flow

```
User navigates to URL
        ↓
   Fetcher loads RDF
        ↓
   Store updated
        ↓
   Panes queried
        ↓
   Best pane selected
        ↓
   render() called
        ↓
   DOM updated
        ↓
   User sees view
```

## Context Object

Panes receive a context object with:

```javascript
const context = {
  // DOM document for creating elements
  dom: document,

  // Current user session
  session: {
    webId: 'https://alice.example/profile/card#me',
    isLoggedIn: true
  },

  // Container element
  div: containerElement,

  // Status area for messages
  statusArea: statusElement,

  // Access to outliner
  getOutliner: () => outliner,

  // Preferences
  preferences: {
    userRole: 'powerUser'
  }
}
```

## Pane Communication

Panes can communicate through the shared store:

```javascript
// Pane A writes data
store.add(subject, predicate, object, doc)
store.updater.update(deletions, insertions)

// Pane B subscribes to changes
store.updater.addDownstreamChangeListener(doc, () => {
  // Re-render when data changes
  refresh()
})
```

## Nested Panes

Panes can embed other panes:

```javascript
render: (subject, context) => {
  const div = context.dom.createElement('div')

  // Render a nested pane
  const friendsPane = paneRegistry.byName('friends')
  if (friendsPane) {
    const friendsDiv = friendsPane.render(subject, context)
    div.appendChild(friendsDiv)
  }

  return div
}
```

## Pane Lifecycle

```
┌──────────────┐
│  Registered  │
└──────┬───────┘
       ↓
┌──────────────┐
│   Queried    │ ← label() called
└──────┬───────┘
       ↓
┌──────────────┐
│  Selected    │ ← User picks or auto-selected
└──────┬───────┘
       ↓
┌──────────────┐
│  Rendered    │ ← render() called
└──────┬───────┘
       ↓
┌──────────────┐
│   Active     │ ← Responding to user/data changes
└──────┬───────┘
       ↓
┌──────────────┐
│  Destroyed   │ ← User navigates away
└──────────────┘
```

## Custom Pane Types

### View Panes

Display data (most common):

```javascript
const viewPane = {
  name: 'articleView',
  label: (subject) => {
    if (store.holds(subject, RDF('type'), SCHEMA('Article'))) {
      return 'Read Article'
    }
    return null
  },
  render: (subject, context) => { /* ... */ }
}
```

### Edit Panes

Modify data:

```javascript
const editPane = {
  name: 'articleEdit',
  label: (subject) => {
    if (store.holds(subject, RDF('type'), SCHEMA('Article'))) {
      return 'Edit Article'
    }
    return null
  },
  render: (subject, context) => {
    // Return form UI
  }
}
```

### Create Panes

Create new resources:

```javascript
const createPane = {
  name: 'newArticle',
  mintClass: SCHEMA('Article'),

  mintNew: async (context, options) => {
    const uri = options.newBase + 'article.ttl#this'
    // Create resource
    return { newInstance: sym(uri) }
  }
}
```

## See Also

- [Pane Anatomy](/panes/pane-anatomy) - Structure of a pane
- [Creating Panes](/panes/creating-panes) - Build your own
- [Available Panes](/panes/overview) - Built-in panes
