---
sidebar_position: 1
title: Architecture Overview
description: How the SolidOS 3.1 packages fit together, from rdflib to mashlib
---

# Architecture Overview

SolidOS 3.1 is six packages stacked on each other, plus the pane packages. Each layer uses the ones below it.

```
┌────────────────────────────────────────────────────────────────────┐
│ mashlib 3.1.0        page globals, layout and theme, runDataBrowser │
├────────────────────────────────────────────────────────────────────┤
│ solid-panes 5.1.0    outline, header, navigation, built-in panes    │
│   + folder-pane, profile-pane, contacts-pane, chat-pane, ...        │
├──────────────────────────────────┬─────────────────────────────────┤
│ solid-ui 5.1.0                   │ pane-registry 5.1.1             │
│ web components (Lit), widgets    │ list of panes, pane types       │
├──────────────────────────────────┴─────────────────────────────────┤
│ solid-logic 6.2.0    shared store, login session, ACL, profiles     │
├────────────────────────────────────────────────────────────────────┤
│ rdflib 2.4.1         RDF store, parsers, fetcher, updater           │
└────────────────────────────────────────────────────────────────────┘
```

The snippets below use the page globals that mashlib sets (`$rdf`, `SolidLogic`, `UI`, `panes`), so they run in the browser console in the [SolidOS Browser](https://solidos.org/docs/browser/).

## rdflib

The RDF layer:

- **Store**: an in-memory graph of statements (`IndexedFormula`)
- **Fetcher** (`store.fetcher`): loads a document over HTTP and parses it into the store
- **UpdateManager** (`store.updater`): writes changes back with `PATCH`, or replaces a document with `PUT`
- **Parsers and serializers**: Turtle, N3, JSON-LD, RDF/XML and others

SolidOS does not create its own stores; it uses the one from solid-logic.

## solid-logic

Shared state and Solid-specific logic on top of rdflib:

- **`store`**: the one store every part of SolidOS uses
- **`authn` and `authSession`**: the login session (Solid-OIDC through `@uvdsl/solid-oidc-client-browser`), `currentUser()` and `checkUser()`
- **`solidLogicSingleton`**: the store plus `acl`, `resource`, `profile`, `inbox`, `typeIndex`, `chat` and `directory` logic

```javascript
const { store, resource } = SolidLogic.solidLogicSingleton
store === SolidLogic.store                  // true
SolidLogic.authn.currentUser()              // the logged-in WebID, or null
```

Details: [solid-logic](../libraries/solid-logic.md).

## pane-registry

The list of registered panes, and the TypeScript types that describe a pane (`PaneDefinition`), the context it is rendered with (`DataBrowserContext`) and the render environment (`RenderEnvironment`). solid-panes re-exports its functions:

```javascript
panes.register(myPane)                      // add a pane at the end of the list
panes.byName('folder')                      // a pane by name, or null
panes.list.length                           // 36 built-in panes in mashlib 3.1.0
```

## solid-ui

The user interface building blocks:

- **Web components**, written with [Lit](https://lit.dev/): `<solid-ui-provider>` (shared context for the others), `<solid-ui-account>`, `<solid-ui-login-button>`, the login modal, dialogs, menus, forms (`<solid-ui-rdf-form>`), the access-control modal, and the file explorer (`<solid-ui-file-explorer-provider>`, `<solid-ui-file-explorer-header>`). A page or pane imports one as `solid-ui/components/<name>`.
- **The older widget library**, still used by many panes: `UI.widgets`, `UI.login`, `UI.acl`, `UI.aclControl`, `UI.tabs`, `UI.table`, `UI.style`, `UI.icons`.

```javascript
const button = UI.widgets.button(document, undefined, 'Click me', () => console.log('clicked'))
document.body.appendChild(button)
```

`button(dom, iconURI, text, handler, options)` takes an icon URL or `undefined` as its second argument. Details: [solid-ui](../libraries/solid-ui.md).

## solid-panes

The data browser itself:

- **The outline manager** (`panes.getOutliner(document)`): shows a resource. Its `GotoSubject` finds the panes whose `label` accepts the subject, picks one, and renders it inside a `<solid-ui-file-explorer-provider>` in `#OutlineView`, with the file-explorer header and its **⋮** pane menu above it.
- **The main page** (`panes.initMainPage`): the header with the account menu, the navigation bar, and the profile heading at the top of a pod (`initializeProfileHeading`, `refreshProfileHeading`).
- **Navigation**: keeps the browser address, history and back/forward in step with what is shown, and fires `solid-panes:navigated` on the document after each view. See [Navigation](../panes/navigation.md).
- **The built-in panes**, registered when solid-panes is loaded. The earliest registered have priority.

```javascript
document.addEventListener('solid-panes:navigated', e => console.log(e.detail.url))

const outliner = panes.getOutliner(document)
outliner.GotoSubject($rdf.sym('https://testingsolidos.solidcommunity.net/profile/card'),
  true, undefined, true, undefined, undefined, { preserveUrl: true })
```

Details: [solid-panes](../libraries/solid-panes.md).

## mashlib

The bundle that puts the rest on a page:

- sets the globals `panes`, `UI`, `SolidLogic`, `$rdf` and `mashlib` (with `mashlib.versionInfo`)
- ships its stylesheet as `mash.css`, and defines `<solid-ui-provider>`
- keeps the **layout** (`data-layout` on `<html>`, desktop or mobile) and the **theme** (`data-theme="dark"` or none), stored in `localStorage` as `mashlib-layout` and `mashlib-theme`
- adds `panes.runDataBrowser(uri?)`, which starts the full data browser

Its `databrowser.html` is the page a pod server sends:

```html
<body id="PageBody" data-app-shell="databrowser">
  <solid-ui-provider>
    <div class="app-main">
      <div class="app-shell">
        <main id="MainContent" class="app-view">
          <div id="OutlineView" class="outline-view"></div>
        </main>
      </div>
    </div>
  </solid-ui-provider>
</body>
```

(trimmed: the full file also has a skip link and a script that calls `panes.runDataBrowser()` on `DOMContentLoaded`.) Details: [mashlib](../libraries/mashlib.md) and [Embedding mashlib](../guides/embedding-mashlib.md).

## Starting up

What `panes.runDataBrowser(uri)` does in 3.1:

1. `SolidLogic.authn.checkUser()` restores a login session, if there is one.
2. `panes.initMainPage(store, uri, environment)` creates `#MainContent` if the page lacks it, sets up the profile heading and navigation, and shows `uri` (or the page's own address when `uri` is not given). The outline manager picks a pane for it and renders it.
3. It then builds the header and the navigation bar.

## The render environment

mashlib passes the current layout and theme to panes as `context.environment`:

```javascript
{
  layout: 'desktop',            // or 'mobile' (768 px wide or less, unless the user chose)
  layoutPreference: 'auto',     // 'auto', 'desktop' or 'mobile'
  inputMode: 'pointer',         // or 'touch'
  theme: 'light',               // or 'dark'
  viewport: { width: 1300, height: 900 }
}
```

When the layout or theme changes, mashlib fires `mashlib:layoutchange` or `mashlib:themechange` on `window` and updates the environment; on the main page started by `runDataBrowser` it also redraws the view. On a page that loads mashlib without calling `runDataBrowser`, `context.environment` can be missing, so a pane must treat it as optional.

## Pane packages

The larger panes are separate packages that solid-panes imports and registers: folder-pane, profile-pane, contacts-pane, issue-pane, meeting-pane and source-pane (4.1.0), chat-pane (4.0.0) and activitystreams-pane (2.1.0). Panes can also be loaded at run time, from a URL, without changing any package. See [Dynamic Panes](../panes/dynamic-panes.md).

## Where it runs

| Setup | What serves the page | Read more |
|-------|----------------------|-----------|
| The SolidOS Browser | SolidOS 3.1 as plain ES modules with an address bar | [No-build SolidOS](../guides/mashlib-com.md) |
| A pod server | the server answers a browser's request for a resource with `databrowser.html` | [Running SolidOS on JSS](../guides/running-on-jss.md) |
| Your own page | a page that loads mashlib and points it at a resource | [Embedding mashlib](../guides/embedding-mashlib.md) |
| Desktop | [Data Kitchen](https://github.com/SolidOS/data-kitchen), mashlib in Electron | |

In every case SolidOS runs in the browser and talks to pods directly over HTTP. A pod on another site must allow cross-origin requests, which Solid servers do.

## See also

- [Data Flow](./data-flow.md): how data is loaded, changed and kept up to date
- [Core Concepts](../getting-started/core-concepts.md): pods, panes and login
- [Pane Anatomy](../panes/pane-anatomy.md): the pane contract
- [SolidOS on GitHub](https://github.com/SolidOS)
