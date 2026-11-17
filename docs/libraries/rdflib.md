---
sidebar_position: 2
title: rdflib.js
description: The RDF store, fetcher and updater under SolidOS
---

# rdflib.js

rdflib.js holds the RDF data SolidOS works with. It provides the in-memory store, the fetcher that loads documents from the web into it, and the update manager that writes changes back.

**SolidOS 3.1 uses rdflib 2.4.1**: mashlib 3.1.0 pins `rdflib` 2.4.1 and `solid-logic` 6.2.0.

## In SolidOS: use the shared store

A SolidOS page has one store, created by solid-logic. Panes and scripts on the page should use it rather than make their own, so that everything shares what has been loaded and the login session.

| What | Inside a pane | On a page that loads mashlib |
|---|---|---|
| rdflib itself | `$rdf` | `window.$rdf` |
| The store | `context.session.store` | `SolidLogic.store` |
| The fetcher | `context.session.store.fetcher` | `SolidLogic.store.fetcher` |
| The update manager | `context.session.store.updater` | `SolidLogic.store.updater` |

`context.session.store` and `SolidLogic.store` are the same object. Its fetcher sends every request through the logged-in session, so private resources load once the user has logged in (see [Authentication](../cookbook/authentication.md)).

The [Cookbook](../cookbook/overview.md) has task-by-task recipes. This page describes the rdflib API itself. Its examples were run in a SolidOS 3.1 pane, with:

```javascript
const store = context.session.store
const { fetcher, updater } = store
```

