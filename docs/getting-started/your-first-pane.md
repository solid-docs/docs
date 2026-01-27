---
sidebar_position: 4
title: Your First Pane
description: Build a simple pane for SolidOS
---

# Your First Pane

Let's build a pane that renders "Hello World" cards for a custom data type.

## What We're Building

A pane that renders resources of type `ex:Greeting`:

```turtle
# greeting.ttl
@prefix ex: <http://example.org/> .

<#hello> a ex:Greeting ;
    ex:message "Hello, World!" ;
    ex:author "Alice" .
```

## Step 1: Set Up the Project

Clone the solid-panes repo:

```bash
git clone https://github.com/SolidOS/solid-panes.git
cd solid-panes
npm install
```

## Step 2: Create the Pane File

Create `src/greeting/greetingPane.ts`:

```typescript
import { PaneDefinition } from 'pane-registry'
import { NamedNode, sym } from 'rdflib'
import { store } from 'solid-logic'

const EX = (local: string) => sym('http://example.org/' + local)

const greetingPane: PaneDefinition = {
  // Unique identifier
  name: 'greeting',

  // Developer info
  dev: {
    name: 'Your Name',
    repo: 'https://github.com/SolidOS/solid-panes'
  },

  // Icon (optional)
  icon: '👋',

  // Can this pane render the given subject?
  label: (subject: NamedNode, context: any): string | null => {
    const dominated = store.holds(subject, rdf('type'), EX('Greeting'))
    if (dominated) {
      return 'Greeting'
    }
    return null
  },

  // Render the pane
  render: (
    subject: NamedNode,
    dom: Document,
    context: any
  ): HTMLElement => {
    const container = dom.createElement('div')
    container.className = 'greeting-pane'

    // Get the message
    const message = store.any(subject, EX('message'), null)
    const author = store.any(subject, EX('author'), null)

    // Build the UI
    container.innerHTML = `
      <div style="
        padding: 20px;
        border-radius: 8px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        font-family: system-ui;
      ">
        <h2 style="margin: 0 0 10px 0;">
          ${message?.value || 'No message'}
        </h2>
        <p style="margin: 0; opacity: 0.8;">
          — ${author?.value || 'Anonymous'}
        </p>
      </div>
    `

    return container
  }
}

export default greetingPane
```

## Step 3: Register the Pane

Edit `src/registerPanes.ts`:

```typescript
import greetingPane from './greeting/greetingPane'

// ... other imports

export function registerPanes() {
  // ... other registrations

  register(greetingPane)
}
```

## Step 4: Test It

Start the development server:

```bash
npm run dev
```

Create a test file on your pod (`greeting.ttl`):

```turtle
@prefix ex: <http://example.org/> .

<#hello> a ex:Greeting ;
    ex:message "Hello from my first pane!" ;
    ex:author "Me" .
```

Navigate to `http://localhost:9000/` and browse to your greeting file. You should see your custom greeting card!

## Understanding the Code

### The `label` Function

```typescript
label: (subject: NamedNode, context: any): string | null => {
  // Check if this resource has rdf:type ex:Greeting
  const isGreeting = store.holds(subject, rdf('type'), EX('Greeting'))

  if (isGreeting) {
    return 'Greeting'  // Return a label to claim this resource
  }
  return null  // Return null to pass
}
```

This function:
- Is called for every resource being rendered
- Returns a string label if the pane can handle it
- Returns null to pass to other panes

### The `render` Function

```typescript
render: (
  subject: NamedNode,     // The resource to render
  dom: Document,          // The DOM document
  context: any            // Context (store, pane registry, etc.)
): HTMLElement => {
  // Build and return a DOM element
}
```

This function:
- Receives the subject (RDF resource) to render
- Must return an HTMLElement
- Can use `store` to query related data
- Can use solid-ui widgets

## Using solid-ui Widgets

Instead of raw HTML, use solid-ui components:

```typescript
import * as UI from 'solid-ui'

render: (subject, dom, context) => {
  const container = dom.createElement('div')

  // Use solid-ui's field widget
  const messageField = UI.widgets.field(
    dom,
    store,
    subject,
    EX('message'),
    'Message'
  )
  container.appendChild(messageField)

  return container
}
```

## Making It Editable

Add write capability:

```typescript
render: (subject, dom, context) => {
  const container = dom.createElement('div')

  // Editable text field
  const input = dom.createElement('input')
  input.value = store.any(subject, EX('message'), null)?.value || ''

  input.addEventListener('change', async () => {
    const oldValue = store.any(subject, EX('message'), null)
    const newValue = literal(input.value)

    // Update the store and pod
    await store.updater.update(
      oldValue ? [st(subject, EX('message'), oldValue, subject.doc())] : [],
      [st(subject, EX('message'), newValue, subject.doc())]
    )
  })

  container.appendChild(input)
  return container
}
```

## Next Steps

- [Pane Anatomy](/docs/panes/pane-anatomy) — detailed structure
- [solid-ui](/libraries/solid-ui) — available UI components
- [Pane Anatomy](/panes/pane-anatomy) — pane structure and reactive updates
- [Creating Panes](/panes/creating-panes) — detailed pane development guide
