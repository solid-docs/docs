---
sidebar_position: 2
title: rdflib.js
description: The RDF foundation for SolidOS
---

# rdflib.js

rdflib.js is the foundation of SolidOS — a JavaScript library for working with RDF (Resource Description Framework) data.

## Installation

```bash
npm install rdflib
```

Or via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/rdflib/dist/rdflib.min.js"></script>
```

## Core Concepts

### The Store (IndexedFormula)

The store is an in-memory RDF graph database:

```javascript
import { graph } from 'rdflib'

const store = graph()

// The store holds triples (subject, predicate, object, graph)
// Also called "quads" when including the graph component
```

### Nodes

RDF uses different node types:

```javascript
import { sym, lit, blankNode, variable } from 'rdflib'

// NamedNode - a URI reference
const alice = sym('https://alice.example/profile/card#me')

// Literal - a value with optional language or datatype
const name = lit('Alice')
const age = lit(30, null, sym('http://www.w3.org/2001/XMLSchema#integer'))
const greeting = lit('Bonjour', 'fr')

// BlankNode - anonymous node
const address = blankNode()

// Variable - for queries
const x = variable('x')
```

### Namespaces

Create namespace helpers for common vocabularies:

```javascript
import { Namespace } from 'rdflib'

const FOAF = Namespace('http://xmlns.com/foaf/0.1/')
const VCARD = Namespace('http://www.w3.org/2006/vcard/ns#')
const RDF = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const RDFS = Namespace('http://www.w3.org/2000/01/rdf-schema#')
const LDP = Namespace('http://www.w3.org/ns/ldp#')
const SOLID = Namespace('http://www.w3.org/ns/solid/terms#')

// Usage
const nameProperty = FOAF('name')  // http://xmlns.com/foaf/0.1/name
const Person = FOAF('Person')       // http://xmlns.com/foaf/0.1/Person
```

## Working with the Store

### Adding Data

```javascript
import { graph, sym, lit, st } from 'rdflib'

const store = graph()
const alice = sym('https://alice.example/profile/card#me')
const doc = sym('https://alice.example/profile/card')

// Add a single statement
store.add(alice, FOAF('name'), lit('Alice'), doc)

// Using st() helper
const statement = st(alice, FOAF('age'), lit(30), doc)
store.add(statement)

// Add multiple statements
store.add(alice, RDF('type'), FOAF('Person'), doc)
store.add(alice, FOAF('knows'), sym('https://bob.example/#me'), doc)
```

### Querying Data

```javascript
// Get a single value
const name = store.any(alice, FOAF('name'), null, null)
console.log(name?.value)  // "Alice"

// Get all values for a predicate
const friends = store.each(alice, FOAF('knows'), null, null)
friends.forEach(friend => console.log(friend.uri))

// Check if a statement exists
const isPerson = store.holds(alice, RDF('type'), FOAF('Person'), null)

// Get all statements matching a pattern
const statements = store.match(alice, null, null, null)
statements.forEach(st => {
  console.log(`${st.predicate.uri}: ${st.object.value}`)
})

// Get statements where alice is the object
const whoKnowsAlice = store.match(null, FOAF('knows'), alice, null)
```

### Removing Data

```javascript
// Remove a specific statement
store.remove(st(alice, FOAF('name'), lit('Alice'), doc))

// Remove all statements matching a pattern
store.removeMatches(alice, FOAF('knows'), null, null)
```

## Fetcher

The Fetcher loads RDF data from URIs into the store:

```javascript
import { graph, Fetcher } from 'rdflib'

const store = graph()
const fetcher = new Fetcher(store)

// Load a resource
await fetcher.load('https://alice.example/profile/card')

// Now query the loaded data
const name = store.any(
  sym('https://alice.example/profile/card#me'),
  FOAF('name'),
  null,
  null
)

// Load multiple resources
await fetcher.load([
  'https://alice.example/profile/card',
  'https://bob.example/profile/card'
])

// Check if a resource is loaded
if (fetcher.requested['https://alice.example/profile/card']) {
  console.log('Already loaded')
}

