---
sidebar_position: 1
title: Troubleshooting
description: Common problems with SolidOS 3.1 and how to fix them
---

# Troubleshooting

Common problems when running SolidOS 3.1 or writing panes for it. The console examples assume a page that loads mashlib, which defines the globals `panes`, `UI`, `SolidLogic`, `$rdf` and `mashlib`.

## Loading SolidOS

### "panes is not defined"

Your script ran before mashlib. Load mashlib first and start the data browser after the page has loaded:

```html
<script src="https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mashlib.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    panes.runDataBrowser()
  })
</script>
```

`runDataBrowser(uri?)` takes an optional URI or NamedNode to show. Without one, it shows the resource the page URL names.

### The view appears below the page, outside my layout

SolidOS 3.1 draws into the element with `id="OutlineView"`. If there is none, it creates one at the end of `#MainContent`, or of `<body>` when there is no `#MainContent`. Markup from 2.x such as `<table id="outline">` or `#PageBody > #main` is ignored. Use the structure of mashlib's `databrowser.html`:

```html
<solid-ui-provider>
  <main id="MainContent">
    <div id="OutlineView"></div>
  </main>
</solid-ui-provider>
```

### The account button or login does nothing

Components that need login state, such as `<solid-ui-account>`, must sit inside `<solid-ui-provider>`, and the provider must be registered before them. mashlib registers it for you; if you load solid-ui components yourself, import `solid-ui/components/provider` first.

### Which version is running?

```javascript
mashlib.versionInfo   // { buildTime, commit, npmInfo }; npmInfo.mashlib is the version
```

## Panes

### Pane not offered

1. Check that it is registered:

   ```javascript
   panes.byName('my-pane')        // the pane, or null
   panes.list.map(p => p.name)    // all registered panes, in order
   ```

   `panes.register` skips a pane with no `name` or no `label`, and only logs a line to the console.

2. Check that `label` returns a string for the resource:

   ```javascript
   const subject = $rdf.sym('https://example.org/data.ttl')
   const context = panes.getOutliner(document).context
   panes.byName('my-pane').label(subject, context)   // a string, not null
   ```

   `label` often depends on the resource's `rdf:type`. The document must be loaded for the type to be in the store: `await SolidLogic.store.fetcher.load(subject.doc())`.

3. Check `audience`. A pane with an `audience` is only offered to users whose preferences give them those roles (for example Power User or Developer), unless it is the first relevant pane.

4. Check `global`. A pane with `global: true` is never offered for a resource.

### Pane offered, but not shown first

The default pane is the one matching the resource's `ui:mintClass`, otherwise the first offered pane whose `shouldGetFocus(subject)` returns true, otherwise the first offered pane. Panes are tried in registration order, and a pane you register comes after the built-in ones. Add `shouldGetFocus` if your pane should be the default for some resources.

### Pane registered, but the view on show does not have it

Registering a pane does not redraw the view already on show. Show the resource again:

```javascript
const subject = $rdf.sym('https://example.org/data.ttl')
await panes.getOutliner(document).GotoSubject(subject, true, undefined, true)
```

### Pane loaded with JSS `--panes` is missing

- JSS lists unusable entries when it starts. A pane URL must be `http(s)` or an absolute path on the server.
- A pane that fails to load, or whose default export is not a pane, is skipped with a console warning.
- The page waits at most 5 seconds for the panes. A slower pane is registered when it arrives and is offered from the next view drawn.
- With `--mashlib-module`, panes are added once the module has put `panes.register` on the page. If it never does, the console shows one warning after 30 seconds.

