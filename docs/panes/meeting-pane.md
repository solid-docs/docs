---
sidebar_position: 8
title: Meeting Pane
description: Meeting agendas and notes
---

# Meeting Pane

The meeting pane renders `meeting:Meeting` resources — collaborative meeting agendas and notes.

## What It Renders

- `meeting:Meeting` — Meeting instances
- Meeting agendas and action items

## Features

- Agenda management
- Action item tracking
- Participant list
- Meeting notes
- Attachments
- Date/time scheduling
- Recurring meetings
- Export to calendar

## Screenshot

![Meeting Pane Mockup](/img/panes/meeting-pane-mockup.svg)

Meetings display with participants, agenda items (with checkboxes), and action items with assignees and due dates.

## RDF Structure

```turtle
@prefix meeting: <http://www.w3.org/ns/pim/meeting#> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix cal: <http://www.w3.org/2002/12/cal/ical#> .
@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .

<#meeting1>
    a meeting:Meeting ;
    dct:title "Weekly Team Sync" ;
    cal:dtstart "2024-01-15T10:00:00Z"^^xsd:dateTime ;
    cal:dtend "2024-01-15T11:00:00Z"^^xsd:dateTime ;

    meeting:participation [
        meeting:participant <https://alice.example/profile/card#me>
    ], [
        meeting:participant <https://bob.example/profile/card#me>
    ] ;

    meeting:agenda (
        <#item1>
        <#item2>
        <#item3>
    ) .

<#item1>
    a meeting:AgendaItem ;
    dct:title "Review last week's action items" ;
    meeting:status meeting:Completed .

<#item2>
    a meeting:AgendaItem ;
    dct:title "Project status updates" ;
    meeting:status meeting:Pending .

<#action1>
    a wf:Task ;
    dct:title "Complete documentation" ;
    wf:assignee <https://alice.example/profile/card#me> ;
    cal:due "2024-01-20"^^xsd:date ;
    wf:status wf:Open .
```

## Usage

```javascript
// Navigate to a meeting
panes.runDataBrowser(document, sym('https://alice.example/meetings/weekly.ttl#meeting1'))

// Get the pane directly
const meetingPane = paneRegistry.byName('meeting')
```

## Creating Meetings

```javascript
const MEETING = Namespace('http://www.w3.org/ns/pim/meeting#')
const CAL = Namespace('http://www.w3.org/2002/12/cal/ical#')
const DCT = Namespace('http://purl.org/dc/terms/')

async function createMeeting(containerUri, title, startTime, endTime) {
  const meetingDoc = sym(`${containerUri}${Date.now()}.ttl`)
  const meeting = sym(`${meetingDoc.uri}#meeting`)

  const statements = [
    st(meeting, RDF('type'), MEETING('Meeting'), meetingDoc),
    st(meeting, DCT('title'), lit(title), meetingDoc),
    st(meeting, CAL('dtstart'), lit(startTime.toISOString(), null,
      sym('http://www.w3.org/2001/XMLSchema#dateTime')), meetingDoc),
    st(meeting, CAL('dtend'), lit(endTime.toISOString(), null,
      sym('http://www.w3.org/2001/XMLSchema#dateTime')), meetingDoc),
  ]

  await store.updater.update([], statements)
  return meeting
}
```

## Agenda Items

### Adding Items

```javascript
async function addAgendaItem(meetingUri, title) {
  const itemId = sym(`${meetingUri.doc().uri}#item-${Date.now()}`)

  await store.updater.update([], [
    st(itemId, RDF('type'), MEETING('AgendaItem'), meetingUri.doc()),
    st(itemId, DCT('title'), lit(title), meetingUri.doc()),
    st(itemId, MEETING('status'), MEETING('Pending'), meetingUri.doc()),
    // Add to meeting's agenda list (simplified - actual implementation uses RDF lists)
  ])

  return itemId
}
```

### Updating Status

```javascript
async function toggleAgendaItem(itemUri) {
  const currentStatus = store.any(itemUri, MEETING('status'), null, null)
  const newStatus = currentStatus?.uri === MEETING('Completed').uri
    ? MEETING('Pending')
    : MEETING('Completed')

  await store.updater.update(
    [st(itemUri, MEETING('status'), currentStatus, itemUri.doc())],
    [st(itemUri, MEETING('status'), newStatus, itemUri.doc())]
  )
}
```

## Action Items

### Creating Tasks

```javascript
const WF = Namespace('http://www.w3.org/2005/01/wf/flow#')

