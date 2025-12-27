---
sidebar_position: 2
title: Authentication
description: Login, logout, and session management
---

# Authentication

Patterns for handling user authentication in SolidOS.

## Basic Login/Logout

### Check Login Status

```javascript
import { authn } from 'solid-logic'

function checkAuth() {
  const user = authn.currentUser()

  if (user) {
    console.log(`Logged in as: ${user.uri}`)
    return user
  } else {
    console.log('Not logged in')
    return null
  }
}
```

### Login

```javascript
import { authn } from 'solid-logic'

async function login() {
  try {
    await authn.login()
    const user = authn.currentUser()
    console.log(`Logged in as: ${user.uri}`)
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

### Login with Specific Provider

```javascript
async function loginWithProvider(providerUrl) {
  await authn.login({
    provider: providerUrl
  })
}

// Usage
await loginWithProvider('https://solidcommunity.net')
await loginWithProvider('https://login.inrupt.com')
```

### Logout

```javascript
async function logout() {
  await authn.logout()
  console.log('Logged out')
}
```

## Session Events

### Listen for Login

```javascript
import { authn } from 'solid-logic'

authn.onLogin((webId) => {
  console.log(`User logged in: ${webId}`)

  // Update UI
  showLoggedInUI(webId)

  // Load user data
  loadUserProfile(webId)
})
```

### Listen for Logout

```javascript
authn.onLogout(() => {
  console.log('User logged out')

  // Update UI
  showLoggedOutUI()

  // Clear cached data
  clearUserData()
})
```

## Protected Operations

### Require Login Before Action

```javascript
async function requireAuth() {
  const user = authn.currentUser()
  if (!user) {
    await authn.login()
  }
  return authn.currentUser()
}

async function saveNote(content) {
  const user = await requireAuth()
  if (!user) {
    throw new Error('Login required')
  }

  // Proceed with save
  await createNote(user, content)
}
```

### Login Gate Component

```javascript
function createAuthGate(dom, onAuthenticated) {
  const container = dom.createElement('div')

  const user = authn.currentUser()
  if (user) {
    onAuthenticated(container, user)
  } else {
    const message = dom.createElement('p')
    message.textContent = 'Please log in to continue'
    container.appendChild(message)

    const loginBtn = UI.widgets.button(dom, 'Log In', async () => {
      await authn.login()
      const newUser = authn.currentUser()
      if (newUser) {
        container.innerHTML = ''
        onAuthenticated(container, newUser)
      }
    })
    container.appendChild(loginBtn)
  }

  return container
}

// Usage
const gate = createAuthGate(document, (container, user) => {
  container.textContent = `Welcome, ${user.uri}!`
})
```

## User Profile

### Load Profile Data

```javascript
import { store, sym } from 'solid-logic'

const FOAF = Namespace('http://xmlns.com/foaf/0.1/')
const VCARD = Namespace('http://www.w3.org/2006/vcard/ns#')

async function loadProfile(webId) {
  const person = sym(webId)
  await store.fetcher.load(person.doc())

  return {
    webId: webId,
    name: store.any(person, FOAF('name'), null, null)?.value ||
          store.any(person, VCARD('fn'), null, null)?.value,
    photo: store.any(person, FOAF('img'), null, null)?.uri,
    email: store.any(person, FOAF('mbox'), null, null)?.uri?.replace('mailto:', ''),
  }
}
```

### Get Pod Root

```javascript
import { profile } from 'solid-logic'

async function getPodRoot(webId) {
  const podRoot = await profile.getPodRoot(webId)
  return podRoot  // e.g., 'https://alice.example/'
}
```

### Get Inbox

```javascript
const LDP = Namespace('http://www.w3.org/ns/ldp#')

async function getInbox(webId) {
  const person = sym(webId)
  await store.fetcher.load(person.doc())

  const inbox = store.any(person, LDP('inbox'), null, null)
  return inbox?.uri
}
```

## Session Persistence

### Check Session on Page Load

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  // Check if there's a valid session
  const user = authn.currentUser()

  if (user) {
    // Session exists, update UI
    updateUIForUser(user)
  } else {
    // No session, show login UI
    showLoginUI()
  }
})
```

### Handle Session Expiry

```javascript
// Session can expire, handle gracefully
async function fetchWithAuth(uri) {
  try {
    await store.fetcher.load(uri)
  } catch (error) {
    if (error.status === 401) {
      // Session may have expired
      const user = authn.currentUser()
      if (!user) {
        // Need to re-login
        await authn.login()
        // Retry the request
        await store.fetcher.load(uri)
      }
    } else {
      throw error
    }
  }
}
```

## Multiple Users

### Display Current User

```javascript
function createUserBadge(dom) {
  const container = dom.createElement('div')
  container.className = 'user-badge'

  const user = authn.currentUser()
  if (user) {
    const avatar = UI.widgets.avatar(dom, user, { size: 32 })
    container.appendChild(avatar)

    loadProfile(user.uri).then(profile => {
      const name = dom.createElement('span')
      name.textContent = profile.name || 'User'
      container.appendChild(name)
    })
  }

  return container
}
```

### Switch Accounts

```javascript
async function switchAccount() {
  // Logout current user
  await authn.logout()

  // Login as different user
  await authn.login()
}
```

## Security Considerations

### Never Store Credentials

```javascript
// DON'T do this:
// localStorage.setItem('password', password)

// DO use Solid-OIDC through authn
await authn.login()
```

### Validate User Input

```javascript
function isValidWebId(uri) {
  try {
    const url = new URL(uri)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}
```

## See Also

- [solid-logic](/docs/libraries/solid-logic) — authn module
- [Access Control](/docs/cookbook/access-control) — permissions
- [Solid-OIDC](https://solidproject.org/TR/oidc) — specification
