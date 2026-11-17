---
sidebar_position: 3
title: solid-logic
description: The shared store, login session and pod logic used by SolidOS 3.1
---

# solid-logic

solid-logic holds the parts of SolidOS that are not user interface: the one shared RDF store, the login session, and helpers for profiles, type indexes, containers, files and access control. SolidOS 3.1 (mashlib 3.1.0) uses **solid-logic 6.2.0**.

In a page that loads mashlib, the whole module is the global `SolidLogic`. In a bundled project:

```bash
npm install solid-logic@6.2.0 rdflib@2.4.1
```

```js
import { store, authn, authSession, solidLogicSingleton } from 'solid-logic'
```

The code on this page was run in the SolidOS 3.1 data browser through the `SolidLogic`, `$rdf`, `UI` and `panes` globals. The blocks that write were run against a test pod while logged in. Replace `https://your.pod/...` with a folder you can write to.

## What it exports

The full list, from `dist/index.d.ts` of 6.2.0:

| Export | What it is |
|---|---|
| `store` | The shared rdflib `LiveStore`, with `fetcher` and `updater`. The same object as `solidLogicSingleton.store`. |
| `solidLogicSingleton` | The logic instance SolidOS uses: `store`, `authn`, `acl`, `resource`, `profile`, `inbox`, `typeIndex`, `chat`, `directory`, `load`, `updatePromise`, `clearStore`. |
| `authn` | Login state: `currentUser()`, `checkUser()`, `saveUser()`, `authSession`, `dispose()`. |
| `authSession` | The OpenID Connect session from `@uvdsl/solid-oidc-client-browser`, with a compatibility layer and an `events` emitter. |
| `getSuggestedIssuers()` | The identity providers offered in the login dialog. |
| `performServerSideLogout(options?)` | Ends the session at the identity provider and the server. |
| `reloadOnIdentityReplaced(events, reload?)` | Reloads the page when the logged-in identity is replaced. |
| `ACCESS_ROLES`, `PUBLIC_ACCESS_ROLES`, `WRITE_LOCKED_OWNER_ROLE` | Role names used by the sharing dialog. |
| `Public`, `Authenticated` | Access subjects for "everyone" and "any logged-in user". |
| `ACL_LINK` | The `acl` link relation as a NamedNode. |
| `classifyContainerAccessScope`, `analyzeContainerAccessScope`, `classifyAuthorizationScope`, `filterAuthorizationsByContainerScope` | Tell whether a grant on a folder covers the folder, its contents, or both. |
| `createTypeIndexLogic`, `createDirectoryLogic` | Factories for the type index and directory logic, for use with another store. |
| `DEFAULT_DIRECTORY_CATALOG_URL`, `DEFAULT_DIRECTORY_SOURCES` | Defaults for `directory.search`. |
| `UnauthorizedError`, `CrossOriginForbiddenError`, `SameOriginForbiddenError`, `NotFoundError`, `FetchError`, `NotEditableError`, `WebOperationError`, `ResourceUploadError` | Error classes. |
| `offlineTestID`, `appContext` | Test helpers used inside `currentUser()`. |

solid-logic does not export `authn.login()`, `authn.logout()`, `onLogin`, `checkAccess`, `sym`, `lit` or `ns`. Take `sym`, `lit` and `st` from rdflib (`$rdf`), and namespaces from `UI.ns`.

## The store

```js
const { store, solidLogicSingleton } = SolidLogic

store === solidLogicSingleton.store                                // true
store === panes.getOutliner(document).context.session.store         // true

const doc = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card')
await store.fetcher.load(doc)
```

Everything SolidOS shows is read into this store, so a pane and your own code see the same data. Reading and writing through rdflib is covered in [rdflib.js](./rdflib.md), [Reading data](../cookbook/reading-data.md) and [Writing data](../cookbook/writing-data.md).

`solidLogicSingleton` adds three helpers:

```js
const logic = SolidLogic.solidLogicSingleton
const doc = $rdf.sym('https://your.pod/public/notes.ttl')

await logic.load(doc)                         // fetch one document, or an array of them
const st = $rdf.st(doc, UI.ns.dct('title'), $rdf.lit('Notes'), doc)
await logic.updatePromise([], [st])           // (deletions, insertions), sent as a PATCH
logic.clearStore()                            // empty the store
```

