---
sidebar_position: 9
title: Issue Pane
description: Issue trackers - a table, a board by state, single issues, and tracker settings
---

# Issue Pane

The issue pane shows an issue tracker and its issues. A tracker has tabs: **My Trackers**, **Table View** (filterable and sortable), a **board** with one column per state (the tab is named after the issue class, "task" for a default tracker), and **Settings**. **New task** adds an issue. Opening a single issue shows its own editable view.

![The issue pane in SolidOS 3.1: the table view of a tracker with two open tasks](/img/builtin-panes/issue-pane.png)

| | |
|---|---|
| Package | [issue-pane](https://github.com/SolidOS/issue-pane) 4.1.0 |
| Pane name | `issue` |
| Audience | everyone (`audience: []`) |
| Registered by | solid-panes 5.1.0, after `basicPreferences` |
| Creates | trackers (`mintClass` is `wf:Tracker`) |

## When it applies

`label(subject, context)` returns:

| Condition | Label |
|---|---|
| subject is a `wf:Task`, or has a `wf:tracker` | `issue` |
| subject is a `wf:Tracker` | `tracker` |
| anything else | `null` |

## What you see

- **New task**: a title box; Enter saves the issue in the tracker's state store.
- **Table View**: one row per issue with title, status and created time, and filter and sort controls above each column.
- **Board**: one column per state; dropping a card on a column changes the issue's state. There is one board tab for the issue class and one for each `wf:issueCategory`.
- **Settings**: the tracker's settings form (issue class and its states, categories, assignee class and so on), and a button that copies the tracker to the clipboard as CSV.
- **My Trackers**: the trackers listed in your type indexes.

The board is `src/board.js` and the CSV button `src/csvButton.js`. The state store is watched with `store.updater.addDownstreamChangeListener`, so the table follows changes made by others.

### A new tracker shows "Tracker settings need an update"

A tracker made with **New Tracker** in issue-pane 4.1.0 sets `wf:issueClass wf:Task` but does not copy the list of allowed states into the tracker document. The pane looks for that list (`owl:disjointUnionOf`) in the tracker document only, so it shows the message *Tracker settings need an update for "task"*. Fill in the states in **Settings**, or add them to `index.ttl` yourself:

```turtle
@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

wf:Task owl:disjointUnionOf ( wf:Open wf:Closed ) .
wf:Open rdfs:subClassOf wf:Task .
wf:Closed rdfs:subClassOf wf:Task .
```

This is what was added to the tracker in the screenshot.

## Data

A tracker is a folder with `index.ttl` (the configuration) and `state.ttl` (the issues). From the test pod, as Turtle:

```turtle
# issues/index.ttl
@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .
@prefix dc: <http://purl.org/dc/elements/1.1/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<#this> a wf:Tracker ;
    dc:author </me/profile/card.jsonld#me> ;
    dc:created "2026-11-17T20:49:30Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
    wf:issueClass wf:Task ;
    wf:initialState wf:Open ;
    wf:stateStore <state.ttl> ;
    wf:assigneeClass foaf:Person .
```

```turtle
# issues/state.ttl
@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .
@prefix dc: <http://purl.org/dc/elements/1.1/> .
@prefix dct: <http://purl.org/dc/terms/> .

<index.ttl#this> wf:stateStore <state.ttl> .

<#Iss1794951000001> a wf:Open ;
    wf:tracker <index.ttl#this> ;
    dc:title "Write the chat pane page" ;
    dct:created "2026-11-17T20:10:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
```

An issue's state is its `rdf:type` (here `wf:Open`). The **New task** form (`src/newIssue.js`) writes exactly these four triples, using the tracker's `wf:initialState` for the type. If the tracker has a `wf:issueURITemplate`, each issue gets its own document instead of a fragment in `state.ttl`.

## Source

[github.com/SolidOS/issue-pane](https://github.com/SolidOS/issue-pane): `src/issuePane.js` is the pane object; `src/issue.js` renders a single issue; `src/ontology/trackerSettingsForm.ttl` is the settings form.

## See also

- [Meeting Pane](./meeting-pane.md): a meeting's action items are a tracker