and the namespaces `FOAF` and `RDF` defined as [below](#namespaces).

## Outside SolidOS

```bash
npm install rdflib@2.4.1
```

```javascript
import * as $rdf from 'rdflib'

const store = $rdf.graph()
const fetcher = new $rdf.Fetcher(store)          // also sets store.fetcher
const updater = new $rdf.UpdateManager(store)    // also sets store.updater
```

In a plain HTML page, the browser build defines the global `$rdf`:

```html
<script src="https://cdn.jsdelivr.net/npm/rdflib@2.4.1/dist/rdflib.min.js"></script>
```

## Nodes

```javascript
const alice = $rdf.sym('https://alice.example/profile/card#me')   // NamedNode
const name = $rdf.lit('Alice')                                    // Literal
const age = $rdf.lit('30', undefined, $rdf.sym('http://www.w3.org/2001/XMLSchema#integer'))
const greeting = $rdf.lit('Bonjour', 'fr')                        // language-tagged
const address = $rdf.blankNode()                                  // BlankNode
const x = $rdf.variable('x')                                      // Variable, for queries

alice.doc()        // NamedNode <https://alice.example/profile/card>
alice.site()       // NamedNode <https://alice.example/>
alice.dir()        // NamedNode <https://alice.example/profile/>
```

`doc()` is the document a thing is described in: the URI without its `#fragment`. That is what you load, and what you name as the fourth part of a statement.

## Namespaces

```javascript
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')
const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#')
const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#')

FOAF('name')       // NamedNode <http://xmlns.com/foaf/0.1/name>
```

## The store

Each statement has a subject, predicate, object and a graph. In SolidOS the graph is the document the statement came from, or is to be written to.

```javascript
const kb = $rdf.graph()     // a separate, empty store (a pane uses context.session.store instead)
const alice = $rdf.sym('https://alice.example/profile/card#me')
const doc = alice.doc()

kb.add(alice, FOAF('name'), $rdf.lit('Alice'), doc)
kb.add($rdf.st(alice, RDF('type'), FOAF('Person'), doc))
kb.add(alice, FOAF('knows'), $rdf.sym('https://bob.example/profile/card#me'), doc)

kb.any(alice, FOAF('name'))?.value                 // 'Alice'
kb.anyValue(alice, FOAF('name'))                   // 'Alice'
kb.each(alice, FOAF('knows'))                      // [NamedNode]
kb.holds(alice, RDF('type'), FOAF('Person'))       // true
kb.statementsMatching(alice, null, null, doc)      // Statement[]
kb.each(null, FOAF('knows'), $rdf.sym('https://bob.example/profile/card#me'))   // who knows Bob

kb.remove($rdf.st(alice, FOAF('name'), $rdf.lit('Alice'), doc))
kb.removeMatches(alice, FOAF('knows'), null, doc)
kb.removeDocument(doc)                             // everything from that document
```

`null` (or leaving the argument out) matches anything. `any()` returns one matching node or `null`; `each()` returns all matches for the one position left open; `statementsMatching()` returns whole statements.

These calls change only the store in memory. To change data on a server, use the [update manager](#update-manager).

## Fetcher

```javascript
const card = 'https://testingsolidos.solidcommunity.net/profile/card'
const typeIndex = 'https://testingsolidos.solidcommunity.net/settings/publicTypeIndex.ttl'

await fetcher.load(card)                     // one document
await fetcher.load([card, typeIndex])        // several, in parallel
await fetcher.load(card, { force: true })    // refetch

fetcher.getState(card)                       // 'unrequested', 'requested', 'fetched' or 'failed'
fetcher.unload($rdf.sym(card))               // remove its statements from the store
await fetcher.load(card, { force: true })    // after unload, only a forced load fetches it again
```

`load()` accepts a NamedNode or a string, drops any `#fragment`, and does nothing if the document is already loaded, unless `force: true`. That includes a document removed with `unload()`: load it again with `force: true`. It rejects with an error that has `status` (the HTTP status, or `999` when the request could not be made at all) and `message`.

`webOperation()` makes any HTTP request without parsing the answer into the store:

```javascript
const response = await fetcher.webOperation('GET', 'https://testingsolidos.solidcommunity.net/profile/card')
response.responseText

await fetcher.webOperation('PUT', AREA + 'notes.txt', {
  data: 'Hello',
  contentType: 'text/plain'     // required whenever there is a body
})
```

`AREA` here and below is a folder the user may write to, such as `https://alice.example/public/`.

It rejects on a non-2xx answer with an error whose `response` is the `Response`. The fetcher also has `delete(uri)`, `createContainer(parentURI, folderName, data)` (a POST with a `Slug`) and `getHeader(doc, name)`. See [Writing Data](../cookbook/writing-data.md) for each in use.

### Fetcher options and authentication

```javascript
new $rdf.Fetcher(store, {
  fetch: myFetch,   // the fetch function to use for every request
  timeout: 30000    // ms; 30000 is the default
})
```

Without a `fetch` option, the fetcher uses `window.solidFetch` (or `global.solidFetch` in Node) if one is set, and otherwise a plain `fetch`. `solidFetcher` is still read as an older name for the same thing.

Inside SolidOS you do not need either: the shared store's fetcher already uses the session. If you make a store of your own on a SolidOS page and want it to send the user's credentials, pass the session's fetch:

```javascript
const kb = $rdf.graph()
const myFetcher = new $rdf.Fetcher(kb, {
  fetch: SolidLogic.authSession.authFetch.bind(SolidLogic.authSession)
})
```

SolidOS 3.1 logs in with [@uvdsl/solid-oidc-client-browser](https://github.com/uvdsl/solid-oidc-client-browser), wrapped by solid-logic as `authSession`. Any library that gives you a `fetch`-compatible function can be used the same way.

## Update manager

```javascript
const doc = $rdf.sym(AREA + 'alice.ttl')
const alice = $rdf.sym(doc.uri + '#me')

await updater.update([], [$rdf.st(alice, FOAF('name'), $rdf.lit('Alice'), doc)])   // creates the document

await updater.update(
  store.statementsMatching(alice, FOAF('name'), null, doc),   // statements to delete
  [$rdf.st(alice, FOAF('name'), $rdf.lit('Alice Smith'), doc)] // statements to insert
)
```

`update(deletions, insertions)` sends one PATCH for one document; every statement must have that document as its graph. When the server accepts it, the store is changed to match. Without a callback it returns a promise that rejects with an `Error` whose message contains the server's answer. If the document has not been loaded, `update()` loads it first; if it does not exist (404), the PATCH creates it.

`updateMany(deletions, insertions)` takes statements for several documents and sends one `update()` per document.

`put(doc, statements, contentType, callback)` replaces a whole document. It reports through the callback `(uri, ok, message)`; wrap it if you want a promise:

```javascript
const statements = [
  $rdf.st(alice, FOAF('name'), $rdf.lit('Alice'), doc),
  $rdf.st(alice, RDF('type'), FOAF('Person'), doc)
]
await new Promise((resolve, reject) => {
  updater.put(doc, statements, 'text/turtle', (uri, ok, message) => ok ? resolve() : reject(new Error(message)))
})
```

### Which method the update manager uses

`updater.editable(uri)` decides from the headers of the last response for that document:

1. If `WAC-Allow` gives the user neither `write` nor `append`, the document is not editable (`false`), and `update()` rejects.
2. If `Accept-Patch` lists `application/sparql-update` (or `application/sparql-update-single-match`), it uses **SPARQL Update** (`'SPARQL'`).
3. Otherwise, if `Accept-Patch` lists `text/n3`, it uses **N3 Patch** (`'N3PATCH'`).
4. Otherwise, if `MS-Author-Via` contains `SPARQL`, SPARQL Update; if it contains `DAV`, a full **PUT** (`'DAV'`).
5. With no response yet it returns `undefined`, and `update()` loads the document and tries again.

SPARQL Update comes first on purpose. rdflib's source says it is preferred over N3 Patch until the N3 Patch specification settles how inserts with blank nodes work. A server that offers both, such as solidcommunity.net and JavaScript Solid Server, is patched with SPARQL Update.

You can read the headers yourself:

```javascript
const doc = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card')
await store.fetcher.load(doc)

store.fetcher.getHeader(doc, 'wac-allow')       // [ 'user="read",public="read"' ]
store.fetcher.getHeader(doc, 'accept-patch')    // [ 'text/n3, application/sparql-update' ]
store.updater.editable(doc.uri)                 // false: this user may not write here
```

### Live updates

`updater.addDownstreamChangeListener(doc, listener)` reloads a document and calls `listener` when the server reports a change. It works only when the server sends an `Updates-Via` header (the older `solid-0.1` WebSocket protocol). Neither solidcommunity.net nor a default JavaScript Solid Server sent that header when this page was checked; on those servers the call sets up nothing.

## Parsing and serializing

```javascript
const kb = $rdf.graph()
const base = 'https://alice.example/profile/card'
const turtle = `
  @prefix foaf: <http://xmlns.com/foaf/0.1/> .
  <#me> a foaf:Person ; foaf:name "Alice" .
`
$rdf.parse(turtle, kb, base, 'text/turtle')

const doc = $rdf.sym(base)
const asTurtle = $rdf.serialize(doc, kb, base, 'text/turtle')
const asNTriples = $rdf.serialize(doc, kb, base, 'application/n-triples')
const asRdfXml = $rdf.serialize(doc, kb, base, 'application/rdf+xml')

// JSON-LD is produced asynchronously: pass a callback.
const asJsonLd = await new Promise((resolve, reject) =>
  $rdf.serialize(doc, kb, base, 'application/ld+json', (err, result) => err ? reject(err) : resolve(result)))

// Parsing JSON-LD is asynchronous too: the callback runs when the data is in the store.
await new Promise((resolve, reject) =>
  $rdf.parse(asJsonLd, $rdf.graph(), base, 'application/ld+json', err => err ? reject(err) : resolve()))
```

`serialize(doc, store, base, contentType)` writes the statements whose graph is `doc`.

## Lists

A Turtle list such as `( :a :b :c )` is parsed into a single `Collection` node. Its members are in `elements`:

```javascript
const me = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')
await fetcher.load(me.doc())

const list = store.any(me, $rdf.sym('http://schema.org/knowsLanguage'))
list.termType     // 'Collection'
list.elements     // the members, in order
```

## Types

rdflib ships TypeScript types. Commonly used ones:

```typescript
import type { NamedNode, Literal, BlankNode, Statement, Store, LiveStore, Fetcher, UpdateManager } from 'rdflib'
```

`LiveStore` is a store that has a fetcher and an update manager; it is the type of `context.session.store`.

## See also

- [rdflib.js on GitHub](https://github.com/linkeddata/rdflib.js)
- [solid-logic](./solid-logic.md): the Solid layer built on this store
- [Reading Data](../cookbook/reading-data.md) and [Writing Data](../cookbook/writing-data.md): recipes
- [RDF Primer](../reference/rdf-primer.md)
