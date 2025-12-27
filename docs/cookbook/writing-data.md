---
sidebar_position: 4
title: Writing Data
description: Creating and updating RDF resources
---

# Writing Data

Patterns for creating, updating, and deleting RDF data in Solid pods.

## Basic Updates

### Add a Statement

```javascript
import { store, sym, lit, st } from 'solid-logic'

async function addStatement(subject, predicate, object, doc) {
  await store.updater.update(
    [],  // deletions
    [st(sym(subject), predicate, object, sym(doc))]  // insertions
  )
}

// Usage
await addStatement(
  'https://alice.example/profile/card#me',
  FOAF('name'),
  lit('Alice Smith'),
  'https://alice.example/profile/card'
)
```

### Remove a Statement

```javascript
async function removeStatement(subject, predicate, object, doc) {
  await store.updater.update(
    [st(sym(subject), predicate, object, sym(doc))],  // deletions
    []  // insertions
  )
}
```

### Update a Value

```javascript
async function updateValue(subject, predicate, newValue, doc) {
  const subj = sym(subject)
  const document = sym(doc)

  // Find current value
  const oldValue = store.any(subj, predicate, null, document)

  await store.updater.update(
    oldValue ? [st(subj, predicate, oldValue, document)] : [],
    [st(subj, predicate, newValue, document)]
  )
}

// Usage
await updateValue(
  'https://alice.example/profile/card#me',
  FOAF('name'),
  lit('Alice Johnson'),
  'https://alice.example/profile/card'
)
```

## Creating Resources

### Create a New Document

```javascript
async function createDocument(uri, statements) {
  const doc = sym(uri)

  // Add statements to local store first
  statements.forEach(statement => store.add(statement))

  // PUT to server
  await store.updater.put(
    doc,
    statements,
    'text/turtle'
  )
}

// Usage
const noteUri = 'https://alice.example/notes/note1.ttl'
const note = sym(`${noteUri}#this`)

await createDocument(noteUri, [
  st(note, RDF('type'), sym('http://schema.org/Note'), sym(noteUri)),
  st(note, RDFS('label'), lit('My Note'), sym(noteUri)),
  st(note, sym('http://schema.org/text'), lit('Note content here'), sym(noteUri)),
])
```

### Create a Container

```javascript
async function createContainer(parentUri, name) {
  const containerUri = `${parentUri}${name}/`

  await store.fetcher.createContainer(sym(parentUri), name)

  return containerUri
}

// Usage
await createContainer('https://alice.example/', 'documents')
// Creates https://alice.example/documents/
```

### Create a Resource with Slug

```javascript
async function createWithSlug(containerUri, slug, statements) {
  // Use POST with Slug header
  const response = await store.fetcher.webOperation('POST', containerUri, {
    headers: {
      'Content-Type': 'text/turtle',
      'Slug': slug
    },
    body: serialize(null, store, containerUri, 'text/turtle')
  })

  return response.headers.get('Location')
}
```

## Common Write Patterns

### Update Profile

```javascript
async function updateProfile(webId, updates) {
  const person = sym(webId)
  const doc = person.doc()

  const deletions = []
  const insertions = []

  if ('name' in updates) {
    const oldName = store.any(person, FOAF('name'), null, doc)
    if (oldName) deletions.push(st(person, FOAF('name'), oldName, doc))
    if (updates.name) insertions.push(st(person, FOAF('name'), lit(updates.name), doc))
  }

  if ('bio' in updates) {
    const oldBio = store.any(person, FOAF('bio'), null, doc)
    if (oldBio) deletions.push(st(person, FOAF('bio'), oldBio, doc))
    if (updates.bio) insertions.push(st(person, FOAF('bio'), lit(updates.bio), doc))
  }

  if ('photo' in updates) {
    const oldPhoto = store.any(person, FOAF('img'), null, doc)
    if (oldPhoto) deletions.push(st(person, FOAF('img'), oldPhoto, doc))
    if (updates.photo) insertions.push(st(person, FOAF('img'), sym(updates.photo), doc))
  }

  await store.updater.update(deletions, insertions)
}
```

### Add to a List

```javascript
async function addFriend(myWebId, friendWebId) {
  const me = sym(myWebId)
  const friend = sym(friendWebId)
  const doc = me.doc()

  await store.updater.update([], [
    st(me, FOAF('knows'), friend, doc)
  ])
}

