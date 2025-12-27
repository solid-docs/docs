---
sidebar_position: 2
title: Creating Panes
description: Step-by-step guide to building custom panes
---

# Creating Panes

This guide walks you through creating a custom pane for SolidOS.

## Pane Structure

Every pane has this structure:

```typescript
import { PaneDefinition } from 'pane-registry'
import { NamedNode } from 'rdflib'
import { store } from 'solid-logic'

const myPane: PaneDefinition = {
  // Required: unique identifier
  name: 'my-pane',

  // Optional: icon (emoji or URL)
  icon: '📋',

  // Optional: developer info
  dev: {
    name: 'Your Name',
    repo: 'https://github.com/you/my-pane'
  },

  // Required: can this pane render the subject?
  label: (subject: NamedNode, context: any): string | null => {
    // Return a label string if yes, null if no
  },

  // Required: render the UI
  render: (
    subject: NamedNode,
    dom: Document,
    context: any
  ): HTMLElement => {
    // Build and return a DOM element
  }
}

export default myPane
```

## Step 1: Define Your Type

Decide what RDF type your pane will render. For this example, we'll create a pane for `ex:Recipe`:

```turtle
@prefix ex: <http://example.org/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<#carbonara> a ex:Recipe ;
    rdfs:label "Spaghetti Carbonara" ;
    ex:servings 4 ;
    ex:prepTime "30 minutes" ;
    ex:ingredients (
        "400g spaghetti"
        "200g guanciale"
        "4 egg yolks"
        "100g pecorino"
    ) .
```

## Step 2: Create the Namespace

```typescript
import { Namespace, sym } from 'rdflib'

const EX = Namespace('http://example.org/')
const RDF = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const RDFS = Namespace('http://www.w3.org/2000/01/rdf-schema#')
```

## Step 3: Implement the Label Function

The `label` function determines if your pane can render a subject:

```typescript
label: (subject: NamedNode, context: any): string | null => {
  // Check if the subject is a Recipe
  if (store.holds(subject, RDF('type'), EX('Recipe'))) {
    return 'Recipe'  // Return a label to claim this resource
  }
  return null  // Return null to pass
}
```

### Label Priority

More specific labels get higher priority:

```typescript
// Good: specific check
if (store.holds(subject, RDF('type'), EX('ItalianRecipe'))) {
  return 'Italian Recipe'
}

// Fallback: broader check
if (store.holds(subject, RDF('type'), EX('Recipe'))) {
  return 'Recipe'
}
```

## Step 4: Implement the Render Function

Build the UI:

```typescript
render: (subject: NamedNode, dom: Document, context: any): HTMLElement => {
  const container = dom.createElement('div')
  container.className = 'recipe-pane'

  // Get the label
  const label = store.any(subject, RDFS('label'), null, null)

  // Create header
  const header = dom.createElement('h2')
  header.textContent = label?.value || 'Untitled Recipe'
  container.appendChild(header)

  // Get metadata
  const servings = store.any(subject, EX('servings'), null, null)
  const prepTime = store.any(subject, EX('prepTime'), null, null)

  if (servings || prepTime) {
    const meta = dom.createElement('div')
    meta.className = 'recipe-meta'
    if (servings) {
      meta.innerHTML += `<span>Servings: ${servings.value}</span>`
    }
    if (prepTime) {
      meta.innerHTML += `<span>Prep: ${prepTime.value}</span>`
    }
    container.appendChild(meta)
  }

  // Get ingredients (RDF list)
  const ingredients = getListItems(store, subject, EX('ingredients'))
  if (ingredients.length > 0) {
    const section = dom.createElement('div')
    section.innerHTML = '<h3>Ingredients</h3>'

    const list = dom.createElement('ul')
    ingredients.forEach(item => {
      const li = dom.createElement('li')
      li.textContent = item.value
      list.appendChild(li)
    })
    section.appendChild(list)
    container.appendChild(section)
  }

  return container
}
```

### Helper: Reading RDF Lists

```typescript
function getListItems(store: any, subject: NamedNode, predicate: NamedNode): any[] {
  const items: any[] = []
  let list = store.any(subject, predicate, null, null)

  const RDF_FIRST = sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#first')
  const RDF_REST = sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest')
  const RDF_NIL = sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')

  while (list && list.uri !== RDF_NIL.uri) {
    const item = store.any(list, RDF_FIRST, null, null)
    if (item) items.push(item)
    list = store.any(list, RDF_REST, null, null)
  }

  return items
}
```

## Step 5: Add Styling

Add CSS for your pane:

