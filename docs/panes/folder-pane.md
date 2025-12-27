---
sidebar_position: 3
title: Folder Pane
description: File and container browser
---

# Folder Pane

The folder pane renders `ldp:Container` resources — the file browser for Solid pods.

## What It Renders

- `ldp:Container`
- `ldp:BasicContainer`
- Any resource with container-like behavior

## Features

- File and folder listing
- Create new files/folders
- Upload files
- Delete resources
- Drag and drop
- Breadcrumb navigation
- Sort by name, date, size
- Grid and list views

## Screenshot

```
┌─────────────────────────────────────────────────┐
│ 📁 /documents/                                  │
├─────────────────────────────────────────────────┤
│ ⬆️ ..                                           │
│ 📁 projects/                      Modified: 2d  │
│ 📁 notes/                         Modified: 1w  │
│ 📄 budget.ttl                     Modified: 3h  │
│ 📄 readme.md                      Modified: 5d  │
├─────────────────────────────────────────────────┤
│ [New Folder] [Upload] [New File]                │
└─────────────────────────────────────────────────┘
```

## RDF Structure

A container in Solid looks like:

```turtle
@prefix ldp: <http://www.w3.org/ns/ldp#> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix stat: <http://www.w3.org/ns/posix/stat#> .

<>
    a ldp:Container, ldp:BasicContainer ;
    dct:modified "2024-01-15T10:30:00Z"^^xsd:dateTime ;
    ldp:contains
        <projects/>,
        <notes/>,
        <budget.ttl>,
        <readme.md> .

<projects/>
    a ldp:Container ;
    dct:modified "2024-01-13T08:00:00Z"^^xsd:dateTime .

<budget.ttl>
    a ldp:Resource ;
    stat:size 2048 ;
    dct:modified "2024-01-15T07:00:00Z"^^xsd:dateTime .
```

## Usage

The folder pane is automatically selected for containers:

```javascript
// Navigate to a container
panes.runDataBrowser(document, sym('https://alice.example/documents/'))

// Or get the pane directly
const folderPane = paneRegistry.byName('folder')
const element = folderPane.render(
  sym('https://alice.example/documents/'),
  document,
  { solo: true }
)
```

## Actions

### Create Folder

```javascript
// The pane provides a UI, but programmatically:
await store.fetcher.createContainer(
  sym('https://alice.example/documents/'),
  'new-folder'
)
```

### Upload File

```javascript
// PUT a new file
const content = 'Hello, World!'
await store.fetcher.putResourceAs(
  sym('https://alice.example/documents/hello.txt'),
  content,
  'text/plain'
)
```

### Delete Resource

```javascript
// DELETE a resource
await store.fetcher.delete(
  sym('https://alice.example/documents/old-file.txt')
)
```

## Customization

### Filter Hidden Files

The folder pane can hide certain files:

```javascript
// Resources starting with . are hidden by default
// ACL files (.acl) are hidden by default
```

### Custom Icons

The pane uses icons based on file type:

| Type | Icon |
|------|------|
| Container | 📁 |
| Turtle | 🐢 |
| JSON-LD | 📋 |
| Image | 🖼️ |
| Video | 🎬 |
| Audio | 🎵 |
| Text | 📄 |
| Unknown | 📎 |

## Events

The folder pane emits navigation events:

```javascript
// Listen for navigation
document.addEventListener('solid-navigate', (event) => {
  console.log('Navigated to:', event.detail.uri)
})
```

## Context Menu

Right-click options:

- **Open** — Navigate to resource
- **Open in new tab** — Open in browser tab
- **Download** — Download the file
- **Rename** — Rename the resource
- **Delete** — Delete the resource
- **Properties** — View resource metadata
- **Sharing** — Edit ACL permissions

## Permissions

The folder pane respects ACL:

- **Read** — Can see contents
- **Write** — Can create/modify/delete
- **Control** — Can edit sharing settings

Without Read access, the container contents are hidden.

## Integration

### Embedding in Custom Panes

```javascript
import { paneRegistry } from 'solid-panes'

const myPane = {
  name: 'project',

  render: (subject, dom, context) => {
    const container = dom.createElement('div')

    // Show project info
    const header = dom.createElement('h2')
    header.textContent = 'Project Files'
    container.appendChild(header)

    // Embed folder pane for the files container
    const filesContainer = store.any(subject, EX('filesLocation'), null, null)
    if (filesContainer) {
      const folderPane = paneRegistry.byName('folder')
      const filesElement = folderPane.render(filesContainer, dom, {
        ...context,
        solo: false
      })
      container.appendChild(filesElement)
    }

    return container
  }
}
```

## Source

- [folder.js in solid-panes](https://github.com/SolidOS/solid-panes/blob/main/src/folder/folder.js)

## See Also

- [LDP Containers](https://www.w3.org/TR/ldp/#ldpc) — W3C specification
- [Solid Protocol](https://solidproject.org/TR/protocol) — container behavior
