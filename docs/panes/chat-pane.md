---
sidebar_position: 5
title: Chat Pane
description: Real-time messaging
---

# Chat Pane

The chat pane renders `meeting:LongChat` resources — real-time messaging for Solid.

## What It Renders

- `meeting:LongChat` — Chat rooms
- Individual messages within chats

## Features

- Real-time messaging
- Message history
- Participant list
- Read receipts
- Reply threading
- File attachments
- Emoji support
- Message editing
- Message deletion

## Screenshot

```
┌─────────────────────────────────────────────────┐
│ 💬 Project Discussion                           │
│ Alice, Bob, Carol                               │
├─────────────────────────────────────────────────┤
│ Alice (10:30 AM)                                │
│ Hey everyone, ready for the meeting?            │
│                                                 │
│ Bob (10:31 AM)                                  │
│ Yes! I've uploaded the documents                │
│ 📎 project-plan.pdf                             │
│                                                 │
│ Carol (10:32 AM)                                │
│ Looking at them now 👍                          │
├─────────────────────────────────────────────────┤
│ [Type a message...                    ] [Send]  │
└─────────────────────────────────────────────────┘
```

## RDF Structure

### Chat Container

```turtle
@prefix meeting: <http://www.w3.org/ns/pim/meeting#> .
@prefix dct: <http://purl.org/dc/terms/> .

<#this>
    a meeting:LongChat ;
    dct:title "Project Discussion" ;
    dct:created "2024-01-15T10:00:00Z"^^xsd:dateTime ;
    meeting:participation [
        a meeting:Participation ;
        meeting:participant <https://alice.example/profile/card#me>
    ], [
        a meeting:Participation ;
        meeting:participant <https://bob.example/profile/card#me>
    ] .
```

### Individual Messages

Messages are stored in date-organized files:

```turtle
# In chat/2024/01/15/chat.ttl

@prefix sioc: <http://rdfs.org/sioc/ns#> .
@prefix dct: <http://purl.org/dc/terms/> .

<#msg1>
    a sioc:Post ;
    sioc:content "Hey everyone, ready for the meeting?" ;
    dct:created "2024-01-15T10:30:00Z"^^xsd:dateTime ;
    sioc:has_creator <https://alice.example/profile/card#me> .

<#msg2>
    a sioc:Post ;
    sioc:content "Yes! I've uploaded the documents" ;
    dct:created "2024-01-15T10:31:00Z"^^xsd:dateTime ;
    sioc:has_creator <https://bob.example/profile/card#me> ;
    sioc:attachment <project-plan.pdf> .
```

## Usage

```javascript
// Navigate to a chat
panes.runDataBrowser(document, sym('https://alice.example/chats/project/index.ttl#this'))

// Get the pane directly
const chatPane = paneRegistry.byName('chat')
```

## Creating a Chat

### Programmatically

```javascript
import { store, sym, lit, st } from 'solid-logic'

const MEETING = Namespace('http://www.w3.org/ns/pim/meeting#')
const DCT = Namespace('http://purl.org/dc/terms/')

async function createChat(containerUri, title) {
  const chatIndex = sym(`${containerUri}index.ttl`)
  const chat = sym(`${containerUri}index.ttl#this`)

  const statements = [
    st(chat, RDF('type'), MEETING('LongChat'), chatIndex),
    st(chat, DCT('title'), lit(title), chatIndex),
    st(chat, DCT('created'), lit(new Date().toISOString(), null,
      sym('http://www.w3.org/2001/XMLSchema#dateTime')), chatIndex)
  ]

  await store.updater.update([], statements)
  return chat
}
```

### Via UI

1. Navigate to a container
2. Click "New Chat"
3. Enter chat name
4. Add participants
5. Click "Create"

## Sending Messages

```javascript
const SIOC = Namespace('http://rdfs.org/sioc/ns#')
const DCT = Namespace('http://purl.org/dc/terms/')

