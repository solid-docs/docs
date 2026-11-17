---
sidebar_position: 2
title: Authentication
description: Logging in and out, and reacting to the session, in SolidOS 3.1
---

# Authentication

SolidOS 3.1 logs users in with Solid-OIDC through [`@uvdsl/solid-oidc-client-browser`](https://github.com/uvdsl/solid-oidc-client-browser), wrapped by solid-logic 6.2.0 as `authSession`. The header's `solid-ui-account` element shows Log In and Sign Up when logged out, and the user's picture with a menu when logged in.

Every snippet here was run in the SolidOS 3.1 data browser, where `SolidLogic`, `UI`, `$rdf` and `panes` are globals. In a bundled project, import the same names from `solid-logic` and `solid-ui`. The functions are listed in [solid-logic](../libraries/solid-logic.md#login-state).

## Who is logged in

```js
const me = await SolidLogic.authn.checkUser()   // NamedNode of the WebID, or null
```

`checkUser()` waits until the session has been restored or the return from the identity provider has been handled. After that, `authn.currentUser()` gives the same answer synchronously. The raw values are on the session:

```js
const { authSession } = SolidLogic
authSession.webId      // 'https://alice.example/profile/card#me', or undefined
authSession.isActive   // true or false
authSession.info       // { webId, isLoggedIn }
```

Inside a pane, use the logic from the context: `context.session.logic.authn.currentUser()`.

## Logging in

### With the login dialog

The Log In button in the header opens this dialog. The field offers the providers from `SolidLogic.getSuggestedIssuers()` and accepts any other provider URL. It starts with the provider used last time.

![The SolidOS 3.1 login dialog: "Select an identity provider", a "Solid Identity Provider" field, Cancel and Login](/img/libraries/login-modal.png)

Open the same dialog from code:

```js
UI.showDialog(customElements.get('solid-ui-login-modal'))
```

Or add a login button. It must be inside `solid-ui-provider`, which in the data browser wraps the whole page, so a pane can render one:

```js
const greetingPane = {
  name: 'greeting',
  icon: UI.icons.iconBase + 'noun_66617.svg',
  label: (subject) => subject.uri.endsWith('#me') ? 'Greeting' : null,
  render: (subject, context) => {
    const div = context.dom.createElement('div')
    const me = context.session.logic.authn.currentUser()
    if (me) {
      div.textContent = 'You are logged in as ' + me.uri
    } else {
      const button = context.dom.createElement('solid-ui-login-button')
      button.textContent = 'Log in to see your greeting'
      div.appendChild(button)
    }
    return div
  }
}
panes.register(greetingPane)
```

`solid-ui-logout-button` and `solid-ui-signup-button` work the same way. The [solid-ui](../libraries/solid-ui.md#account-and-login) page lists them with `solid-ui-account`, `solid-ui-avatar` and `solid-ui-guard`.

### Straight to a provider

To skip the dialog, send the browser to a provider yourself. Both forms are accepted:

```js
await SolidLogic.authSession.login('https://solidcommunity.net', window.location.href)
await SolidLogic.authSession.login({ oidcIssuer: 'https://solidcommunity.net', redirectUrl: window.location.href })
```

The second argument (or `redirectUrl`) is where the provider sends the user back to. The page then loads again, and `checkUser()` finishes the login. The dialog's own path also stores the provider in localStorage `loginIssuer` and clears cached access information from the store before it redirects.

The suggested providers are Solid Community (`https://solidcommunity.net`), Solid Web (`https://solidweb.org`), Solid Web ME (`https://solidweb.me`) and Inrupt.com (`https://login.inrupt.com`). On any other host, that host is offered first, so a pod server that serves SolidOS offers itself.

## Logging out

```js
await SolidLogic.authSession.logout()
```

SolidOS then refreshes the view, so the page shows what a logged-out visitor sees. When a provider was stored in `loginIssuer`, solid-ui also calls that provider's `end_session_endpoint` and the server's `/.well-known/solid/logout`.

`SolidLogic.performServerSideLogout({ issuer, postLogoutRedirectPath })` does those two server calls on its own, and goes to `postLogoutRedirectPath` (default `/`) if the server logout succeeds. It returns `true` when it navigated.

## Reacting to login and logout

`authSession.events` is an emitter with `on(event, handler)` and `off(event, handler)`:

```js
const { authSession, authn } = SolidLogic
authSession.events.on('login', () => console.log('logged in as', authn.currentUser()?.uri))
authSession.events.on('logout', () => console.log('logged out'))
```

| Event | When |
|---|---|
| `login` | The page has come back from the provider and the session is active |
| `logout` | The session went from active to inactive |
| `sessionChange` | Any other change of the active state or WebID |
| `sessionRestore` | A restore during `checkUser()` turned an inactive session into an active one |
| `identityReplaced` | The identity that was logged in is gone or replaced; data fetched under it should be dropped |

The session object is also an `EventTarget`. It fires `sessionStateChange` with `event.detail` = `{ isActive, webId }`:

```js
SolidLogic.authSession.addEventListener('sessionStateChange', e => console.log(e.detail))
```

What we saw in the 3.1 data browser against a local pod:

- Returning from the provider fired `sessionChange`, `sessionStateChange` and `login`.
- `logout()` fired `logout`, `identityReplaced` and `sessionStateChange`.
- Reloading a page while logged in fired none of them. Code that runs at start-up should call `await authn.checkUser()` rather than wait for an event.

`SolidLogic.reloadOnIdentityReplaced(authSession.events, reload?)` reloads the page (or calls your `reload` function) on `identityReplaced`. solid-ui's provider uses it so that a switch to another account in another tab does not leave the previous user's data on screen.

## Authenticated requests

The shared store's fetcher sends the session's credentials, so `SolidLogic.store.fetcher.load(...)`, the updater and the solid-logic helpers all act as the logged-in user. For a request outside rdflib, use the session's fetch:

```js
const response = await SolidLogic.authSession.authFetch('https://your.pod/private/notes.ttl')
```

The session's tokens are kept in the browser's IndexedDB (database `soidc`), so a reload restores the login without another trip to the provider.

## After login: the user's profile

```js
const logic = SolidLogic.solidLogicSingleton
const me = await SolidLogic.authn.checkUser()
if (me) {
  await logic.profile.loadProfile(me)
  const name = UI.utils.label(me)
  const podRoot = logic.profile.getPodRoot(me)
  const inbox = await logic.profile.getMainInbox(me)
}
```

More profile, preferences and type index helpers are in [solid-logic](../libraries/solid-logic.md#profile).

## See also

- [solid-logic](../libraries/solid-logic.md): `authn`, `authSession` and the rest of the API
- [solid-ui](../libraries/solid-ui.md): the login and account components
- [Access control](./access-control.md): what a logged-in user can share
