---
sidebar_position: 4
title: Writing Data
description: Creating, updating, uploading and deleting resources in Solid pods
---

# Writing Data

Recipes for changing data on a pod: patching documents, writing whole documents and files, making folders, uploading and deleting. Each one was run, in order, inside SolidOS 3.1 by a logged-in user on a [JavaScript Solid Server](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer) pod.

All recipes start from the same lines as [Reading Data](./reading-data.md):

```javascript
const store = context.session.store      // the shared rdflib store
const { fetcher, updater } = store       // rdflib Fetcher and UpdateManager
const logic = context.session.logic      // solid-logic (resource, profile, typeIndex, acl, ...)
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')
const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
```

`AREA` is a folder the user may write to, ending in `/`, for example `https://alice.example/public/cookbook/`.

Writing needs a logged-in user with write access; see [Authentication](./authentication.md) and [Access Control](./access-control.md). Requests go through the session automatically, because the shared store's fetcher uses it.

## Folders

```javascript
// Create a folder at a URL you choose (it must end in '/').
// An existing folder is left as it is.
await logic.resource.createContainer(AREA)

// Or let the server name it: POST to the parent with a suggested name (Slug).
const response = await fetcher.createContainer(AREA, 'notes')
const notesFolder = new URL(response.headers.get('Location'), AREA).href
// 'https://alice.example/public/cookbook/notes/'
```

`logic.resource.createContainer(url)` sends a `PUT` with `If-None-Match: *`, so it never overwrites. `fetcher.createContainer(parentURI, folderName, data)` takes the parent as a string; the server may choose a different name than the one suggested, so read the `Location` header.

## Writing a whole document

```javascript
// Write a whole new Turtle document.
const doc = $rdf.sym(AREA + 'note-1.ttl')
const note = $rdf.sym(doc.uri + '#this')
const SCHEMA = $rdf.Namespace('http://schema.org/')

const statements = [
  $rdf.st(note, RDF('type'), SCHEMA('NoteDigitalDocument'), doc),
  $rdf.st(note, SCHEMA('name'), $rdf.lit('First note'), doc),
  $rdf.st(note, SCHEMA('dateCreated'), $rdf.lit(new Date().toISOString(), undefined, $rdf.sym('http://www.w3.org/2001/XMLSchema#dateTime')), doc)
]

await new Promise((resolve, reject) => {
  updater.put(doc, statements, 'text/turtle', (uri, ok, message) => ok ? resolve() : reject(new Error(message)))
})
// The statements are now in the store as well as on the server.
```

`updater.put()` replaces whatever was at that URL. It reports through its callback, hence the promise around it.

## Changing a document: patch

```javascript
const doc = $rdf.sym(AREA + 'note-1.ttl')
const note = $rdf.sym(doc.uri + '#this')
const SCHEMA = $rdf.Namespace('http://schema.org/')
await fetcher.load(doc)   // update() needs the document's headers to know how to patch it

// Add a statement
await updater.update([], [$rdf.st(note, SCHEMA('keywords'), $rdf.lit('cookbook'), doc)])

// Remove a statement
await updater.update([$rdf.st(note, SCHEMA('keywords'), $rdf.lit('cookbook'), doc)], [])

// Replace a value: delete the old statement and insert the new one in one PATCH
const old = store.statementsMatching(note, SCHEMA('name'), null, doc)
await updater.update(old, [$rdf.st(note, SCHEMA('name'), $rdf.lit('Renamed note'), doc)])
```

`update(deletions, insertions)` sends one PATCH and changes the store once the server has accepted it. Every statement must name the same document as its fourth part. The PATCH fails (the server answered `409 Conflict`) if a statement to delete is not in the document. That keeps two editors from silently overwriting each other, but it also means the deletions must match the document exactly: take them from the store, as above, rather than typing them out. After a conflict, reload with `fetcher.load(doc, { force: true })` and build the patch again.

Which kind of PATCH is sent (SPARQL Update or N3 Patch) depends on the server's headers; see [rdflib.js: which method the update manager uses](../libraries/rdflib.md#which-method-the-update-manager-uses).

### Create a document by patching it

```javascript
// update() on a document that does not exist yet creates it.
const doc = $rdf.sym(AREA + 'note-2.ttl')
const note = $rdf.sym(doc.uri + '#this')
const SCHEMA = $rdf.Namespace('http://schema.org/')

await updater.update([], [$rdf.st(note, SCHEMA('name'), $rdf.lit('Second note'), doc)])
```

This is how most panes add to a document that may or may not exist yet: no separate create step.

### Several documents in one call