```typescript
render: (subject, dom, context) => {
  const container = dom.createElement('div')

  // Add scoped styles
  const style = dom.createElement('style')
  style.textContent = `
    .recipe-pane {
      font-family: system-ui, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .recipe-pane h2 {
      color: #2c3e50;
      border-bottom: 2px solid #e74c3c;
      padding-bottom: 10px;
    }
    .recipe-meta {
      display: flex;
      gap: 20px;
      color: #7f8c8d;
      margin: 15px 0;
    }
    .recipe-pane ul {
      list-style: none;
      padding: 0;
    }
    .recipe-pane li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .recipe-pane li:before {
      content: "•";
      color: #e74c3c;
      margin-right: 10px;
    }
  `
  container.appendChild(style)

  // ... rest of render
}
```

## Step 6: Make It Editable

Allow users to edit the data:

```typescript
import * as UI from 'solid-ui'
import { authn } from 'solid-logic'

render: (subject, dom, context) => {
  const container = dom.createElement('div')

  // Check if user can edit
  const user = authn.currentUser()
  const canEdit = user !== null  // More sophisticated: check ACL

  if (canEdit) {
    // Editable title field
    const titleField = UI.widgets.field(
      dom,
      store,
      subject,
      RDFS('label'),
      'Recipe Name'
    )
    container.appendChild(titleField)

    // Editable servings
    const servingsField = UI.widgets.field(
      dom,
      store,
      subject,
      EX('servings'),
      'Servings'
    )
    container.appendChild(servingsField)
  } else {
    // Read-only display
    const label = store.any(subject, RDFS('label'), null, null)
    const h2 = dom.createElement('h2')
    h2.textContent = label?.value || 'Untitled'
    container.appendChild(h2)
  }

  return container
}
```

## Step 7: Register the Pane

### In solid-panes

Edit `src/registerPanes.ts`:

```typescript
import recipePane from './recipe/recipePane'

export function registerPanes() {
  // ... other registrations
  register(recipePane)
}
```

### Standalone

```typescript
import { paneRegistry } from 'solid-panes'
import recipePane from './recipePane'

paneRegistry.register(recipePane)
```

## Complete Example

```typescript
import { PaneDefinition } from 'pane-registry'
import { NamedNode, Namespace, sym } from 'rdflib'
import { store, authn } from 'solid-logic'
import * as UI from 'solid-ui'

const EX = Namespace('http://example.org/')
const RDF = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const RDFS = Namespace('http://www.w3.org/2000/01/rdf-schema#')

const recipePane: PaneDefinition = {
  name: 'recipe',
  icon: '🍝',
  dev: {
    name: 'Recipe Pane Developer',
    repo: 'https://github.com/example/recipe-pane'
  },

  label: (subject: NamedNode): string | null => {
    if (store.holds(subject, RDF('type'), EX('Recipe'))) {
      return 'Recipe'
    }
    return null
  },

  render: (subject: NamedNode, dom: Document, context: any): HTMLElement => {
    const container = dom.createElement('div')
    container.className = 'recipe-pane'

    // Styles
    const style = dom.createElement('style')
    style.textContent = `
      .recipe-pane { max-width: 600px; margin: 0 auto; padding: 20px; }
      .recipe-pane h2 { color: #2c3e50; }
      .recipe-meta { color: #7f8c8d; margin: 10px 0; }
    `
    container.appendChild(style)

    // Header
    const label = store.any(subject, RDFS('label'), null, null)
    const h2 = dom.createElement('h2')
    h2.textContent = label?.value || 'Untitled Recipe'
    container.appendChild(h2)

    // Meta
    const servings = store.any(subject, EX('servings'), null, null)
    if (servings) {
      const meta = dom.createElement('div')
      meta.className = 'recipe-meta'
      meta.textContent = `Serves ${servings.value}`
      container.appendChild(meta)
    }

    // Edit button (if logged in)
    const user = authn.currentUser()
    if (user) {
      const editBtn = UI.widgets.button(dom, 'Edit Recipe', () => {
        // Open edit mode
      })
      container.appendChild(editBtn)
    }

    return container
  }
}

export default recipePane
```

## Testing

```typescript
import { graph, sym, lit } from 'rdflib'
import recipePane from './recipePane'

describe('recipePane', () => {
  let testStore

  beforeEach(() => {
    testStore = graph()
  })

  test('claims Recipe type', () => {
    const subject = sym('https://example.org/recipe#carbonara')
    testStore.add(subject, RDF('type'), EX('Recipe'))

    // Mock store.holds
    const label = recipePane.label(subject, { store: testStore })
    expect(label).toBe('Recipe')
  })

  test('ignores non-Recipe types', () => {
    const subject = sym('https://example.org/other')
    testStore.add(subject, RDF('type'), sym('http://other.org/Type'))

    const label = recipePane.label(subject, { store: testStore })
    expect(label).toBeNull()
  })
})
```

## See Also

- [Pane Anatomy](/docs/panes/pane-anatomy) — detailed structure reference
- [solid-ui](/docs/libraries/solid-ui) — UI components
- [Your First Pane](/docs/getting-started/your-first-pane) — simpler tutorial
