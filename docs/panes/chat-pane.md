---
sidebar_position: 5
title: Chat Pane
description: Chat channels, threads and messages stored on a pod
---

# Chat Pane

The chat pane shows a chat channel: its messages grouped by day, a box to write a new one, and buttons for participants, your other chats and the channel's preferences. Messages are stored on the pod, one document per day, and each message is signed by its author.

![The chat pane in SolidOS 3.1: three messages and the message box](/img/builtin-panes/chat-pane.png)

| | |
|---|---|
| Package | [chat-pane](https://github.com/SolidOS/chat-pane) 4.0.0 (unchanged for SolidOS 3.1) |
| Pane names | `long chat` (chat channels) and `chat` (older short chats) |
| Registered by | solid-panes 5.1.0, `long chat` first, after `tabbed` |
| Creates | chat channels (`mintClass` is `meeting:LongChat`) |

## When it applies

The package exports two panes.

`long chat` (`src/longChatPane.ts`). Its `label(subject, context)` returns:

| Condition | Label |
|---|---|
| subject is a `meeting:LongChat` | `Chat channnel` (spelled this way in the source) |
| subject is a `sioc:Thread` | `Thread` |
| subject has `sioc:content` and `dct:created` | `message` |
| anything else | `null` |

`chat` (`src/shortChatPane.ts`, audience Power User). Its `label` returns `Chat (n)` if the subject has `n` `wf:message` values, `Meeting chat` for a `meeting:Chat`, `IRC log` for a document containing a `foaf:ChatChannel`, and `null` otherwise. It is registered after `long chat`, so a chat channel opens in `long chat`.

## What you see

- **Messages** grouped under the day they were sent, each with its author, time and a tools button (edit your own message, bookmark, thumbs up or down, reply in a thread).
- **Message box** with a send button and a camera button for a photo. Enter sends; the preferences can make Shift-Enter send instead.
- **Participants** (people icon) and **your other chats** (chat icon) on the left, and **preferences** (wrench) on the right. The preferences are a form: color text by author, expand image links inline, newest first, inline image height, Shift-Enter sends, author and date on the left, show deleted messages.

The message area is solid-ui's `infiniteMessageArea`. It loads more days as you scroll and listens for changes to the current day's document with `store.updater.addDownstreamChangeListener`, so new messages from others appear without a reload.

## Data

A chat channel is a folder with an `index.ttl`, plus one `chat.ttl` per day in `YYYY/MM/DD/` folders. This is what the pane wrote on the test pod for the screenshot (`chat/`), as Turtle:

```turtle
# chat/index.ttl
@prefix meeting: <http://www.w3.org/ns/pim/meeting#> .
@prefix dc: <http://purl.org/dc/elements/1.1/> .
@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .
@prefix ical: <http://www.w3.org/2002/12/cal/ical#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<#this> a meeting:LongChat ;
    dc:title "Chat channel" ;
    dc:author </me/profile/card.jsonld#me> ;
    dc:created "2026-11-17T20:49:30Z"^^xsd:dateTime ;
    ui:sharedPreferences <#SharedPreferences> ;
    wf:participation <#id1794948680960> .

<#id1794948680960> wf:participant </me/profile/card.jsonld#me> ;
    ical:dtstart "2026-11-17T20:51:20Z"^^xsd:dateTime ;
    ui:backgroundColor "#c3f7f8" .
```

```turtle
# chat/2026/11/17/chat.ttl
@prefix sioc: <http://rdfs.org/sioc/ns#> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix sec: <https://w3id.org/security#> .
@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .

<../../../index.ttl#this> wf:message <#Msg1794948883604> .

<#Msg1794948883604>
    sioc:content "Hello team, the pane pages are moving to SolidOS 3.1." ;
    dct:created "2026-11-17T20:54:43Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
    foaf:maker </me/profile/card.jsonld#me> ;
    sec:proofValue "5cc296c0ec6e…" .
```

- `sec:proofValue` is the author's signature over the message. The signing code is solid-ui's `src/chat/signature.ts`, using `@noble/curves`.
- Editing a message adds a new message and links the old one to it with `dct:isReplacedBy`. Deleting adds a replacement with `schema:dateDeleted`.
- A thread is a `sioc:Thread`; the message it answers points to it with `sioc:has_reply`, and the thread lists its messages with `sioc:has_member`.

These writes are in solid-ui's `src/chat/chatLogic.js`.

`mintNew` also writes two ACL documents. In both, the creator has Read, Write and Control, and everyone can read. The folder's `.acl` lets any logged-in agent append (post messages); `index.ttl.acl` lets any logged-in agent write `index.ttl` (join as a participant).

## Source

- [github.com/SolidOS/chat-pane](https://github.com/SolidOS/chat-pane): `src/longChatPane.ts`, `src/shortChatPane.ts`
- The message area, message tools and signatures are in solid-ui, `src/chat/`.

## See also

- [Meeting Pane](./meeting-pane.md): a meeting can have a chat tab
- [SIOC Core Ontology](http://rdfs.org/sioc/spec/)