## Login state

`authn` answers "who is logged in". `authSession` holds the session itself.

```js
const { authn, authSession } = SolidLogic

const me = await authn.checkUser()   // waits for the session to be restored; NamedNode or null
authn.currentUser()                  // the same answer, synchronously, once checkUser has run
authSession.webId                    // the WebID string, or undefined
authSession.isActive                 // true while logged in
authSession.info                     // { webId, isLoggedIn }
```

Log in by sending the browser to an identity provider. Both call forms work:

```js
await authSession.login('https://solidcommunity.net', window.location.href)
await authSession.login({ oidcIssuer: 'https://solidcommunity.net', redirectUrl: window.location.href })
```

Log out with `await authSession.logout()`. For authenticated requests outside rdflib, use `authSession.authFetch(url, init)`.

`authSession.events` is a small emitter with `on`, `off` and `emit`. Its events are `login`, `logout`, `sessionChange`, `sessionRestore` and `identityReplaced`. The session is also an `EventTarget` that fires `sessionStateChange`. When each one fires, the login dialog and a login button are covered in [Authentication](../cookbook/authentication.md).

`getSuggestedIssuers()` returns `{ name, uri }` pairs: Solid Community (`https://solidcommunity.net`), Solid Web (`https://solidweb.org`), Solid Web ME (`https://solidweb.me`) and Inrupt.com (`https://login.inrupt.com`). When the page is served from any other host, that host is added at the top of the list.

## Profile

```js
const logic = SolidLogic.solidLogicSingleton
const me = SolidLogic.authn.currentUser()

await logic.profile.loadProfile(me)        // NamedNode of the profile document
await logic.profile.loadMe()               // the logged-in user's WebID, after loading the profile
await logic.profile.loadPreferences(me)    // NamedNode of the preferences file (needs login)
logic.profile.getPodRoot(me)               // NamedNode of the storage root
logic.profile.findStorage(me)              // the profile's pim:storage, or null
await logic.profile.getMainInbox(me)       // NamedNode of the ldp:inbox
```

`silencedLoadPreferences(me)` works like `loadPreferences` but returns `undefined` instead of throwing.

## Type indexes

```js
const logic = SolidLogic.solidLogicSingleton
const me = SolidLogic.authn.currentUser()

const scopes = await logic.typeIndex.loadAllTypeIndexes(me)
// [{ label: 'public', index, agent }, { label: 'private', index, agent }, ...]

const publicIndex = scopes.find(s => s.label === 'public').index
const notes = $rdf.sym('https://your.pod/public/notes.ttl#this')
const klass = UI.ns.schema('NoteDigitalDocument')

await logic.typeIndex.registerInTypeIndex(notes, publicIndex, klass)
await logic.typeIndex.getScopedAppInstances(klass, me)  // [{ instance, type, scope }]
await logic.typeIndex.getAppInstances(klass)            // [NamedNode]
await logic.typeIndex.deleteTypeIndexRegistrationForResource(notes, me)
```

Also available: `loadTypeIndexesFor`, `loadCommunityTypeIndexes`, `getRegistrations`, `getScopedAppsFromIndex`, `suggestPublicTypeIndex`, `suggestPrivateTypeIndex` and `deleteTypeIndexRegistration`.

## Containers and files

`solidLogicSingleton.resource` is new in solid-logic 6. The 3.1 file explorer uses it.

```js
const logic = SolidLogic.solidLogicSingleton
const folder = 'https://your.pod/public/demo/'

await logic.resource.createContainer(folder)
const file = new File(['Hello'], 'hello.txt', { type: 'text/plain' })
const [result] = await logic.resource.uploadFiles([file], folder)
// { success: true, file, uploadedUri } or { success: false, file, error }

const { content, metadata } = await logic.resource.fetchContentAndMetadata($rdf.sym(folder + 'hello.txt'))

await SolidLogic.store.fetcher.load($rdf.sym(folder))
logic.resource.isContainer($rdf.sym(folder))            // true
logic.resource.getContainerMembers($rdf.sym(folder))    // [NamedNode]
logic.resource.getContainerMemberCount($rdf.sym(folder))

await logic.resource.recursiveDelete($rdf.sym(folder))  // the folder and everything in it
```