async function addActionItem(meetingUri, title, assigneeWebId, dueDate) {
  const taskId = sym(`${meetingUri.doc().uri}#task-${Date.now()}`)
  const doc = meetingUri.doc()

  await store.updater.update([], [
    st(taskId, RDF('type'), WF('Task'), doc),
    st(taskId, DCT('title'), lit(title), doc),
    st(taskId, WF('assignee'), sym(assigneeWebId), doc),
    st(taskId, CAL('due'), lit(dueDate.toISOString().split('T')[0], null,
      sym('http://www.w3.org/2001/XMLSchema#date')), doc),
    st(taskId, WF('status'), WF('Open'), doc),
  ])

  return taskId
}
```

### Completing Tasks

```javascript
async function completeTask(taskUri) {
  const currentStatus = store.any(taskUri, WF('status'), null, null)

  await store.updater.update(
    currentStatus ? [st(taskUri, WF('status'), currentStatus, taskUri.doc())] : [],
    [st(taskUri, WF('status'), WF('Completed'), taskUri.doc())]
  )
}
```

## Participants

### Adding Participants

```javascript
async function addParticipant(meetingUri, webId) {
  const participation = blankNode()
  const doc = meetingUri.doc()

  await store.updater.update([], [
    st(meetingUri, MEETING('participation'), participation, doc),
    st(participation, MEETING('participant'), sym(webId), doc),
  ])
}
```

### Listing Participants

```javascript
function getParticipants(meetingUri) {
  const participations = store.each(meetingUri, MEETING('participation'), null, null)
  return participations
    .map(p => store.any(p, MEETING('participant'), null, null))
    .filter(Boolean)
}
```

## Meeting Notes

```turtle
<#meeting1>
    meeting:notes """
    ## Discussion Points

    - Reviewed Q4 deliverables
    - Identified blockers for Project X
    - Agreed on next steps
    """ .
```

```javascript
// Get notes
const notes = store.any(meetingUri, MEETING('notes'), null, null)

// Update notes
async function updateNotes(meetingUri, newNotes) {
  const oldNotes = store.any(meetingUri, MEETING('notes'), null, meetingUri.doc())

  await store.updater.update(
    oldNotes ? [st(meetingUri, MEETING('notes'), oldNotes, meetingUri.doc())] : [],
    [st(meetingUri, MEETING('notes'), lit(newNotes), meetingUri.doc())]
  )
}
```

## Calendar Export

Export to iCalendar format:

```javascript
function exportToICS(meetingUri) {
  const title = store.any(meetingUri, DCT('title'), null, null)?.value
  const start = store.any(meetingUri, CAL('dtstart'), null, null)?.value
  const end = store.any(meetingUri, CAL('dtend'), null, null)?.value

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SolidOS//Meeting//EN
BEGIN:VEVENT
UID:${meetingUri.uri}
DTSTART:${formatICSDate(start)}
DTEND:${formatICSDate(end)}
SUMMARY:${title}
END:VEVENT
END:VCALENDAR`

  // Download as .ics file
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/\s+/g, '-')}.ics`
  a.click()
}

function formatICSDate(isoDate) {
  return new Date(isoDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}
```

## Source

- [meetingPane.js in solid-panes](https://github.com/SolidOS/solid-panes/tree/main/src/meeting)

## See Also

- [Chat Pane](/docs/panes/chat-pane) — real-time discussion
- [Issue Pane](/docs/panes/issue-pane) — task tracking
- [iCalendar](https://tools.ietf.org/html/rfc5545) — calendar format