```javascript
// Statements for several documents: updateMany() sends one PATCH per document.
const SCHEMA = $rdf.Namespace('http://schema.org/')
const one = $rdf.sym(AREA + 'note-1.ttl')
const two = $rdf.sym(AREA + 'note-2.ttl')
await fetcher.load([one, two])

await updater.updateMany([], [
  $rdf.st($rdf.sym(one.uri + '#this'), SCHEMA('isPartOf'), $rdf.sym(AREA), one),
  $rdf.st($rdf.sym(two.uri + '#this'), SCHEMA('isPartOf'), $rdf.sym(AREA), two)
])
```

The patches are separate requests: if one fails, the others may still have been applied.

## Files and raw requests

### Write any file

```javascript
// Write any file: the body as a string, Blob or ArrayBuffer, and its content type.
await fetcher.webOperation('PUT', AREA + 'hello.txt', {
  data: 'Hello from a pane',
  contentType: 'text/plain'
})

// Serialize part of the store yourself and PUT it.
const doc = $rdf.sym(AREA + 'note-3.ttl')
store.add($rdf.sym(doc.uri + '#this'), FOAF('name'), $rdf.lit('Third note'), doc)
await fetcher.webOperation('PUT', doc, {
  data: $rdf.serialize(doc, store, doc.uri, 'text/turtle'),
  contentType: 'text/turtle'
})
```

`webOperation(method, uri, options)` fails without sending anything if there is a body and no `contentType`.

### Let the server choose the name

```javascript
// POST into a folder and let the server pick the name; Slug is a suggestion.
const response = await fetcher.webOperation('POST', AREA, {
  data: '<#this> <http://schema.org/name> "Posted note" .',
  contentType: 'text/turtle',
  headers: { Slug: 'posted.ttl' }
})
const created = new URL(response.headers.get('Location'), AREA).href
```

### Upload files

```javascript
// Upload File objects, for example from <input type="file"> or a drop event.
// Each file is PUT to the folder under its own name.
const files = [
  new File(['# A note\n'], 'readme.md', { type: 'text/markdown' }),
  new File([new Uint8Array([137, 80, 78, 71])], 'tiny.png', { type: 'image/png' })
]
const results = await logic.resource.uploadFiles(files, AREA)
for (const result of results) {
  if (result.success) console.log('uploaded', result.uploadedUri)
  else console.warn('failed', result.file.name, result.error.status, result.error.message)
}
```

`uploadFiles(files, destination)` never rejects for a single failed file; check `success` on each result. Each name is URL-encoded. If the file's extension does not match its type, an extension is added (`photo` of type `image/png` is saved as `photo_.png`), and a file with neither a type nor a known extension is refused.

## Deleting

```javascript
// Delete one resource. The store forgets the document too.
await fetcher.delete(AREA + 'hello.txt')

// Delete a folder and everything in it, deepest first.
await logic.resource.recursiveDelete($rdf.sym(AREA))
```

`recursiveDelete` loads each folder's listing, deletes the contents, then the folder, and removes them all from the store. A resource that is already gone is not an error. Do not rely on the server to refuse deleting a folder that still has contents: the JavaScript Solid Server pod these recipes ran on deleted one with a plain `DELETE`.

## When writing fails

```javascript
// update() rejects with an Error; the message carries the server's answer.
try {
  const doc = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card')
  await fetcher.load(doc)
  await updater.update([], [$rdf.st(doc, FOAF('name'), $rdf.lit('x'), doc)])
} catch (err) {
  console.warn(err.message)   // "... Can't make changes in uneditable ..."
}

// webOperation() rejects with an Error that has the Response: err.response.status
try {
  await fetcher.webOperation('PUT', 'https://testingsolidos.solidcommunity.net/public/x.txt', { data: 'x', contentType: 'text/plain' })
} catch (err) {
  console.warn(err.response?.status)   // 401: not logged in to that pod
}
```

`update()` checks the `WAC-Allow` header before sending anything: when it says the user cannot write, the promise rejects without a request. To find out in advance, use `updater.editable(doc.uri)` after loading the document, or `logic.resource.fetchMetadata(doc)` and its `access.canEdit` (see [Reading Data](./reading-data.md#headers-and-permissions)).

## Access control files on JavaScript Solid Server

JavaScript Solid Server stores ACL documents only as JSON-LD and answers a Turtle write to an `.acl` with `415 Unsupported Media Type`. Other documents can be written as Turtle, as above. For changing who may access what, use the solid-logic ACL functions described in [Access Control](./access-control.md) rather than writing ACL files by hand.

## See also

- [Reading Data](./reading-data.md)
- [rdflib.js](../libraries/rdflib.md): `update`, `put`, `webOperation` in detail
- [solid-logic](../libraries/solid-logic.md): `resource.createContainer`, `uploadFiles`, `recursiveDelete`
