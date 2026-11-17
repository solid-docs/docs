---
sidebar_position: 12
title: Internal Pane
description: Under The Hood - what the data browser knows about a resource, refresh, and delete
---

# Internal Pane

The internal pane, labelled **Under The Hood** in the pane menu, shows what the data browser itself knows about a resource: its address, whether it is editable and how, and the request metadata rdflib recorded when it fetched it. It also has the buttons to **delete** a file or folder and to **refresh** it from the server.

![The internal pane in SolidOS 3.1 for a Turtle file: the delete and refresh buttons, its address, and Editable: SPARQL](/img/builtin-panes/internal-pane.png)

| | |
|---|---|
| Package | [solid-panes](https://github.com/SolidOS/solid-panes) 5.1.0, `src/internal/internalPane.ts` |
| Pane name | `internal` |
| Registered by | solid-panes 5.1.0, second to last, before `home` |

## When it applies

`label()` always returns `Under The Hood`, so it is offered for every resource. It is also the fallback: when no pane is relevant to a subject, SolidOS shows this one.

## What you see

- **Delete** (red button), only for a document (an address without `#`). For a folder it deletes the folder and everything in it. It asks for confirmation first, then calls `resource.recursiveDelete(subject)` from solid-logic, and dispatches a `solid-resource-deleted` event on the document with `detail.resource`. The pod's root, `profile/`, `profile/card`, `settings/` and the preference and type index files under `settings/` have no delete button.
- **Refresh** reloads the document from the server with `store.fetcher.refresh`.
- **Properties** of the subject (and statements pointing at it), filtered to the pane's own `predicates` list: `link:request`, `link:requestedBy`, `link:source`, `link:session`, `link:uri`, `link:documentURI`, `link:document`, `link:all`, `link:Document`, `rww:editable`, `rdfs:seeAlso` and `owl:`. For a `link:ProtocolEvent` (a request record) every property is shown. "Editable: SPARQL" in the screenshot is `rww:editable`, telling you the server accepts SPARQL Update `PATCH`.

The folder pane has no delete button of its own; this pane is where files and folders are deleted.

## Data

The pane writes nothing except the delete. It reads the triples rdflib keeps in the store about a fetched document, in the `link:` namespace (`http://www.w3.org/2007/ont/link#`), and `rww:editable`.

## Source

[internalPane.ts in solid-panes](https://github.com/SolidOS/solid-panes/blob/main/src/internal/internalPane.ts)

## See also

- [Folder Pane](./folder-pane.md)
- [Other Panes](./other-panes.md): the data views (`dataContents`, `n3`, `RDFXML`, `default`)
