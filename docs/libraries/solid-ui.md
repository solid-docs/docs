---
sidebar_position: 4
title: solid-ui
description: UI components for Solid applications
---

# solid-ui

solid-ui provides reusable UI components for building Solid applications — widgets, forms, tables, and styling utilities.

## Installation

```bash
npm install solid-ui
```

## Widgets

### Buttons

```javascript
import * as UI from 'solid-ui'

// Simple button
const btn = UI.widgets.button(
  document,
  'Click Me',
  () => console.log('clicked')
)

// Button with icon
const iconBtn = UI.widgets.button(
  document,
  '+ Add',
  handleAdd,
  { icon: 'plus' }
)

// Async button (shows loading state)
const saveBtn = UI.widgets.asyncButton(
  document,
  'Save',
  async () => {
    await saveData()
  }
)
```

### Text Fields

```javascript
// Simple text input
const input = UI.widgets.textInputField(
  document,
  'Enter name...',
  (value) => console.log('Changed:', value)
)

// With initial value
const nameField = UI.widgets.textInputField(
  document,
  '',
  handleChange,
  { value: 'Alice' }
)
```

### RDF-Bound Fields

```javascript
import { store, ns } from 'solid-logic'

// Field bound to RDF property
const field = UI.widgets.field(
  document,
  store,
  subject,        // NamedNode - the resource
  ns.foaf('name'), // NamedNode - the predicate
  'Name'          // Label
)

// Changes automatically saved to pod
```

### Links

```javascript
// Create a clickable link to a resource
const link = UI.widgets.linkTo(
  document,
  sym('https://alice.example/profile/card#me'),
  'View Alice\'s Profile'
)

// Link with custom styling
const styledLink = UI.widgets.linkTo(
  document,
  target,
  label,
  { style: 'button' }
)
```

### Avatars

```javascript
// User avatar from WebID
const avatar = UI.widgets.avatar(
  document,
  sym('https://alice.example/profile/card#me'),
  { size: 48 }
)

// Avatar with fallback
const avatarWithFallback = UI.widgets.avatar(
  document,
  webId,
  { fallback: 'initials' }
)
```

## Forms

### Auto-Generated Forms

solid-ui can generate forms from RDF ontologies:

```javascript
import * as UI from 'solid-ui'

// Generate form from a form specification
const form = UI.forms.buildForm(
  document,
  store,
  subject,
  formSpec,      // NamedNode pointing to form definition
  doc            // Document to save to
)

container.appendChild(form)
```

### Form Specification

Forms are defined in RDF using the UI ontology:

```turtle
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<#PersonForm> a ui:Form ;
    ui:parts (
        <#nameField>
        <#emailField>
    ) .

<#nameField> a ui:SingleLineTextField ;
    ui:property foaf:name ;
    ui:label "Name" ;
    ui:required true .

<#emailField> a ui:EmailField ;
    ui:property foaf:mbox ;
    ui:label "Email" .
```

### Field Types

```javascript
// Available field types
UI.forms.fieldTypes = {
  'SingleLineTextField': /* text input */,
  'MultiLineTextField':  /* textarea */,
  'IntegerField':        /* number input */,
  'DecimalField':        /* decimal number */,
  'BooleanField':        /* checkbox */,
  'DateField':           /* date picker */,
  'DateTimeField':       /* datetime picker */,
  'EmailField':          /* email input */,
  'PhoneField':          /* phone input */,
  'ColorField':          /* color picker */,
  'Choice':              /* dropdown/radio */,
  'Classifier':          /* type selector */,
}
```

### Manual Form Building

```javascript
// Build a form manually
const form = document.createElement('form')

// Name field
const nameGroup = UI.forms.fieldGroup(document, 'Name')
const nameInput = UI.forms.textField(document, store, subject, ns.foaf('name'))
nameGroup.appendChild(nameInput)
form.appendChild(nameGroup)

// Save button
const saveBtn = UI.widgets.asyncButton(document, 'Save', async () => {
  await store.updater.update([], store.statementsMatching(null, null, null, subject.doc()))
})
form.appendChild(saveBtn)
```

## Tables

### Simple Table

```javascript
// Create a table from RDF data
const subjects = store.each(container, ns.ldp('contains'), null, null)

const table = UI.widgets.table(
  document,
  subjects,
  [
    { property: ns.rdfs('label'), label: 'Name' },
    { property: ns.dct('created'), label: 'Created' },
    { property: ns.dct('modified'), label: 'Modified' }
  ]
)
```

### Editable Table

```javascript
const editableTable = UI.widgets.editableTable(
  document,
  store,
  subjects,
  columns,
  {
    onAdd: async (newRow) => { /* handle add */ },
    onDelete: async (row) => { /* handle delete */ },
    sortable: true
  }
)
```

## Tabs

