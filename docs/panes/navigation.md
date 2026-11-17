---
sidebar_position: 5
title: Navigation
description: Showing another thing from a pane or a page in SolidOS 3.1, GotoSubject and its options, and the solid-panes:navigated event
---

# Navigation

Every change of what SolidOS shows ends in one call: `GotoSubject` on the page's outline manager. Links and buttons in solid-ui, the header and navbar, back and forward, and mashlib's own code all use it. A pane or a page that wants to show something else calls it too, and listens for the `solid-panes:navigated` event to follow what is shown.

## Getting the outliner

There is one outline manager per document.

- In a pane: `context.getOutliner(context.dom)`.
- On a page running mashlib: `panes.getOutliner(document)`.

## `GotoSubject`

```javascript
outliner.GotoSubject(subject, expand, pane, solo, referrer, table, options)
```

| Argument | Meaning |
|---|---|
| `subject` | The thing to show, a `NamedNode` (`$rdf.sym(url)`). |
| `expand` | `true` to show the thing open, with a pane rendered. Pass `true`. |
| `pane` | A pane to use, from `panes.byName(name)`. `undefined` lets SolidOS choose (see [how a pane is chosen](./overview.md#how-a-pane-is-chosen)). |
| `solo` | `true` to clear the outline and show only this thing, as a page. With `solo`, the URL and history are updated and `solid-panes:navigated` is sent. Pass `true` for navigation. |
| `referrer` | Not needed; pass `undefined`. |
| `table` | The element to render into. Default: `#OutlineView`. |
| `options` | An object, all optional: `source`, `folderView`, `preserveUrl`. Described below. |

It returns `subject`. Rendering finishes after it returns: the subject's document is loaded first.

The most common calls:

```javascript
const outliner = panes.getOutliner(document)
const thing = $rdf.sym('https://alice.example/public/recipes/recipe.ttl#this')

outliner.GotoSubject(thing, true, undefined, true)                     // show it, as a link would
outliner.GotoSubject(thing, true, panes.byName('types'), true)        // show it in a given pane
outliner.GotoSubject(thing, true, undefined, true, undefined, undefined, { preserveUrl: true })  // keep the page URL
```

### What happens to the URL and history

With `solo`:

- If the subject is on the same origin as the page and is not the page's URL, the subject's URL is pushed as a new history entry, so the address bar shows it and Back returns.
- If it is the page's URL already, the current entry is replaced only if what it records has changed.
- If the subject is on another origin, the URL and history are left alone; a page can only push URLs on its own origin.
- With `preserveUrl: true`, the URL is never changed, and the current history entry is replaced in place (no new entry).

The history entry records which pane was used (`paneName`) when one was passed, and whether the account menu opened the view.

### Options

| Option | Values | Effect |
|---|---|---|
| `preserveUrl` | `true` | Keep the page's own URL while showing a different subject. For pages that keep the subject in their own query string, such as a browse page with `?uri=`. Without it, `GotoSubject` makes the displayed subject the page URL (on the same origin). |
| `folderView` | `'explorer'`, `'storage'`, `'container'` | How the folder pane presents a container: `explorer` with the storage header, sidebar and content; `storage` with sidebar and content, under the navbar of someone else's pod; `container` the container alone. |
| `source` | `'default'`, `'accountMenu'` | Who asked. `'accountMenu'` is for the viewer's own content shown while the URL points elsewhere: the navbar is not revealed, and the history entry is marked. The older form, `false` as the seventh argument, still means `'accountMenu'`. |

## Navigating from a pane

This pane lists every resource a thing links to, each as a button that shows it:

```javascript title="links-pane.js"
// links-pane.js: every resource this thing points at, each one a button that goes there.
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'

// Each resource once, however many properties point at it.
function linksFrom (subject, store) {
  const targets = new Map()
  for (const st of store.statementsMatching(subject, null, null, subject.doc())) {
    if (st.object.termType === 'NamedNode' && st.predicate.value !== RDF_TYPE) targets.set(st.object.value, st.object)
  }
  return [...targets.values()]
}

export default {
  name: 'links',
  icon: new URL('links.svg', import.meta.url).href,

  label (subject, context) {
    return linksFrom(subject, context.session.store).length ? 'Links' : null
  },

  render (subject, context) {
    const { dom } = context
    const outliner = context.getOutliner(dom)
    const root = dom.createElement('ul')
    root.className = 'links-pane'

    for (const target of linksFrom(subject, context.session.store)) {
      const item = dom.createElement('li')
      const button = dom.createElement('button')
      button.type = 'button'
      button.textContent = target.value
      // Show the target in place of this page, as a link in SolidOS would.
      button.addEventListener('click', () => {
        outliner.GotoSubject(target, true, undefined, true)
      })
      item.appendChild(button)
      root.appendChild(item)
    }
    return root
  }
}
```

![The links pane on a WebID in SolidOS 3.1, listing the profile document, inbox, storage, preferences and type index files as buttons](/img/panes-dev/links-pane.png)

On a pod's own data browser, clicking `…/me/inbox/` pushes that URL, shows the inbox with its default pane, and sends `solid-panes:navigated`; Back returns to the WebID.

## The `solid-panes:navigated` event

After a `GotoSubject` call with `solo` has rendered and written history, a `CustomEvent` named `solid-panes:navigated` is dispatched on the document. It is sent whoever called `GotoSubject`, and also with `preserveUrl`. The navbar and the profile heading listen for it to keep themselves up to date.

```javascript
document.addEventListener('solid-panes:navigated', event => {
  const { url, state } = event.detail
  console.log('Now at', url, 'showing', state.view.kind, state.view.pane || '(default pane)')
})
```

`event.detail`:

| Property | Meaning |
|---|---|
| `url` | The page URL after the navigation. With `preserveUrl`, the page's own URL. |
| `state.view.kind` | `'default'` (no pane was asked for), `'profile'` (the `profile` pane), `'friends'` (the `social` pane), `'storage'` (the `folder` pane), or `'pane'` (any other named pane). |
| `state.view.pane` | The registry name of the pane asked for. Not set for `'default'`. |
| `state.view.subject` | What the pane shows, when it is not the page URL (a profile, friends list or storage). |
| `state.viaAccountMenu` | `true` when the account menu opened the view. |

For example, `GotoSubject(webId, true, panes.byName('links'), true)` sends `{ url: webId, state: { view: { kind: 'pane', pane: 'links' }, viaAccountMenu: false } }`.

`GotoSubject` without `solo` (rendering into part of the page) sends no event.

## Back, forward and reload

On the page started by `panes.runDataBrowser()`, SolidOS handles Back, Forward and pressing Enter on the current URL itself. They show what the URL is: a WebID ending in `#me` with the profile pane, anything else with its default pane. It uses the browser's [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API) where there is one and falls back to `popstate` where there is not. `panes.isHandlingBrowserNavigation()` returns `true` once it has taken this over; mashlib's own `window.onpopstate` then does nothing.

A page that renders subjects itself, without `runDataBrowser`, handles Back and Forward on its own. If it uses `preserveUrl` and keeps the subject in its query string, it should listen for `popstate` and call `GotoSubject` for the subject in the URL. The browse page at https://mashlib.com/ does this, and wraps `GotoSubject` so that links inside panes also keep its `?uri=` in step:

```javascript
const outliner = panes.getOutliner(document)
const gotoSubject = outliner.GotoSubject.bind(outliner)
outliner.GotoSubject = function (subject, expand, pane, solo, referrer, table, options) {
  if (solo && subject && subject.uri) {
    // record subject.uri in this page's own address here, then:
    options = { ...(options && typeof options === 'object' ? options : {}), preserveUrl: true }
  }
  return gotoSubject(subject, expand, pane, solo, referrer, table, options)
}
```

## See also

- [Panes overview](./overview.md#how-a-pane-is-chosen): how the pane shown is chosen
- [The Pane Contract](./pane-anatomy.md): `getOutliner` and the rest of the context
- [solid-panes](../libraries/solid-panes.md): `getOutliner`, `initMainPage`, `refreshUI` and the profile heading
- [navigation-design.md](https://github.com/SolidOS/solid-panes/blob/main/docs/navigation-design.md) in solid-panes: the design behind these rules
