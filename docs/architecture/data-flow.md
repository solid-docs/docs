---
sidebar_position: 3
title: Data Flow
description: How data is loaded, changed and kept up to date in SolidOS 3.1
---

# Data Flow

All data in SolidOS goes through one rdflib store, `SolidLogic.store` (in a pane, `context.session.store`). Panes read from the store, and write through it.

```
            browser                                    pod
pane ──reads──▶ store ◀──parses── fetcher ◀── GET ──── documents
  │               ▲                                     and folders
  │               │ on success                              ▲
  └──changes──▶ updater ──────────── PATCH ─────────────────┘
```

The snippets below use the page globals (`SolidLogic`, `$rdf`) and run in the browser console of a SolidOS 3.1 page.

## Loading

When you open an address, the outline manager loads the document into the store before asking the panes which of them can show it. To load a document yourself:

```javascript
const store = SolidLogic.store
const doc = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card')
const me = $rdf.sym(doc.uri + '#me')

await store.fetcher.load(doc)               // GET, parse, add the statements to the store
store.any(me, $rdf.sym('http://xmlns.com/foaf/0.1/name'))?.value   // "Testing SolidOS"
```

1. The fetcher sends `GET` with the login session's credentials, if any.
2. It parses the response (Turtle, JSON-LD, RDF/XML and others) into statements, recorded as coming from that document.
3. It also records the response headers in the store, such as `WAC-Allow` and `Accept-Patch`. The updater reads them to decide whether and how the document can be changed.

`load` does not fetch a document again if it is already loaded. A folder (container) is loaded the same way; its members are `ldp:contains` statements.

## Changing

A change is a list of statements to remove and a list to add, all in the same document:

```javascript
const store = SolidLogic.store
const doc = $rdf.sym('https://alice.example/notes/note.ttl')
const it = $rdf.sym(doc.uri + '#it')
const NAME = $rdf.sym('http://schema.org/name')

await store.fetcher.load(doc)
const old = store.any(it, NAME, null, doc)
await store.updater.update(
  [$rdf.st(it, NAME, old, doc)],                  // remove
  [$rdf.st(it, NAME, $rdf.lit('Second'), doc)]    // add
)
store.any(it, NAME, null, doc).value             // "Second"
```

1. The updater checks that the document is editable from the headers it was loaded with. If `WAC-Allow` says the user may not write or append, `update` fails with "Can't make changes in uneditable …".
2. It sends a `PATCH`. When the server's `Accept-Patch` offers both, rdflib 2.4.1 uses SPARQL Update (`application/sparql-update`) before N3 Patch (`text/n3`).
3. When the server accepts, the statements are changed in the store too, and `update` resolves. When it refuses, `update` rejects with the server's message and the store is not changed.

The pane that made the change redraws what it needs. Other views of the same data are not redrawn for you.

Creating, uploading and deleting documents and folders: see [Writing Data](../cookbook/writing-data.md).

## Changes made elsewhere

To hear about changes made by someone else, rdflib can listen on a WebSocket that the server names in an `Updates-Via` header (the older `solid-0.1` notification protocol):

```javascript
store.updater.addDownstreamChangeListener(doc, () => {
  // the document has been loaded again; redraw from the store
})
store.updater.getUpdatesVia(doc)    // the WebSocket address, or null if the server sends none
```

When a change is announced, rdflib reloads the document and then calls each listener with no arguments. If the server sends no `Updates-Via` header, `getUpdatesVia` returns null and the listener is never called.

## Page events

SolidOS 3.1 also tells the page when the view or its environment changes:

| Event | Fired on | `event.detail` |
|-------|----------|----------------|
| `solid-panes:navigated` | `document`, after a view is shown and its history entry written | `{ url, state }` |
| `mashlib:layoutchange` | `window` | `{ layout, preference, inputMode, viewport }` |
| `mashlib:themechange` | `window` | `{ theme }` |

```javascript
document.addEventListener('solid-panes:navigated', event => {
  console.log('now showing', event.detail.url)
})
```

The login session has events of its own: `SolidLogic.authSession.events.on('login' | 'logout' | 'sessionRestore' | 'sessionChange' | 'identityReplaced', handler)`. See [Authentication](../cookbook/authentication.md).

## See also

- [Architecture Overview](./overview.md)
- [rdflib](../libraries/rdflib.md)
- [Reading Data](../cookbook/reading-data.md) and [Writing Data](../cookbook/writing-data.md)
- [Navigation](../panes/navigation.md)
