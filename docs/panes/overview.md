---
sidebar_position: 1
title: Panes Overview
description: Understanding the SolidOS pane system
---

# Panes Overview

Panes are the heart of SolidOS — modular UI components that render Solid data.

## What is a Pane?

A pane is a self-contained module that:
- Declares what data types it can render
- Provides a UI for viewing/editing that data
- Integrates with the SolidOS ecosystem

Think of panes like "apps" in an operating system, but for data types.

## Built-in Panes

SolidOS includes many panes out of the box:

| Pane | Renders | Description |
|------|---------|-------------|
| **folder** | `ldp:Container` | File browser for pods |
| **contacts** | `vcard:Individual` | Contact cards, address books |
| **chat** | `meeting:LongChat` | Real-time messaging |
| **meeting** | `meeting:Meeting` | Meetings with agendas |
| **profile** | WebID profiles | User profile pages |
| **source** | Any text | Raw source code/data |
| **image** | Images | Photo viewer/slideshow |
| **video** | Videos | Video player |
| **issue** | `wf:Issue` | Issue tracking |

## How Panes Are Selected

When you navigate to a resource:

```
1. SolidOS fetches the resource
2. Determines its RDF types
3. Asks each pane: "Can you render this?"
4. Panes respond with a label or null
5. Most specific pane wins
6. That pane renders the UI
```

### Selection Priority

```javascript
// More specific = higher priority
contactPane.label(aliceContact)  // Returns "Contact" (specific)
tablePane.label(aliceContact)    // Returns "Data"    (generic)
// contactPane wins!
```

## The Pane Interface

Every pane implements this interface:

```typescript
interface PaneDefinition {
  // Unique identifier
  name: string

  // Icon (emoji or URI)
  icon?: string

  // Developer info
  dev?: {
    name: string
    repo?: string
  }

  // Can this pane render the subject?
  label: (
    subject: NamedNode,
    context: any
  ) => string | null

  // Render the pane
  render: (
    subject: NamedNode,
    dom: Document,
    context: any
  ) => HTMLElement
}
```

## Pane Categories

### Data Type Panes

Render specific RDF types:
- Contact pane → `vcard:Individual`
- Meeting pane → `meeting:Meeting`
- Issue pane → `wf:Issue`

### Container Panes

Render collections:
- Folder pane → `ldp:Container`
- Address book → `vcard:AddressBook`
- Chat → `meeting:LongChat`

### Utility Panes

Always available:
- Source pane — view raw data
- Internals pane — debug information
- Table pane — generic RDF viewer

## Nesting Panes

Panes can embed other panes:

```javascript
render: (subject, dom, context) => {
  const container = dom.createElement('div')

  // Get the appropriate pane for a related resource
  const authorPane = paneRegistry.bySubject(author)

  // Embed it
  const authorElement = authorPane.render(author, dom, context)
  container.appendChild(authorElement)

  return container
}
```

## Pane Context

The `context` object provides:

```typescript
interface PaneContext {
  dom: Document           // The DOM document
  div: HTMLElement        // Container element
  store: IndexedFormula   // The RDF store
  session: any            // Authentication session
  noun: string            // Readable name for the subject
  solo: boolean           // Is this the only pane?
}
```

## Registering Panes

Panes must be registered with the pane registry:

```javascript
import { paneRegistry } from 'pane-registry'
import myPane from './myPane'

paneRegistry.register(myPane)
```

In solid-panes, this happens in `registerPanes.ts`.

## Creating Custom Panes

See [Creating Panes](/docs/panes/creating-panes) for a step-by-step guide.

## Pane Lifecycle

```
1. Registration
   ↓ paneRegistry.register(pane)
2. Selection
   ↓ pane.label(subject) → "My Label"
3. Rendering
   ↓ pane.render(subject, dom, context) → HTMLElement
4. Updates
   ↓ Store changes trigger re-renders (if subscribed)
5. Cleanup
   ↓ Element removed from DOM
```

## See Also

- [Creating Panes](/docs/panes/creating-panes) — build your own
- [Pane Anatomy](/docs/panes/pane-anatomy) — detailed structure
- [Built-in Panes](/docs/panes/folder-pane) — explore what's included