async function removeFriend(myWebId, friendWebId) {
  const me = sym(myWebId)
  const friend = sym(friendWebId)
  const doc = me.doc()

  await store.updater.update([
    st(me, FOAF('knows'), friend, doc)
  ], [])
}
```

### Create a Note

```javascript
async function createNote(containerUri, title, content) {
  const noteDoc = sym(`${containerUri}${Date.now()}.ttl`)
  const note = sym(`${noteDoc.uri}#this`)

  const now = new Date().toISOString()
  const dateTimeLit = lit(now, null, sym('http://www.w3.org/2001/XMLSchema#dateTime'))

  const statements = [
    st(note, RDF('type'), sym('http://schema.org/Note'), noteDoc),
    st(note, RDFS('label'), lit(title), noteDoc),
    st(note, sym('http://schema.org/text'), lit(content), noteDoc),
    st(note, DCT('created'), dateTimeLit, noteDoc),
    st(note, DCT('creator'), authn.currentUser(), noteDoc),
  ]

  await store.updater.put(noteDoc, statements, 'text/turtle')
  return note
}
```

## Deleting Resources

### Delete a Document

```javascript
async function deleteDocument(uri) {
  await store.fetcher.delete(sym(uri))
}
```

### Delete a Container

```javascript
async function deleteContainer(uri) {
  const container = sym(uri)
  await store.fetcher.load(container)

  // First, delete all contents
  const contents = store.each(container, LDP('contains'), null, null)
  for (const item of contents) {
    const isContainer = store.holds(item, RDF('type'), LDP('Container'), null)
    if (isContainer) {
      await deleteContainer(item.uri)
    } else {
      await store.fetcher.delete(item)
    }
  }

  // Then delete the container
  await store.fetcher.delete(container)
}
```

## File Operations

### Upload a File

```javascript
async function uploadFile(containerUri, file) {
  const fileUri = `${containerUri}${file.name}`

  await store.fetcher.webOperation('PUT', fileUri, {
    headers: {
      'Content-Type': file.type
    },
    body: file
  })

  return fileUri
}

// Usage with file input
const input = document.querySelector('input[type="file"]')
input.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  const uri = await uploadFile('https://alice.example/photos/', file)
  console.log('Uploaded:', uri)
})
```

### Upload with RDF Metadata

```javascript
async function uploadWithMetadata(containerUri, file, metadata) {
  // Upload the file
  const fileUri = await uploadFile(containerUri, file)

  // Create metadata document
  const metaDoc = sym(`${fileUri}.meta`)
  const fileNode = sym(fileUri)

  const statements = [
    st(fileNode, RDFS('label'), lit(metadata.title || file.name), metaDoc),
    st(fileNode, DCT('created'), lit(new Date().toISOString(), null,
      sym('http://www.w3.org/2001/XMLSchema#dateTime')), metaDoc),
  ]

  if (metadata.description) {
    statements.push(st(fileNode, DCT('description'), lit(metadata.description), metaDoc))
  }

  await store.updater.put(metaDoc, statements, 'text/turtle')

  return fileUri
}
```

## Error Handling

### Handle Update Errors

```javascript
async function safeUpdate(deletions, insertions) {
  try {
    await store.updater.update(deletions, insertions)
    return { success: true }
  } catch (error) {
    if (error.status === 401) {
      return { success: false, reason: 'Not authenticated' }
    } else if (error.status === 403) {
      return { success: false, reason: 'No write permission' }
    } else if (error.status === 409) {
      return { success: false, reason: 'Conflict - resource changed' }
    } else if (error.status === 412) {
      return { success: false, reason: 'Precondition failed' }
    } else {
      return { success: false, reason: error.message }
    }
  }
}
```

### Retry on Conflict

```javascript
async function updateWithRetry(subject, predicate, newValue, doc, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Reload to get latest state
      await store.fetcher.load(sym(doc), { force: true })

      // Get current value
      const oldValue = store.any(sym(subject), predicate, null, sym(doc))

      // Apply update
      await store.updater.update(
        oldValue ? [st(sym(subject), predicate, oldValue, sym(doc))] : [],
        [st(sym(subject), predicate, newValue, sym(doc))]
      )

      return { success: true }
    } catch (error) {
      if (error.status === 409 && i < maxRetries - 1) {
        // Conflict, retry
        continue
      }
      throw error
    }
  }
}
```

## Batch Operations

### Multiple Updates at Once

```javascript
async function batchUpdate(operations) {
  const allDeletions = []
  const allInsertions = []

  operations.forEach(op => {
    if (op.type === 'delete') {
      allDeletions.push(st(sym(op.subject), op.predicate, op.object, sym(op.doc)))
    } else if (op.type === 'insert') {
      allInsertions.push(st(sym(op.subject), op.predicate, op.object, sym(op.doc)))
    }
  })

  await store.updater.update(allDeletions, allInsertions)
}
```

## See Also

- [rdflib.js](/docs/libraries/rdflib) — UpdateManager
- [Reading Data](/docs/cookbook/reading-data) — load and query
- [Access Control](/docs/cookbook/access-control) — permissions
