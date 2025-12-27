---
sidebar_position: 3
title: Reading Data
description: Fetching and querying RDF data
---

# Reading Data

Patterns for loading and querying RDF data from Solid pods.

## Loading Resources

### Load a Single Document

```javascript
import { store, sym } from 'solid-logic'

async function loadDocument(uri) {
  const doc = sym(uri)
  await store.fetcher.load(doc)

  console.log(`Loaded ${store.statementsMatching(null, null, null, doc).length} statements`)
}
```

### Load Multiple Documents

```javascript
async function loadDocuments(uris) {
  // Load in parallel
  await Promise.all(uris.map(uri =>
    store.fetcher.load(sym(uri))
  ))
}
```

### Check if Already Loaded

```javascript
function isLoaded(uri) {
  return !!store.fetcher.requested[uri]
}

async function ensureLoaded(uri) {
  if (!isLoaded(uri)) {
    await store.fetcher.load(sym(uri))
  }
}
```

### Force Reload

```javascript
async function reloadDocument(uri) {
  await store.fetcher.load(sym(uri), { force: true })
}
```

## Querying Data

### Get a Single Value

```javascript
import { store, sym } from 'solid-logic'

const FOAF = Namespace('http://xmlns.com/foaf/0.1/')

function getName(webId) {
  const person = sym(webId)
  const name = store.any(person, FOAF('name'), null, null)
  return name?.value  // String or undefined
}
```

### Get All Values

```javascript
function getAllEmails(webId) {
  const person = sym(webId)
  const emails = store.each(person, FOAF('mbox'), null, null)
  return emails.map(email => email.uri.replace('mailto:', ''))
}
```

### Check if Statement Exists

```javascript
function isPerson(uri) {
  const subject = sym(uri)
  return store.holds(subject, RDF('type'), FOAF('Person'), null)
}
```

### Get All Statements

```javascript
function getAllStatements(subject) {
  return store.statementsMatching(sym(subject), null, null, null)
}

function getStatementsByPredicate(subject, predicate) {
  return store.statementsMatching(sym(subject), predicate, null, null)
}
```

## Common Queries

### Get Resource Type

```javascript
function getType(uri) {
  const subject = sym(uri)
  return store.any(subject, RDF('type'), null, null)
}

function getTypes(uri) {
  const subject = sym(uri)
  return store.each(subject, RDF('type'), null, null)
}

function hasType(uri, type) {
  const subject = sym(uri)
  return store.holds(subject, RDF('type'), type, null)
}
```

### Get Label

```javascript
function getLabel(uri) {
  const subject = sym(uri)

  // Try various label predicates
  return store.any(subject, RDFS('label'), null, null)?.value ||
         store.any(subject, FOAF('name'), null, null)?.value ||
         store.any(subject, VCARD('fn'), null, null)?.value ||
         store.any(subject, DCT('title'), null, null)?.value ||
         uri.split('#').pop().split('/').pop()  // Fallback to URI fragment
}
```

### Get Container Contents

```javascript
const LDP = Namespace('http://www.w3.org/ns/ldp#')

async function getContainerContents(containerUri) {
  const container = sym(containerUri)
  await store.fetcher.load(container)

  return store.each(container, LDP('contains'), null, null)
}
```

### Get Friends

```javascript
async function getFriends(webId) {
  const person = sym(webId)
  await store.fetcher.load(person.doc())

  const friends = store.each(person, FOAF('knows'), null, null)

  // Load each friend's profile
  const friendData = []
  for (const friend of friends) {
    try {
      await store.fetcher.load(friend.doc())
      friendData.push({
        webId: friend.uri,
        name: store.any(friend, FOAF('name'), null, null)?.value,
        photo: store.any(friend, FOAF('img'), null, null)?.uri
      })
    } catch (e) {
      friendData.push({ webId: friend.uri, name: null, photo: null })
    }
  }

  return friendData
}
```

## Working with RDF Lists

### Read an RDF List

```javascript
const RDF_FIRST = sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#first')
const RDF_REST = sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest')
const RDF_NIL = sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')

function readList(listNode) {
  const items = []
  let current = listNode

  while (current && current.uri !== RDF_NIL.uri) {
    const item = store.any(current, RDF_FIRST, null, null)
    if (item) items.push(item)
    current = store.any(current, RDF_REST, null, null)
  }

  return items
}

// Usage
const listHead = store.any(subject, predicate, null, null)
const items = readList(listHead)
```

## Following Links

### Follow a Link

```javascript
async function getCreator(resourceUri) {
  const resource = sym(resourceUri)
  await store.fetcher.load(resource.doc())

  const creator = store.any(resource, DCT('creator'), null, null)
  if (!creator) return null

  // Load the creator's profile
  await store.fetcher.load(creator.doc())

  return {
    webId: creator.uri,
    name: store.any(creator, FOAF('name'), null, null)?.value
  }
}
```

### Recursive Loading

```javascript
async function loadWithDepth(uri, depth = 1) {
  const subject = sym(uri)
  await store.fetcher.load(subject.doc())

  if (depth > 0) {
    // Get all object URIs
    const statements = store.statementsMatching(subject, null, null, null)
    const linkedUris = statements
      .map(st => st.object)
      .filter(obj => obj.termType === 'NamedNode')
      .map(obj => obj.uri)
      .filter(uri => !isLoaded(uri))

    // Load each linked resource
    await Promise.all(linkedUris.map(linkedUri =>
      loadWithDepth(linkedUri, depth - 1)
    ))
  }
}
```

## Error Handling

### Handle Load Errors

```javascript
async function safeLoad(uri) {
  try {
    await store.fetcher.load(sym(uri))
    return { success: true }
  } catch (error) {
    return {
      success: false,
      status: error.status,
      message: error.message
    }
  }
}

// Usage
const result = await safeLoad('https://alice.example/private.ttl')
if (!result.success) {
  if (result.status === 401) {
    console.log('Need to log in')
  } else if (result.status === 403) {
    console.log('No permission')
  } else if (result.status === 404) {
    console.log('Does not exist')
  }
}
```

## Performance Tips

### Batch Loads

```javascript
// Instead of:
for (const uri of uris) {
  await store.fetcher.load(sym(uri))  // Sequential, slow
}

// Do:
await Promise.all(uris.map(uri =>
  store.fetcher.load(sym(uri))  // Parallel, fast
))
```

### Cache Awareness

```javascript
// The store caches loaded data
// Subsequent queries don't need network requests

await store.fetcher.load('https://alice.example/profile/card')

// These are instant (from cache)
const name = store.any(alice, FOAF('name'), null, null)
const friends = store.each(alice, FOAF('knows'), null, null)
```

## See Also

- [rdflib.js](/docs/libraries/rdflib) — store and fetcher
- [Writing Data](/docs/cookbook/writing-data) — create and update
- [solid-logic](/docs/libraries/solid-logic) — business logic
