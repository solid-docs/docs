---
sidebar_position: 2
title: Core Concepts
description: Pods, RDF, WebIDs, panes, the store and login in SolidOS 3.1
---

# Core Concepts

The ideas you need before building with SolidOS 3.1.

## Pods

A **pod** is a web server that keeps someone's data as documents and folders (containers), each with its own address:

```
https://alice.example/
├── profile/
│   └── card            ← profile document; card#me is Alice's WebID
├── public/             ← readable by anyone, by convention
├── private/
└── contacts/
    └── index.ttl
```

- Every document and folder has a URL, and is read with HTTP `GET` and changed with `PUT`, `PATCH` and `DELETE` ([Solid Protocol](https://solidproject.org/TR/protocol)).
- Who may do what is set per document or folder (see [Access control](#access-control)).
- Any server that follows the protocol works with SolidOS.

## RDF and linked data

Data in a pod is **RDF**: statements of the form subject, predicate, object, where each part can be a URL.

```turtle
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<#me> a foaf:Person ;
    foaf:name "Alice" ;
    foaf:knows <https://bob.example/profile/card#me> .
```

Because the parts are URLs, data in one pod can point at data in another. Shared vocabularies give the predicates a common meaning:

| Prefix | Vocabulary | Used for |
|--------|------------|----------|
| `foaf:` | Friend of a Friend | People, profiles |
| `vcard:` | vCard | Contacts, address books |
| `schema:` | Schema.org | General things |
| `solid:` | Solid terms | Type indexes, inboxes |
| `acl:` | Web Access Control | Permissions |

More in the [RDF primer](../reference/rdf-primer.md).

## WebID

A **WebID** is a URL that names a person, such as `https://alice.example/profile/card#me`. Fetching it returns the profile document that describes them. You log in to SolidOS as a WebID.

## The page globals

mashlib puts its libraries on the page as globals, so you can try everything below in the browser console in the [SolidOS Browser](https://solidos.org/docs/browser/):

| Global | What it is |
|--------|------------|
| `panes` | solid-panes: `register`, `byName`, `list`, `getOutliner`, plus `runDataBrowser` added by mashlib |
| `UI` | solid-ui |
| `SolidLogic` | solid-logic: `store`, `authn`, `authSession`, `solidLogicSingleton` |
| `$rdf` | rdflib |
| `mashlib.versionInfo` | build and version information |

## The store

All of SolidOS shares one rdflib store. Documents are loaded into it, read from it and written back through it.

```javascript
const store = SolidLogic.store
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')
const me = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')

await store.fetcher.load(me.doc())          // GET the profile document into the store
store.any(me, FOAF('name'))?.value           // "Testing SolidOS"
store.each(me, FOAF('knows')).length         // 2
```

`store.updater.update(deletions, insertions)` writes changes back to the pod. [Data Flow](../architecture/data-flow.md) shows a full read and write.

Inside a pane, use the store from the context (`context.session.store`) rather than a global. It is the same object.

## Panes

A **pane** is a view for one kind of thing. In 3.1 a pane is a plain object, usually the default export of an ES module:

```javascript
export default {
  name: 'hello',                    // unique name
  icon: 'https://example.org/hello.svg',   // image URL for menus

  // "Can you show this?" Return a label to say yes, null to say no.
  label (subject, context) {
    const store = context.session.store
    return store.any(subject, store.sym('http://xmlns.com/foaf/0.1/primaryTopic')) ? 'Hello' : null
  },

  // "Show it." Return one element.
  render (subject, context) {
    const div = context.dom.createElement('div')
    div.textContent = 'Hello'
    return div
  }
}
```

`subject` is an rdflib `NamedNode`. `context` has `dom` (the document), `session.store`, `session.logic` (solid-logic), `session.paneRegistry`, and in the data browser `environment` (layout, theme, input mode and viewport). Optional fields such as `shouldGetFocus`, `audience` and `mintClass` are described in [Pane Anatomy](../panes/pane-anatomy.md).

A pane is added with `panes.register(pane)`.

### How a pane is chosen

When SolidOS shows a resource:

1. It goes through the registered panes **in registration order** and keeps every one whose `label` returns a string. The built-in panes are registered first, so a pane you add later comes after them.
2. If a pane has an `audience` (a list of user roles), it is kept only when the logged-in user's preferences list those roles. The first pane from step 1 is always kept.
3. It shows the first of these that matches the resource's `ui:mintClass`, otherwise the first whose `shouldGetFocus(subject)` returns true, otherwise the first in the list.

For a file or folder, the others are offered in the **⋮** menu at the top right of the view. For the test profile above, the panes that say yes to the WebID are `profile`, `social`, `source`, `default` and `internal`, and `profile` is shown.

## Login

SolidOS 3.1 logs in with Solid-OIDC through `@uvdsl/solid-oidc-client-browser`, wrapped by solid-logic as `authSession`. In the data browser the header's **Log In** button and account menu (the `<solid-ui-login-button>` and `<solid-ui-account>` components) do this for you. From code:

```javascript
SolidLogic.authn.currentUser()              // NamedNode of the WebID, or null
await SolidLogic.authn.checkUser()          // the same, after restoring a session

const session = SolidLogic.authSession
session.events.on('login', () => { /* ... */ })   // also 'logout', 'sessionRestore', 'sessionChange', 'identityReplaced'
await session.login('https://solidcommunity.net', window.location.href)  // redirects to the provider
await session.logout()

SolidLogic.getSuggestedIssuers()            // [{ name, uri }, ...] identity providers offered at login
```

More in [Authentication](../cookbook/authentication.md).

## Access control

Most Solid servers use **Web Access Control** ([WAC](https://solidproject.org/TR/wac)). An ACL document next to a resource lists who may do what:

```turtle
@prefix acl: <http://www.w3.org/ns/auth/acl#> .

<#owner>
    a acl:Authorization ;
    acl:agent <https://alice.example/profile/card#me> ;
    acl:accessTo <./document.ttl> ;
    acl:mode acl:Read, acl:Write, acl:Control .
```

| Mode | Allows |
|------|--------|
| `acl:Read` | reading the resource |
| `acl:Write` | changing or deleting it |
| `acl:Append` | adding to it without changing what is there |
| `acl:Control` | reading and changing its ACL |

In SolidOS you change access with the sharing dialog rather than by editing ACLs. See [Access Control](../cookbook/access-control.md).

## Next steps

- [Quick Start](./quick-start.md): run SolidOS
- [Your First Pane](./your-first-pane.md): write and load a pane
- [Architecture Overview](../architecture/overview.md): how the packages fit together
