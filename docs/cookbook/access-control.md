---
sidebar_position: 5
title: Access Control
description: Reading and changing Web Access Control in SolidOS 3.1
---

# Access Control

SolidOS 3.1 works with Web Access Control ([WAC](https://solidproject.org/TR/wac)). Each resource can have an ACL document listing who may `Read`, `Write`, `Append` or `Control` it. A resource without its own ACL inherits the `acl:default` rules of the nearest folder above it that has one.

There are two ways to change access in 3.1. One is the solid-logic 6.2.0 plan API, which the newer Manage Access dialog uses. The other is the older Sharing pane, which is what the data browser's Manage Access controls open. Every snippet below was run in the SolidOS 3.1 data browser, logged in as the owner of a test pod. Replace `https://your.pod/...` with your own resources.

## In the interface

We tested each control in the official mashlib 3.1.0 bundle and in the no-build 3.1 tree, logged in as the owner of a JSS pod. Both behaved the same:

- **Header of a file, desktop width:** the Manage Access button (person-and-cog icon) opens the Sharing pane in place of the file's view.
- **Header of a file, mobile width:** the button moves into the header's ⋮ menu as "Manage Access". It opens the same Sharing pane.
- **⋮ menu of a file or of the folder in the folder view:** "Manage Access" sends `resource-open-pane` with `paneName: 'sharing'` to the folder view. In our tests nothing visible opened.

When logged out, or without `Control` access, these controls are not shown. The Sharing pane groups people as Owners, Editors, Posters, Submitters and Viewers. "Set specific sharing for this File" gives the resource its own ACL.

![The Sharing pane in SolidOS 3.1 for a file named Notes: Owners "me", Viewers "Everyone", and a "Set specific sharing for this File" button](/img/libraries/sharing-pane.png)

solid-ui 5.1.0 also contains the newer `solid-ui-access-control-modal`, shown below. The outline in solid-panes 5.1.0 can open it in two ways: it listens for `UI.FILE_EXPLORER_MANAGE_ACCESS_EVENT` on each `solid-ui-file-explorer-provider`, and it sets `provider.handleAccessClick`. In 3.1, nothing dispatches that event and no control calls `provider.handleAccessClick`. This is true of the source and of the official bundle. Open the dialog from code as shown in [The Manage Access dialog](#the-manage-access-dialog), or dispatch the event yourself:

```js
const provider = document.querySelector('solid-ui-file-explorer-provider')
provider.dispatchEvent(new CustomEvent(UI.FILE_EXPLORER_MANAGE_ACCESS_EVENT, {
  bubbles: true, composed: true, detail: { subjectUri: provider.subjectUri }
}))
```

The user guide describes the Sharing pane step by step.

## Who has access

```js
const acl = SolidLogic.solidLogicSingleton.acl
const doc = 'https://your.pod/public/demo/hello.txt'

const context = await acl.findEffectiveAcl(doc)
context.resource                // the resource
context.defaultACLResource      // its own ACL document (may not exist yet)
context.effectiveACLResource    // the ACL that applies now
context.inherited               // true when it comes from a folder
context.authorizations          // the rules that apply to this resource
```

Each authorization looks like this:

```js
{
  id: 'https://your.pod/public/.acl#owner',
  agent: ['https://your.pod/profile/card#me'],
  agentClass: [],
  agentGroup: [],
  origin: [],
  mode: ['Read', 'Write', 'Control'],
  accessTo: ['https://your.pod/public/'],
  default: ['https://your.pod/public/'],
  ...
}
```

`acl.findAccessGrants(doc)` returns the `authorizations` array alone. Turn modes into the role names the interface uses, and back:

```js
acl.roleFromModes(['Read', 'Write'])   // 'Editor'
acl.roleFromModes(['Read', 'Append'])  // 'Poster'
acl.modesFromRole('Viewer')            // ['Read']
SolidLogic.ACCESS_ROLES                // ['Owner', 'Editor', 'No Access', 'Viewer', 'Poster', 'Submitter']
```

To learn only what the logged-in user may do, read the response headers instead:

```js
const { access } = await SolidLogic.solidLogicSingleton.resource.fetchMetadata($rdf.sym(doc))
// { canEdit, canManageAccess, isPublic, isPublicKnown }
```

## Changing access

Each change is planned first and then applied. `plan…` reads the current ACL and returns `{ target, deletes, inserts }`; `applyPlan` writes it as a PATCH and returns the `Response`. If the resource had no ACL of its own, the first plan copies the inherited rules into a new one, so nothing that applied before is lost.

A person, group or class is given as `{ type, iri }`, where `type` is `agent`, `agentGroup`, `agentClass` or `origin`. `SolidLogic.Public` (everyone) and `SolidLogic.Authenticated` (anyone logged in) are ready-made.

### Share a file with one person

```js
const acl = SolidLogic.solidLogicSingleton.acl
const doc = 'https://your.pod/public/demo/hello.txt'
const friend = { type: 'agent', iri: 'https://friend.example/profile/card#me' }

await acl.applyPlan(await acl.planGrant(doc, friend, acl.modesFromRole('Viewer')))
```

### Stop sharing it

```js
await acl.applyPlan(await acl.planRevoke(doc, friend))
```

### Make it private, or public again

```js
await acl.applyPlan(await acl.planPublicRead(doc, false))   // no public read
await acl.applyPlan(await acl.planPublicRead(doc, true))    // public read
```

In the test, a request without login got `401` after the first line.

### Share a folder

```js
const folder = 'https://your.pod/public/demo/'

await acl.applyPlan(await acl.planGrantContainerAndContents(folder, friend, acl.modesFromRole('Editor')))
```

The friend then had `Editor` on the folder and, through `acl:default`, on `hello.txt` inside it. `planGrantContainer` covers the folder only, and `planGrantContainerContents` the contents only. `planRevoke(folder, friend)` removed both; `planRevokeContainerContents` removes the contents rule only.

`acl.classifyContainerScope(context)` (or `SolidLogic.analyzeContainerAccessScope(context)` for more detail) says which of `folder+contents`, `folder` and `contents` the folder's rules cover.

### Back to inherited access

```js
await acl.resetToDefault(doc)   // deletes the resource's own ACL document
```

`acl.isProtectedResource(url)` is true for a storage root: the root of the origin, or a container typed `pim:Storage`. A plan for a storage root throws if it would leave no `Control` rule.

## The Manage Access dialog

The newer dialog uses the plan API above. It takes the resource and its current grants:

```js
const AccessControlModal = customElements.get('solid-ui-access-control-modal')
const doc = $rdf.sym('https://your.pod/public/demo/hello.txt').doc()
const accessGrants = await SolidLogic.solidLogicSingleton.acl.findAccessGrants(doc)
UI.showDialog(AccessControlModal, { props: { subjectUri: doc.uri, accessGrants } })
```

![The Manage Access dialog for hello.txt: a field to add a person, group or software agent URL with a role, the Shared with list, General Access settings for logged-in users and for anyone with the link, and Cancel and Save Changes buttons](/img/libraries/manage-access-modal.png)

The mashlib 3.1 bundle registers the component at start-up. Elsewhere, load `solid-ui/components/access-control-modal` first, or `customElements.get` returns `undefined`.

## The older editor in code

The Sharing pane is `UI.aclControl.ACLControlBox5`:

```js
const subject = $rdf.sym('https://your.pod/public/demo/')
const context = panes.getOutliner(document).context
await SolidLogic.store.fetcher.load(subject)
const box = UI.aclControl.ACLControlBox5(subject, context, 'Folder', SolidLogic.store)
document.querySelector('#OutlineView').prepend(box)
```

It and the other `UI.acl` helpers (`getACL`, `readACL`, `putACLbyCombo`, …) save ACL documents with a `PUT` of Turtle.

## JavaScriptSolidServer pods

JavaScriptSolidServer (JSS) stores ACL documents as JSON-LD. A Turtle `PUT` to an ACL is refused with `415` and `Accept-Put: application/ld+json, application/json`. On a JSS pod this affects the older editor and `UI.acl` helpers. The plan API writes with PATCH; on the JSS test pod, `planGrant`, `planRevoke`, `planPublicRead`, the folder plans and `resetToDefault` all succeeded.

## See also

- [solid-logic](../libraries/solid-logic.md#access-control): the full `acl` API
- [solid-ui](../libraries/solid-ui.md): the dialog and other components
- [Authentication](./authentication.md): logging in before changing access
- [WAC specification](https://solidproject.org/TR/wac)
