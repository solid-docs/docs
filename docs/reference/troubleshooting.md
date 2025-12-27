---
sidebar_position: 1
title: Troubleshooting
description: Common issues and solutions
---

# Troubleshooting

Solutions to common issues when developing with SolidOS.

## Build Issues

### "Cannot find module 'rdflib'"

**Problem:** Dependencies not properly installed.

**Solution:**
```bash
# In the monorepo
npm run setup

# Or in individual package
npm install
```

### "Type error: property X does not exist"

**Problem:** TypeScript definitions out of sync.

**Solution:**
```bash
# Rebuild types
npm run build

# Or specifically
npx tsc --build
```

### "Cannot resolve solid-logic"

**Problem:** Symlinks not set up correctly in monorepo.

**Solution:**
```bash
# Re-run lerna bootstrap
npx lerna bootstrap

# Or with npm workspaces
npm install
```

## Runtime Issues

### "panes is not defined"

**Problem:** mashlib not loaded before your script.

**Solution:**
```html
<!-- Ensure mashlib loads first -->
<script src="mashlib.min.js"></script>
<script>
  // Now panes is available
  document.addEventListener('DOMContentLoaded', () => {
    panes.runDataBrowser(document)
  })
</script>
```

### "Failed to fetch" / Network errors

**Problem:** CORS not configured on the Solid server.

**Solutions:**

1. Use a local development server:
```bash
npm install -g @solid/community-server
community-solid-server -p 3000
```

2. Check server CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, PUT, POST, DELETE, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
```

### "401 Unauthorized"

**Problem:** Not logged in, or session expired.

**Solution:**
```javascript
import { authn } from 'solid-logic'

// Check login status
const user = authn.currentUser()
if (!user) {
  await authn.login()
}
```

### "403 Forbidden"

**Problem:** No permission to access the resource.

**Solutions:**

1. Check you're accessing your own pod
2. Verify ACL permissions
3. Check if resource exists (might be 404 masquerading as 403)

```javascript
// Check access before operation
const canWrite = await solidLogicSingleton.checkAccess(uri, 'Write')
if (!canWrite) {
  console.log('No write access to', uri)
}
```

### "404 Not Found"

**Problem:** Resource doesn't exist.

**Solution:**
```javascript
try {
  await store.fetcher.load(uri)
} catch (error) {
  if (error.status === 404) {
    // Resource doesn't exist, create it
    await createResource(uri)
  }
}
```

### Store queries return null/empty

**Problem:** Document not loaded before querying.

**Solution:**
```javascript
// WRONG: query before load
const name = store.any(person, FOAF('name'))  // null

// CORRECT: load first
await store.fetcher.load(person.doc())
const name = store.any(person, FOAF('name'))  // "Alice"
```

## Authentication Issues

### "Login popup blocked"

**Problem:** Browser blocking popup for OIDC flow.

**Solutions:**

1. Trigger login from user action:
```javascript
button.onclick = () => authn.login()  // Works
```

2. Not from async code:
```javascript
// May be blocked
setTimeout(() => authn.login(), 1000)
```

### "Invalid redirect URI"

**Problem:** Your app's origin not registered with the identity provider.

**Solutions:**

1. For development, use localhost with the correct port
2. Register your app origin with the IDP
3. Check the provider's trusted app settings

### Session not persisting

**Problem:** Cookies or localStorage blocked.

**Solutions:**

1. Check browser privacy settings
2. Ensure same-origin or correct CORS
3. Check for third-party cookie blocking

## Pane Issues

### Pane not appearing

**Problem:** Pane not registered, or label returning null.

**Solutions:**

1. Check pane is registered:
```javascript
console.log(paneRegistry.byName('my-pane'))  // Should not be undefined
```

2. Check label function:
```javascript
const result = myPane.label(subject, context)
console.log('Label result:', result)  // Should be a string, not null
```

3. Verify resource type:
```javascript
console.log(store.each(subject, RDF('type'), null, null))
```

### Pane rendering blank

**Problem:** Render function not returning element, or data not loaded.

**Solutions:**

1. Ensure render returns an element:
```javascript
render: (subject, dom, context) => {
  const container = dom.createElement('div')
  // ... build UI ...
  return container  // MUST return element
}
```

2. Load data before rendering:
```javascript
render: async (subject, dom, context) => {
  await store.fetcher.load(subject.doc())  // Load first
  // ... query and render ...
}
```

### Styles not applying

**Problem:** CSS not loaded or scoped incorrectly.

**Solutions:**

1. Include mash.css:
```html
<link href="mash.css" rel="stylesheet">
```

2. Use solid-ui styling:
```javascript
UI.style.styleElement(element, 'button')
```

## Data Issues

### Updates not saving

**Problem:** UpdateManager not configured, or no write permission.

**Solutions:**

1. Check updater exists:
```javascript
console.log(store.updater)  // Should not be undefined
```

2. Verify write access:
```javascript
const canWrite = await solidLogicSingleton.checkAccess(uri, 'Write')
```

3. Check update response:
```javascript
try {
  await store.updater.update(dels, ins)
  console.log('Update successful')
} catch (error) {
  console.error('Update failed:', error.status, error.message)
}
```

### RDF parsing errors

**Problem:** Invalid Turtle or malformed data.

**Solution:**
```javascript
import { parse, graph } from 'rdflib'

try {
  const testStore = graph()
  parse(turtleString, testStore, baseUri, 'text/turtle')
} catch (error) {
  console.error('Parse error:', error.message)
}
```

### Blank nodes not matching

**Problem:** Blank nodes have different IDs across loads.

**Solution:** Use named nodes when you need to reference them:
```turtle
# Instead of blank node
<#me> foaf:knows [ foaf:name "Bob" ] .

# Use named node
<#me> foaf:knows <#bob> .
<#bob> foaf:name "Bob" .
```

## Performance Issues

### Slow loading

**Solutions:**

1. Load in parallel:
```javascript
await Promise.all(uris.map(uri => store.fetcher.load(sym(uri))))
```

2. Avoid loading same document twice:
```javascript
if (!store.fetcher.requested[uri]) {
  await store.fetcher.load(sym(uri))
}
```

3. Use `store.fetcher.nowOrWhenFetched` for conditional loads

### Memory issues with large stores

**Solutions:**

1. Clear unused data:
```javascript
store.removeMatches(null, null, null, oldDoc)
```

2. Don't load entire containers recursively

## Debugging Tips

### Enable debug logging

```javascript
// In browser console
localStorage.setItem('debug', 'solid:*')
```

### Inspect the store

```javascript
// All statements about a subject
console.log(store.statementsMatching(subject, null, null, null))

// All loaded documents
console.log(Object.keys(store.fetcher.requested))

// Current user
console.log(authn.currentUser())
```

### View raw response

```javascript
const response = await fetch(uri, {
  headers: { 'Accept': 'text/turtle' }
})
console.log(await response.text())
```

## See Also

- [FAQ](/docs/reference/faq) — frequently asked questions
- [SolidOS GitHub Issues](https://github.com/SolidOS/solidos/issues)
- [Solid Forum](https://forum.solidproject.org/)
