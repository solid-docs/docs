---
sidebar_position: 2
title: FAQ
description: Frequently asked questions about developing with SolidOS 3.1
---

# Frequently Asked Questions

Questions developers ask about SolidOS 3.1 (mashlib 3.1.0).

## General

### What is SolidOS?

SolidOS is a data browser for Solid pods. Given the URL of any resource, it loads the data and shows it with the panes that can render that kind of data: a folder, a profile, an address book, a chat, and so on. Logged-in users can edit what they have access to.

### How do SolidOS, mashlib and solid-panes relate?

| Package | Role |
|---------|------|
| **mashlib** | The bundle that puts everything on one page and starts the data browser |
| **solid-panes** | The built-in panes, the outliner, the header and navigation |
| **pane-registry** | The list of registered panes, and the pane and context types |
| **solid-ui** | Web components, the theme, and the older DOM widgets |
| **solid-logic** | Login, access control, type indexes, profiles and resources |
| **rdflib.js** | The RDF store, fetcher and updater |

See the [libraries overview](../libraries/overview.md).

### Is SolidOS a Solid server?

No. SolidOS runs in the browser and talks to Solid servers over HTTP. Servers such as JSS, CSS and NSS store the data; some of them also serve SolidOS as their HTML view of a resource.

### Which Solid servers does it work with?

Any server that follows the Solid Protocol, including:

- JavaScript Solid Server (JSS), which can also serve SolidOS itself (`--mashlib-cdn`, `--mashlib`, `--mashlib-module`) and load extra panes (`--panes`)
- Community Solid Server (CSS)
- Node Solid Server (NSS)