async function sendMessage(chatUri, content) {
  const now = new Date()
  const dateFolder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`

  const messageDoc = sym(`${chatUri.doc().dir().uri}${dateFolder}/chat.ttl`)
  const messageId = sym(`${messageDoc.uri}#${Date.now()}`)

  const statements = [
    st(messageId, RDF('type'), SIOC('Post'), messageDoc),
    st(messageId, SIOC('content'), lit(content), messageDoc),
    st(messageId, DCT('created'), lit(now.toISOString(), null,
      sym('http://www.w3.org/2001/XMLSchema#dateTime')), messageDoc),
    st(messageId, SIOC('has_creator'), authn.currentUser(), messageDoc)
  ]

  await store.updater.update([], statements)
}
```

## Real-Time Updates

The chat pane uses WebSockets for real-time updates:

```javascript
// Subscribe to changes
store.updater.addDownstreamChangeListener(chatUri.doc(), () => {
  // Reload and re-render
  refreshMessages()
})
```

### Solid Notifications

For Solid servers supporting notifications:

```javascript
// Subscribe via WebSocket
const socket = new WebSocket('wss://alice.example/')
socket.onopen = () => {
  socket.send(`sub ${chatUri.doc().uri}`)
}
socket.onmessage = (event) => {
  if (event.data.startsWith('pub')) {
    // Document changed, reload
    store.fetcher.refresh(chatUri.doc())
  }
}
```

## Attachments

### Uploading Files

```javascript
async function attachFile(chatUri, file) {
  const attachmentUri = sym(`${chatUri.doc().dir().uri}attachments/${file.name}`)

  // Upload the file
  await store.fetcher.putResourceAs(attachmentUri, file, file.type)

  // Reference in message
  const messageId = /* ... create message ... */
  await store.updater.update([], [
    st(messageId, SIOC('attachment'), attachmentUri, messageDoc)
  ])
}
```

### Displaying Attachments

```javascript
const attachments = store.each(message, SIOC('attachment'), null, null)
attachments.forEach(attachment => {
  const link = document.createElement('a')
  link.href = attachment.uri
  link.textContent = attachment.uri.split('/').pop()
  container.appendChild(link)
})
```

## Participants

### Adding Participants

```javascript
async function addParticipant(chatUri, webId) {
  const participation = blankNode()

  await store.updater.update([], [
    st(chatUri, MEETING('participation'), participation, chatUri.doc()),
    st(participation, RDF('type'), MEETING('Participation'), chatUri.doc()),
    st(participation, MEETING('participant'), sym(webId), chatUri.doc())
  ])
}
```

### Listing Participants

```javascript
function getParticipants(chatUri) {
  const participations = store.each(chatUri, MEETING('participation'), null, null)
  return participations.map(p =>
    store.any(p, MEETING('participant'), null, null)
  ).filter(Boolean)
}
```

## Access Control

Chats typically use these permissions:

```turtle
# chat/.acl
@prefix acl: <http://www.w3.org/ns/auth/acl#> .

<#owner>
    a acl:Authorization ;
    acl:agent <https://alice.example/profile/card#me> ;
    acl:accessTo <./> ;
    acl:default <./> ;
    acl:mode acl:Read, acl:Write, acl:Control .

<#participants>
    a acl:Authorization ;
    acl:agent <https://bob.example/profile/card#me> ;
    acl:agent <https://carol.example/profile/card#me> ;
    acl:accessTo <./> ;
    acl:default <./> ;
    acl:mode acl:Read, acl:Append .
```

## Type Index Integration

Register chats in the Type Index:

```turtle
<#chats>
    a solid:TypeRegistration ;
    solid:forClass meeting:LongChat ;
    solid:instanceContainer </chats/> .
```

## Source

- [chatPane.js in solid-panes](https://github.com/SolidOS/solid-panes/tree/main/src/chat)

## See Also

- [Meeting Ontology](http://www.w3.org/ns/pim/meeting#) — RDF vocabulary
- [SIOC Ontology](http://rdfs.org/sioc/spec/) — for posts
- [Solid Notifications](https://solidproject.org/TR/notifications-protocol) — real-time updates
