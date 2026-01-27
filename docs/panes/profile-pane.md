---
sidebar_position: 6
title: Profile Pane
description: WebID profile viewer and editor
---

# Profile Pane

The profile pane renders WebID profiles — the identity cards of the Solid ecosystem.

## What It Renders

- WebID profile documents
- `foaf:Person` resources
- `schema:Person` resources

## Features

- Avatar display
- Name and bio
- Contact information
- Social links
- Friends list (foaf:knows)
- Trusted apps
- Profile editing
- Public key management

## Screenshot

![Profile Pane Mockup](/img/panes/profile-pane-mockup.svg)

The QR code button (top-right) allows users to share their WebID by generating a scannable code — useful for in-person identity sharing.

## RDF Structure

A typical WebID profile:

```turtle
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix vcard: <http://www.w3.org/2006/vcard/ns#> .
@prefix solid: <http://www.w3.org/ns/solid/terms#> .
@prefix ldp: <http://www.w3.org/ns/ldp#> .
@prefix space: <http://www.w3.org/ns/pim/space#> .

<#me>
    a foaf:Person ;
    foaf:name "Alice Smith" ;
    foaf:nick "alice" ;
    foaf:img <photo.jpg> ;
    foaf:bio "Software developer passionate about decentralization." ;
    foaf:mbox <mailto:alice@example.org> ;
    foaf:homepage <https://alice.example> ;

    # Location
    vcard:hasAddress [
        vcard:locality "San Francisco" ;
        vcard:region "CA"
    ] ;

    # Friends
    foaf:knows
        <https://bob.example/profile/card#me>,
        <https://carol.example/profile/card#me> ;

    # Solid-specific
    solid:oidcIssuer <https://solidcommunity.net> ;
    solid:publicTypeIndex </settings/publicTypeIndex.ttl> ;
    solid:privateTypeIndex </settings/privateTypeIndex.ttl> ;
    space:preferencesFile </settings/prefs.ttl> ;
    space:storage </> ;
    ldp:inbox </inbox/> .
```

## Usage

```javascript
// Navigate to a profile
panes.runDataBrowser(document, sym('https://alice.example/profile/card#me'))

// Get the pane directly
const profilePane = paneRegistry.byName('profile')
```

## Reading Profile Data

```javascript
import { store, sym } from 'solid-logic'

const FOAF = Namespace('http://xmlns.com/foaf/0.1/')
const SOLID = Namespace('http://www.w3.org/ns/solid/terms#')

async function getProfile(webId) {
  const person = sym(webId)
  await store.fetcher.load(person.doc())

  return {
    name: store.any(person, FOAF('name'), null, null)?.value,
    nick: store.any(person, FOAF('nick'), null, null)?.value,
    photo: store.any(person, FOAF('img'), null, null)?.uri,
    bio: store.any(person, FOAF('bio'), null, null)?.value,
    email: store.any(person, FOAF('mbox'), null, null)?.uri?.replace('mailto:', ''),
    homepage: store.any(person, FOAF('homepage'), null, null)?.uri,
    storage: store.any(person, SPACE('storage'), null, null)?.uri,
    inbox: store.any(person, LDP('inbox'), null, null)?.uri,
  }
}
```

## Editing Profiles

```javascript
import { store, sym, lit, st } from 'solid-logic'

async function updateProfile(webId, updates) {
  const person = sym(webId)
  const doc = person.doc()

  const deletions = []
  const insertions = []

  // Update name
  if (updates.name !== undefined) {
    const oldName = store.any(person, FOAF('name'), null, doc)
    if (oldName) {
      deletions.push(st(person, FOAF('name'), oldName, doc))
    }
    if (updates.name) {
      insertions.push(st(person, FOAF('name'), lit(updates.name), doc))
    }
  }

  // Update bio
  if (updates.bio !== undefined) {
    const oldBio = store.any(person, FOAF('bio'), null, doc)
    if (oldBio) {
      deletions.push(st(person, FOAF('bio'), oldBio, doc))
    }
    if (updates.bio) {
      insertions.push(st(person, FOAF('bio'), lit(updates.bio), doc))
    }
  }

  await store.updater.update(deletions, insertions)
}
```

