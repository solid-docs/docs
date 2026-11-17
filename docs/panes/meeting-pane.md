---
sidebar_position: 8
title: Meeting Pane
description: A meeting as a set of tabs - details, participants, chat, notes, polls, materials
---

# Meeting Pane

The meeting pane shows a meeting as a column of tabs on the left and the selected tab on the right. The first tab is the meeting's details form (name, location, start, end, comment, tab color). A green **+** under the tabs adds tools to the meeting: a group of people, a scheduling poll, a shared notepad, a chat, action items, a video call, materials, sharing, or a sub-meeting. Each tool becomes a tab.

![The meeting pane in SolidOS 3.1: the details tab of a meeting called Docs sprint](/img/builtin-panes/meeting-pane.png)

| | |
|---|---|
| Package | [meeting-pane](https://github.com/SolidOS/meeting-pane) 4.1.0 |
| Pane name | `meeting` |
| Audience | Power User (`solid:PowerUser`) |
| Registered by | solid-panes 5.1.0, after `period` and before `tabbed` |
| Creates | meetings (`mintClass` is `meeting:Meeting`) |

## When it applies

`label(subject, context)` returns `Meeting` if the store holds `subject rdf:type meeting:Meeting`, and `null` otherwise.

The pane's audience is Power User. A meeting still opens in the meeting pane for every user, because the first relevant pane is always kept; but **New Meeting** appears in the folder pane's **Add** menu only for users who have set Power User in their [preferences](./dashboard-and-preferences.md).

## What you see

- **Tabs** on the left. The first is the meeting itself; each tool added becomes another tab, with the tab color from `ui:backgroundColor`.
- **Details of meeting**: a form for `ical:summary` (name), `ical:location`, `ical:dtstart`, `ical:dtend`, `ical:comment` and the tab color. A changed field is saved to the meeting document.
- **Public and private links** to the meeting, and the participants.
- **+** opens the tool icons. Most tools create their resource with another pane's `mintNew`: `schedule` for a poll, `pad` for shared notes, `contact` for a group of people, `folder` for materials, `meeting` for a sub-meeting. The chat tool writes a `meeting:Chat` document (shown by the `chat` pane) and the action items tool a `wf:Tracker` (shown by the [issue pane](./issue-pane.md)). Each new thing gets a tab.
- Web pages can be dragged onto the tab bar to add them as meeting materials.

## Data

What the pane wrote on the test pod for the screenshot (`meeting/index.ttl`), as Turtle, after the details were filled in:

```turtle
@prefix meeting: <http://www.w3.org/ns/pim/meeting#> .
@prefix dc: <http://purl.org/dc/elements/1.1/> .
@prefix ical: <http://www.w3.org/2002/12/cal/ical#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<#this> a meeting:Meeting ;
    dc:author </me/profile/card.jsonld#me> ;
    dc:created "2026-11-17T20:49:30Z"^^xsd:dateTime ;
    meeting:toolList ( <#this> ) ;
    ui:backgroundColor "#ddddcc"^^xsd:color ;
    wf:participation <#id1794948699061> ;
    ical:summary "Docs sprint" ;
    ical:location "Online" ;
    ical:dtstart "2026-11-18"^^xsd:date ;
    ical:dtend "2026-11-19"^^xsd:date ;
    ical:comment "Bring the pane pages up to SolidOS 3.1." .

<#id1794948699061> wf:participant </me/profile/card.jsonld#me> ;
    ical:dtstart "2026-11-17T20:51:39Z"^^xsd:dateTime ;
    ui:backgroundColor "#c3f7f8" .
```

`meeting:toolList` is an ordered list of the tabs; it starts with the meeting itself. A tool added later is appended to the list and linked from the meeting with its own predicate (for example `meeting:sharedNotes`, `meeting:chat`, `meeting:actions`, `meeting:subMeeting`).

## Source

[github.com/SolidOS/meeting-pane](https://github.com/SolidOS/meeting-pane): `src/meetingPane.js` is the whole pane; `src/meetingDetailsForm.ttl` is the details form.

## See also

- [Chat Pane](./chat-pane.md), [Issue Pane](./issue-pane.md): tools a meeting can hold
- [Meeting ontology](http://www.w3.org/ns/pim/meeting)
