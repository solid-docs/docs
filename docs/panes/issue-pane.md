---
sidebar_position: 9
title: Issue Pane
description: Issue and task tracking
---

# Issue Pane

The issue pane renders `wf:Issue` resources — a lightweight issue tracker built into SolidOS.

## What It Renders

- `wf:Issue` — Individual issues
- `wf:Tracker` — Issue collections/projects

## Features

- Issue creation and editing
- Status workflow (Open → In Progress → Closed)
- Priority levels
- Assignees
- Labels/tags
- Comments
- Due dates
- Related issues

## Screenshot

```
┌─────────────────────────────────────────────────┐
│ 🐛 #42: Fix login redirect bug                  │
│ Status: Open  Priority: High  Assigned: Alice   │
├─────────────────────────────────────────────────┤
│ When logging in from the /settings page, users  │
│ are redirected to the homepage instead of back  │
│ to /settings.                                   │
│                                                 │
│ Steps to reproduce:                             │
│ 1. Go to /settings while logged out             │
│ 2. Click "Login"                                │
│ 3. Complete login flow                          │
│ 4. Observe redirect to / instead of /settings   │
├─────────────────────────────────────────────────┤
│ Comments (2)                                    │
│ ┌─────────────────────────────────────────────┐ │
│ │ Bob (Jan 14): I can reproduce this on Chrome│ │
│ │ Alice (Jan 15): Working on a fix            │ │
│ └─────────────────────────────────────────────┘ │
│ [Add Comment]                                   │
├─────────────────────────────────────────────────┤
│ [Edit] [Close Issue] [Delete]                   │
└─────────────────────────────────────────────────┘
```

## RDF Structure

### Issue Tracker

```turtle
@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .
@prefix dct: <http://purl.org/dc/terms/> .

<#tracker>
    a wf:Tracker ;
    dct:title "Project Issues" ;
    wf:issueClass wf:Issue ;
    wf:stateClass wf:State ;
    wf:initialState wf:Open ;
    wf:terminalState wf:Closed ;
    wf:assigneeClass foaf:Person .
```

### Individual Issue

```turtle
@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix sioc: <http://rdfs.org/sioc/ns#> .

<#issue42>
    a wf:Issue ;
    dct:title "Fix login redirect bug" ;
    dct:description """
    When logging in from the /settings page, users
    are redirected to the homepage instead of back
    to /settings.
    """ ;
    wf:tracker <#tracker> ;
    wf:state wf:Open ;
    wf:priority wf:High ;
    wf:assignee <https://alice.example/profile/card#me> ;
    dct:created "2024-01-14T10:00:00Z"^^xsd:dateTime ;
    dct:creator <https://bob.example/profile/card#me> .

# Comment
<#comment1>
    a sioc:Post ;
    sioc:reply_of <#issue42> ;
    sioc:content "I can reproduce this on Chrome" ;
    dct:created "2024-01-14T12:00:00Z"^^xsd:dateTime ;
    sioc:has_creator <https://bob.example/profile/card#me> .
```

## Usage

```javascript
// Navigate to an issue
panes.runDataBrowser(document, sym('https://alice.example/project/issues.ttl#issue42'))

// Get the pane directly
const issuePane = paneRegistry.byName('issue')
```

## Creating Issues

```javascript
const WF = Namespace('http://www.w3.org/2005/01/wf/flow#')
const DCT = Namespace('http://purl.org/dc/terms/')

async function createIssue(trackerUri, title, description) {
  const doc = trackerUri.doc()
  const issueId = sym(`${doc.uri}#issue-${Date.now()}`)

  const statements = [
    st(issueId, RDF('type'), WF('Issue'), doc),
    st(issueId, DCT('title'), lit(title), doc),
    st(issueId, DCT('description'), lit(description), doc),
    st(issueId, WF('tracker'), trackerUri, doc),
    st(issueId, WF('state'), WF('Open'), doc),
    st(issueId, DCT('created'), lit(new Date().toISOString(), null,
      sym('http://www.w3.org/2001/XMLSchema#dateTime')), doc),
    st(issueId, DCT('creator'), authn.currentUser(), doc),
  ]

  await store.updater.update([], statements)
  return issueId
}
```

## Issue States

Standard workflow states:

| State | Description |
|-------|-------------|
| `wf:Open` | New issue, not started |
| `wf:InProgress` | Currently being worked on |
| `wf:Closed` | Resolved or completed |

### Changing State

```javascript
async function updateIssueState(issueUri, newState) {
  const doc = issueUri.doc()
  const currentState = store.any(issueUri, WF('state'), null, doc)

  await store.updater.update(
    currentState ? [st(issueUri, WF('state'), currentState, doc)] : [],
    [st(issueUri, WF('state'), newState, doc)]
  )
}

