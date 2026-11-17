---
sidebar_position: 2
title: The Pane Contract
description: What a SolidOS 3.1 pane is made of, what it is given, and when it is called
---

# The Pane Contract

This page is the reference for what a pane is in SolidOS 3.1 (mashlib 3.1.0, solid-panes 5.1.0, pane-registry 5.1.1). Every built-in pane and every pane you write follows it.

A pane is an object with a `name`, an `icon`, a `label(subject, context)` function and a `render(subject, context)` function. Written as its own file, it is an ES module whose default export is that object:

```javascript title="types-pane.js"
// types-pane.js: the classes a thing belongs to, and how many statements describe it.
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'

export default {
  name: 'types',
  icon: new URL('types.svg', import.meta.url).href,

  // Called for every registered pane each time something is shown.
  // Return a short label to be offered, or null. Keep it cheap: no fetching.
  label (subject, context) {
    const store = context.session.store
    return store.any(subject, store.sym(RDF_TYPE), null, subject.doc()) ? 'Types' : null
  },

  // Build the view and return one element. It is put on the page for you.
  render (subject, context) {
    const { dom } = context
    const store = context.session.store
    const types = store.each(subject, store.sym(RDF_TYPE), null, subject.doc())
    const count = store.statementsMatching(subject, null, null, subject.doc()).length

    const root = dom.createElement('section')
    root.className = 'types-pane'
    const heading = dom.createElement('h2')
    heading.textContent = `${count} statements about this thing`
    const list = dom.createElement('ul')
    for (const type of types) {
      const item = dom.createElement('li')
      item.textContent = type.value
      list.appendChild(item)
    }
    root.append(heading, list)
    return root
  }
}
```

Registered on a page running SolidOS 3.1 with `panes.register(pane)`, it is offered in the pane menu of anything that has a type, with its label and icon:

![The pane menu of a recipe document in SolidOS 3.1, offering About, Under The Hood, the registered Types pane, and Open in New Tab](/img/panes-dev/pane-menu.png)

Chosen from the menu, it renders below the file explorer header:

![The Types pane rendering a recipe: "6 statements about this thing" and the class schema:Recipe](/img/panes-dev/types-pane.png)

## Fields

The TypeScript type is `PaneDefinition`, exported by [pane-registry](../libraries/pane-registry.md).

