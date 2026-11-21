---
sidebar_position: 4
title: Dynamic Panes
description: Write a pane as one ES module and load it into SolidOS 3.1 at run time, without rebuilding mashlib
---

# Dynamic Panes

A dynamic pane is a pane that is not compiled into mashlib. It is one ES module at a URL whose default export is a pane, and it reaches the registry at run time through `panes.register`. Nothing about the pane is different from a built-in one: it follows [the pane contract](./pane-anatomy.md) and receives the same `context`. Only the way it is loaded differs.

There are three ways to load one:

| Where | How | Who decides |
|---|---|---|
| Any page running SolidOS 3.1 | `panes.register(pane)`, or pane-loader's `loadPanes([url])` | The page's code, or you in the console |
| A JSS pod | `jss start --mashlib-cdn --panes <url>` | Whoever runs the server |
| A link | `https://solidos.org/docs/browser/?pane=<url>&uri=<resource>` | The person who opens the link, after a prompt |

## A pane module

This pane summarises what a folder holds. It is a complete dynamic pane: one module, a stylesheet and an icon beside it, and no imports.

```javascript title="folder-summary-pane.js"
// folder-summary-pane.js: what a folder holds, counted by kind.
// One ES module, no imports: everything it needs arrives in `context`.
const LDP_CONTAINS = 'http://www.w3.org/ns/ldp#contains'
const STYLES = new URL('folder-summary.css', import.meta.url).href

function kindOf (uri) {
  if (uri.endsWith('/')) return 'folders'
  const match = /\.([a-z0-9]+)$/i.exec(new URL(uri).pathname)
  return match ? '.' + match[1].toLowerCase() : 'no extension'
}

export default {
  name: 'folder-summary',
  icon: new URL('folder-summary.svg', import.meta.url).href,

  label (subject, context) {
    return subject.uri.endsWith('/') ? 'Summary' : null
  },

  render (subject, context) {
    const { dom } = context
    const store = context.session.store

    // One stylesheet per page, however often the pane is drawn.
    if (!dom.querySelector(`link[href="${STYLES}"]`)) {
      const link = dom.createElement('link')
      link.rel = 'stylesheet'
      link.href = STYLES
      dom.head.appendChild(link)
    }

    const counts = new Map()
    for (const item of store.each(subject, store.sym(LDP_CONTAINS), null, subject.doc())) {
      const kind = kindOf(item.value)
      counts.set(kind, (counts.get(kind) || 0) + 1)
    }

    const root = dom.createElement('section')
    root.className = 'folder-summary'
    // Mobile or desktop, light or dark: set by the page, passed in on every render.
    root.dataset.theme = context.environment?.theme || 'light'
    root.dataset.layout = context.environment?.layout || 'desktop'

    const heading = dom.createElement('h2')
    heading.textContent = counts.size ? 'What this folder holds' : 'This folder is empty'
    root.appendChild(heading)

    const list = dom.createElement('dl')
    for (const [kind, count] of [...counts].sort((a, b) => b[1] - a[1])) {
      const name = dom.createElement('dt')
      name.textContent = kind
      const value = dom.createElement('dd')
      value.textContent = String(count)
      list.append(name, value)
    }
    root.appendChild(list)
    return root
  }
}
```

```css title="folder-summary.css"
/* Every rule starts with the pane's own class: the pane shares the page with SolidOS. */
.folder-summary { padding: 16px; color: inherit; }
.folder-summary h2 { margin: 0 0 12px; font-size: var(--solid-ui-font-size-xl, 1.25rem); }
.folder-summary dl { display: grid; grid-template-columns: max-content max-content; gap: 6px 24px; margin: 0; }
.folder-summary dt { font-weight: 700; }
.folder-summary dd { margin: 0; color: var(--solid-ui-color-primary, #7c4dff); }
.folder-summary[data-layout="mobile"] dl { grid-template-columns: 1fr max-content; }
.folder-summary[data-theme="dark"] dd { color: var(--solid-ui-color-lavender-400, #cbb9ff); }
```

The same module was loaded into the official mashlib 3.1.0 bundle, into the no-build tree and into a JSS pod's data browser, and rendered on all three:

![The folder summary pane in the SolidOS Browser: "What this folder holds", with counts of .js, .svg, .css and .ttl files](/img/panes-dev/dynamic-summary.png)

