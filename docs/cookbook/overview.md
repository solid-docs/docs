---
sidebar_position: 1
title: Cookbook
description: Common patterns and recipes for SolidOS development
---

# Cookbook

Practical recipes for common SolidOS development tasks.

## Quick Reference

| Recipe | Description |
|--------|-------------|
| [Authentication](/docs/cookbook/authentication) | Login, logout, and session handling |
| [Reading Data](/docs/cookbook/reading-data) | Fetching and querying RDF |
| [Writing Data](/docs/cookbook/writing-data) | Creating and updating resources |
| [Access Control](/docs/cookbook/access-control) | Managing permissions |
| [File Operations](/docs/cookbook/file-operations) | Upload, download, containers |
| Type Index | Finding user data locations |

## Common Patterns

### Check if User is Logged In

```javascript
import { authn } from 'solid-logic'

const user = authn.currentUser()
if (user) {
  console.log(`Logged in as ${user.uri}`)
} else {
  console.log('Not logged in')
}
```

### Load and Display a Name

```javascript
import { store, sym } from 'solid-logic'

const FOAF = Namespace('http://xmlns.com/foaf/0.1/')

async function displayName(webId) {
  const person = sym(webId)
  await store.fetcher.load(person.doc())

  const name = store.any(person, FOAF('name'), null, null)
  return name?.value || 'Unknown'
}
```

### Create a Simple Form

```javascript
import * as UI from 'solid-ui'
import { store, sym } from 'solid-logic'

function createNameForm(subject, container) {
  const FOAF = Namespace('http://xmlns.com/foaf/0.1/')

  const nameField = UI.widgets.field(
    document,
    store,
    subject,
    FOAF('name'),
    'Name'
  )
  container.appendChild(nameField)

  const saveBtn = UI.widgets.asyncButton(document, 'Save', async () => {
    // Changes are auto-saved by the field
    UI.widgets.alert('Saved!')
  })
  container.appendChild(saveBtn)
}
```

### Handle Errors Gracefully

```javascript
import { store } from 'solid-logic'

async function loadSafely(uri) {
  try {
    await store.fetcher.load(uri)
    return { success: true }
  } catch (error) {
    if (error.status === 401) {
      return { success: false, reason: 'Please log in' }
    } else if (error.status === 403) {
      return { success: false, reason: 'Access denied' }
    } else if (error.status === 404) {
      return { success: false, reason: 'Not found' }
    } else {
      return { success: false, reason: error.message }
    }
  }
}
```

### Subscribe to Changes

```javascript
import { store, sym } from 'solid-logic'

function watchResource(uri, callback) {
  const doc = sym(uri).doc()

  // Reload periodically (simple approach)
  const interval = setInterval(async () => {
    await store.fetcher.refresh(doc)
    callback()
  }, 5000)

  // Return cleanup function
  return () => clearInterval(interval)
}

// Usage
const unsubscribe = watchResource('https://alice.example/data.ttl', () => {
  console.log('Data changed!')
})
// Later: unsubscribe()
```

### Create a Linked Resource

```javascript
import { store, sym, lit, st, blankNode } from 'solid-logic'

async function createNote(containerUri, title, content) {
  const noteDoc = sym(`${containerUri}note-${Date.now()}.ttl`)
  const note = sym(`${noteDoc.uri}#this`)

  const statements = [
    st(note, RDF('type'), sym('http://schema.org/Note'), noteDoc),
    st(note, RDFS('label'), lit(title), noteDoc),
    st(note, sym('http://schema.org/text'), lit(content), noteDoc),
    st(note, DCT('created'), lit(new Date().toISOString(), null,
      sym('http://www.w3.org/2001/XMLSchema#dateTime')), noteDoc),
    st(note, DCT('creator'), authn.currentUser(), noteDoc),
  ]

  await store.updater.update([], statements)
  return note
}
```

### Navigate Programmatically

```javascript
// In mashlib context
function navigateTo(uri) {
  const subject = panes.UI.store.sym(uri)
  panes.runDataBrowser(document, subject)
}

// Or dispatch event
function navigateViaEvent(uri) {
  const event = new CustomEvent('solid-navigate', {
    detail: { uri }
  })
  document.dispatchEvent(event)
}
```

## See Also

- [Authentication](/docs/cookbook/authentication) — login patterns
- [Reading Data](/docs/cookbook/reading-data) — query patterns
- [Writing Data](/docs/cookbook/writing-data) — update patterns
