---
sidebar_position: 2
title: Embedding mashlib
description: Put the SolidOS data browser in your own page with mashlib 3.1 - globals, the two page types, the browse page line by line, data islands
---

# Embedding mashlib

mashlib is one script and one stylesheet. Load them into a page and the whole SolidOS data browser is there: the libraries as globals, the built-in panes, the login, the header. This page shows the two ways to use it, walks through the browse page that ships with mashlib 3.1.0, and shows how to draw data that is inside the page itself.

Three working pages use everything below. Open them and view their source:

- [SolidOS Browser](https://solidos.org/docs/browser/): an address bar and the data browser.
- [Data island demo](https://solidos.org/docs/data-island/): Turtle inside the page, drawn by SolidOS.
- [Custom pane demo](https://solidos.org/docs/pane-demo/): a pane registered with `panes.register` and drawn for a real resource.

![The SolidOS Browser demo showing a folder in the 3.1 file explorer](/img/mashlib/browser-demo-folder.png)

## Load it

Pin the exact version. An unpinned `mashlib` URL changes under you when a new major version comes out.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mash.css">
<script src="https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mashlib.min.js"></script>
```

`mashlib.min.js` is a classic script, not a module. When it has run, the globals below exist; code that touches the page should still wait for `DOMContentLoaded`.

If you load it from a CDN, also read [Files at the site root](#files-at-the-site-root).

## The globals

| Global | What it is |
|---|---|
| `panes` | solid-panes 5.1.0, plus `panes.runDataBrowser` added by mashlib |
| `UI` | solid-ui 5.1.0 |
| `SolidLogic` | solid-logic 6.2.0 |
| `$rdf` | rdflib 2.4.1 |
| `mashlib` | `{ versionInfo }`: build time, commit and package versions |

The ones you use most:

```javascript
const outliner = panes.getOutliner(document)        // draws subjects into the page
const { store, resource } = SolidLogic.solidLogicSingleton
store === SolidLogic.store                           // true: one shared rdflib store
SolidLogic.authn.currentUser()                       // the logged-in WebID as a NamedNode, or null
SolidLogic.authn.authSession.events.on('login', fn)  // login events (also 'logout', 'sessionRestore', ...)
panes.register(myPane)                               // add a pane
panes.byName('folder')                               // look a pane up
panes.list.length                                    // 36 built-in panes in 3.1.0
$rdf.sym('https://example.org/#me')                  // make a NamedNode
mashlib.versionInfo.npmInfo.mashlib                  // '3.1.0'
```

`panes` also has `initMainPage`, `initializeProfileHeading`, `refreshProfileHeading`, `refreshUI`, `updateEnvironment`, `isHandlingBrowserNavigation`, `paneForIcon`, `paneForPredicate` and `OutlineManager`. The [solid-panes](/docs/libraries/solid-panes) page describes them.

## Two kinds of page

**The data browser page** shows the resource its own URL points at. A Solid server sends it in place of the data when a browser asks for an RDF document. mashlib ships it as `dist/databrowser.html`. It calls `panes.runDataBrowser()`, which checks the login, then builds the header, the profile heading and the navigation bar, and shows the page's own URL. You rarely write this page yourself; you point a server at it.

**The browse page** shows a resource named in its address (`?uri=...`) and lives anywhere. mashlib ships it as `dist/browse.html`. It does not call `runDataBrowser()`; it draws each resource itself with `GotoSubject`. This is the page to copy for your own site.

`runDataBrowser(uri)` does take a resource, but the profile heading and the navigation bar still follow the page's own URL, so on a page of your own the browse page pattern is the one that works.

## The data browser page

This is the markup of mashlib 3.1.0's `databrowser.html`, with the files loaded from jsDelivr. The header and the navigation bar are added by `runDataBrowser()`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>SolidOS</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mash.css">
  <script src="https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mashlib.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => panes.runDataBrowser())
  </script>
</head>
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
</html>
```

`runDataBrowser()` also sets `$rdf.Fetcher.crossSiteProxyTemplate` to `<page origin>/xss/?uri={uri}`, the cross-site proxy path that some Solid servers provide.

## The browse page, line by line

mashlib 3.1.0's `static/browse.html` (published as `dist/browse.html`), with comments. The [SolidOS Browser](https://solidos.org/docs/browser/) on this site is the same page for SolidOS loaded as ES modules, where a link can also add a pane: see [Dynamic panes](/docs/panes/dynamic-panes).

### Markup

```html
<body>
  <solid-ui-provider>
    <header id="PageHeader" role="banner" class="header-mash">
      SolidOS Databrowser
      <div class="input-row" id="inputArea">
        Viewing <input id="uriField" type="text" class="uri-field"> <input type="button" id="goButton" value="Go">
      </div>
    </header>
    <div class="user-row">
      <solid-ui-account></solid-ui-account>
    </div>
    <main id="MainContent" tabindex="-1" aria-live="polite" class="app-view browser-main">
      <div id="OutlineView" class="outline-view" aria-label="Resource browser" style="width: 100%"></div>
    </main>
  </solid-ui-provider>
</body>
```

- `<solid-ui-provider>` wraps everything. solid-ui's components, `<solid-ui-account>` among them, are meant to sit inside it.
- `<solid-ui-account>` is the login: Log In and Sign Up buttons, the login dialog, and the account menu once logged in.
- `#OutlineView` is where every resource is drawn. mashlib 3.1 looks for this id. If it is missing, mashlib creates it inside `#MainContent`, or at the end of `<body>`.

### Script

```javascript
document.addEventListener('DOMContentLoaded', function () {
  const dom = document
  const outliner = panes.getOutliner(dom)
  const { store, resource } = SolidLogic.solidLogicSingleton
  const uriField = dom.getElementById('uriField')
```

`getOutliner` returns the one outline manager for this document. `resource` is solid-logic's resource logic, used below to tell folders from documents.

```javascript
  const ready = panes.initializeProfileHeading(() =>
    new URLSearchParams(location.search).get('uri') || location.href)
```

Sets up the profile heading, the name and picture shown above a person's pages. The function tells it which resource is on show: the one in `?uri=`, not the browse page itself. It returns a promise that settles when the login check is done.

```javascript
  let navigationRequest = 0

  async function go () {
    const request = ++navigationRequest
    const target = new URL(uriField.value, window.location.href)
    await ready
    if (request !== navigationRequest) return
```

Each call gets a number. If the user asks for something else while this one is still loading, the older call stops at the next check.

```javascript
    const subject = $rdf.sym(target.href)
    let isContainer = false
    let canonicalSubject = subject
    try {
      const response = await store.fetcher.load(subject.doc())
      const canonical = new URL(response.url || target.href)
      canonical.hash = target.hash
      canonicalSubject = $rdf.sym(canonical.href)
      isContainer = resource.isContainer(subject.doc()) || resource.isContainer(canonicalSubject.doc())
      if (isContainer) {
        if (!canonical.pathname.endsWith('/')) canonical.pathname += '/'
        target.href = canonical.href
      }
    } catch (error) {
      console.warn('Could not preload the browse resource.', error)
    }
    if (request !== navigationRequest) return
```

The document is loaded first, with the shared fetcher, which sends the login credentials when there is a session. That shows where a redirect led, and whether the resource is a folder, so a folder address without its final `/` is corrected. If loading fails, the outline below draws the error (not found, access denied).

```javascript
    uriField.value = target.href
    const pageUrl = new URL(window.location.href)
    pageUrl.searchParams.set('uri', target.href)
    window.history.replaceState({}, '', pageUrl)
```

The page's own address keeps `?uri=` in step, so it can be bookmarked or sent.

```javascript
    const isStorageRoot = resource.isStorageRoot(subject) || resource.isStorageRoot(canonicalSubject)
    const options = isContainer
      ? { folderView: isStorageRoot ? 'explorer' : 'container', preserveUrl: true }
      : { preserveUrl: true }
    outliner.GotoSubject($rdf.sym(target.href), true, undefined, true, undefined, undefined, options)
    await panes.refreshProfileHeading(true)
  }
```

`GotoSubject(subject, expand, pane, solo, referrer, table, options)` draws the resource:

- `expand: true` opens it rather than showing a folded line.
- `pane: undefined` lets SolidOS choose the pane. Pass a pane object to choose it yourself.
- `solo: true` clears `#OutlineView` first.
- `table` is the element to draw into; `undefined` means `#OutlineView`.
- `options.preserveUrl: true` keeps the browse page's URL. Without it, GotoSubject writes the resource's URL into the address bar when both are on the same origin.
- `options.folderView` picks how a folder is shown: `'explorer'` (storage header, sidebar and content) for the root of a pod, `'container'` (the folder alone) otherwise.

Then the profile heading is redrawn for the new resource.

```javascript
  function navigate () {
    if (!uriField.value.trim()) return
    go().catch(error => console.error('Failed to browse the resource.', error))
  }

  uriField.addEventListener('keydown', event => { if (event.key === 'Enter') navigate() })
  goButton.addEventListener('click', navigate)

  const authSession = SolidLogic.authn.authSession
  for (const event of ['login', 'sessionRestore', 'logout', 'sessionChange', 'identityReplaced']) {
    authSession.events.on(event, navigate)
  }
```

Logging in or out changes what can be seen, so the resource is drawn again after each session event.

```javascript
  const initial = new URLSearchParams(location.search).get('uri') ||
    (location.pathname === '/' ? location.href : '')
  if (initial) {
    uriField.value = initial
    navigate()
  }
})
```

On load, the resource in `?uri=` is shown. At the root of a site with no `?uri=`, the site itself is shown, which is what you want when the browse page is a pod's home page.

The upstream file also measures the header's height into `--browse-header-offset` and has a small stylesheet; both are layout only.

## Back and forward

mashlib 3.1 sets `window.onpopstate`. When the page has not called `runDataBrowser()`, that handler shows the page's own URL on back and forward. The browse page above uses `replaceState`, so it never adds history entries and the handler never matters.

If your page adds an entry per resource with `pushState`, replace the handler so that going back shows the previous `?uri=`. This is what the [SolidOS Browser](https://solidos.org/docs/browser/) does:

```javascript
window.onpopstate = null
window.addEventListener('popstate', () => {
  const uri = new URLSearchParams(location.search).get('uri')
  if (uri) show(uri)   // your function that loads and draws a resource
})
```

## Data islands

You can draw data that is not on any server. Put it in the page, parse it into the shared store, and draw it:

```html
<script type="text/turtle" id="profile-data">
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix vcard: <http://www.w3.org/2006/vcard/ns#> .
<#me> a foaf:Person ; foaf:name "Alice Example" ;
  vcard:note "This profile is Turtle inside this HTML page." .
</script>

<solid-ui-provider>
  <main id="MainContent"><div id="OutlineView" class="outline-view"></div></main>
</solid-ui-provider>

<script>
document.addEventListener('DOMContentLoaded', () => {
  const doc = 'https://data-island.example/profile'
  $rdf.parse(document.getElementById('profile-data').textContent, SolidLogic.store, doc, 'text/turtle')
  panes.getOutliner(document).GotoSubject($rdf.sym(doc + '#me'), true, undefined, true, undefined, undefined, { preserveUrl: true })
})
</script>
```

- Browsers do not run a `<script>` whose type they do not know, so the Turtle stays inert text.
- The document address you parse into becomes the base for `<#me>`. The demo uses an address of its own rather than the page's URL; the outline may still try to fetch it, which fails quietly.
- Everything parsed this way is in the same store every pane reads, so the profile pane draws it as it would a real profile.

The [Data island demo](https://solidos.org/docs/data-island/) is this code with styling.

## Adding panes

Any page that has loaded mashlib can add panes:

```javascript
const module = await import('https://example.org/panes/hello-pane.js')
panes.register(module.default)
```

A pane registered after the first view is offered from the next view drawn. To show the current resource with it straight away, draw it again and pass the pane:

```javascript
outliner.GotoSubject(subject, true, module.default, true, undefined, undefined, { preserveUrl: true })
```

How to write a pane, and how to load one by link or on a JSS server, is in [Dynamic panes](/docs/panes/dynamic-panes). The [Custom pane demo](https://solidos.org/docs/pane-demo/) registers one on a live page.

## Theme and layout

mashlib sets `data-theme` and `data-layout` on `<html>` and keeps both up to date. With nothing saved, the theme follows the system setting. To keep a page light, save the choice before mashlib loads:

```html
<script>
  try { if (!localStorage.getItem('mashlib-theme')) localStorage.setItem('mashlib-theme', 'light') } catch (e) {}
</script>
```

Listen for `mashlib:themechange` and `mashlib:layoutchange` on `window` to react to changes. [Theming](/docs/reference/theming) lists the CSS tokens.

mash.css has rules for some plain class names, `.container` among them (a thick black border). Prefix the class names of your own page to keep them apart.

## Files at the site root

mashlib 3.1.0 fetches three more files when it needs them, and asks for them at the root of the site that serves the page, whatever URL the script came from:

| File | Needed for |
|---|---|
| `/841.js` | parsing JSON-LD |
| `/410.js` | the source editor |
| `/5fb2ef310e691f59285b.js` | the login client's worker (must be on the page's own origin) |

**If you serve mashlib from your site root**, copy these three files from `node_modules/mashlib/dist/` beside `mashlib.min.js`.

**If you load mashlib from a CDN, or your page is in a sub-folder**, the requests reach your site's root and fail. Then parsing JSON-LD fails with `ChunkLoadError`, and the login check takes about 5 seconds longer. The demo pages on this site solve it with a short script, loaded before `mashlib.min.js`, that sends the two parts to jsDelivr and the worker to a copy beside the page: [mashlib-files.js](pathname:///docs/browser/mashlib-files.js). Copy it and the worker file next to your page.

## See also

- [Migrating to 3.1](/docs/guides/migrating-to-3.1)
- [The no-build data browser](/docs/guides/mashlib-com)
- [Running SolidOS on JSS](/docs/guides/running-on-jss)
- [Navigation](/docs/panes/navigation)
- [Deployment](/docs/reference/deployment)
