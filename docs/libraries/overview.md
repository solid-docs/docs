---
sidebar_position: 1
title: Libraries Overview
description: The libraries SolidOS 3.1 is built from, their versions, and how they fit together
---

# Libraries Overview

SolidOS is six npm packages. mashlib bundles the other five into one script for the browser.

| Library | Version in SolidOS 3.1 | What it does | Global in a mashlib page |
|---|---|---|---|
| [rdflib](/docs/libraries/rdflib) | 2.4.1 | RDF store, parsers and serializers, fetcher, update manager | `$rdf` |
| [solid-logic](/docs/libraries/solid-logic) | 6.2.0 | the shared store, login session, access control, resources, type indexes, profiles | `SolidLogic` |
| [pane-registry](/docs/libraries/pane-registry) | 5.1.1 | the list of panes and the types a pane is written against | through `panes` |
| [solid-ui](/docs/libraries/solid-ui) | 5.1.0 | web components (Lit) and the older widget library | `UI` |
| [solid-panes](/docs/libraries/solid-panes) | 5.1.0 | the outline, navigation, header and every built-in pane | `panes` |
| [mashlib](/docs/libraries/mashlib) | 3.1.0 | all of the above in one bundle, plus `runDataBrowser` | `mashlib` |

Use **mashlib** when you want the whole data browser in a page. Use the separate packages when you build an app or a pane with your own bundler.

## How they depend on each other

From the `dependencies` of each package's `package.json`:

```
mashlib 3.1.0
├── solid-panes 5.1.0
│   ├── profile-pane, folder-pane, contacts-pane, issue-pane,
│   │   meeting-pane, source-pane (4.1.0), chat-pane (4.0.0),
│   │   activitystreams-pane (2.1.0)
│   ├── solid-ui 5.1.0
│   ├── pane-registry 5.1.1
│   ├── solid-logic 6.2.0
│   └── rdflib 2.4.1
├── solid-ui 5.1.0
│   ├── pane-registry 5.1.1
│   ├── solid-logic 6.2.0
│   ├── rdflib 2.4.1
│   └── lit, @awesome.me/webawesome, CodeMirror
├── pane-registry 5.1.1
│   ├── solid-logic 6.2.0
│   └── rdflib 2.4.1
├── solid-logic 6.2.0
│   └── @uvdsl/solid-oidc-client-browser, @dokieli/web-access-control
└── rdflib 2.4.1
```

There must be one copy of solid-logic and one of rdflib on a page. The store and the login session live in solid-logic; a second copy has its own empty store and no login. mashlib pins every SolidOS package to one version for this reason.

## Quick reference

These lines run on any page that has loaded mashlib, where the libraries are globals. With a bundler, import the same objects by name, as mashlib itself does:

```javascript
import * as $rdf from 'rdflib'
import * as SolidLogic from 'solid-logic'
import * as UI from 'solid-ui'
import * as panes from 'solid-panes'
```

### rdflib

```javascript
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')
const store = $rdf.graph()
const fetcher = new $rdf.Fetcher(store)
await fetcher.load('https://testingsolidos.solidcommunity.net/profile/card')

const me = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')
store.any(me, FOAF('name'))?.value   // 'Testing SolidOS'
```

### solid-logic

```javascript
const { store, authn, solidLogicSingleton } = SolidLogic

await store.fetcher.load(me.doc())        // the store every pane reads
authn.currentUser()                       // NamedNode of the logged-in WebID, or null
solidLogicSingleton.resource.isContainer($rdf.sym('https://testingsolidos.solidcommunity.net/public/'))   // true
SolidLogic.getSuggestedIssuers()          // identity providers the login dialog offers
```

### solid-ui

```html
<solid-ui-provider>
  <solid-ui-account></solid-ui-account>   <!-- Log In / Sign Up, then the account menu -->
</solid-ui-provider>
```

```javascript
// The older widgets are still there: button(dom, iconURI, text, handler, options)
const button = UI.widgets.button(document, undefined, 'Click me', () => alert('clicked'))
```

### solid-panes and pane-registry

```javascript
panes.list.length            // 36 built-in panes
panes.byName('folder')       // a pane by name
panes.register(myPane)       // add a pane, offered after the built-in ones

const outliner = panes.getOutliner(document)
outliner.GotoSubject(me, true, undefined, true, undefined, undefined, { preserveUrl: true })
```

### mashlib

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mash.css">
<script src="https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mashlib.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => panes.runDataBrowser())
</script>
```

## Installation

```bash
npm install mashlib@3.1.0                 # everything, as one bundle
npm install rdflib@2.4.1 solid-logic@6.2.0 solid-ui@5.1.0 solid-panes@5.1.0 pane-registry@5.1.1
```

solid-ui also publishes each web component on its own (`solid-ui/components/<name>`) and its theme as `solid-ui/theme.css`; see [solid-ui](/docs/libraries/solid-ui).

To work on all of them at once, clone the [SolidOS monorepo](https://github.com/SolidOS/solidos).

## TypeScript

rdflib, solid-logic, solid-ui, solid-panes and pane-registry ship type definitions. The pane types come from pane-registry:

```typescript
import type { NamedNode } from 'rdflib'
import type { PaneDefinition, DataBrowserContext, RenderEnvironment } from 'pane-registry'
```

## See also

- [mashlib](/docs/libraries/mashlib)
- [Embedding mashlib](/docs/guides/embedding-mashlib)
- [Migrating to 3.1](/docs/guides/migrating-to-3.1)