JSS stores ACL documents only as JSON-LD; see [Troubleshooting](./troubleshooting.md#415-unsupported-media-type-when-changing-sharing).

### Where can I try it?

Open [mashlib.com](https://mashlib.com/), which runs the official mashlib 3.1.0 bundle, and enter the address of a pod, a folder or a profile.

## Development

### Do I need a build step?

No. To use SolidOS, load the mashlib bundle from a CDN with a `<script>` tag, or open [mashlib.com/dynamic/](https://mashlib.com/dynamic/), which serves the same data browser as plain ES modules. A pane can also be a single ES module that you load from a URL without building anything. You only need a build to work on the SolidOS libraries themselves; see [Contributing](./contributing.md).

### How do I add a pane without forking solid-panes?

Write one ES module whose default export is the pane:

```javascript
export default {
  name: 'hello',
  icon: 'https://example.org/hello.svg',
  label: (subject, context) => subject.uri.endsWith('.hello') ? 'Hello' : null,
  render: (subject, context) => {
    const div = context.dom.createElement('div')
    div.textContent = 'Hello from ' + subject.uri
    return div
  }
}
```

Then load it in one of three ways:

- On any page with mashlib: `panes.register((await import(url)).default)`.
- On a JSS server: `jss start --mashlib-cdn --conneg --panes <url>`. The server owner chooses the panes for every user.
- By link: `https://mashlib.com/dynamic/?pane=<url>&uri=<resource>`. The browser asks the user before it runs a pane from a site it has not allowed yet.

A pane runs with the logged-in user's session and can do whatever that user can. Load only panes you trust. See [Creating panes](../panes/creating-panes.md) and the [JSS dynamic panes guide](https://jss.live/docs/guides/dynamic-panes).

### Which pane is shown first?

SolidOS asks every registered pane for a `label(subject, context)`. The panes that return a string are offered, in registration order. The default is the pane matching the resource's `ui:mintClass`, otherwise the first offered pane whose `shouldGetFocus(subject)` returns true, otherwise the first offered pane. A pane you register yourself comes after the built-in ones.

### Do I need TypeScript?

No. Panes can be plain JavaScript. If you use TypeScript, pane-registry exports the types `PaneDefinition`, `DataBrowserContext` and `RenderEnvironment`.

### Can I use React, Vue or another framework?

Inside a pane, `render` must return an `HTMLElement`. Anything that can render into an element you create with `context.dom.createElement('div')` works there. solid-ui's own newer components are Lit web components, which you can use from any framework.

Outside SolidOS, you can use rdflib.js and solid-logic directly in any framework.

### How do I style my pane?

- Use the solid-ui theme variables (`--solid-ui-color-*` and the other tokens in `solid-ui/theme.css`) so your pane follows the light and dark themes.
- Add a `<style>` element or a stylesheet in your `render` function.
- Read `context.environment.theme` (`light` or `dark`) and `context.environment.layout` (`desktop` or `mobile`) if your pane needs to change more than colours.

See [Theming](./theming.md).

### How do I test a pane?

`label` and `render` take a context object, so you can call them with a context you build in a test:

```javascript
import * as $rdf from 'rdflib'
import pane from './myPane.js'

const store = $rdf.graph()
const subject = $rdf.sym('https://example.org/data.hello')
const context = { dom: document, session: { store } }

test('offers itself for .hello files', () => {
  expect(pane.label(subject, context)).toBe('Hello')
})
```

The test needs a DOM (for example jsdom) for `render`. Read data from `context.session.store` in your pane, not from an imported store, so a test can pass its own.

## Data and RDF

### Which RDF format should I use?

- **Turtle** (`.ttl`) for most data. Most Solid servers store it.
- **JSON-LD** when JavaScript code will read the file directly.
- **N-Triples** for simple line-by-line processing.
- **RDF/XML** only when something requires it.

### How do I choose predicates?

1. Use an existing vocabulary where one fits (FOAF, vCard, schema.org, Dublin Core).
2. Search [Linked Open Vocabularies](https://lov.linkeddata.es/).
3. Otherwise define your own terms under a URL you control.

### What is the difference between sym() and lit()?

Both come from rdflib (`$rdf` on a mashlib page).

- `$rdf.sym(uri)` makes a NamedNode: a URI.
- `$rdf.lit(value, lang?, datatype?)` makes a Literal: a string, number or date.

```javascript
$rdf.sym('https://alice.example/profile/card#me')
$rdf.lit('Alice')
$rdf.lit('30', undefined, $rdf.sym('http://www.w3.org/2001/XMLSchema#integer'))
```

### How do I handle blank nodes?

Use `$rdf.blankNode()`. Blank node identifiers change each time a document is loaded, so give anything you need to refer to again a URI, for example `<#address1>`.

## Authentication

### How does login work in 3.1?

The login button opens a dialog titled "Select an identity provider". The user picks or types a provider, and the browser redirects there to log in and back to the page. The client library is `@uvdsl/solid-oidc-client-browser`, used through `SolidLogic.authSession`.

In code:

```javascript
// Start a login (redirects away from the page)
await SolidLogic.authSession.login('https://solidcommunity.net', location.href)

// After the page loads again
const me = await SolidLogic.authn.checkUser()   // NamedNode or null

// React to changes
SolidLogic.authSession.events.on('login', () => console.log('logged in'))
SolidLogic.authSession.events.on('logout', () => console.log('logged out'))
```

`SolidLogic.getSuggestedIssuers()` returns the providers the dialog suggests. See [Authentication](../cookbook/authentication.md).

### Can I use my own identity provider?

Yes. Any Solid-OIDC provider works; the user types its URL in the login dialog.

## Deployment

### How do I deploy SolidOS?

- **mashlib.com**: nothing to deploy; link to `https://mashlib.com/` or `https://mashlib.com/dynamic/`.
- **Static hosting**: serve a page that loads a pinned mashlib bundle, for example from `https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/`.
- **From a Solid server**: JSS with `--mashlib-cdn`, `--mashlib` or `--mashlib-module <url>`.
- **Desktop**: [Data Kitchen](https://github.com/SolidOS/data-kitchen).

See [Deployment](./deployment.md).

### Can I use it offline?

The page can be served locally, but the data lives on Solid servers, so reading and writing needs the network.

## Troubleshooting

### Why is my pane not offered?

Check in the browser console:

```javascript
panes.byName('my-pane')                  // the pane, or null if it is not registered
panes.list.map(p => p.name)              // every registered pane, in order
```

Then check that `label(subject, context)` returns a string for the resource, and that the user's roles match the pane's `audience`, if it has one. More in [Troubleshooting](./troubleshooting.md#pane-not-offered).

### Why can't I save changes?

1. Check you are logged in: `SolidLogic.authn.currentUser()` returns your WebID, not `null`.
2. Check the document can be edited: once it is loaded, `SolidLogic.store.updater.editable(uri)` returns the patch method it will use, such as `'SPARQL'` or `'N3PATCH'`. `false` or `undefined` means SolidOS will not write to it.
3. Look for 401, 403 or CORS errors in the network panel.

### Why is data not loading?

1. Check the URI.
2. Look in the network panel for the response status and CORS errors.
3. Check whether the resource needs you to be logged in.

## Contributing

### How do I contribute?

Each library has its own repository under [github.com/SolidOS](https://github.com/SolidOS). Fork the one you want to change and open a pull request. See [Contributing](./contributing.md).

### Where do I report bugs?

In the issues of the repository the bug is in, for example [solid-panes](https://github.com/SolidOS/solid-panes/issues) or [mashlib](https://github.com/SolidOS/mashlib/issues). If you do not know which, use [SolidOS/solidos](https://github.com/SolidOS/solidos/issues).

### How do I get help?

- [Matrix chat](https://matrix.to/#/#solid_solidos:gitter.im)
- [Solid Forum](https://forum.solidproject.org/)
- [GitHub Discussions](https://github.com/SolidOS/solidos/discussions)

## See also

- [Troubleshooting](./troubleshooting.md)
- [Glossary](./glossary.md)
- [Contributing](./contributing.md)