`fetchMetadata(subject)` reads the response headers and returns:

```js
{
  contentType: 'text/turtle',
  access: { canEdit: true, canManageAccess: true, isPublic: true, isPublicKnown: true },
  aclUri: 'https://your.pod/public/.acl',
  eTag: '"a07662ad..."',
  modified: '2026-11-17T20:50:52.036Z'
}
```

`fetchMetadataWithDelete` adds `access.canDelete`. The other helpers are `deleteResourceAndTypeIndexIfExists`, `getContainerIndexThing`, `containerHasIndexDocument`, `isStorageRoot` (true for the root of the origin, or for a container typed `pim:Storage`), `isHiddenFile`, `isMediaType`, `isImage`, `isAudio`, `isVideo` and `isWebId`. `getContainerMembers` and the `is…` checks read the store, so load the container first.

## Access control

`solidLogicSingleton.acl` reads and changes Web Access Control (WAC) documents. It is built on [`@dokieli/web-access-control`](https://github.com/dokieli/web-access-control). A change takes two steps: a `plan…` call works out the triples to add and remove, and `applyPlan` writes them as a PATCH.

```js
const acl = SolidLogic.solidLogicSingleton.acl
const doc = 'https://your.pod/public/demo/hello.txt'

const context = await acl.findEffectiveAcl(doc)
// { resource, defaultACLResource, effectiveACLResource, inherited, authorizations, dataset, ... }

const friend = { type: 'agent', iri: 'https://friend.example/profile/card#me' }
const plan = await acl.planGrant(doc, friend, acl.modesFromRole('Viewer'))
await acl.applyPlan(plan)                                   // a Response: 201 or 204

await acl.applyPlan(await acl.planRevoke(doc, friend))
await acl.applyPlan(await acl.planPublicRead(doc, false))   // stop public reading
await acl.resetToDefault(doc)                               // delete the resource's own ACL
```

The full set: `findAclDocUrl`, `findEffectiveAcl`, `findAccessGrants`, `classifyContainerScope`, `isProtectedResource`, `classifyAccessControlSubject`, `roleFromModes`, `modesFromRole`, `publicRoleFromModes`, `modesFromPublicRole`, `planGrant`, `planGrantContainer`, `planGrantContainerAndContents`, `planGrantContainerContents`, `planRevoke`, `planRevokeContainerContents`, `planPublicRead`, `resetToDefault`, `applyPlan`, and the older `setACLUserPublic` and `genACLText`. Recipes are in [Access control](../cookbook/access-control.md).

## Inbox, chat and directory

- `inbox`: `createInboxFor(peerWebId, nick)`, `getNewMessages(user?)`, `markAsRead(url, date)`.
- `chat`: `findChat`, `getChat`, `createChatThing`, `mintNew`, `sendInvite`, `setAcl`, `addToPrivateTypeIndex`. The chat pane uses these.
- `directory.search(options?)` finds people and groups for the sharing dialog. It looks in the user's contacts, friends and groups, and in the public [Solid catalog](https://github.com/solid/catalog).

```js
const results = await SolidLogic.solidLogicSingleton.directory.search({ query: 'tim' })
// [{ kind: 'person', uri, label, subjectType: 'agent', relationshipLabel, sources: ['catalog'] }, ...]
```

Its options are `query`, `sources` (any of `contacts`, `friends`, `catalog`, `groups`), `catalogUrl`, `user` and `maxFoafDistance`.

## Types

The TypeScript interfaces (`SolidLogic`, `AuthnLogic`, `AclLogic`, `ResourceLogic`, `ProfileLogic`, `TypeIndexLogic`, `InboxLogic`, `ChatLogic`, `DirectoryLogic`) are in `dist/types.d.ts` of the [published package](https://unpkg.com/browse/solid-logic@6.2.0/). A pane receives the same instance as `context.session.logic`.

## See also

- [solid-ui](./solid-ui.md): the login and sharing components built on this
- [pane-registry](./pane-registry.md): the context object a pane receives
- [Authentication](../cookbook/authentication.md) and [Access control](../cookbook/access-control.md)
- Source: [github.com/SolidOS/solid-logic](https://github.com/SolidOS/solid-logic)
