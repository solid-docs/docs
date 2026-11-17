---
sidebar_position: 5
title: solid-panes
description: The outline, main page, navigation and built-in panes of SolidOS 3.1
---

# solid-panes

solid-panes is the part of SolidOS that shows things. It holds the outline manager that renders a subject with a pane, the main page (header, navbar and profile heading), the navigation rules, and the built-in panes, which it registers when it is first imported. SolidOS 3.1 ships solid-panes **5.1.0**, with pane-registry 5.1.1, solid-ui 5.1.0, solid-logic 6.2.0 and rdflib 2.4.1.

The registry itself (`register`, `list`, `byName`) lives in [pane-registry](./pane-registry.md); solid-panes re-exports it. What a pane is, is on [The Pane Contract](../panes/pane-anatomy.md).

- Source: https://github.com/SolidOS/solid-panes
- Package: `solid-panes` on npm

## Using it

Most code does not install solid-panes. On a page running mashlib 3.1 it is already loaded, as `window.panes`, with mashlib's `runDataBrowser` added:

```javascript
panes.register(myPane)                  // add a pane
panes.byName('folder')                  // a registered pane, or null
panes.getOutliner(document).GotoSubject($rdf.sym(url), true, undefined, true)   // show something
```

To build on it from npm:

```bash
npm install solid-panes
```

```javascript
import { register, getOutliner } from 'solid-panes'
```

Importing it registers the built-in panes and creates the outline manager for `window.document`. It also sets `window.panes` to `{ getOutliner }`; mashlib then replaces that with the whole module.

## Exports

| Export | What it is |
|---|---|
| `register(pane, requireQueryButton?)` | Adds a pane to the registry, after those already there. From pane-registry. |
| `byName(name)` | The first registered pane with that name, or `null`. From pane-registry. |
| `list` | The registered panes, in order. From pane-registry. |
| `paneForIcon` | Registered panes indexed by icon URL. From pane-registry. |
| `paneForPredicate` | `{ pred, code }` indexed by predicate URI, from panes' `predicates`. From pane-registry. |
| `getOutliner(dom, environment?)` | The outline manager for a document, created on first call. With `environment`, also sets the render environment. |
| `OutlineManager` | The outline manager class. Use `getOutliner` rather than constructing one. |
| `updateEnvironment(outliner, environment)` | Sets `context.environment` (a `RenderEnvironment`) for the panes the outliner renders. |
| `refreshUI(outliner)` | Renders the view on show again if the render environment has changed since the last render. mashlib calls it on layout and theme changes. |
| `initMainPage(store, uri?, environment?)` | Starts the full data browser page. See below. |
| `isHandlingBrowserNavigation()` | `true` once the main page handles Back, Forward and Enter itself. |
| `initializeProfileHeading(getPageUrl?)` | Sets up the profile heading above the view. Returns a promise. |
| `refreshProfileHeading(force?)` | Updates the profile heading for what is on show. Returns a promise. |
| `UI` | solid-ui, as imported by solid-panes. |
| `versionInfo` | Build details of this solid-panes. |

## The outline manager

`getOutliner(document)` returns the one outline manager for that document. Panes reach it as `context.getOutliner(context.dom)`. Its `context` property is the `DataBrowserContext` every pane receives (`dom`, `getOutliner`, `session.store`, `session.logic`, `session.paneRegistry`, `environment`), and its `GotoSubject` method shows a subject. See [Navigation](../panes/navigation.md).

It renders into `#OutlineView`. If the page has none, it creates one inside `#MainContent`, or at the end of `<body>` if there is no `#MainContent`.

## The main page

`initMainPage(store, uri, environment)` is what mashlib's `panes.runDataBrowser(uri?)` calls once the login state is known. It:

1. creates `<main id="MainContent">` if the page has none;
2. sets up the profile heading;
3. shows `uri`, or the page URL if there is none, in the pane the URL calls for;
4. takes over Back, Forward and Enter (see [Navigation](../panes/navigation.md#back-forward-and-reload));
5. shows the same thing again after login, logout and session changes;
6. adds the header (account menu) and the navbar.

Pages that show subjects themselves, such as a browse page with an address bar, do not call `initMainPage`. They call `getOutliner(document).GotoSubject(...)` with `preserveUrl`, and set up the profile heading with:

```javascript
const ready = panes.initializeProfileHeading(() => currentSubjectUrl() || location.href)
// after each GotoSubject:
await panes.refreshProfileHeading(true)
```

`initializeProfileHeading` takes a function that returns the URL being shown, for pages whose own URL is not the subject. The heading also refreshes itself on `solid-panes:navigated` and on login and logout.

## Built-in panes

solid-panes registers 36 panes, in the order listed on [Panes overview](../panes/overview.md#the-panes-solidos-31-registers). Some are in solid-panes itself (`src/`); folder, contacts, profile, chat, meeting, issue, source and activitystreams panes come from their own packages, which solid-panes depends on. Registration is in [`src/registerPanes.js`](https://github.com/SolidOS/solid-panes/blob/main/src/registerPanes.js).

To add a pane, you do not need to change solid-panes: register it at run time. See [Dynamic Panes](../panes/dynamic-panes.md).

## Developing solid-panes

The repository's scripts include `start` (a Vite development server), `build`, `watch`, `test`, `lint` and `typecheck`:

```bash
git clone https://github.com/SolidOS/solid-panes
cd solid-panes
npm install
npm start
```

## See also

- [The Pane Contract](../panes/pane-anatomy.md)
- [Navigation](../panes/navigation.md)
- [Dynamic Panes](../panes/dynamic-panes.md)
- [mashlib](./mashlib.md): the bundle that puts solid-panes on a page
- [pane-registry](./pane-registry.md)
