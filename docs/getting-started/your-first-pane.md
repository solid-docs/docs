---
sidebar_position: 4
title: Your First Pane
description: Write a SolidOS 3.1 pane as one ES module and load it into a running data browser
---

# Your First Pane

You will write a pane that says hello to the owner of a profile document, load it into a running SolidOS 3.1 without building anything, and then make it the view that opens first.

A pane is one JavaScript object with a `name`, an `icon`, a `label` function ("can you show this?") and a `render` function ("show it"). In 3.1 it can live in its own ES module and be added to a running data browser with `panes.register`.

You need a browser. For steps 2 to 4 you also need `git` and Node.js.

## Step 1: Try it in the console

Open [the SolidOS Browser with the test profile document](https://solidos.org/docs/browser/?uri=https%3A%2F%2Ftestingsolidos.solidcommunity.net%2Fprofile%2Fcard). Open the browser's developer tools, go to the Console, and paste:

```javascript
panes.register({
  name: 'hello',
  icon: UI.icons.iconBase + 'noun_15059.svg',
  label (subject, context) {
    const store = context.session.store
    return store.any(subject, store.sym('http://xmlns.com/foaf/0.1/primaryTopic')) ? 'Hello' : null
  },
  render (subject, context) {
    const store = context.session.store
    const person = store.any(subject, store.sym('http://xmlns.com/foaf/0.1/primaryTopic'))
    const h2 = context.dom.createElement('h2')
    h2.textContent = 'Hello, ' + person.value
    return h2
  }
})
```

Press **Go** in the address bar so the document is drawn again. Open the **⋮** menu at the top right of the `card` view: **Hello** is now in the list. Choose it, and the view shows `Hello, https://testingsolidos.solidcommunity.net/profile/card#me`.

The pane is gone when you reload the page. The next steps put it in a file that is loaded every time.

## Step 2: Write the pane as a module

Get the no-build data browser, which can load panes from a link:

```bash
git clone https://github.com/mashlib/dynamic.git
cd dynamic
```

In that folder, create `hello-pane.js`:

```javascript
// hello-pane.js: a first SolidOS pane.
// Offered for a profile document (one with a foaf:primaryTopic); says hello to its owner.
const FOAF = 'http://xmlns.com/foaf/0.1/'
const VCARD = 'http://www.w3.org/2006/vcard/ns#'

const ICON = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" ' +
  'stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>')

export default {
  name: 'hello',
  icon: ICON,

  // "Can I show this?" A string (the name in the pane menu) means yes, null means no.
  label (subject, context) {
    const store = context.session.store
    return store.any(subject, store.sym(FOAF + 'primaryTopic')) ? 'Hello' : null
  },

  // Build the view and return one element.
  render (subject, context) {
    const dom = context.dom
    const store = context.session.store
    const person = store.any(subject, store.sym(FOAF + 'primaryTopic'))
    const name = store.any(person, store.sym(FOAF + 'name')) ||
      store.any(person, store.sym(VCARD + 'fn'))

    const div = dom.createElement('div')
    div.style.padding = '1em'
    const h2 = dom.createElement('h2')
    h2.textContent = 'Hello, ' + (name ? name.value : person.value)
    const p = dom.createElement('p')
    p.textContent = 'This pane was loaded from ' + import.meta.url
    div.append(h2, p)
    return div
  }
}
```

The module imports nothing. Everything it needs comes from `context`: the document (`context.dom`) and the store that SolidOS has already loaded the resource into (`context.session.store`).

## Step 3: Load it into the data browser

Start a static file server in the same folder:

```bash
npx http-server -p 8000 -c-1
```

Open:

http://localhost:8000/mashlib/browse.html?pane=http://localhost:8000/hello-pane.js&uri=https://testingsolidos.solidcommunity.net/profile/card

`?pane=` names the module to load and `?uri=` the resource to show. The page imports the module, checks that its default export has `name`, `label` and `render`, and calls `panes.register` with it before drawing the resource. The browser console shows `[browse] pane "hello" added from http://localhost:8000/hello-pane.js`.

## Step 4: Open your pane

The profile document opens in its default view. Open the **⋮** menu at the top right of the `card` view and choose **Hello**:

![The ⋮ menu of the card document listing Data, Source, Under The Hood, Hello and Open in New Tab](/img/getting-started/hello-pane-menu.png)

![The Hello pane showing "Hello, Testing SolidOS" and the address it was loaded from](/img/getting-started/hello-pane.png)

To change the pane, edit `hello-pane.js` and reload the page with the cache disabled (developer tools, Network, Disable cache).

## Step 5: Make it the first view

A pane you add is registered after the built-in panes, so it is offered in the menu but not shown first. To ask to be shown first for the things it says yes to, add `shouldGetFocus` next to `icon`:

```javascript
  icon: ICON,

  shouldGetFocus (subject) { return true },
```

Reload. The profile document now opens in the Hello view. `shouldGetFocus` is only asked of panes whose `label` said yes, so this does not affect other resources. A resource whose `ui:mintClass` matches another pane's `mintClass` still opens in that pane.

## Step 6: Share it

To let other people use your pane, put `hello-pane.js` where a browser can fetch it from another site: a public folder on your pod, GitHub Pages, or any host that serves JavaScript with an `Access-Control-Allow-Origin` header. Then send a link to the SolidOS Browser:

```
https://solidos.org/docs/browser/?pane=<your module URL>&uri=<a resource>
```

For example, this link loads a pane published with [pane-loader](https://github.com/melvincarvalho/pane-loader) and shows a folder:

[https://solidos.org/docs/browser/?pane=https://melvincarvalho.github.io/pane-loader/examples/hello-pane.js&uri=https://testingsolidos.solidcommunity.net/public/](https://solidos.org/docs/browser/?pane=https://melvincarvalho.github.io/pane-loader/examples/hello-pane.js&uri=https://testingsolidos.solidcommunity.net/public/)

A pane from another site is code that runs as the person looking at it: once they are logged in it can read and change whatever they can. So the page asks first ("This link adds a pane from …", **Allow panes from this site** or **Not now**) and shows the resource without the pane meanwhile. A pane from the page's own site, as in step 3, is loaded without asking. The answer is remembered in that browser.

A server can also load panes for every visitor: JSS does this with `--panes <module URL>`. See [Running SolidOS on JSS](../guides/running-on-jss.md) and [Dynamic Panes](../panes/dynamic-panes.md).

## Rules for a loaded pane

- Make the pane the module's **default export**.
- Do not import solid-logic, solid-ui or rdflib from a CDN. A second copy of solid-logic has its own empty store and no login. Use `context.session.store`, `context.session.logic`, and the page globals `UI` and `$rdf` if you need them.
- Refer to your own files (icons, styles) relative to the module: `new URL('hello.svg', import.meta.url).href`.
- Keep `label` fast. It is called for every resource shown, for every registered pane.
- `render` returns one element. Build it with `context.dom`.

## The other way: build it into solid-panes

The built-in panes are compiled into solid-panes, and from there into the mashlib bundle. To add a pane that way, as the [solid-panes README](https://github.com/SolidOS/solid-panes) describes:

1. Clone solid-panes and start its development sandbox:

   ```bash
   git clone https://github.com/solidos/solid-panes
   cd solid-panes
   npm install
   npm start
   ```

   The sandbox is at http://localhost:5173 and shows the test profile.

2. Put your pane under `src/`, for example `src/hello/helloPane.js`, with the same default export as above.

3. Register it in `src/registerPanes.js`. That file exports `registerPanes (register)` and calls `register(...)` once per pane. The earliest registered panes have priority, so where you add the line decides where your pane comes in the list:

   ```javascript
   import helloPane from './hello/helloPane'
   // ...
   register(helloPane)
   ```

4. Larger panes are published as npm packages of their own (folder-pane, contacts-pane, meeting-pane and others) and imported into `registerPanes.js` the same way.

A pane built in this way reaches users only in a new solid-panes and mashlib release. A loaded pane, as in steps 2 to 6, reaches them as soon as the file is published. [Creating Panes](../panes/creating-panes.md) covers both in more depth.

## Next steps

- [Pane Anatomy](../panes/pane-anatomy.md): every field a pane can have and the full `context`
- [Dynamic Panes](../panes/dynamic-panes.md): the three ways to load a pane, and how trust works
- [Creating Panes](../panes/creating-panes.md): editing data, forms and solid-ui components in a pane
- [solid-ui](../libraries/solid-ui.md): components to build the view with
