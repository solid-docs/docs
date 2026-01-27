---
sidebar_position: 3
title: Data Flow
description: How data moves through SolidOS
---

# Data Flow

Understanding how data flows through the SolidOS architecture.

## Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│   SolidOS   │────▶│  Solid Pod  │
│   Action    │     │   (Client)  │     │  (Server)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌─────────┐   ┌─────────┐
              │  Store  │   │  Panes  │
              │(rdflib) │   │  (UI)   │
              └─────────┘   └─────────┘
```

## Fetch Cycle

1. **User navigates** to a URI
2. **Fetcher** requests the resource from the Pod
3. **Parser** converts response to RDF triples
4. **Store** holds the data in memory
5. **Panes** render the data as UI

```javascript
// 1. Navigate
const uri = 'https://alice.example/profile/card#me'

// 2-4. Fetch and parse into store
await store.fetcher.load(sym(uri))

// 5. Query and render
const name = store.any(sym(uri), FOAF('name'))
```

## Update Cycle

1. **User edits** data in a pane
2. **Pane** creates update statements
3. **Updater** sends PATCH to Pod
4. **Store** updates local cache
5. **UI** refreshes

```javascript
// 1-2. User changes name
const deletions = [st(me, FOAF('name'), oldName, doc)]
const insertions = [st(me, FOAF('name'), newName, doc)]

// 3-4. Send update
await store.updater.update(deletions, insertions)

// 5. UI automatically updates
```

## Subscription Flow

For real-time updates:

```javascript
// Subscribe to changes
store.updater.addDownstreamChangeListener(doc, (changes) => {
  // Re-render when data changes
  refreshUI()
})
```

## See Also

- [Pane System](/architecture/pane-system)
- [Architecture Overview](/architecture/overview)
- [rdflib.js](/libraries/rdflib)
