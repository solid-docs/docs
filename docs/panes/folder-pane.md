---
sidebar_position: 3
title: Folder Pane
description: Browse a container, open what is in it, and add folders, files and apps
---

# Folder Pane

The folder pane shows the contents of a Solid container (a folder). It lists what the folder holds as a grid or a list, opens an item when you double-click it, and has an **Add** menu for new folders, files, uploads and app resources.

![The folder pane in SolidOS 3.1: a grid of folders and files, with the Add menu open](/img/builtin-panes/folder-pane.png)

| | |
|---|---|
| Package | [folder-pane](https://github.com/SolidOS/folder-pane) 4.1.0 |
| Pane name | `folder` |
| Registered by | solid-panes 5.1.0, after the media panes and before `slideshow` |
| Creates | folders (`mintNew` makes an empty container with `PUT`) |

## When it applies

`label(subject, context)` returns `Contents (n)`, where `n` is the number of members, when:

- `context.session.logic.resource.isContainer(subject)` is true, and
- the address does not end in `.js` or `.json` (some servers wrongly report those files as containers).

Otherwise it returns `null`.

When you open a container that holds an `index.ttl`, SolidOS shows the thing described in `index.ttl#this` instead of the listing. Opening `chat/` on a pod shows the chat, not a folder with one file in it.

## What you see

- **Breadcrumb** of the folder's path, and a menu for the folder itself.
- **Grid view and list view**, switched with the two buttons beside **Add**.
- **A card per item** with its name, its size or item count, and a globe (public) or lock (private).
- **A menu on each card** listing the panes that can show that item. It is the same pane menu as in the header; see [Panes Overview](./overview.md).
- **Add**: one entry for each registered pane that has `mintNew` and whose audience matches the user (in the screenshot: New Tracker, New Address Book, New Long Chat, New Dokieli Document, New Folder, New File), plus **Upload**.
- **Sidebar tree** with Home, in the storage layouts. Items in the grid, list and tree can be dragged onto anything that accepts a link. Dragging shares the address; it does not move or copy the resource.

To delete a file or folder, open its **Under The Hood** view ([Internal Pane](./internal-pane.md)).

The view is made of Lit components in `src/components/`: `folder-pane-view`, `folder-pane-container`, `folder-pane-content`, `folder-pane-provider`, `folder-pane-sidebar` and `folder-pane-storage-header`.

### Three layouts

`render(subject, context, options)` takes a third argument. `options.folderView` picks the layout:

| `folderView` | Shows |
|---|---|
| `explorer` | Storage header, sidebar and content: the viewer's own storage, or the server root |
| `storage` | Storage header, sidebar and content, under the navbar of someone else's pod |
| `container` | Storage header and contents, no sidebar: a container opened on its own |

Without `folderView`, `fullView: true` or `solo: true` gives `container`, and anything else gives `explorer`. `GotoSubject(..., options)` passes `folderView` through; see [Navigation](./navigation.md).

## Data

The pane reads the container listing the server returns. From the test pod used for the screenshot:

```turtle
@prefix ldp: <http://www.w3.org/ns/ldp#> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix stat: <http://www.w3.org/ns/posix/stat#> .

<photos/> a ldp:Container, ldp:BasicContainer, ldp:Resource ;
    ldp:contains <photos/one.png>, <photos/two.png>, <photos/three.png> .

<photos/one.png> a ldp:Resource ;
    stat:size 14679 ;
    dct:modified "2026-11-17T20:49:51.522Z" .
```

It writes with plain HTTP: `PUT` to create a folder or upload a file. **Add** entries for apps call that pane's `mintNew`, which writes the app's own files.

## Source

[github.com/SolidOS/folder-pane](https://github.com/SolidOS/folder-pane): `src/folderPane.ts` is the pane object, `src/components/` the view, and `src/resourceActionItems.ts` builds the per-item pane menu.

## See also

- [Internal Pane](./internal-pane.md): inspect and delete a resource
- [Source Pane](./source-pane.md): what **New File** opens