// Force reload
await fetcher.load('https://alice.example/profile/card', { force: true })
```

### Fetcher Options

```javascript
const fetcher = new Fetcher(store, {
  timeout: 30000,           // Request timeout in ms
  withCredentials: true,    // Include cookies for CORS
  fetch: customFetch,       // Custom fetch implementation
})
```

## UpdateManager

The UpdateManager writes changes back to Solid pods:

```javascript
import { graph, Fetcher, UpdateManager, sym, lit, st } from 'rdflib'

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)

// Load the document first
const doc = sym('https://alice.example/profile/card')
await fetcher.load(doc)

const alice = sym('https://alice.example/profile/card#me')

// Update: delete old statements, insert new ones
const oldName = store.any(alice, FOAF('name'), null, doc)
const newName = lit('Alice Smith')

await updater.update(
  oldName ? [st(alice, FOAF('name'), oldName, doc)] : [],  // deletions
  [st(alice, FOAF('name'), newName, doc)]                   // insertions
)

// The store is automatically updated after successful PATCH
```

### Creating New Resources

```javascript
// PUT a new resource
const newDoc = sym('https://alice.example/notes/note1.ttl')
const note = sym('https://alice.example/notes/note1.ttl#it')

store.add(note, RDF('type'), sym('http://example.org/Note'), newDoc)
store.add(note, RDFS('label'), lit('My First Note'), newDoc)

await updater.put(
  newDoc,
  store.statementsMatching(null, null, null, newDoc),
  'text/turtle'
)
```

## Serialization

### Parse RDF

```javascript
import { graph, parse } from 'rdflib'

const store = graph()
const turtle = `
  @prefix foaf: <http://xmlns.com/foaf/0.1/> .
  <#me> a foaf:Person ;
        foaf:name "Alice" .
`

parse(turtle, store, 'https://alice.example/profile/card', 'text/turtle')
```

### Serialize RDF

```javascript
import { serialize } from 'rdflib'

// Serialize to Turtle
const turtle = serialize(doc, store, null, 'text/turtle')

// Serialize to JSON-LD
const jsonld = serialize(doc, store, null, 'application/ld+json')

// Serialize to N-Triples
const ntriples = serialize(doc, store, null, 'application/n-triples')

// Serialize to RDF/XML
const rdfxml = serialize(doc, store, null, 'application/rdf+xml')
```

## Common Patterns

### Following Links

```javascript
async function getProfile(webId) {
  await fetcher.load(webId)

  const person = sym(webId)
  const name = store.any(person, FOAF('name'), null, null)
  const friends = store.each(person, FOAF('knows'), null, null)

  // Load friend profiles
  for (const friend of friends) {
    await fetcher.load(friend.doc())  // Load the document containing the friend
  }

  return { name: name?.value, friends }
}
```

### Type Checking

```javascript
function isContainer(uri) {
  return store.holds(sym(uri), RDF('type'), LDP('Container'), null) ||
         store.holds(sym(uri), RDF('type'), LDP('BasicContainer'), null)
}

function isPerson(uri) {
  return store.holds(sym(uri), RDF('type'), FOAF('Person'), null) ||
         store.holds(sym(uri), RDF('type'), VCARD('Individual'), null)
}
```

### Getting Document from URI

```javascript
// For a URI like https://example.org/doc#thing
// .doc() returns https://example.org/doc

const thing = sym('https://example.org/doc#thing')
const document = thing.doc()  // NamedNode for https://example.org/doc

// Load the document containing a resource
await fetcher.load(thing.doc())
```

## TypeScript Types

```typescript
import type {
  NamedNode,
  Literal,
  BlankNode,
  Variable,
  Statement,
  IndexedFormula,
  Fetcher,
  UpdateManager,
  Node
} from 'rdflib'

// Node is the union type for all node types
type RDFNode = NamedNode | Literal | BlankNode | Variable

// Statement represents a quad
interface Statement {
  subject: NamedNode | BlankNode
  predicate: NamedNode
  object: Node
  graph: NamedNode
}
```

## See Also

- [rdflib.js GitHub](https://github.com/linkeddata/rdflib.js)
- [solid-logic](/docs/libraries/solid-logic) — builds on rdflib for Solid
- [Architecture Overview](/docs/architecture/overview) — how rdflib fits in