// Usage
await updateIssueState(issueUri, WF('InProgress'))
await updateIssueState(issueUri, WF('Closed'))
```

## Priority Levels

```javascript
// Available priorities
const priorities = [
  WF('Critical'),
  WF('High'),
  WF('Medium'),
  WF('Low'),
]

async function setPriority(issueUri, priority) {
  const doc = issueUri.doc()
  const currentPriority = store.any(issueUri, WF('priority'), null, doc)

  await store.updater.update(
    currentPriority ? [st(issueUri, WF('priority'), currentPriority, doc)] : [],
    [st(issueUri, WF('priority'), priority, doc)]
  )
}
```

## Assignees

```javascript
// Assign an issue
async function assignIssue(issueUri, assigneeWebId) {
  const doc = issueUri.doc()
  const currentAssignee = store.any(issueUri, WF('assignee'), null, doc)

  await store.updater.update(
    currentAssignee ? [st(issueUri, WF('assignee'), currentAssignee, doc)] : [],
    [st(issueUri, WF('assignee'), sym(assigneeWebId), doc)]
  )
}

// Unassign
async function unassignIssue(issueUri) {
  const doc = issueUri.doc()
  const currentAssignee = store.any(issueUri, WF('assignee'), null, doc)

  if (currentAssignee) {
    await store.updater.update(
      [st(issueUri, WF('assignee'), currentAssignee, doc)],
      []
    )
  }
}
```

## Comments

```javascript
const SIOC = Namespace('http://rdfs.org/sioc/ns#')

async function addComment(issueUri, content) {
  const doc = issueUri.doc()
  const commentId = sym(`${doc.uri}#comment-${Date.now()}`)

  await store.updater.update([], [
    st(commentId, RDF('type'), SIOC('Post'), doc),
    st(commentId, SIOC('reply_of'), issueUri, doc),
    st(commentId, SIOC('content'), lit(content), doc),
    st(commentId, DCT('created'), lit(new Date().toISOString(), null,
      sym('http://www.w3.org/2001/XMLSchema#dateTime')), doc),
    st(commentId, SIOC('has_creator'), authn.currentUser(), doc),
  ])

  return commentId
}

// Get all comments for an issue
function getComments(issueUri) {
  return store.each(null, SIOC('reply_of'), issueUri, null)
    .map(comment => ({
      uri: comment.uri,
      content: store.any(comment, SIOC('content'), null, null)?.value,
      created: store.any(comment, DCT('created'), null, null)?.value,
      creator: store.any(comment, SIOC('has_creator'), null, null)
    }))
    .sort((a, b) => new Date(a.created) - new Date(b.created))
}
```

## Labels/Tags

```javascript
async function addLabel(issueUri, labelName) {
  const doc = issueUri.doc()

  await store.updater.update([], [
    st(issueUri, DCT('subject'), lit(labelName), doc)
  ])
}

function getLabels(issueUri) {
  return store.each(issueUri, DCT('subject'), null, null)
    .map(label => label.value)
}
```

## Listing Issues

```javascript
async function listIssues(trackerUri, filters = {}) {
  await store.fetcher.load(trackerUri.doc())

  let issues = store.each(null, WF('tracker'), trackerUri, null)

  // Filter by state
  if (filters.state) {
    issues = issues.filter(issue =>
      store.holds(issue, WF('state'), filters.state, null)
    )
  }

  // Filter by assignee
  if (filters.assignee) {
    issues = issues.filter(issue =>
      store.holds(issue, WF('assignee'), sym(filters.assignee), null)
    )
  }

  // Map to objects
  return issues.map(issue => ({
    uri: issue.uri,
    title: store.any(issue, DCT('title'), null, null)?.value,
    state: store.any(issue, WF('state'), null, null),
    priority: store.any(issue, WF('priority'), null, null),
    assignee: store.any(issue, WF('assignee'), null, null),
    created: store.any(issue, DCT('created'), null, null)?.value,
  }))
}
```

## Related Issues

```javascript
async function linkIssues(issueUri, relatedIssueUri) {
  const doc = issueUri.doc()

  await store.updater.update([], [
    st(issueUri, DCT('relation'), relatedIssueUri, doc)
  ])
}

function getRelatedIssues(issueUri) {
  return store.each(issueUri, DCT('relation'), null, null)
}
```

## Source

- [issue/issuePane.js in solid-panes](https://github.com/SolidOS/solid-panes/tree/main/src/issue)

## See Also

- [Workflow Ontology](http://www.w3.org/2005/01/wf/flow#) — wf: vocabulary
- [Meeting Pane](/docs/panes/meeting-pane) — action items
