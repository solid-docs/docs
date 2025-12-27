---
sidebar_position: 3
title: solid-logic
description: Business logic layer for Solid applications
---

# solid-logic

solid-logic provides the business logic layer for SolidOS — authentication, access control, type indexes, and a shared store singleton.

## Installation

```bash
npm install solid-logic
```

## The Singleton Store

solid-logic exports a shared store instance used across all SolidOS components:

```javascript
import { store } from 'solid-logic'

// This is the same store used by all panes
// Changes here are visible everywhere

await store.fetcher.load('https://alice.example/profile/card')

const name = store.any(
  store.sym('https://alice.example/profile/card#me'),
  store.sym('http://xmlns.com/foaf/0.1/name'),
  null,
  null
)
```

### Store Properties

```javascript
import { store } from 'solid-logic'

// The rdflib store (IndexedFormula)
store                    // The graph itself

// Fetcher for loading data
store.fetcher            // Fetcher instance

// UpdateManager for writing data
store.updater            // UpdateManager instance
```

## Authentication

### authn Module

```javascript
import { authn } from 'solid-logic'

// Get current logged-in user
const webId = authn.currentUser()
if (webId) {
  console.log(`Logged in as ${webId.uri}`)
}

// Check login status
if (authn.checkUser()) {
  // User is authenticated
}

// Login
await authn.login()

// Logout
await authn.logout()

// Login with specific provider
await authn.login({
  provider: 'https://solidcommunity.net'
})
```

### Session Management

```javascript
import { authn } from 'solid-logic'

// Listen for login/logout events
authn.onLogin((webId) => {
  console.log(`User logged in: ${webId}`)
})

authn.onLogout(() => {
  console.log('User logged out')
})

// Get session info
const session = authn.session
if (session) {
  console.log(`Session expires: ${session.expiresAt}`)
}
```

## Access Control

### Checking Permissions

```javascript
import { solidLogicSingleton } from 'solid-logic'

const uri = 'https://alice.example/private/data.ttl'

// Check specific access modes
const canRead = await solidLogicSingleton.checkAccess(uri, 'Read')
const canWrite = await solidLogicSingleton.checkAccess(uri, 'Write')
const canControl = await solidLogicSingleton.checkAccess(uri, 'Control')

// Check multiple modes
const access = await solidLogicSingleton.checkAccessAll(uri)
console.log(access)  // { Read: true, Write: false, Control: false }
```

### ACL Management

```javascript
import { acl } from 'solid-logic'

// Get ACL document for a resource
const aclDoc = await acl.getACLDocument('https://alice.example/data.ttl')

// Check if user has access
const hasAccess = await acl.checkAccess(
  'https://alice.example/data.ttl',
  'https://bob.example/profile/card#me',
  'Write'
)
```

## Type Index

The Type Index maps RDF types to their storage locations in a pod:

```javascript
import { typeIndex } from 'solid-logic'

// Find where contacts are stored
const contactLocations = await typeIndex.findByType(
  'http://www.w3.org/2006/vcard/ns#AddressBook'
)

// Register a new type location
await typeIndex.register(
  'http://example.org/MyType',
  'https://alice.example/my-data/',
  true  // isContainer
)
```

### Public vs Private Type Index

```javascript
import { typeIndex } from 'solid-logic'

// Get public type index (visible to others)
const publicIndex = await typeIndex.getPublicTypeIndex(webId)

// Get private type index (only visible to owner)
const privateIndex = await typeIndex.getPrivateTypeIndex(webId)

// List all registered types
const registrations = await typeIndex.getAllRegistrations(webId)
registrations.forEach(reg => {
  console.log(`${reg.forClass} -> ${reg.instance || reg.instanceContainer}`)
})
```

## Profile Utilities

```javascript
import { profile } from 'solid-logic'

// Load and parse a WebID profile
const webId = 'https://alice.example/profile/card#me'
const profileData = await profile.load(webId)

console.log(profileData.name)
console.log(profileData.inbox)
console.log(profileData.storage)
console.log(profileData.preferencesFile)

// Get pod root from WebID
const podRoot = await profile.getPodRoot(webId)
// https://alice.example/

// Get inbox
const inbox = await profile.getInbox(webId)
// https://alice.example/inbox/
```

## Preferences

```javascript
import { preferences } from 'solid-logic'

// Load user preferences
const prefs = await preferences.load(webId)

// Get a preference value
const theme = prefs.get('http://example.org/theme')

// Set a preference
await prefs.set('http://example.org/theme', 'dark')
```

## Container Operations

```javascript
import { container } from 'solid-logic'

// List container contents
const contents = await container.list('https://alice.example/documents/')

contents.forEach(item => {
  console.log(`${item.name} - ${item.type}`)  // file or container
})

// Create a container
await container.create('https://alice.example/new-folder/')

// Delete a container (must be empty)
await container.delete('https://alice.example/old-folder/')
```

## Utility Functions

### Document Helpers

```javascript
import { store } from 'solid-logic'

// Get the document URI from a hash URI
const doc = store.sym('https://example.org/doc#thing').doc()
// https://example.org/doc

// Check if a document is loaded
const isLoaded = store.fetcher.requested['https://example.org/doc']
```

### Common Namespaces

```javascript
import { ns } from 'solid-logic'

// Pre-defined namespaces
ns.rdf('type')      // http://www.w3.org/1999/02/22-rdf-syntax-ns#type
ns.rdfs('label')    // http://www.w3.org/2000/01/rdf-schema#label
ns.foaf('name')     // http://xmlns.com/foaf/0.1/name
ns.vcard('fn')      // http://www.w3.org/2006/vcard/ns#fn
ns.ldp('Container') // http://www.w3.org/ns/ldp#Container
ns.solid('inbox')   // http://www.w3.org/ns/solid/terms#inbox
ns.acl('Read')      // http://www.w3.org/ns/auth/acl#Read
```

## Error Handling

```javascript
import { store, authn } from 'solid-logic'

try {
  await store.fetcher.load('https://alice.example/private/data.ttl')
} catch (error) {
  if (error.status === 401) {
    // Not authenticated
    await authn.login()
  } else if (error.status === 403) {
    // No permission
    console.log('Access denied')
  } else if (error.status === 404) {
    // Resource doesn't exist
    console.log('Not found')
  }
}
```

## TypeScript Types

```typescript
import type {
  SolidLogic,
  AuthenticationContext,
  AccessModes,
  TypeRegistration
} from 'solid-logic'

interface AccessModes {
  Read: boolean
  Write: boolean
  Append: boolean
  Control: boolean
}

interface TypeRegistration {
  forClass: string
  instance?: string
  instanceContainer?: string
}
```

## Integration with Panes

Panes typically use solid-logic like this:

```javascript
import { store, authn, ns } from 'solid-logic'

const myPane = {
  name: 'my-pane',

  label: (subject, context) => {
    // Use store to check type
    if (store.holds(subject, ns.rdf('type'), MY_TYPE)) {
      return 'My Pane'
    }
    return null
  },

  render: (subject, dom, context) => {
    const container = dom.createElement('div')

    // Check if user is logged in
    const user = authn.currentUser()
    if (!user) {
      container.textContent = 'Please log in'
      return container
    }

    // Query the store
    const name = store.any(subject, ns.foaf('name'), null, null)
    container.textContent = name?.value || 'Unknown'

    return container
  }
}
```

## See Also

- [solid-logic GitHub](https://github.com/SolidOS/solid-logic)
- [rdflib.js](/docs/libraries/rdflib) — underlying RDF library
- [Authentication Flow](/docs/architecture/overview#data-flow) — how auth works
