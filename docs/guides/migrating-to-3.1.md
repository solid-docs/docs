---
sidebar_position: 1
title: Migrating to SolidOS 3.1
description: What changed from mashlib 2.x to 3.1, and what a site or pane author has to change
---

# Migrating to SolidOS 3.1

This page is for you if you host a page that loads mashlib 2.x, or you maintain a pane that ran inside it. It lists what changed between mashlib 2.1 and mashlib 3.1.0, and what you have to do about each change.

## Versions

| Package | mashlib 2.1.3 | mashlib 3.1.0 |
|---|---|---|
| mashlib | 2.1.3 | 3.1.0 (16 Nov 2026) |
| solid-panes | ^4.2.3 | 5.1.0 |
| solid-ui | ^3.0.4 | 5.1.0 |
| solid-logic | ^4.0.3 | 6.2.0 |
| pane-registry | through solid-panes | 5.1.1, now a direct dependency |
| rdflib | ^2.3.5 | 2.4.1 |

3.0.0 came out on 29 Sep 2026 and 3.1.0 on 16 Nov 2026. Their release notes: [v3.0.0](https://github.com/SolidOS/mashlib/releases/tag/v3.0.0), [v3.1.0](https://github.com/SolidOS/mashlib/releases/tag/v3.1.0). 3.0 brought the new design (web components, the new header, the new layout); 3.1 reworked navigation and moved the outline from a table to a `<div>`.

To check which version a page is running, open the browser console:

```javascript
mashlib.versionInfo.npmInfo.mashlib   // '3.1.0'
```

## What has not changed

- **The globals.** mashlib still sets `window.panes` (solid-panes), `window.UI` (solid-ui), `window.SolidLogic` (solid-logic), `window.$rdf` (rdflib) and `window.mashlib` (`{ versionInfo }`).
- **The entry point.** `panes.runDataBrowser(uri?)` takes one optional argument, the resource to show, and defaults to the page's own URL. It had the same signature in 2.x.
- **The registry calls.** `panes.register`, `panes.byName`, `panes.list` and `panes.getOutliner(document)` are still there.
- **The pane contract.** A pane is still `{ name, icon, label(subject, context), render(subject, context), ... }`, and `context` still has `dom`, `getOutliner` and `session` (`store`, `logic`, `paneRegistry`). 3.1 adds one optional field, `context.environment`. See [Dynamic panes](/docs/panes/dynamic-panes) for the contract.

## The page markup

The data browser now draws into different elements. This is the change most likely to break a page you wrote for 2.x.

| | mashlib 2.x `databrowser.html` | mashlib 3.1 `databrowser.html` |
|---|---|---|
| Wrapper | none | `<solid-ui-provider>` around the page |
| Main area | `<main id="mainContent">` | `<main id="MainContent">` |
| Outline | `<table id="outline">` inside `<div class="TabulatorOutline">` | `<div id="OutlineView" class="outline-view">` |
| Header | `<header id="PageHeader">` | created by solid-panes (`solid-panes-header`) |
| Dashboard | `<div id="GlobalDashboard">` | removed |
| Footer | `<footer id="PageFooter">` | removed |

3.1 looks only for `#OutlineView`. It ignores `#outline`. If there is no `#OutlineView`, it creates one inside `#MainContent`, or at the end of `<body>` if there is no `#MainContent` either. A 2.x page therefore still shows data, but outside the box you made for it.

**What to change:** wrap the page in `<solid-ui-provider>`, and replace the outline table with:

```html
<solid-ui-provider>
  <main id="MainContent">
    <div id="OutlineView" class="outline-view" aria-label="Resource browser"></div>
  </main>
</solid-ui-provider>
```

[Embedding mashlib](/docs/guides/embedding-mashlib) walks through a complete 3.1 page.

## Login

**The client changed.** In 2.x, `SolidLogic.authSession` was a session from Inrupt's client library: it had `handleIncomingRedirect`, `fetch` and `logout`. In 3.1 it comes from [`@uvdsl/solid-oidc-client-browser`](https://github.com/uvdsl/solid-oidc-client-browser), a dependency of solid-logic 6. The same object is also `SolidLogic.authn.authSession`. Code that called Inrupt-specific methods has to change; see [Authentication](/docs/cookbook/authentication).

**The events kept their shape.** `authSession.events.on(name, handler)` still works. mashlib 3.1's own browse page listens for `login`, `sessionRestore`, `logout`, `sessionChange` and `identityReplaced`, and shows the resource again on each.

**The login widget changed.** The 2.x browse page built its login button with `UI.login.loginStatusBox(document, null, {})`. That function still exists, but the 3.1 pages use a web component instead, placed inside `<solid-ui-provider>`:

```html
<solid-ui-account></solid-ui-account>
```

It shows Log In and Sign Up, opens the login dialog, and after login shows the account menu.

`SolidLogic.authn.currentUser()` and `checkUser()` are unchanged.

## Navigation

`GotoSubject` has a seventh argument, an options object:

```javascript
const outliner = panes.getOutliner(document)
outliner.GotoSubject($rdf.sym(uri), true, undefined, true, undefined, undefined, { preserveUrl: true })
```

| Option | Meaning |
|---|---|
| `preserveUrl: true` | Keep the page's own URL. Without it, GotoSubject writes the resource's URL into the address bar when it is on the same origin as the page. |
| `folderView` | How a folder is shown: `'explorer'`, `'storage'` or `'container'`. |
| `source` | `'accountMenu'` for views opened from the account menu; the default is `'default'`. |

After a solo `GotoSubject`, solid-panes dispatches a `solid-panes:navigated` event on `document`.

**The profile heading.** The name and picture above a person's pages are new in 3.x. A page that renders subjects itself sets them up with `panes.initializeProfileHeading(getPageUrl)` and updates them with `panes.refreshProfileHeading(force)` after each navigation. `runDataBrowser()` does this for you.

**Back and forward.** mashlib 3.1 still sets `window.onpopstate`. On a page that does not call `runDataBrowser()`, it shows the page's own URL when the user goes back. A page that keeps the shown resource in `?uri=` should replace that handler; [Embedding mashlib](/docs/guides/embedding-mashlib#back-and-forward) shows how.

[Navigation](/docs/panes/navigation) covers the navigation API in full.

## New on `panes`

| Function | What it does |
|---|---|
| `initializeProfileHeading(getPageUrl?)` | Sets up the profile heading; returns a promise. |
| `refreshProfileHeading(force?)` | Redraws it for the resource on show. |
| `refreshUI(outliner)` | Draws the current view again after the environment changed. |
| `updateEnvironment(outliner, environment)` | Puts a new render environment on the outliner's context. |
| `isHandlingBrowserNavigation()` | True while the main page is handling back and forward itself. |

## Built-in panes

2.1.3 registered 38 panes; 3.1.0 registers 36. `dashboard` and `editProfile` are no longer registered. The folder, contacts, profile and source panes have new interfaces. The [pane pages](/docs/panes/overview) describe each one.

## Theme and layout

3.x has a dark theme and a mobile layout. mashlib sets them on `<html>`:

| | Attribute | Saved in `localStorage` | Event on `window` |
|---|---|---|---|
| Theme | `data-theme="dark"` (absent when light) | `mashlib-theme` | `mashlib:themechange` |
| Layout | `data-layout="desktop"` or `"mobile"` | `mashlib-layout` | `mashlib:layoutchange` |

With nothing saved, the theme follows the system's `prefers-color-scheme`, and the layout is `mobile` at 768 px wide or less. Panes receive the same values in `context.environment`: `layout`, `layoutPreference`, `inputMode`, `theme` and `viewport`.

**What to change:** if your page must stay light, save the choice before mashlib loads:

```html
<script>
  try { if (!localStorage.getItem('mashlib-theme')) localStorage.setItem('mashlib-theme', 'light') } catch (e) {}
</script>
```

The CSS variables of 2.x docs (`--solid-primary-color` and similar) never existed. solid-ui 5 uses `--solid-ui-color-*` tokens; see [Theming](/docs/reference/theming).

## Files the bundle fetches from the site root

Both versions load parts of themselves on demand, from the root of the site that serves the page (webpack `publicPath` is `/`). The names changed:

| mashlib 2.1.3 | mashlib 3.1.0 |
|---|---|
| `/841.mashlib.min.js` | `/841.js` (the JSON-LD parser), `/410.js` (the source editor) |
| | `/5fb2ef310e691f59285b.js` (the login client's worker; `/a9c30b64ceaae48b72f0.js` with the unminified `mashlib.js`) |

If you serve `mashlib.min.js` from your own site root, copy these files beside it. If you load it from a CDN or from a sub-folder, the browser asks your site's root for them. When the worker file is missing, the login check takes about 5 seconds longer, and everything that waits for it (the profile heading, for one) waits too. When `841.js` is missing, parsing JSON-LD fails with `ChunkLoadError`. [Embedding mashlib](/docs/guides/embedding-mashlib#files-at-the-site-root) shows a fix.

## Bundle size

| | 2.1.3 | 3.1.0 |
|---|---|---|
| `mashlib.min.js` | 2,244 KB (580 KB gzip) | 4,209 KB (1,169 KB gzip) |
| `mash.css` | 70 KB (14 KB gzip) | 122 KB (22 KB gzip) |

## solid-logic 4 to 6 and solid-ui 3 to 5

These two libraries changed the most. In short:

- **solid-logic 6** adds `solidLogicSingleton.resource` (containers, uploads, deleting) and `solidLogicSingleton.directory`, an access-control planning API (`ACCESS_ROLES` and the `acl` logic), and top-level `getSuggestedIssuers`, `performServerSideLogout` and `reloadOnIdentityReplaced`. See [solid-logic](/docs/libraries/solid-logic).
- **solid-ui 5** adds Lit web components (`<solid-ui-provider>`, `<solid-ui-account>`, `<solid-ui-login-button>` and more), importable one by one as `solid-ui/components/<name>`, and a theme stylesheet, `solid-ui/theme.css`. The older namespaces (`UI.widgets`, `UI.login`, `UI.acl`, `UI.tabs`, `UI.style` and others) are still exported. See [solid-ui](/docs/libraries/solid-ui).

## Checklist

**For a page that hosts mashlib:**

1. Pin the version: `https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mashlib.min.js` and `.../mash.css`.
2. Wrap the page in `<solid-ui-provider>` and give it `#MainContent` and `#OutlineView`.
3. Replace `UI.login.loginStatusBox` with `<solid-ui-account>`.
4. Pass `{ preserveUrl: true }` to `GotoSubject` if the page keeps its own URL.
5. Make the three root files reachable (see above).
6. Remove calls to Inrupt-specific `authSession` methods.

**For a pane:**

1. Check that `render(subject, context)` reads the store from `context.session.store`, not from a second copy of solid-logic.
2. If the pane has its own colours, read `context.environment.theme` or use the `--solid-ui-color-*` tokens so it works in the dark theme.
3. If the pane is wide, read `context.environment.layout` and draw a narrow version for `mobile`.

## See also

- [Embedding mashlib](/docs/guides/embedding-mashlib)
- [mashlib](/docs/libraries/mashlib)
- [mashlib.com and the no-build data browser](/docs/guides/mashlib-com)
