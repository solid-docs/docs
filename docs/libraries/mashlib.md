---
sidebar_position: 6
title: mashlib
description: The SolidOS data browser in one script - versions, files, globals, entry points, events and building it
---

# mashlib

mashlib is the SolidOS data browser as one webpack bundle. It contains rdflib, solid-logic, solid-ui, pane-registry and solid-panes with all the built-in panes, and puts them on the page as globals. A Solid server sends a page that loads it in place of RDF data, and the page then shows that data and lets the user edit it.

This page is the reference. For walk-throughs, see:

- [Embedding mashlib](/docs/guides/embedding-mashlib): your own page with the data browser in it
- [Migrating to 3.1](/docs/guides/migrating-to-3.1): what changed since 2.x
- [mashlib.com and the no-build data browser](/docs/guides/mashlib-com)
- [Running SolidOS on JSS](/docs/guides/running-on-jss)

Try it: the [Data island](https://solidos.org/docs/data-island/) and [Custom pane](https://solidos.org/docs/pane-demo/) demos on this site load the 3.1.0 bundle from jsDelivr. The [SolidOS Browser](https://solidos.org/docs/browser/) runs SolidOS 3.1 as ES modules, so a link can add a pane.

## Version 3.1.0

Released 16 Nov 2026 ([release notes](https://github.com/SolidOS/mashlib/releases/tag/v3.1.0)). It pins:

| Package | Version | Global |
|---|---|---|
| rdflib | 2.4.1 | `$rdf` |
| solid-logic | 6.2.0 | `SolidLogic` |
| solid-ui | 5.1.0 | `UI` |
| pane-registry | 5.1.1 | (through `panes`) |
| solid-panes | 5.1.0 | `panes` |

The source is [SolidOS/mashlib](https://github.com/SolidOS/mashlib). The package is MIT licensed.

## Install

From a CDN, pinned:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mash.css">
<script src="https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mashlib.min.js"></script>
```

From npm:

```bash
npm install mashlib@3.1.0
```

The files you serve are in `node_modules/mashlib/dist/`.

## Files in `dist/`

| File | What it is |
|---|---|
| `mashlib.min.js` | the bundle, minified: 4,209 KB, 1,169 KB gzip |
| `mashlib.js` | the bundle, not minified |
| `mash.css` | the stylesheet: 122 KB, 22 KB gzip |
| `databrowser.html` | the page a Solid server sends for an RDF resource; loads `/mashlib.min.js` and `/mash.css` and calls `panes.runDataBrowser()` |
| `browse.html` | a stand-alone page with an address bar; loads `mashlib.js` and `mash.css` from beside itself |
| `841.js` | loaded on demand: the JSON-LD parser |
| `410.js` | loaded on demand: the source editor |
| `5fb2ef310e691f59285b.js` | the login client's worker, used by `mashlib.min.js` |
| `a9c30b64ceaae48b72f0.js` | the same worker, used by `mashlib.js` |

The bundle asks for the last four at the **root of the site** that serves the page (`/841.js` and so on), wherever the script itself came from. Serve them there, or see [Files at the site root](/docs/guides/embedding-mashlib#files-at-the-site-root).

## Globals

After `mashlib.min.js` has run:

| Global | Contents |
|---|---|
| `panes` | solid-panes: `getOutliner`, `register`, `byName`, `list`, `paneForIcon`, `paneForPredicate`, `initMainPage`, `initializeProfileHeading`, `refreshProfileHeading`, `refreshUI`, `updateEnvironment`, `isHandlingBrowserNavigation`, `OutlineManager`, `versionInfo`, plus `runDataBrowser` |
| `UI` | solid-ui: `widgets`, `login`, `acl`, `aclControl`, `tabs`, `table`, `style`, `icons`, `ns`, `utils`, the web component classes and more |
| `SolidLogic` | solid-logic: `store`, `authn`, `authSession`, `solidLogicSingleton`, `getSuggestedIssuers`, `performServerSideLogout` and more |
| `$rdf` | rdflib |
| `mashlib` | `{ versionInfo }` |

```javascript
mashlib.versionInfo.npmInfo.mashlib            // '3.1.0'
mashlib.versionInfo.commit                     // the mashlib commit it was built from
SolidLogic.store === SolidLogic.solidLogicSingleton.store   // true
SolidLogic.authn.currentUser()                 // NamedNode of the logged-in WebID, or null
```

The library pages describe each one: [solid-panes](/docs/libraries/solid-panes), [solid-ui](/docs/libraries/solid-ui), [solid-logic](/docs/libraries/solid-logic), [rdflib](/docs/libraries/rdflib), [pane-registry](/docs/libraries/pane-registry).

## Entry points

### `panes.runDataBrowser(uri?)`

Starts the full data browser on the page: checks the login, builds the header, the profile heading and the navigation bar, and shows `uri`, or the page's own URL when `uri` is left out. It also sets `$rdf.Fetcher.crossSiteProxyTemplate` to `<page origin>/xss/?uri={uri}`.

It is meant for the page a server sends for a resource, where the page's URL is the resource. The profile heading and navigation bar follow the page's URL even when you pass `uri`.

```html
<script>
  document.addEventListener('DOMContentLoaded', () => panes.runDataBrowser())
</script>
```

### `panes.getOutliner(document).GotoSubject(...)`

Draws one resource into `#OutlineView` without the rest of the main page. Pages that choose the resource themselves, like `browse.html`, use this:

```javascript
const outliner = panes.getOutliner(document)
outliner.GotoSubject($rdf.sym(uri), true, undefined, true, undefined, undefined, { preserveUrl: true })
```

The arguments are `(subject, expand, pane, solo, referrer, table, options)`; [Embedding mashlib](/docs/guides/embedding-mashlib#the-browse-page-line-by-line) explains each one.

## Page markup

mashlib 3.1 draws into `#OutlineView`. The page `databrowser.html` uses:

```html
<body id="PageBody" data-app-shell="databrowser">
  <solid-ui-provider>
    <a href="#MainContent" class="skip-link">Skip to main content</a>
    <div class="app-main" tabindex="-1" aria-live="polite">
      <div class="app-shell">
        <main id="MainContent" class="app-view">
          <div id="OutlineView" class="outline-view" aria-label="Resource browser"></div>
        </main>
      </div>
    </div>
  </solid-ui-provider>
</body>
```

If `#OutlineView` is missing, mashlib creates it inside `#MainContent`, or at the end of `<body>`. The 2.x elements `#outline`, `#GlobalDashboard`, `#PageHeader` and `#PageFooter` are no longer used.

## Events

| Event | Dispatched on | When |
|---|---|---|
| `solid-panes:navigated` | `document` | after a solo `GotoSubject` has drawn a resource and written its history entry; `event.detail` has `url` and `state` |
| `mashlib:themechange` | `window` | the theme changed; `event.detail.theme` is `'light'` or `'dark'` |
| `mashlib:layoutchange` | `window` | the layout changed; `event.detail` has `layout`, `preference`, `inputMode` and `viewport` |

Login events come from the session object:

```javascript
const authSession = SolidLogic.authn.authSession
for (const name of ['login', 'sessionRestore', 'logout', 'sessionChange', 'identityReplaced']) {
  authSession.events.on(name, () => console.log('session event:', name))
}
```

## Theme and layout

mashlib sets three attributes on `<html>` and keeps them up to date:

| Attribute | Values | Saved in `localStorage` |
|---|---|---|
| `data-theme` | `dark`, or absent for light | `mashlib-theme` (`light` or `dark`) |
| `data-layout` | `desktop` or `mobile` (768 px wide or less) | `mashlib-layout` (`desktop` or `mobile`; absent means automatic) |
| `data-input-mode` | `touch` or `pointer` | not saved |

With no saved theme, mashlib follows the system's `prefers-color-scheme`. Panes receive the same values as `context.environment`. Colours and fonts come from solid-ui's `--solid-ui-*` tokens; see [Theming](/docs/reference/theming).

## Adding panes

```javascript
panes.register(myPane)
```

A pane is an object with `name`, `icon`, `label(subject, context)` and `render(subject, context)`. Registered panes are offered after the built-in ones. You can also load panes from URLs at run time, from a JSS server's `--panes` list, or with `?pane=` in the SolidOS Browser. See [Dynamic panes](/docs/panes/dynamic-panes) and the [Custom pane demo](https://solidos.org/docs/pane-demo/).

## Build from source

```bash
git clone https://github.com/SolidOS/mashlib.git
cd mashlib
npm install
npm run build      # writes dist/
npm start          # webpack-dev-server on port 8080
```

The repository's `.nvmrc` names Node 22.22.0.

By default the build takes solid-ui and solid-panes from `node_modules`. To build against sibling checkouts of the SolidOS repositories, use the workspace scripts: `npm run build:workspace`, `npm run watch:workspace` and `npm run start:workspace`. To work on all of SolidOS at once, see the [SolidOS monorepo](https://github.com/SolidOS/solidos).

## Where it runs

- **Any static host**, as a browse page: [Embedding mashlib](/docs/guides/embedding-mashlib), [SolidOS Browser](https://solidos.org/docs/browser/).
- **JavaScript Solid Server** serves a data browser page for every resource: [Running SolidOS on JSS](/docs/guides/running-on-jss).
- **Node Solid Server** serves mashlib's `databrowser.html` for RDF resources. Its latest release, 6.0.0, depends on mashlib `^2.0.0`, so it ships 2.x.
- **Data Kitchen**, a desktop app: [SolidOS/data-kitchen](https://github.com/SolidOS/data-kitchen).

[Deployment](/docs/reference/deployment) compares the options.

## Troubleshooting

**`panes is not defined`.** Your script ran before `mashlib.min.js`. Load mashlib first, and run your code on `DOMContentLoaded`.

**The view appears below the page, outside your layout.** The page has no `#OutlineView`. Add `<div id="OutlineView" class="outline-view">` where the view should go.

**The login takes 5 seconds longer, or JSON-LD fails with `ChunkLoadError`.** The files at the site root are missing; see [Files at the site root](/docs/guides/embedding-mashlib#files-at-the-site-root).

**The page turns dark.** mashlib follows the system theme. Save `light` under `mashlib-theme` in `localStorage` before mashlib loads.

**A thick black border appears around part of your page.** mash.css styles some plain class names, such as `.container`. Rename your own classes.

## See also

- [SolidOS/mashlib on GitHub](https://github.com/SolidOS/mashlib)
- [Libraries overview](/docs/libraries/overview)
- [Deployment](/docs/reference/deployment)