```javascript
// Create a tabbed interface
const tabs = UI.widgets.tabs(document, [
  {
    label: 'Profile',
    render: (container) => {
      container.appendChild(profilePane)
    }
  },
  {
    label: 'Settings',
    render: (container) => {
      container.appendChild(settingsPane)
    }
  },
  {
    label: 'Activity',
    render: (container) => {
      container.appendChild(activityPane)
    }
  }
])
```

## Styling

### Apply Standard Styles

```javascript
// Style an element
UI.style.styleElement(element, 'button')
UI.style.styleElement(element, 'input')
UI.style.styleElement(element, 'heading')
UI.style.styleElement(element, 'panel')
```

### Style Classes

```javascript
// Add SolidOS style classes
element.classList.add('solid-button')
element.classList.add('solid-input')
element.classList.add('solid-panel')
element.classList.add('solid-card')
```

### Color Palette

```javascript
// Access the color palette
UI.style.colors.primary    // Main brand color
UI.style.colors.secondary  // Secondary actions
UI.style.colors.success    // Success states
UI.style.colors.warning    // Warning states
UI.style.colors.error      // Error states
UI.style.colors.muted      // Disabled/muted
```

## Dialogs

### Alert Dialog

```javascript
UI.widgets.alert('Operation completed successfully')
```

### Confirm Dialog

```javascript
const confirmed = await UI.widgets.confirm(
  'Are you sure you want to delete this?'
)
if (confirmed) {
  await deleteResource()
}
```

### Prompt Dialog

```javascript
const name = await UI.widgets.prompt('Enter your name:')
if (name) {
  console.log(`Hello, ${name}`)
}
```

### Custom Dialog

```javascript
const dialog = UI.widgets.dialog(
  document,
  'Edit Profile',
  (container) => {
    // Build dialog content
    const form = buildProfileForm()
    container.appendChild(form)
  },
  {
    buttons: [
      { label: 'Cancel', action: 'close' },
      { label: 'Save', action: handleSave, primary: true }
    ]
  }
)
```

## Icons

```javascript
// Get an icon element
const icon = UI.icons.iconFor(subject)  // Infers from type

// Specific icons
const folderIcon = UI.icons.icon('folder')
const personIcon = UI.icons.icon('person')
const fileIcon = UI.icons.icon('file')
const lockIcon = UI.icons.icon('lock')
```

## Loading States

```javascript
// Show loading indicator
const loader = UI.widgets.loadingIndicator(document)
container.appendChild(loader)

// Later, remove it
loader.remove()

// Or use with async operations
const content = await UI.widgets.withLoading(
  container,
  async () => {
    return await fetchData()
  }
)
```

## Error Handling

```javascript
// Display an error message
UI.widgets.errorMessage(
  container,
  'Failed to load data',
  error  // optional Error object
)

// With retry button
UI.widgets.errorMessage(
  container,
  'Connection failed',
  error,
  { retry: () => fetchData() }
)
```

## Integration Example

Here's a complete example using solid-ui in a pane:

```javascript
import * as UI from 'solid-ui'
import { store, authn, ns } from 'solid-logic'

const personPane = {
  name: 'person',
  icon: UI.icons.icon('person'),

  label: (subject) => {
    if (store.holds(subject, ns.rdf('type'), ns.foaf('Person'))) {
      return 'Person'
    }
    return null
  },

  render: (subject, dom, context) => {
    const container = dom.createElement('div')
    UI.style.styleElement(container, 'panel')

    // Header with avatar
    const header = dom.createElement('div')
    header.style.display = 'flex'
    header.style.alignItems = 'center'
    header.style.gap = '12px'

    const avatar = UI.widgets.avatar(dom, subject, { size: 64 })
    header.appendChild(avatar)

    const name = store.any(subject, ns.foaf('name'), null, null)
    const heading = dom.createElement('h2')
    heading.textContent = name?.value || 'Unknown'
    header.appendChild(heading)

    container.appendChild(header)

    // Editable fields (if owner)
    const user = authn.currentUser()
    if (user && user.uri === subject.uri) {
      const nameField = UI.widgets.field(
        dom, store, subject, ns.foaf('name'), 'Name'
      )
      container.appendChild(nameField)

      const bioField = UI.widgets.field(
        dom, store, subject, ns.foaf('bio'), 'Bio'
      )
      container.appendChild(bioField)
    }

    // Friends list
    const friends = store.each(subject, ns.foaf('knows'), null, null)
    if (friends.length > 0) {
      const heading = dom.createElement('h3')
      heading.textContent = 'Friends'
      container.appendChild(heading)

      const list = dom.createElement('ul')
      friends.forEach(friend => {
        const li = dom.createElement('li')
        li.appendChild(UI.widgets.linkTo(dom, friend))
        list.appendChild(li)
      })
      container.appendChild(list)
    }

    return container
  }
}
```

## See Also

- [solid-ui GitHub](https://github.com/SolidOS/solid-ui)
- [Creating Panes](/docs/panes/creating-panes) — use solid-ui in panes
- [solid-logic](/docs/libraries/solid-logic) — data layer
