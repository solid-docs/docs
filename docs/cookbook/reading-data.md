---
sidebar_position: 3
title: Reading Data
description: Loading and querying RDF data from Solid pods
---

# Reading Data

Recipes for loading documents into the store and asking questions of them. Each one was run inside SolidOS 3.1 against the public test profile `https://testingsolidos.solidcommunity.net/profile/card#me`; the comments show what it returned.

All recipes on this page start from these lines, inside a pane's `render(subject, context)` or any function that has the pane `context`:

```javascript
const store = context.session.store      // the shared rdflib store
const { fetcher, updater } = store       // rdflib Fetcher and UpdateManager
const logic = context.session.logic      // solid-logic (resource, profile, typeIndex, acl, ...)
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')
const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#')
const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#')
```

`$rdf` is the rdflib global that mashlib sets. On a page outside a pane, use `SolidLogic.store` and `SolidLogic.solidLogicSingleton` for `store` and `logic`. See [Cookbook](./overview.md) for what else a pane has.

## Loading

### Load a document

```javascript
async function loadDocument (uri) {
  const doc = $rdf.sym(uri).doc()          // drop any #fragment
  await fetcher.load(doc)
  return store.statementsMatching(null, null, null, doc).length
}

const count = await loadDocument('https://testingsolidos.solidcommunity.net/profile/card#me')
```

Load the document, not the thing in it: `$rdf.sym(webId).doc()`. `fetcher.load()` drops a fragment by itself, but the statements are stored with the document as their graph, so you need `doc()` to ask about them.

### Load several documents at once

```javascript
await fetcher.load([
  'https://testingsolidos.solidcommunity.net/profile/card',
  'https://testingsolidos.solidcommunity.net/settings/publicTypeIndex.ttl'
])
```

