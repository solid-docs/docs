---
sidebar_position: 13
title: Dashboard and Preferences
description: The home, basicPreferences and trustedApplications panes, opened from the account menu
---

# Dashboard and Preferences

Three panes are not about a resource but about the logged-in user. They are opened from the account menu in the header (your avatar, top right), not from the pane menu:

| Account menu item | Pane | Shows |
|---|---|---|
| **Dashboard** | `home` | "Create new thing somewhere": buttons for each kind of thing you can create, and the things in your type indexes |
| **Preferences** | `basicPreferences` | User types, trusted applications, and links to delete your account |
| (inside Preferences) | `trustedApplications` | The table of applications you trust |

All three are in [solid-panes](https://github.com/SolidOS/solid-panes) 5.1.0. The account menu is built in `src/mainPage/header.ts`; each item calls the navigation controller with `{ kind: 'app', pane: 'home' }` or `{ kind: 'app', pane: 'basicPreferences' }`. The menu's other items, **Profile** and **Friends**, open the `profile` and `social` panes for your WebID.

## Dashboard: `home`

![The Dashboard in SolidOS 3.1, with the create buttons shown](/img/builtin-panes/dashboard.png)

- `global: true` and `label()` returns `Home`. Global panes are never offered in the pane menu of a resource.
- Audience: Power User. The account menu opens it for any logged-in user.
- The green **+** shows one button for each registered pane that has `mintNew` and whose audience matches the user, through solid-ui's `create.newThingUI`. In the screenshot (a user with no roles set): tracker, address book, chat, dokieli document, folder and text file.
- Below that, solid-ui's `login.registrationList` lists the things registered in your type indexes.

Source: [homePane.ts](https://github.com/SolidOS/solid-panes/blob/main/src/home/homePane.ts)

## Preferences: `basicPreferences`

![The Preferences page in SolidOS 3.1: user types and trusted applications](/img/builtin-panes/preferences.png)

- `label()` always returns `null`; the pane is only ever opened by name.
- **User types** is a form on your preferences file. "Level of user" sets `rdf:type` on your WebID in that file to `solid:PowerUser` and/or `solid:Developer`. These are the roles panes name in their `audience`: setting them makes panes such as `meeting`, `pad`, `schedule` and `slideshow` (Power User) or `dataContents`, `n3`, `RDFXML` and `default` (Developer) appear in pane menus and the **Add** menu.
- Below it, the `trustedApplications` pane is rendered, then **Delete account**: a link per storage in your profile (`space:storage`), guessed from the Node Solid Server URL layout. Servers with another layout get no link.

```turtle
# in your preferences file
</profile/card#me> a <http://www.w3.org/ns/solid/terms#PowerUser> .
```

Source: [basicPreferences.ts](https://github.com/SolidOS/solid-panes/blob/main/src/dashboard/basicPreferences.ts), form in `src/dashboard/preferencesFormText.ttl`

## Trusted applications: `trustedApplications`

- `global: true`, `label()` returns `null`. It is rendered by `basicPreferences` with `context.session.paneRegistry.byName('trustedApplications')`.
- A table of application origins with checkboxes for Read, Write, Append and Control. **Add** writes the entry to your profile document:

```turtle
@prefix acl: <http://www.w3.org/ns/auth/acl#> .

<#me> acl:trustedApp [
    acl:origin <https://app.example> ;
    acl:mode acl:Read, acl:Write
] .
```

Trusted applications get access to everything you have access to, limited to the modes you tick, and never more than you have.

Source: [trustedApplications.view.ts](https://github.com/SolidOS/solid-panes/blob/main/src/trustedApplications/trustedApplications.view.ts)

## See also

- [Panes Overview](./overview.md): how `audience` filters panes
- [Folder Pane](./folder-pane.md): the **Add** menu uses the same list of creatable panes
