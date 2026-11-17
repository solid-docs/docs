---
sidebar_position: 1
title: Cookbook
description: Recipes for SolidOS 3.1 panes and pages
---

# Cookbook

Short recipes for common tasks in a SolidOS pane or on a page that loads mashlib. Every recipe was run in SolidOS 3.1 (mashlib 3.1.0, rdflib 2.4.1, solid-logic 6.2.0) before it was published here.

| Recipe | What it covers |
|---|---|
| [Reading Data](./reading-data.md) | Load documents, query the store, folder contents, type indexes, errors |
| [Writing Data](./writing-data.md) | Patch and write documents, create folders, upload and delete files |
| [Authentication](./authentication.md) | Log in and out, react to the session |
| [Access Control](./access-control.md) | See and change who may read or write a resource |

## What a pane has to work with

A pane's `render(subject, context)` and `label(subject, context)` receive a `context`. Together with the globals that mashlib sets on the page, that is all a recipe needs:

| Name | What it is |
|---|---|
| `context.dom` | The `document` to create elements in |
| `context.session.store` | The shared rdflib store; the same object as `SolidLogic.store` |
| `context.session.store.fetcher` | Loads documents into the store, using the login session ([rdflib.js](../libraries/rdflib.md#fetcher)) |
| `context.session.store.updater` | Writes changes back ([rdflib.js](../libraries/rdflib.md#update-manager)) |
| `context.session.logic` | The solid-logic instance (`resource`, `profile`, `typeIndex`, `acl`, `authn`, ...); the same object as `SolidLogic.solidLogicSingleton` ([solid-logic](../libraries/solid-logic.md)) |
| `context.session.paneRegistry` | The registered panes |
| `$rdf` | rdflib: `sym`, `lit`, `st`, `Namespace`, `graph`, `parse`, `serialize`, ... |
| `SolidLogic` | The solid-logic module: `store`, `authn`, `authSession`, `solidLogicSingleton`, ... |
| `UI` | solid-ui ([solid-ui](../libraries/solid-ui.md)) |
| `panes` | solid-panes: `register`, `getOutliner`, ... |

`$rdf`, `SolidLogic`, `UI` and `panes` are globals on the page that mashlib 3.1 sets. `sym`, `lit` and `st` come from rdflib (`$rdf.sym`), not from solid-logic.

For the pane object itself (`name`, `icon`, `label`, `render`, registration), see [Creating Panes](../panes/creating-panes.md).

## A pane that reads data

```javascript
// friends-pane.js: a pane that lists who a person knows
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')

const friendsPane = {
  name: 'cookbook-friends',
  icon: UI.icons.iconBase + 'noun_99101.svg',

  // Offer the pane only when the loaded data says the subject knows someone.
  label (subject, context) {
    return context.session.store.any(subject, FOAF('knows')) ? 'Friends' : null
  },

  render (subject, context) {
    const { dom } = context
    const store = context.session.store
    const div = dom.createElement('div')
    const list = div.appendChild(dom.createElement('ul'))

    // render() returns at once; fill the element in when the data has loaded.
    store.fetcher.load(subject.doc()).then(() => {
      for (const friend of store.each(subject, FOAF('knows'))) {
        const link = list.appendChild(dom.createElement('li')).appendChild(dom.createElement('a'))
        link.href = friend.uri
        link.textContent = UI.utils.label(friend)
      }
    }).catch(err => {
      div.textContent = `Could not load ${subject.doc().uri}: ${err.status ?? err.message}`
    })
    return div
  }
}

panes.register(friendsPane)   // or `export default friendsPane` in a pane module
```

Opened on the test profile `https://testingsolidos.solidcommunity.net/profile/card#me`, it lists the two people that profile knows.

## Common patterns

### Who is logged in

```javascript
// Who is logged in? A NamedNode (the WebID) or null.
const me = SolidLogic.authn.currentUser()

// Waits for a session that is being restored, then answers the same way.
const me2 = await SolidLogic.authn.checkUser()
```

Logging in and out, and reacting when it happens, are in [Authentication](./authentication.md).

### The user's profile and storage

```javascript
// Load the logged-in user's profile document, then read from it.
const me = await logic.profile.loadMe()          // the WebID; throws if nobody is logged in
const name = store.anyValue(me, FOAF('name')) ?? store.anyValue(me, VCARD('fn'))
const podRoot = logic.profile.getPodRoot(me)    // the profile's space:storage; throws if there is none
```

`logic`, `store`, `FOAF` and `VCARD` are set up as at the top of [Reading Data](./reading-data.md).

### Show another resource

```javascript
// Show another resource in the main view, as following a link would.
const outliner = panes.getOutliner(document)
const target = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')

// Run something after each navigation (the main view's own, or yours).
document.addEventListener('solid-panes:navigated', event => {
  console.log('now showing', event.detail.url)
})

// GotoSubject(subject, expand, pane, solo, referrer, table, options)
outliner.GotoSubject(target, true, undefined, true)

// To show it without changing the address bar:
outliner.GotoSubject(target, true, undefined, true, undefined, undefined, { preserveUrl: true })
```

Pass a pane object as the third argument to open the subject in that pane, for example `GotoSubject(target, true, friendsPane, true)`.

### Errors

- `fetcher.load()` rejects with an error that has `status`: the HTTP status, or `999` when no answer came back. See [Reading Data: when loading fails](./reading-data.md#when-loading-fails).
- `updater.update()` rejects with an `Error` whose message contains the server's answer. `fetcher.webOperation()` rejects with an error whose `response.status` is the HTTP status. See [Writing Data: when writing fails](./writing-data.md#when-writing-fails).

## See also

- [rdflib.js](../libraries/rdflib.md)
- [solid-logic](../libraries/solid-logic.md)
- [RDF Primer](../reference/rdf-primer.md)