### Rules for a pane loaded at run time

- **Default export.** The pane is the module's default export. Loaders check that it has a non-empty `name`, a `label` function and a `render` function, and skip it otherwise.
- **Import nothing from SolidOS.** Take the store, the session and the document from `context`. On the official bundle a bare specifier such as `import 'rdflib'` does not resolve, and a second copy of solid-logic would have its own store and no login. The page globals `$rdf`, `UI`, `SolidLogic` and `panes` are there if you need them ([list](./creating-panes.md#4-what-a-pane-can-use-without-importing)). In the no-build tree only, which the SolidOS Browser runs, an import map resolves `rdflib`, `solid-logic`, `solid-ui`, `solid-panes`, `lit` and `lit-html` to the copies already loaded.
- **Refer to your own files relative to the module**, with `new URL('file', import.meta.url)`, as the icon and stylesheet above do.
- **A unique `name`.** A loader will not register a second, different pane under a name already in the registry.

### Serving a pane module

A module is fetched with CORS and checked for its type, so the server must:

- send a JavaScript content type (`text/javascript` or `application/javascript`). A file served as `text/plain`, as raw.githubusercontent.com does, fails with a "Strict MIME type checking" error;
- allow cross-origin access with an `Access-Control-Allow-Origin` header that covers the page. Without it the import fails with "blocked by CORS policy".

GitHub Pages and JSS pods do both, so a file in a public folder of a JSS pod works as a pane URL. Use `https` for a page served over `https`.

## On any page: `panes.register`

On a page running mashlib 3.1 (the SolidOS Browser, a pod's data browser, your own page), `window.panes` is solid-panes. Import the module, register the pane, and show the subject again so that the new pane is considered:

```javascript
const pane = (await import('https://alice.example/public/panes/folder-summary-pane.js')).default
panes.register(pane)
const subject = $rdf.sym('https://alice.example/public/')
panes.getOutliner(document).GotoSubject(subject, true, panes.byName('folder-summary'), true)
```

Passing the pane as the third argument of `GotoSubject` opens it directly. Pass `undefined` instead to let SolidOS choose; the new pane is then offered in the pane menu (see [Navigation](./navigation.md)).

### pane-loader

[pane-loader](https://github.com/melvincarvalho/pane-loader) is a small module that does this for a list of URLs and reports what happened. It is the loader JSS ships.

```javascript
import { loadPanes } from 'https://melvincarvalho.github.io/pane-loader/pane-loader.js'

const results = await loadPanes(['https://alice.example/public/panes/folder-summary-pane.js'], { show: true })
// [{ url, ok: true, name: 'folder-summary' }]
```

| Export | What it does |
|---|---|
| `loadPane(url, options)` | Imports one module, checks the default export is a pane, calls `panes.register`. Never throws: returns `{ url, ok, name?, already?, reason? }`. Loading the same module again returns `already: true`; a different pane with a name already registered is refused. |
| `loadPanes(urls, options)` | `loadPane` for each URL in order, then shows the current subject again so the new panes are offered. |
| `isPane(object)` | Whether the object has a non-empty `name`, a `label` and a `render`. |

| Option | Meaning |
|---|---|
| `panes` | The solid-panes module. Default: `window.panes`. |
| `refresh` | Show the current subject again afterwards. Default `true`. |
| `show` | Open the newest loaded pane whose `label` accepts the current subject. |
| `subject` | URL of the thing on show, when it is not the page's own URL (for example on a page that takes `?uri=`). |

A URL that cannot be imported, or is not a pane, is skipped with a console warning starting `[pane-loader]`; the others still load.

## On a JSS pod: `--panes`

The [JavaScript Solid Server](https://jss.live/) can load panes into the data browser it serves, from JSS 0.0.227:

```bash
jss start --mashlib-cdn --conneg --panes https://alice.example/public/panes/folder-summary-pane.js
```

- **Setting the list.** `--panes` takes a comma-separated list of URLs. The same list can be set with the environment variable `JSS_PANES` or as a `panes` array in the config file. A URL that contains a comma must go in the config file.
- **Which URLs count.** Each entry is an `http(s)` URL or an absolute path on the same server, such as `/public/panes/folder-summary-pane.js`. Anything else is dropped, and the server lists the dropped entries at start-up.
- **Which modes.** It works with `--mashlib-cdn`, and from JSS 0.0.230 with `--mashlib-module`.
- **Start-up with `--mashlib-cdn`.** The page fetches all the modules at once and registers them in the order listed, after the built-in panes. It then starts SolidOS, when every pane is dealt with or after 5 seconds, whichever comes first. A pane slower than that is registered when it arrives and is offered from the next view; the view on show is not redrawn.
- **Start-up with `--mashlib-module`.** The module starts SolidOS itself, so the page waits (up to 30 seconds) for `panes.register` to appear, then loads the panes and redraws the view on show.
- **Failures.** A module that fails to load, or is not a pane, is skipped with a console warning, and the data browser still starts. Look for console lines starting `[jss]`.

JSS serves its copy of pane-loader at `/.well-known/jss/pane-loader.js`. That copy leaves out the upstream `?pane=` shortcut, so a JSS page loads only the panes in the server's list. See the [JSS dynamic panes guide](https://jss.live/docs/guides/dynamic-panes).

## By link: `?pane=` in the SolidOS Browser

The [SolidOS Browser](https://solidos.org/docs/browser/) is SolidOS 3.1 as plain ES modules, with an address bar. It takes two query parameters:

- `uri=<resource>`: the thing to show;
- `pane=<module URL>`: a pane to add. It may be repeated, up to 10.

```text
https://solidos.org/docs/browser/?pane=https%3A%2F%2Falice.example%2Fpublic%2Fpanes%2Ffolder-summary-pane.js&uri=https%3A%2F%2Falice.example%2Fpublic%2F
```

Encode both values with `encodeURIComponent`.

### Trust model

A pane is code. It runs in the page as the person looking at it: once they are logged in, it can read and change anything they can. A link therefore cannot add a pane silently:

- Only `http:` and `https:` URLs without a user name or password are accepted; other `pane` values are ignored.
- A pane from the page's own site, or from a site this browser has allowed before, is loaded before the first view. The page waits at most 5 seconds for it.
- For a pane from any other site, the page shows the resource without it and asks, once per site, listing the module URLs:

![The prompt in the SolidOS Browser: "This link adds a pane from 127.0.0.1:8732", explaining that a pane runs as you, listing the module URL, with the buttons "Allow panes from this site" and "Not now"](/img/panes-dev/dynamic-ask.png)

- **Allow panes from this site** loads the panes, shows the resource again with them, and remembers the site in this browser (the `localStorage` key `mashlib.panes.allowed`), so later links from that site are not asked about.
- **Not now** loads nothing and remembers nothing.

An allowed pane is registered after the built-in panes, so it is offered in the pane menu and is shown first only if its `shouldGetFocus` returns `true`.

The same holds for the other routes: whoever runs a JSS server chooses its `--panes` for every user of that server, and `panes.register` runs whatever it is given. Load only panes you would install as a browser extension. Signed panes and trust ratings are being worked on in [JSS issue 651](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer/issues/651).

## Styling

The element a pane returns is put inside `<solid-ui-file-explorer-provider>` as an ordinary child, with the class `paneDiv` added. It is not in a shadow root, so:

- the page's styles reach the pane, and the pane's styles reach the page. Give the root element a class of its own and start every rule with it;
- load a stylesheet once per page, as `render` above does, rather than adding a `<style>` element on every render;
- use solid-ui's CSS custom properties, such as `--solid-ui-color-primary` and `--solid-ui-font-size-xl`, with a fallback value, to match the rest of SolidOS. See [Theming](../reference/theming.md).

`context.environment` says whether the page is in the `light` or `dark` theme and the `desktop` or `mobile` layout. Read it in `render` every time. On a page started with `panes.runDataBrowser()` (a pod's data browser, for example), a theme or layout change renders the pane on show again with the new values. Pages that show subjects themselves, such as the SolidOS Browser, update `context.environment` but do not redraw the pane.

## See also

- [The Pane Contract](./pane-anatomy.md)
- [Creating Panes](./creating-panes.md): a pane that writes data, with tests
- [Your First Pane](../getting-started/your-first-pane.md)
- [pane-loader](https://github.com/melvincarvalho/pane-loader), with a [live demo](https://melvincarvalho.github.io/pane-loader/demo.html)
- [SolidOS Panes](https://melvincarvalho.github.io/solidos-panes/), the write-up of the dynamic pane idea
