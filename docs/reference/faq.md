---
sidebar_position: 2
title: FAQ
description: Frequently asked questions about SolidOS
---

# Frequently Asked Questions

Common questions about SolidOS development.

## General

### What is SolidOS?

SolidOS (formerly known as "the data browser" or "mashlib") is a modular operating system for the web that lets you browse, view, and edit Solid pod data. It's built on a pane system where each pane is responsible for rendering specific types of RDF data.

### What's the relationship between SolidOS, mashlib, and solid-panes?

- **mashlib** — The bundled distribution that includes everything
- **solid-panes** — The pane registry and built-in panes
- **solid-ui** — Reusable UI components
- **solid-logic** — Business logic (auth, ACL, utilities)
- **rdflib.js** — The RDF foundation

mashlib bundles all of these together into a single deployable package.

### Is SolidOS the same as a Solid server?

No. SolidOS is a **client-side** application that connects to Solid servers. Solid servers (like CSS or NSS) store and serve the data. SolidOS provides the UI to browse and edit that data.

### Can I use SolidOS with any Solid server?

Yes. SolidOS works with any Solid-compliant server:
- Community Solid Server (CSS)
- Node Solid Server (NSS)
- Enterprise Solid Server (ESS)
- Any other Solid Protocol implementation

## Development

### How do I create a custom pane?

1. Create a pane object with `name`, `label`, and `render` properties
2. Register it with `paneRegistry.register(myPane)`
3. The pane will be considered when rendering resources

See [Creating Panes](/docs/panes/creating-panes) for a complete guide.

### Do I need to use TypeScript?

No, but it's recommended. All SolidOS libraries include TypeScript definitions, which provide better IDE support and catch errors early. You can use plain JavaScript if you prefer.

### Can I use React/Vue/Angular with SolidOS?

SolidOS panes use vanilla DOM manipulation, but you can:

1. **Embed SolidOS in a framework app** — Load mashlib and render into a container
2. **Use rdflib.js directly** — Build your own UI with any framework
3. **Create hybrid panes** — Render framework components inside pane containers

```jsx
// Example: React component using rdflib
function Profile({ webId }) {
  const [name, setName] = useState(null)

  useEffect(() => {
    async function load() {
      await store.fetcher.load(sym(webId).doc())
      setName(store.any(sym(webId), FOAF('name'))?.value)
    }
    load()
  }, [webId])

  return <h1>{name}</h1>
}
```

### How do I style my pane?

Options:
1. Inline styles in JavaScript
2. Create a `<style>` element in your render function
3. Use solid-ui's `UI.style.styleElement()`
4. Add a CSS file and include it in the build

### How do I test my pane?

```javascript
import { graph } from 'rdflib'
import myPane from './myPane'

test('pane claims correct type', () => {
  const store = graph()
  // Add test data to store
  const label = myPane.label(subject, { store })
  expect(label).toBe('Expected Label')
})
```

## Data & RDF

### What RDF format should I use?

- **Turtle (.ttl)** — Most human-readable, recommended for most use cases
- **JSON-LD (.jsonld)** — Good for JavaScript integration
- **N-Triples** — Simplest format, good for streaming
- **RDF/XML** — Legacy, avoid unless required

### How do I choose predicates?

1. Use existing vocabularies when possible (FOAF, vCard, Schema.org)
2. Check [Linked Open Vocabularies](https://lov.linkeddata.es/)
3. Create custom predicates under your domain if needed:
   ```turtle
   @prefix myapp: <https://myapp.example/vocab#> .
   ```

### What's the difference between sym() and lit()?

- `sym(uri)` — Creates a NamedNode (a URI reference)
- `lit(value)` — Creates a Literal (a string value)
- `lit(value, 'en')` — Literal with language tag
- `lit(value, null, datatype)` — Literal with datatype

```javascript
sym('https://alice.example/#me')  // URI
lit('Alice')                       // String
lit('30', null, XSD('integer'))   // Typed literal
```

### How do I handle blank nodes?

Blank nodes are anonymous resources:

```javascript
import { blankNode, st } from 'rdflib'

const address = blankNode()
store.add(person, VCARD('hasAddress'), address, doc)
store.add(address, VCARD('locality'), lit('Paris'), doc)
```

Note: Blank node IDs are not stable across loads.

## Authentication

### How does login work?

SolidOS uses Solid-OIDC:
1. User clicks login
2. Browser redirects to identity provider
3. User authenticates
4. Redirected back with tokens
5. Tokens stored in session

### Can I use my own identity provider?

Yes, any Solid-OIDC compliant identity provider works. Users can specify their provider URI.

### How long do sessions last?

Depends on the identity provider configuration. Typically 24 hours, but can be refreshed.

## Deployment

### How do I deploy SolidOS?

Options:
1. **Static hosting** — Serve mashlib.js from any static host
2. **Embedded in Solid server** — NSS/CSS can serve SolidOS
3. **Desktop app** — Use Data Kitchen (Electron wrapper)

See [Deployment](/docs/reference/deployment) for details.

### What browsers are supported?

Modern browsers with ES6 support:
- Chrome/Edge 80+
- Firefox 75+
- Safari 13+

IE11 is not supported.

### Can I use SolidOS offline?

Limited. The core app works, but data access requires network connectivity to the Solid server.

## Troubleshooting

### Why is my pane not showing?

1. Check it's registered: `console.log(paneRegistry.byName('my-pane'))`
2. Verify the label function returns a string (not null)
3. Check the resource has the expected RDF type

### Why can't I save changes?

1. Check you're logged in: `authn.currentUser()`
2. Verify write access: `solidLogicSingleton.checkAccess(uri, 'Write')`
3. Check for CORS issues in browser console

### Why is data not loading?

1. Check the URI is correct
2. Verify network connectivity
3. Check authentication status
4. Look for CORS errors in console

## Contributing

### How do I contribute to SolidOS?

1. Fork the [solidos monorepo](https://github.com/SolidOS/solidos)
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [Contributing](/docs/reference/contributing) for the full guide.

### Where do I report bugs?

[SolidOS GitHub Issues](https://github.com/SolidOS/solidos/issues)

### How do I get help?

- [Solid Forum](https://forum.solidproject.org/)
- [Matrix Chat](https://matrix.to/#/#solid_solidos:gitter.im)
- [GitHub Discussions](https://github.com/SolidOS/solidos/discussions)

## See Also

- [Troubleshooting](/docs/reference/troubleshooting) — specific error solutions
- [Contributing](/docs/reference/contributing) — contribution guide
- [Solid Project](https://solidproject.org/) — the Solid ecosystem
