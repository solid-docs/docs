---
sidebar_position: 5
title: Access Control
description: Managing permissions with WAC and ACP
---

# Access Control

Solid uses Access Control to determine who can read, write, and manage resources. SolidOS supports both Web Access Control (WAC) and Access Control Policy (ACP).

## Web Access Control (WAC)

WAC is the original Solid access control system using `.acl` files.

### ACL Modes

| Mode | Description |
|------|-------------|
| `acl:Read` | View the resource |
| `acl:Write` | Modify the resource |
| `acl:Append` | Add to the resource (but not modify existing) |
| `acl:Control` | Manage the ACL itself |

### Reading Permissions

```javascript
import { store, sym } from 'solid-logic'

const ACL = Namespace('http://www.w3.org/ns/auth/acl#')

async function getPermissions(resourceUri) {
  const resource = sym(resourceUri)
  const aclUri = resource.uri + '.acl'
  const acl = sym(aclUri)

  try {
    await store.fetcher.load(acl)
  } catch (e) {
    // ACL might not exist, check parent
    console.log('No direct ACL, inheriting from parent')
    return null
  }

  const authorizations = store.each(null, ACL('accessTo'), resource, acl.doc())

  return authorizations.map(auth => ({
    agent: store.any(auth, ACL('agent'), null, acl.doc())?.uri,
    agentClass: store.any(auth, ACL('agentClass'), null, acl.doc())?.uri,
    modes: store.each(auth, ACL('mode'), null, acl.doc()).map(m => m.uri)
  }))
}
```

### Setting Permissions

```javascript
async function grantAccess(resourceUri, agentWebId, modes) {
  const resource = sym(resourceUri)
  const aclUri = resource.uri + '.acl'
  const acl = sym(aclUri)
  const agent = sym(agentWebId)

  // Create authorization
  const authId = sym(aclUri + '#auth-' + Date.now())

  const statements = [
    st(authId, RDF('type'), ACL('Authorization'), acl.doc()),
    st(authId, ACL('accessTo'), resource, acl.doc()),
    st(authId, ACL('agent'), agent, acl.doc()),
    ...modes.map(mode => st(authId, ACL('mode'), ACL(mode), acl.doc()))
  ]

  await store.updater.update([], statements)
}

// Example: Grant read/write access
await grantAccess(
  'https://alice.example/document.ttl',
  'https://bob.example/profile/card#me',
  ['Read', 'Write']
)
```

### Public Access

Grant access to everyone:

```javascript
// Make resource publicly readable
const statements = [
  st(authId, ACL('agentClass'), FOAF('Agent'), acl.doc()),
  st(authId, ACL('mode'), ACL('Read'), acl.doc())
]
```

### Authenticated Users

Grant access to any logged-in user:

```javascript
// Allow any authenticated user to read
const statements = [
  st(authId, ACL('agentClass'), ACL('AuthenticatedAgent'), acl.doc()),
  st(authId, ACL('mode'), ACL('Read'), acl.doc())
]
```

### Group Access

```javascript
// Grant access to a group
const group = sym('https://alice.example/groups/friends#group')
const statements = [
  st(authId, ACL('agentGroup'), group, acl.doc()),
  st(authId, ACL('mode'), ACL('Read'), acl.doc())
]
```

## Default Permissions

Default permissions apply to new resources in a container:

```javascript
// Set default for container
const statements = [
  st(authId, ACL('default'), container, acl.doc()),
  st(authId, ACL('agent'), agent, acl.doc()),
  st(authId, ACL('mode'), ACL('Read'), acl.doc())
]
```

## Using solid-ui

solid-ui provides widgets for access control:

```javascript
import { widgets } from 'solid-ui'

// Render ACL editor
const aclEditor = widgets.aclControl.ACLControlBox(
  resource,
  context,
  'resource',
  store
)
container.appendChild(aclEditor)
```

## Checking Access

Before performing operations, check if user has access:

```javascript
import { authn } from 'solid-logic'

async function canWrite(resourceUri) {
  const resource = sym(resourceUri)

  try {
    // Try a HEAD request to check permissions
    const response = await store.fetcher.webOperation('HEAD', resource.uri)
    const wacAllow = response.headers.get('WAC-Allow')

    if (wacAllow) {
      return wacAllow.includes('write')
    }
  } catch (e) {
    return false
  }

  return false
}
```

## Trusted Apps

Users can grant apps specific permissions via their profile:

```turtle
<#me>
    acl:trustedApp [
        acl:mode acl:Read, acl:Write ;
        acl:origin <https://myapp.example>
    ] .
```

```javascript
// Check if current app is trusted
async function isAppTrusted(webId, origin) {
  const person = sym(webId)
  await store.fetcher.load(person.doc())

  const trustedApps = store.each(person, ACL('trustedApp'))
  for (const app of trustedApps) {
    const appOrigin = store.any(app, ACL('origin'))
    if (appOrigin?.uri === origin) {
      return store.each(app, ACL('mode')).map(m => m.uri)
    }
  }
  return []
}
```

## Common Patterns

### Private by Default

```javascript
// Only owner has access
const ownerAuth = [
  st(authId, ACL('agent'), owner, acl.doc()),
  st(authId, ACL('mode'), ACL('Read'), acl.doc()),
  st(authId, ACL('mode'), ACL('Write'), acl.doc()),
  st(authId, ACL('mode'), ACL('Control'), acl.doc())
]
```

### Share with Specific People

```javascript
// Owner + specific friends
const friendAuth = [
  st(friendAuthId, ACL('agent'), friend1, acl.doc()),
  st(friendAuthId, ACL('agent'), friend2, acl.doc()),
  st(friendAuthId, ACL('mode'), ACL('Read'), acl.doc())
]
```

### Public Read, Owner Write

```javascript
// Common blog pattern
const publicRead = [
  st(publicAuthId, ACL('agentClass'), FOAF('Agent'), acl.doc()),
  st(publicAuthId, ACL('mode'), ACL('Read'), acl.doc())
]

const ownerWrite = [
  st(ownerAuthId, ACL('agent'), owner, acl.doc()),
  st(ownerAuthId, ACL('mode'), ACL('Read'), acl.doc()),
  st(ownerAuthId, ACL('mode'), ACL('Write'), acl.doc()),
  st(ownerAuthId, ACL('mode'), ACL('Control'), acl.doc())
]
```

## See Also

- [WAC Specification](https://solid.github.io/web-access-control-spec/)
- [Sharing View](https://solid-docs.github.io/userguide/views/sharing) - UI for managing permissions
- [Authentication](/cookbook/authentication) - User login