See the [JSS dynamic panes guide](https://jss.live/docs/guides/dynamic-panes).

### Pane given with `?pane=` in the SolidOS Browser is missing

- The page asks before it runs panes from a site you have not allowed yet. If you did not allow it, the pane is not added.
- The module's default export must have `name`, `label` and `render`; otherwise the console shows "pane not added".
- At most 10 `pane` parameters are read, and a pane whose `name` is already registered is not added again.

### My changed pane still behaves like the old one

`panes.register` adds to the list each time it is called, and `panes.byName` returns the first pane with that name. Reload the page rather than registering the same name twice.

### Pane renders nothing

`render` must return an `HTMLElement` straight away. If you need to load data first, return a container and fill it when the data arrives:

```javascript
render: (subject, context) => {
  const div = context.dom.createElement('div')
  const store = context.session.store
  store.fetcher.load(subject.doc()).then(() => {
    div.textContent = store.any(subject, $rdf.sym('http://xmlns.com/foaf/0.1/name'))?.value ?? ''
  })
  return div
}
```

Read data through `context.session.store`, not a store you import yourself.

### Pane colours look wrong in the dark theme

Use the solid-ui theme variables (`--solid-ui-color-*`) instead of fixed colours, or read `context.environment.theme`. The theme is set by `data-theme="dark"` on `<html>` and changes fire a `mashlib:themechange` event. See [Theming](./theming.md).

## Login

### Login sends me away from the page

That is expected. In 3.1 the login dialog ("Select an identity provider") redirects to the provider and back; it does not use a popup. Start login from a user action, such as a button click:

```javascript
button.addEventListener('click', () => {
  SolidLogic.authSession.login('https://solidcommunity.net', location.href)
})
```

### I am logged out after the redirect back

After the page loads again, wait for the session before you read the user:

```javascript
const me = await SolidLogic.authn.checkUser()   // NamedNode or null
```

`SolidLogic.authn.currentUser()` can return `null` until `checkUser()` has finished. To react later, listen for `login`, `logout` or `sessionRestore` on `SolidLogic.authSession.events`.

### 401 Unauthorized

You are not logged in, or the session has ended. Check `SolidLogic.authn.currentUser()`, and log in again.

### 403 Forbidden

You are logged in but the resource's access rules do not give you that access. Check the resource's sharing settings, or ask its owner.

## Writing data

### Changes do not save

1. Check you are logged in: `SolidLogic.authn.currentUser()`.
2. Load the document, then check how rdflib would write it:

   ```javascript
   await SolidLogic.store.fetcher.load(uri)
   SolidLogic.store.updater.editable(uri)   // e.g. 'SPARQL' or 'N3PATCH'; false or undefined: not writable
   ```

3. Catch the error from the update to see the server's answer:

   ```javascript
   try {
     await SolidLogic.store.updater.update(deletions, insertions)
   } catch (error) {
     console.error(error)
   }
   ```

### 415 Unsupported Media Type when changing sharing

JSS stores ACL documents only as JSON-LD and answers a Turtle ACL write with 415. SolidOS 3.1 writes ACLs as Turtle, so with the mashlib 3.1.0 bundle a sharing change on a JSS pod gets a 415. The no-build data browser, which the [SolidOS Browser](https://solidos.org/docs/browser/) runs, retries such a write once as JSON-LD.

### Network errors on another server

If the data browser runs on one origin and the data is on another, the data server must allow cross-origin requests (CORS). Look for CORS errors in the browser console.

### Queries return nothing

Load the document before you query it:

```javascript
const person = $rdf.sym('https://alice.example/profile/card#me')
await SolidLogic.store.fetcher.load(person.doc())
SolidLogic.store.any(person, $rdf.sym('http://xmlns.com/foaf/0.1/name'))
```

### Blank nodes do not match

Blank node identifiers change each time a document is loaded. Give anything you need to refer to again a URI:

```turtle
# Instead of a blank node
<#me> foaf:knows [ foaf:name "Bob" ] .

# use a named node
<#me> foaf:knows <#bob> .
<#bob> foaf:name "Bob" .
```

## Developing the libraries

These apply to the [SolidOS/solidos](https://github.com/SolidOS/solidos) workspace; see [Contributing](./contributing.md).

### Wrong Node version

The workspace pins Node 22.22.0 in `.nvmrc` and its scripts switch version with nvm. Install nvm, then `nvm install` in the repository.

### A change in one library does not show up

The libraries depend on each other: a pane, then solid-panes, then mashlib. Each one has to be rebuilt for a change to reach the page. Run `npx lerna bootstrap --force-local` after an `npm install` in any workspace, or use `npm run watch-pivot` to rebuild them as you edit.

### Scripts fail on Windows

The npm scripts are bash scripts, so they need a bash environment.

## Inspecting data

```javascript
// Statements about a subject
SolidLogic.store.statementsMatching($rdf.sym(uri), undefined, undefined, undefined)

// The current user
SolidLogic.authn.currentUser()

// The raw response
const response = await fetch(uri, { headers: { Accept: 'text/turtle' } })
console.log(await response.text())
```

## See also

- [FAQ](./faq.md)
- [Solid Forum](https://forum.solidproject.org/)
- [SolidOS issues](https://github.com/SolidOS/solidos/issues)