The requests run in parallel. The promise rejects if any of them fails; use `Promise.allSettled` with one `load()` per document when some may fail (see [Following links](#following-links)).

### Already loaded? Reload

```javascript
const uri = 'https://testingsolidos.solidcommunity.net/profile/card'

fetcher.getState(uri)   // 'unrequested', 'requested', 'fetched' or 'failed'

// A second load() of a fetched document is answered from the store.
await fetcher.load(uri)

// force: true refetches it from the server.
await fetcher.load(uri, { force: true })
```

## Querying

### Values

```javascript
const me = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')
await fetcher.load(me.doc())

// One value, or null
const name = store.any(me, FOAF('name'))            // Literal "Testing SolidOS"
name?.value                                         // 'Testing SolidOS'

// The value as a string straight away
const fn = store.anyValue(me, VCARD('fn'))          // 'Testing SolidOS Test'

// All values
const friends = store.each(me, FOAF('knows'))       // [NamedNode, NamedNode]

// Does a statement exist?
const isPerson = store.holds(me, RDF('type'), FOAF('Person'))   // true

// Whole statements, here everything said about `me` in its own document
const statements = store.statementsMatching(me, null, null, me.doc())
```

Each call takes `(subject, predicate, object, document)`; `null` or a missing argument matches anything. Pass the document as the fourth argument when you want only what that document says.

### Types

```javascript
const me = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')
await fetcher.load(me.doc())

const types = store.each(me, RDF('type'))          // the rdf:type values as stated
const all = Object.keys(store.findTypeURIs(me))    // also the types implied by loaded ontologies
```

Here both return `schema:Person` and `foaf:Person`.

### A display label

```javascript
const me = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')
await fetcher.load(me.doc())

UI.utils.label(me)   // the label SolidOS shows for a thing, e.g. 'Testing SolidOS Test'
```

`UI` is the solid-ui global. `UI.utils.label` picks a name from the usual predicates and falls back to a readable form of the URI. See [solid-ui](../libraries/solid-ui.md).

### Folder contents

```javascript
const folder = $rdf.sym('https://testingsolidos.solidcommunity.net/public/')
await fetcher.load(folder)

const members = logic.resource.getContainerMembers(folder)   // NamedNode[] from the loaded listing
// the same with plain rdflib:
const same = store.each(folder, LDP('contains'))

const folders = members.filter(m => logic.resource.isContainer(m))
```

`logic.resource.getContainerMembers()` reads what is already in the store, so load the folder first. `isContainer()` is true for a URI ending in `/` or typed as an LDP container.

### Lists

```javascript
const me = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')
await fetcher.load(me.doc())

// rdflib parses a Turtle list ( a b c ) into a Collection node.
const SCHEMA = $rdf.Namespace('http://schema.org/')
const lists = store.each(me, SCHEMA('knowsLanguage'))
const longest = lists.reduce((a, b) => (b.elements.length > a.elements.length ? b : a))
longest.termType          // 'Collection'
longest.elements          // the members, in order
```

## Following links

```javascript
async function friendNames (webId) {
  const person = $rdf.sym(webId)
  await fetcher.load(person.doc())

  const friends = store.each(person, FOAF('knows'))
  // Load all friends' profiles in parallel; one failure does not stop the rest.
  const results = await Promise.allSettled(friends.map(friend => fetcher.load(friend.doc())))

  return friends.map((friend, i) => ({
    webId: friend.uri,
    loaded: results[i].status === 'fulfilled',
    name: store.anyValue(friend, FOAF('name')) ?? store.anyValue(friend, VCARD('fn'))
  }))
}

const friends = await friendNames('https://testingsolidos.solidcommunity.net/profile/card#me')
// [ { webId: 'https://solidos.solidcommunity.net/profile/card#me', loaded: true,
//     name: 'Solid Open Source Operating System' },
//   { webId: 'https://timbl.inrupt.net/profile/card#me', loaded: false, name: undefined } ]
```

Links on the web break; here one of the two profiles no longer loads. Plan for that.

## Finding a person's data: type indexes

```javascript
const me = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')
await fetcher.load(me.doc())

// Load the public type index (and the private one if you are its owner)
const scopes = await logic.typeIndex.loadTypeIndexesFor(me)   // [{ label, index, agent }]

// Then find where this person keeps things of a given class
const apps = await logic.typeIndex.getScopedAppInstances(VCARD('AddressBook'), me)
apps.map(app => app.instance.uri)
// [ 'https://testingsolidos.solidcommunity.net/public/Contacts/index.ttl#this' ]
```

## Without parsing

### Headers and permissions

```javascript
const doc = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card')
const meta = await logic.resource.fetchMetadata(doc)    // a HEAD request
meta.contentType       // 'text/turtle'
meta.access.canEdit    // from the WAC-Allow header: can the current user write?
meta.access.isPublic   // can everyone read it?
meta.aclUri            // the ACL document from the Link header
```

### The raw text

```javascript
// The text of any resource, not parsed into the store
const response = await fetcher.webOperation('GET', 'https://testingsolidos.solidcommunity.net/profile/card')
const text = response.responseText

// or, with the metadata as well:
const { content, metadata } = await logic.resource.fetchContentAndMetadata(
  $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card'))
```

## When loading fails

```javascript
async function safeLoad (uri) {
  try {
    await fetcher.load(uri)
    return { ok: true }
  } catch (err) {
    // err.status is the HTTP status (401, 403, 404, ...); err.message describes the failure
    return { ok: false, status: err.status, message: err.message }
  }
}
```

What it returned:

| Case | `status` |
|---|---|
| A missing document on a pod you can read | `404` |
| A private document on someone else's pod | `401` |
| A missing document in a place you may not read (solidcommunity.net) | `401`, not `404` |
| No answer at all (network error, or an `http:` URL from an `https:` page) | `999` |

After a failed load, `getState(uri)` returns `'failed'`.

## Performance

- The store is a cache. Once a document is loaded, `any()`, `each()` and the rest answer without a request, and a second `load()` is free.
- Load in parallel (`load([a, b])` or `Promise.all`) rather than one `await` after another.
- `render()` must return an element at once. Start the load, return the element, and fill it when the promise resolves. The pane in the [Cookbook overview](./overview.md#a-pane-that-reads-data) does this.

## See also

- [Writing Data](./writing-data.md)
- [rdflib.js](../libraries/rdflib.md): store, fetcher and update manager reference
- [solid-logic](../libraries/solid-logic.md): `resource`, `profile`, `typeIndex`