## Friends (foaf:knows)

### Listing Friends

```javascript
async function getFriends(webId) {
  const person = sym(webId)
  await store.fetcher.load(person.doc())

  const friends = store.each(person, FOAF('knows'), null, null)

  // Load friend profiles
  const friendProfiles = []
  for (const friend of friends) {
    try {
      await store.fetcher.load(friend.doc())
      friendProfiles.push({
        webId: friend.uri,
        name: store.any(friend, FOAF('name'), null, null)?.value,
        photo: store.any(friend, FOAF('img'), null, null)?.uri
      })
    } catch (e) {
      // Friend profile not accessible
      friendProfiles.push({ webId: friend.uri, name: null, photo: null })
    }
  }

  return friendProfiles
}
```

### Adding Friends

```javascript
async function addFriend(myWebId, friendWebId) {
  const me = sym(myWebId)
  const friend = sym(friendWebId)
  const doc = me.doc()

  await store.updater.update([], [
    st(me, FOAF('knows'), friend, doc)
  ])
}
```

### Removing Friends

```javascript
async function removeFriend(myWebId, friendWebId) {
  const me = sym(myWebId)
  const friend = sym(friendWebId)
  const doc = me.doc()

  await store.updater.update([
    st(me, FOAF('knows'), friend, doc)
  ], [])
}
```

## Profile Photo

### Uploading Photo

```javascript
async function uploadPhoto(webId, file) {
  const person = sym(webId)
  const photoUri = sym(`${person.doc().dir().uri}photo.${file.name.split('.').pop()}`)

  // Upload the image
  await store.fetcher.putResourceAs(photoUri, file, file.type)

  // Update profile
  const oldPhoto = store.any(person, FOAF('img'), null, person.doc())
  await store.updater.update(
    oldPhoto ? [st(person, FOAF('img'), oldPhoto, person.doc())] : [],
    [st(person, FOAF('img'), photoUri, person.doc())]
  )
}
```

## Solid-Specific Properties

### Storage

```javascript
// Get pod root
const storage = store.any(person, SPACE('storage'), null, null)
console.log('Pod root:', storage?.uri)  // https://alice.example/
```

### Inbox

```javascript
// Get inbox for notifications
const inbox = store.any(person, LDP('inbox'), null, null)
console.log('Inbox:', inbox?.uri)  // https://alice.example/inbox/
```

### Type Indexes

```javascript
// Get type indexes
const publicTypeIndex = store.any(person, SOLID('publicTypeIndex'), null, null)
const privateTypeIndex = store.any(person, SOLID('privateTypeIndex'), null, null)
```

### OIDC Issuer

```javascript
// Get identity provider
const issuer = store.any(person, SOLID('oidcIssuer'), null, null)
console.log('IDP:', issuer?.uri)  // https://solidcommunity.net
```

## Trusted Apps

Manage which apps have access:

```turtle
<#me>
    acl:trustedApp [
        acl:mode acl:Read, acl:Write ;
        acl:origin <https://trusted-app.example>
    ] .
```

```javascript
// List trusted apps
const trustedApps = store.each(person, ACL('trustedApp'), null, null)
trustedApps.forEach(app => {
  const origin = store.any(app, ACL('origin'), null, null)
  const modes = store.each(app, ACL('mode'), null, null)
  console.log(`${origin?.uri}: ${modes.map(m => m.uri).join(', ')}`)
})
```

## Source

- [profile/profilePane.js in solid-panes](https://github.com/SolidOS/solid-panes/tree/main/src/profile)

## See Also

- [WebID Specification](https://www.w3.org/2005/Incubator/webid/spec/identity/)
- [FOAF Vocabulary](http://xmlns.com/foaf/spec/)
- [Solid WebID Profile](https://solidproject.org/TR/protocol#webid-profile)
