---
sidebar_position: 5
title: pane-registry
description: The list of panes, the pane contract and the context a pane receives
---

# pane-registry

pane-registry is the list every SolidOS pane is added to, and the TypeScript types that define what a pane is. SolidOS 3.1 (mashlib 3.1.0) uses **pane-registry 5.1.1**. The package is small: one JavaScript file (`src/paneRegistry.js`) and one type file (`src/index.d.ts`).

solid-panes re-exports its functions, so in a page that runs SolidOS they are on the `panes` global:

```js
panes.register(myPane)
panes.byName('profile')
panes.list            // every registered pane, in registration order
```

In a bundled project, `import { register, byName, list } from 'pane-registry'` gives the same functions. mashlib, solid-panes and solid-ui all depend on pane-registry 5.1.1, so there is one registry per page.

A pane also reaches the registry through its context: `context.session.paneRegistry`.

Writing a pane step by step is covered in [Your first pane](../getting-started/your-first-pane.md), [Creating panes](../panes/creating-panes.md) and [Pane anatomy](../panes/pane-anatomy.md). This page is the reference.

## Functions and lists

| Name | What it does |
|---|---|
| `register(pane, requireQueryButton?)` | Adds `pane` to `list`. Skips it, with a console message, if it has no `name` or no `label`. Sets `pane.requireQueryButton` to the second argument. Indexes the pane by `icon` in `paneForIcon`, and each key of `pane.predicates` in `paneForPredicate`. A pane is also stored on the registry object under its name, unless that name is already taken. |
| `byName(name)` | The first pane in `list` with that name, or `null` (with a console warning). |
| `list` | Array of all registered panes. Order matters: see [How a pane is chosen](#how-a-pane-is-chosen). |
| `paneForIcon` | Object from icon URL to pane. |
| `paneForPredicate` | Object from predicate URI to `{ pred, code }`. |

There is no unregister function.

## Registering a pane

This pane offers a "Hello" view for any WebID ending in `#me`. Paste it into the browser console on a page that runs SolidOS 3.1:

```js
const helloPane = {
  name: 'hello',
  icon: UI.icons.iconBase + 'noun_66617.svg',
  label: (subject, context) => subject.uri.endsWith('#me') ? 'Hello' : null,
  render: (subject, context) => {
    const div = context.dom.createElement('div')
    div.textContent = 'Hello, ' + subject.uri
    return div
  }
}

panes.register(helloPane)
panes.byName('hello') === helloPane                    // true
panes.paneForIcon[helloPane.icon] === helloPane        // true

// Show it now
const me = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')
await panes.getOutliner(document).GotoSubject(me, true, helloPane, true, undefined)
```

A pane registered this way lasts until the page is reloaded. To load a pane from a URL instead, see [Creating panes](../panes/creating-panes.md).

## PaneDefinition

From `src/index.d.ts`:

| Field | Type | Meaning |
|---|---|---|
| `name` | `string` | Required. Unique name, used by `byName`. |
| `icon` | `string` | Required. URL of the icon shown in the pane menu. |
| `label` | `(subject, context) => string \| null` | Required. Return `null` if the pane does not apply to `subject`, or a short label (used as the tooltip and menu text) if it does. Called for every pane on every navigation, so keep it fast and synchronous. |
| `render` | `(subject, context, options?) => HTMLElement` | Required. Build and return the pane's element. |
| `shouldGetFocus` | `(subject) => boolean` | Optional. Return `true` to be shown first among the panes that apply. |
| `global` | `boolean` | Optional. A global pane is left out of the per-resource pane list and renders its own application view. |
| `audience` | `NamedNode[]` | Optional. User roles the pane is meant for; see below. |
| `requireQueryButton` | `boolean` | Set by `register` from its second argument. Shows the outline's query button while the pane is open. |
| `mintClass` | `NamedNode` | Optional. The class of thing this pane can create. |
| `mintNew` | `(context, options) => Promise<...>` | Optional. Creates a new instance of `mintClass`; used by the "new" menus. |
| `predicates` | `{ [uri]: number }` | Optional. Predicates this pane claims. The default pane leaves out every predicate the internal pane lists here. |
| `classes` | `{ [uri]: number }` | Optional. Classes this pane claims. |

## The context a pane receives

```ts
type DataBrowserContext = {
  dom: HTMLDocument
  getOutliner: (dom: HTMLDocument) => unknown
  session: DataBrowserSession
  environment?: RenderEnvironment
}

type DataBrowserSession = {
  paneRegistry: PaneRegistry      // { list, paneForIcon, paneForPredicate, register, byName }
  store: LiveStore                // the shared rdflib store, same as SolidLogic.store
  logic: SolidLogic               // SolidLogic.solidLogicSingleton
}

interface RenderEnvironment {
  layout: 'desktop' | 'mobile'
  layoutPreference: 'desktop' | 'mobile' | 'auto'
  inputMode: 'touch' | 'pointer'
  theme: 'light' | 'dark'
  viewport: { width: number, height: number }
}
```

Use `context.dom` to create elements, and `context.session.store` and `context.session.logic` for data. `environment` is set when the page was started with `panes.runDataBrowser()`, which the standard data browser does. Read it with optional chaining (`context.environment?.layout`), because a page that renders panes another way may leave it out. How the environment changes, and how a pane is re-rendered when it does, is in [Theming](../reference/theming.md).

You can look at the live context from the console:

```js
const context = panes.getOutliner(document).context
Object.keys(context)          // ['dom', 'getOutliner', 'session', 'environment']
Object.keys(context.session)  // ['paneRegistry', 'store', 'logic']
```

## How a pane is chosen

When SolidOS shows a resource, solid-ui's `getRelevantPanes` and `getPreferredPane` decide which panes are offered and which is shown:

1. Every pane in `list` that is not `global` and whose `label(subject, context)` returns something other than `null` is relevant, kept in registration order.
2. Panes whose `audience` does not match the user's roles (from `UI.login.getUserRoles()`) are removed. The first relevant pane is kept even when its audience does not match.
3. If the resource names a `ui:mintClass`, the pane with that `mintClass` is shown.
4. Otherwise the first relevant pane whose `shouldGetFocus(subject)` returns `true` is shown, or else the first relevant pane.

Panes registered earlier win ties, and `registerPanes.js` in solid-panes registers the built-in panes in priority order. A pane you register later is offered in the menu, but is only shown first if `shouldGetFocus` returns `true` and no earlier pane's does. There is no priority number.

Both functions are on `UI`, so you can ask what SolidOS would do:

```js
const subject = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')
await SolidLogic.store.fetcher.load(subject.doc())
const context = panes.getOutliner(document).context
const relevant = await UI.getRelevantPanes(subject, context)
relevant.map(p => p.name)                                  // ['profile', 'social', 'source', 'internal']
UI.getPreferredPane(subject, context, relevant).name       // 'profile'
```

## See also

- [solid-panes](./solid-panes.md): the outline, `getOutliner`, `GotoSubject` and the built-in panes
- [Pane anatomy](../panes/pane-anatomy.md) and [Creating panes](../panes/creating-panes.md)
- [solid-logic](./solid-logic.md): what `context.session.logic` offers
- Source: [github.com/SolidOS/pane-registry](https://github.com/SolidOS/pane-registry), types in [src/index.d.ts](https://unpkg.com/pane-registry@5.1.1/src/index.d.ts)
