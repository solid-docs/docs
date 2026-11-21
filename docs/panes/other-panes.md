---
sidebar_position: 14
title: Other Panes
description: The registered panes that have no page of their own - what each shows and when it applies
---

# Other Panes

SolidOS 3.1 (mashlib 3.1.0, solid-panes 5.1.0) registers 36 panes; the full list in registration order is on [Panes Overview](./overview.md). These have their own pages:

- [Folder](./folder-pane.md), [Contacts](./contacts-pane.md), [Chat](./chat-pane.md) (`long chat` and `chat`), [Profile](./profile-pane.md), [Meeting](./meeting-pane.md), [Issue](./issue-pane.md), [Source](./source-pane.md)
- [Human-Readable](./human-readable-pane.md) (`humanReadable`), [Media](./media-panes.md) (`image`, `video`, `audio`, `slideshow`, `playlistSlot`), [Internal](./internal-pane.md) (`internal`)
- [Dashboard and Preferences](./dashboard-and-preferences.md) (`home`, `basicPreferences`, `trustedApplications`)

The rest are below. "When it applies" is what the pane's `label(subject, context)` checks; the label it returns is the text shown in the pane menu. Panes with an audience are offered only to users who have that role in their preferences, unless the pane is the first one relevant to the subject.

| Name | Shows | When it applies (label) | Audience | Source |
|---|---|---|---|---|
| `activitystreams` | An Activity Streams note as a card | subject is an `as:Note` (`Note`) | everyone | [activitystreams-pane](https://github.com/SolidOS/activitystreams-pane) 2.1.0 |
| `pad` | A shared notepad, edited line by line | subject is a `pad:Notepad` (`Notepad`). Creates notepads. | Power User | [padPane.ts](https://github.com/SolidOS/solid-panes/blob/main/src/pad/padPane.ts) |
| `transaction` | A financial transaction | subject is a `qif:Transaction` (`$$`), has a `qu:amount` (`$$$`), or is a `trip:Trip` (`Trip $`) | Power User | [transaction/pane.js](https://github.com/SolidOS/solid-panes/blob/main/src/transaction/pane.js) |
| `period` | Transactions in a financial period | subject is a `qif:Period` (`Period`) | Power User | [transaction/period.js](https://github.com/SolidOS/solid-panes/blob/main/src/transaction/period.js) |
| `tabbed` | A thing's parts as tabs | subject is a `meeting:Cluster` (`Tabbed`) | Power User | [tabbedPane.ts](https://github.com/SolidOS/solid-panes/blob/main/src/tabbed/tabbedPane.ts) |
| `schedule` | A scheduling poll: proposed times and everyone's answers | subject is a `sched:SchedulableEvent` (`Scheduling poll`). Creates polls. | Power User | [schedulePane.ts](https://github.com/SolidOS/solid-panes/blob/main/src/schedule/schedulePane.ts) |
| `travel expenses` | Transactions grouped by trip | subject is a subclass of `qu:Transaction` (`by Trip`) or a `trip:Trip` (`Trip $`) | Power User | [tripPane.js](https://github.com/SolidOS/solid-panes/blob/main/src/trip/tripPane.js) |
| `Dokieli` | Nothing; it only creates | never (`null`). Creates a dokieli HTML document (**New Dokieli Document**); `humanReadable` shows it. | everyone | [dokieliPane.js](https://github.com/SolidOS/solid-panes/blob/main/src/dokieli/dokieliPane.js) |
| `classInstance` | A class, as a list of its instances | the store has instances of the subject (`List (n)`) | Power User | [classInstancePane.js](https://github.com/SolidOS/solid-panes/blob/main/src/classInstancePane.js) |
| `social` | A person's friends (`foaf:knows`) and friends in common | subject is a `foaf:Person` or `vcard:Individual` (`Friends`). The account menu's **Friends** opens it. | everyone | [socialPane.ts](https://github.com/SolidOS/solid-panes/blob/main/src/social/socialPane.ts) |
| `dataContents` | The triples in an RDF document as nested tables | the document has statements, and the subject is not a `link:ProtocolEvent` (`Data (n)`). The default for a Turtle file. | Developer | [dataContentPane.ts](https://github.com/SolidOS/solid-panes/blob/main/src/dataContentPane.ts) |
| `n3` | The document serialized as N3 | as `dataContents` (`Data (n) as N3`) | Developer | [n3Pane.ts](https://github.com/SolidOS/solid-panes/blob/main/src/n3Pane.ts) |
| `RDFXML` | The document serialized as RDF/XML | as `dataContents` (`As RDF/XML (n)`) | Developer | [RDFXMLPane.ts](https://github.com/SolidOS/solid-panes/blob/main/src/RDFXMLPane.ts) |
| `form` | A thing through the forms that apply to it | solid-ui's `widgets.formsFor(subject)` finds forms (`n forms`) | Power User | [form/pane.ts](https://github.com/SolidOS/solid-panes/blob/main/src/form/pane.ts) |
| `tableOfClass` | A class, as a table of its instances | the subject has 1 to 15 instances (`<class> table`) | everyone | [tableViewPane.js](https://github.com/SolidOS/solid-panes/blob/main/src/tableViewPane.js) |
| `default` | Any thing, as property and value | always (`About `) | Developer | [defaultPane.ts](https://github.com/SolidOS/solid-panes/blob/main/src/defaultPane.ts) |
| `ui` | Creation forms for a class, or a form being edited | subject is an `rdfs:Class` (`creation forms`) or a `ui:Form` (`edit form`) | Power User | [ui/pane.js](https://github.com/SolidOS/solid-panes/blob/main/src/ui/pane.js) |
| `sharing` | Who has access to a resource (solid-ui `ACLControlBox5`) | subject is an `ldp:Resource`, `ldp:Container` or `ldp:BasicContainer` (`Sharing`), but SolidOS 3.1 leaves it out of the pane menu; see below | everyone | [sharingPane.ts](https://github.com/SolidOS/solid-panes/blob/main/src/sharing/sharingPane.ts) |

Namespaces used above: `pad:` `http://www.w3.org/ns/pim/pad#`, `qif:` `http://www.w3.org/2000/10/swap/pim/qif#`, `trip:` `http://www.w3.org/ns/pim/trip#`, `sched:` `http://www.w3.org/ns/pim/schedule#`, `as:` `https://www.w3.org/ns/activitystreams#`, `link:` `http://www.w3.org/2007/ont/link#`.

## Sharing in 3.1

The `sharing` pane is still registered, and it is what the data browser's access controls open. The outline and the folder pane leave it out of their pane menus (`excludedPaneNames: ['sharing']`); it is in `panes.list` and `panes.byName('sharing')` returns it. Tested logged in on a JSS pod, with the same results in the official mashlib 3.1.0 bundle and the no-build tree:

- The Manage Access button (person-and-cog icon) in the header of a file opens the `sharing` pane in place of the file's view. At mobile width the button moves into the header's ⋮ menu, and the item opens the same pane.
- "Manage Access" in the ⋮ menu of a file or folder in the folder view sends `resource-open-pane` with `paneName: 'sharing'` to the folder view. Nothing visible opened in our tests.
- Logged out, or without `Control` access, these controls are not shown.

solid-ui 5.1.0 also has the newer `solid-ui-access-control-modal`. The outline in solid-panes 5.1.0 is ready to open it: it listens for `UI.FILE_EXPLORER_MANAGE_ACCESS_EVENT` and sets `provider.handleAccessClick`, both of which call `acl.findAccessGrants` and then `UI.showDialog`. But no control in 3.1 dispatches that event or calls `provider.handleAccessClick`, so the dialog only opens from code. See [Access control](../cookbook/access-control.md#the-manage-access-dialog).

## activitystreams in the no-build tree

The official mashlib 3.1.0 bundle registers `activitystreams`. The no-build 3.1 tree used for the screenshots on these pages does not, so it lists 35 panes.