| Field | Required | What SolidOS 3.1 does with it |
|---|---|---|
| `name` | yes | The pane's identifier. `byName(name)` finds it, the pane menu uses it as the item key, and the history entry records it (see [Navigation](./navigation.md)). `register` skips a pane without one. |
| `icon` | yes | URL of an image, shown in the pane menu and the file explorer header. solid-ui's pane menu also accepts a function `(subject, context)` that returns the URL. |
| `label(subject, context)` | yes | Returns a string to say the pane can show `subject`, or `null` (any falsy value) to say it cannot. The string is the pane menu item's text. `register` skips a pane without one. |
| `render(subject, context, options?)` | yes | Builds the view and returns one `HTMLElement`. See [Rendering](#rendering). |
| `shouldGetFocus(subject)` | no | Asked only of panes whose `label` accepted the subject. The first one, in registry order, that returns `true` becomes the view shown, instead of the first relevant pane. Built in, the source pane uses it to open first for `.js`, `.cjs` and `.mjs` files. |
| `audience` | no | An array of role classes (`NamedNode`), such as `solid:PowerUser` or `solid:Developer` from `http://www.w3.org/ns/solid/terms#`. The pane is offered only to users whose preferences include every role listed. The most relevant pane is kept even when its audience does not match. |
| `global` | no | `true` for a pane that is not about one resource, such as `home` and `trustedApplications`. Global panes are never offered for a subject. |
| `mintClass` | no | The RDF class (`NamedNode`) of the things this pane creates. Used to name the pane in "new" menus. A resource whose document says `ui:mintClass` with this class opens in this pane first. |
| `mintNew(context, options)` | no | Creates a new instance. Panes with `mintNew` are offered in the folder pane's and solid-ui's create menus. It returns a promise of the options with `newInstance` set. |
| `predicates` | no | A map from predicate URI to a number, copied into the registry's `paneForPredicate` index. |
| `classes` | no | A map from class URI to a number. Declared in the type; nothing in 3.1 reads it. |
| `requireQueryButton` | no | When the pane is opened in place, the page's `#queryButton` is shown for it and hidden otherwise. `register(pane, requireQueryButton)` sets this field from its second argument, overwriting any value on the object. |

The outliner also reads one field the type does not declare: a pane with `managesUpdates: true`, shown again for the same subject without a refresh, keeps its rendered element instead of being rendered again. Set it only if the pane keeps its own DOM up to date.

## The context

`label` and `render` receive the same `context`, of type `DataBrowserContext`. A pane takes everything it needs from it, rather than importing SolidOS packages.

| Property | What it is |
|---|---|
| `context.dom` | The `Document` to create elements in. |
| `context.session.store` | The shared rdflib store (`LiveStore`). Every pane, the outline and solid-logic read and write the same store. It has `fetcher` (loading) and `updater` (writing). |
| `context.session.logic` | The solid-logic object: `authn`, `acl`, `resource`, `profile`, `inbox`, `typeIndex`, `chat`, `directory`, `load`, `updatePromise`, `clearStore`. See [solid-logic](../libraries/solid-logic.md). |
| `context.session.paneRegistry` | The registry: `list`, `byName`, `register`, `paneForIcon`, `paneForPredicate`. |
| `context.getOutliner(dom)` | Returns the page's outline manager, for [navigation](./navigation.md). |
| `context.environment` | The render environment, described below. Optional in the type; set by mashlib. |

`context.environment` is a `RenderEnvironment`:

| Property | Values |
|---|---|
| `layout` | `'desktop'` or `'mobile'` |
| `layoutPreference` | `'desktop'`, `'mobile'` or `'auto'` |
| `inputMode` | `'touch'` or `'pointer'` |
| `theme` | `'light'` or `'dark'` |
| `viewport` | `{ width, height }` in CSS pixels |

On the page started by `panes.runDataBrowser()`, a change of layout or theme renders the pane on show again, with the new environment. Read `context.environment` in `render` each time; do not keep it.

## Choosing a pane

For each subject shown, SolidOS 3.1 asks every registered pane's `label` in registration order. The panes that accept it are offered in the pane menu, and one of them is shown:

1. A pane whose `mintClass` matches the subject's `ui:mintClass`.
2. Otherwise the first pane whose `shouldGetFocus(subject)` returns `true`.
3. Otherwise the first pane that accepted the subject.

Registration order is the priority: built-in panes are registered most specific first, and `panes.register` adds a pane after all of them. A pane added at run time is therefore offered in the menu, and is shown first only when it asks with `shouldGetFocus`. [Panes overview](./overview.md#how-a-pane-is-chosen) has the details, including the `audience` filter.

`label` is called often: for every pane, on every view, and again to build the menu. It must return quickly and must not fetch. By the time it is called, the subject's document has been loaded into the store (for a folder, its listing too).

## Rendering

`render(subject, context, options)` returns one element. SolidOS then:

- adds the class `paneDiv` to it and puts it inside a `<solid-ui-file-explorer-provider>` element in `#OutlineView`. It is an ordinary child in the page's DOM, not inside a shadow root, so page styles reach it;
- shows the file explorer header above it for most resources, with the pane's icon and the pane menu;
- if `render` throws, shows the stack trace in an element with the class `exceptionPane` instead.

The third argument holds the outliner's options for this view (for example `solo` and `folderView`). Most panes ignore it.

`render` is synchronous. To show data that is not in the store yet, return the element at once and fill it in when the data arrives. This pane, for a WebID, loads each of the person's storages and counts what the top of it lists:

```javascript title="storage-pane.js"
// storage-pane.js: for a WebID, how many things the top of each of its storages lists.
const PIM_STORAGE = 'http://www.w3.org/ns/pim/space#storage'
const LDP_CONTAINS = 'http://www.w3.org/ns/ldp#contains'

export default {
  name: 'storage-count',
  icon: new URL('storage.svg', import.meta.url).href,

  label (subject, context) {
    const store = context.session.store
    return store.any(subject, store.sym(PIM_STORAGE)) ? 'Storage' : null
  },

  render (subject, context) {
    const { dom } = context
    const store = context.session.store
    const list = dom.createElement('ul')

    for (const storage of store.each(subject, store.sym(PIM_STORAGE))) {
      const item = dom.createElement('li')
      item.textContent = storage.value + ': loading…'
      list.appendChild(item)
      // render() must return at once: fetch afterwards, then fill in the element.
      store.fetcher.load(storage).then(() => {
        const count = store.each(storage, store.sym(LDP_CONTAINS), null, storage).length
        item.textContent = `${storage.value}: ${count} items`
      }, err => {
        item.textContent = `${storage.value}: could not be read (${err.status || err.message})`
      })
    }
    return list
  }
}
```

A failed `fetcher.load` rejects with an `Error` whose `status` is the HTTP status, for example 401 for a storage that is not public.

There is no teardown call. When the user moves on, the element is removed from the page. Do not leave timers or listeners on `document` running after that.

## Registering

```javascript
panes.register(pane)
```

`register` comes from pane-registry and is re-exported by solid-panes; on a page running mashlib it is `window.panes.register`. It:

- logs `registering pane: <name>` and appends the pane to `panes.list`;
- skips a pane without `name` or `label` (with a console message);
- indexes the pane by `icon` in `paneForIcon` and by each `predicates` key in `paneForPredicate`;
- sets `pane.requireQueryButton` from its second argument.

There is no `unregister`. Registering a second pane under a name already used does not replace the first: both are in `panes.list`, and `byName` returns the earlier one. Pane loaders check the name before registering; see [Dynamic Panes](./dynamic-panes.md).

The built-in panes are registered by solid-panes itself, in [`src/registerPanes.js`](https://github.com/SolidOS/solid-panes/blob/main/src/registerPanes.js), when the module is first imported.

## Types

In TypeScript, take the types from pane-registry:

```typescript
import type { PaneDefinition, DataBrowserContext, RenderEnvironment } from 'pane-registry'
```

## See also

- [Creating Panes](./creating-panes.md): a pane built step by step, with writing, testing and publishing
- [Your First Pane](../getting-started/your-first-pane.md): the shortest path to a working pane
- [Dynamic Panes](./dynamic-panes.md): loading a pane module at run time
- [Navigation](./navigation.md): `GotoSubject` and the `solid-panes:navigated` event
- [solid-panes](../libraries/solid-panes.md): the library that runs panes
