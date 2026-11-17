---
sidebar_position: 4
title: Contacts Pane
description: Address books, groups and contacts stored as vCard data
---

# Contacts Pane

The contacts pane shows an address book: its groups on the left, the people and organizations in the selected group in the middle, and the selected contact's details on the right. You can add contacts and groups, search, and edit a contact in place.

![The contacts pane in SolidOS 3.1: a group list, three contacts, and the details of the selected contact](/img/builtin-panes/contacts-pane.png)

| | |
|---|---|
| Package | [contacts-pane](https://github.com/SolidOS/contacts-pane) 4.1.0 |
| Pane name | `contact` |
| Registered by | solid-panes 5.1.0, after `issue` |
| Creates | address books (`mintClass` is `vcard:AddressBook`) |

## When it applies

`label(subject, context)` looks at the subject's types:

| Type | Label |
|---|---|
| `vcard:AddressBook` | `Address book` |
| `vcard:Organization` | `Contact` |
| anything else | `null` |

A person (`vcard:Individual`) is not labelled by this pane. A person opened on their own is shown by the [profile pane](./profile-pane.md); inside an address book the contacts pane shows them in its details column.

## What you see

- **Group bar**: All Contacts, then each group with a member count, a filter box, and **New Group**.
- **People list** for the selected group. Each row has a menu.
- **Details** of the selected contact: an editable form (name, nickname, pronouns, role, organization, addresses, phones, emails and so on), a photo, and a delete button.
- **Header**: the address book's title, a Private/Public badge, **Search** (by name, email, WebID or profile URL), **New Contact**, and a menu with tools.
- **New Contact** asks for the type (Person or Organization) and a name. The contact is added to the group that is selected.

The interface is made of Lit components in `src/components/`: `address-book`, `address-book-header`, `group-bar`, `people-list`, `details-section`, `search`, `add-contact-modal`, `new-group-modal`, `sharing-modal`, `tools`, `tools-modal` and others.

## Data

An address book is a folder with an `index.ttl` and two index documents. This is what the pane wrote on the test pod for the screenshot (`contacts/`), as Turtle:

```turtle
# contacts/index.ttl
@prefix vcard: <http://www.w3.org/2006/vcard/ns#> .
@prefix dc: <http://purl.org/dc/elements/1.1/> .

<#this> a vcard:AddressBook ;
    dc:title "Team contacts" ;
    vcard:nameEmailIndex <people.ttl> ;
    vcard:groupIndex <groups.ttl> .
```

```turtle
# contacts/people.ttl: one entry per contact
<Person/1c513c5c-02fb-4512-9f6f-4da068d95d94/index.ttl#this>
    vcard:inAddressBook <index.ttl#this> ;
    vcard:fn "Alan Turing" .
```

```turtle
# contacts/Person/1c513c5c-02fb-4512-9f6f-4da068d95d94/index.ttl
@prefix dct: <http://purl.org/dc/terms/> .

<#this> a vcard:Individual ;
    vcard:fn "Alan Turing" .
<> dct:created "2026-11-17T20:54:15Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
```

```turtle
# contacts/groups.ttl
<index.ttl#this> vcard:includesGroup <Group/Docs_team.ttl#this> .
<Group/Docs_team.ttl#this> a vcard:Group ; vcard:fn "Docs team" .

# contacts/Group/Docs_team.ttl
<#this> a vcard:Group ;
    vcard:fn "Docs team" ;
    vcard:hasMember <../Person/1c513c5c-02fb-4512-9f6f-4da068d95d94/index.ttl#this> .
```

Each contact gets its own document under `Person/` with a random id, and each group its own document under `Group/`. A new organization is typed `vcard:Organization` instead of `vcard:Individual`. The writes are in `src/contactLogic.ts` (`saveNewContact`, `saveNewGroup`, `addPersonToGroup`) and `src/mintNewAddressBook.ts`.

## Source

[github.com/SolidOS/contacts-pane](https://github.com/SolidOS/contacts-pane): `src/contactsPane.ts` is the pane object.

## See also

- [Profile Pane](./profile-pane.md): a person's own profile
- [vCard ontology](https://www.w3.org/TR/vcard-rdf/)
