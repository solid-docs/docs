---
sidebar_position: 2
title: Core Concepts
description: Understanding Solid pods, RDF, and the pane system
---

# Core Concepts

Before building with SolidOS, understand these foundational concepts.

## Solid Pods

A **pod** (Personal Online Datastore) is where your data lives.

```
https://alice.solidcommunity.net/
├── profile/
│   └── card#me          ← WebID (identity)
├── public/              ← Anyone can read
├── private/             ← Only you can access
├── contacts/
│   ├── alice.ttl
│   └── bob.ttl
└── settings/
    └── prefs.ttl
```

Key properties:
- **You own it** — your data, your control
- **ACL protected** — fine-grained access control
- **Linked Data** — everything connects via URIs
- **Protocol-based** — any compliant server works

## RDF & Linked Data

Solid uses **RDF** (Resource Description Framework) — data as triples:

```turtle
# Subject → Predicate → Object

<#me> a foaf:Person ;
    foaf:name "Alice" ;
    foaf:knows <https://bob.example.com/profile/card#me> .
```

Why RDF?
- **Universal identifiers** — URIs for everything
- **Vocabularies** — shared meaning (foaf:Person, vcard:email)
- **Linking** — connect data across pods
- **Queryable** — SPARQL for complex queries

### Common Vocabularies

| Prefix | Vocabulary | Used For |
|--------|------------|----------|
| `foaf:` | Friend of a Friend | People, social |
| `vcard:` | vCard | Contacts |
| `schema:` | Schema.org | General |
| `solid:` | Solid | Solid-specific |
| `acl:` | Web Access Control | Permissions |

## WebID

Your **WebID** is your identity on the decentralized web:

```
https://alice.solidcommunity.net/profile/card#me
```

It's a URI that:
- Identifies you uniquely
- Points to your profile document
- Can be dereferenced (fetched) to learn about you
- Uses the `#me` fragment convention

## The Pane System

SolidOS renders data through **panes** — specialized UI components.

### How Panes Work

```javascript
// Each pane declares what it can handle
const contactPane = {
  name: 'contact',

  // "Can you render this resource?"
  label: (subject, context) => {
    if (subject.hasType(vcard('Individual'))) {
      return "Contact"  // Yes! Return a label
    }
    return null  // No, pass to next pane
  },

  // "Render it!"
  render: (subject, dom, context) => {
    const div = dom.createElement('div')
    // Build the UI...
    return div
  }
}
```

### Pane Selection

When rendering a resource, SolidOS:

1. Queries all registered panes
2. Each pane returns a label (or null)
3. Most specific pane wins
4. Falls back to generic pane if none match

```
Resource: /contacts/alice.ttl (type: vcard:Individual)

Panes consulted:
  ✓ contacts-pane    → "Contact"     (specific, wins!)
  ✓ generic-pane     → "Data"        (fallback)
  ✗ chat-pane        → null          (can't handle)
  ✗ meeting-pane     → null          (can't handle)
```

## The Store

SolidOS uses **rdflib.js** to manage RDF data in memory:

```javascript
import { store } from 'solid-logic'

// Fetch data into the store
await store.fetcher.load('https://alice.example/profile/card')

// Query the store
const name = store.any(
  namedNode('https://alice.example/profile/card#me'),
  foaf('name'),
  null
)

// Update the store
store.add(
  namedNode('https://alice.example/profile/card#me'),
  foaf('nick'),
  literal('Ali')
)

// Write back to pod
await store.updater.update([], [/* statements */])
```

## Authentication

SolidOS handles authentication via **Solid-OIDC**:

```javascript
import { authn } from 'solid-logic'

// Check current user
const webId = authn.currentUser()

// Login
await authn.login()

// Logout
await authn.logout()
```

## Access Control

Solid uses **Web Access Control (WAC)** for permissions:

```turtle
# .acl file
<#authorization>
    a acl:Authorization ;
    acl:agent <https://alice.example/profile/card#me> ;
    acl:accessTo <./document.ttl> ;
    acl:mode acl:Read, acl:Write .
```

Modes:
- `acl:Read` — view the resource
- `acl:Write` — modify the resource
- `acl:Append` — add to (but not modify)
- `acl:Control` — manage permissions

## Next Steps

- [Quick Start](/docs/getting-started/quick-start) — run SolidOS locally
- [Architecture Overview](/docs/architecture/overview) — how pieces connect
- [RDF Primer](/docs/reference/rdf-primer) — deeper dive into RDF
