---
sidebar_position: 4
title: File Operations
description: Reading and writing files in Solid Pods
---

# File Operations

Working with files and resources in Solid Pods.

## Reading Resources

### Fetch a Turtle file

```javascript
import { store, sym } from 'solid-logic'

async function readResource(uri) {
  const resource = sym(uri)
  await store.fetcher.load(resource)

  // Resource is now in the store
  const statements = store.match(null, null, null, resource)
  return statements
}
```

### Fetch raw content

```javascript
async function fetchRaw(uri) {
  const response = await store.fetcher.webOperation('GET', uri)
  return response.text()
}
```

## Writing Resources

### Create a new resource

```javascript
import { store, sym, lit, st } from 'solid-logic'

async function createResource(containerUri, filename, content) {
  const resourceUri = containerUri + filename
  const resource = sym(resourceUri)

  // Add statements
  const statements = [
    st(resource, RDF('type'), SCHEMA('Article'), resource),
    st(resource, SCHEMA('name'), lit('My Article'), resource)
  ]

  await store.updater.put(resource, statements, 'text/turtle')
}
```

### Update existing resource

```javascript
async function updateResource(uri, deletions, insertions) {
  await store.updater.update(deletions, insertions)
}
```

## Uploading Files

### Upload binary file

```javascript
async function uploadFile(containerUri, file) {
  const uri = containerUri + file.name
  await store.fetcher.webOperation('PUT', uri, {
    body: file,
    contentType: file.type
  })
}
```

### Upload with drag and drop

```javascript
dropzone.addEventListener('drop', async (e) => {
  e.preventDefault()
  const files = e.dataTransfer.files

  for (const file of files) {
    await uploadFile(currentFolder, file)
  }
})
```

## Deleting Resources

```javascript
async function deleteResource(uri) {
  await store.fetcher.webOperation('DELETE', uri)
}
```

## Creating Containers

```javascript
async function createFolder(parentUri, name) {
  const folderUri = parentUri + name + '/'
  await store.fetcher.webOperation('PUT', folderUri, {
    headers: {
      'Content-Type': 'text/turtle',
      'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"'
    }
  })
}
```

## See Also

- [Writing Data](/cookbook/writing-data)
- [Access Control](/cookbook/access-control)
- [Folder Pane](/panes/folder-pane)
