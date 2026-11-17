---
sidebar_position: 6
title: Profile Pane
description: A person's profile page, read from their WebID document and edited in place by its owner
---

# Profile Pane

The profile pane shows a person as a profile page: bio, resume, projects and communities, social accounts, skills, languages, contact details and a QR code for the WebID. When you look at your own profile and can write to it, every section has **Edit** or **Add** buttons and saves straight to your profile document.

![The profile pane in SolidOS 3.1 showing the public test profile](/img/builtin-panes/profile-pane.png)

| | |
|---|---|
| Package | [profile-pane](https://github.com/SolidOS/profile-pane) 4.1.0 |
| Pane name | `profile` |
| Registered by | solid-panes 5.1.0, first of all panes |

The card at the top (name, photo, job title, and **Add as friend**) is not part of this pane. It is the profile heading from solid-panes (`src/mainPage/profileHeading.ts`), which the main page places above the pane. solid-panes exports its two entry points, `initializeProfileHeading` and `refreshProfileHeading`.

## When it applies

`label(subject, context)` returns `Profile` if the subject is a `vcard:Individual`, `foaf:Person` or `schema:Person`, and `null` otherwise. Because `profile` is registered first, it is the default view for any person, including a WebID opened from the address bar.

Before rendering, the pane loads every document the profile links with `rdfs:seeAlso`, so data kept in an extended profile is shown too.

## Owner, visitor, anonymous

The pane decides how to render from who is looking (`src/viewerMode.ts`):

| Viewer | Mode | Sections |
|---|---|---|
| Not logged in | `anonymous` | Read only |
| Logged in, someone else's profile | `authenticated` | Read only |
| Logged in, own profile, and the profile document is editable | `owner` | Edit and Add buttons on each section |

Editing is done in dialogs per section (for example the bio dialog). There is no separate edit page: profile-pane 4.1 does not export an editor pane, so `registerPanes.js` skips registering one.

After a section saves, the pane dispatches a `profile-pane-saved` event (bubbling, composed) with `detail.subjectUri` and `detail.profileData`. If a host page edits the profile elsewhere, it can dispatch `profile-heading-saved` with `detail.subjectUri` and the pane re-renders from the store.

## Data

The pane reads the person's WebID document. A small profile with the fields most sections use:

```turtle
@prefix : <#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix vcard: <http://www.w3.org/2006/vcard/ns#> .
@prefix schema: <http://schema.org/> .
@prefix solid: <http://www.w3.org/ns/solid/terms#> .
@prefix org: <http://www.w3.org/ns/org#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

:me a foaf:Person, schema:Person ;
    foaf:name "Alex Example" ;
    vcard:note "Writes documentation for Solid apps." ;   # Bio
    schema:skills :skill1 ;                              # Skills
    schema:knowsLanguage :lang1 ;                        # Languages
    vcard:hasEmail :email1 .                             # Contact Info

:email1 a vcard:Work ; vcard:value <mailto:alex@example.org> .

:skill1 schema:name "Technical writing" .

:lang1 solid:publicId <https://www.w3.org/ns/iana/language-code/en> .

:role1 a solid:CurrentRole ;                             # Resume
    org:member :me ;
    vcard:role "Documentation lead" ;
    org:organization :org1 ;
    schema:startDate "2024-01-01"^^xsd:date .

:org1 a schema:Organization ; schema:name "Example Org" .
```

The predicates are those in each section's `selectors.ts` under `src/sections/` (`bio`, `resume`, `projects`, `social`, `skills`, `languages`, `contactInfo`, `qrcode`). Projects and communities are `solid:community`; social accounts are `foaf:account` nodes with `foaf:accountName`. Each section's `mutations.ts` writes the same predicates back to the profile document.

## Source

[github.com/SolidOS/profile-pane](https://github.com/SolidOS/profile-pane): `src/index.ts` is the pane object, `src/ProfileView.ts` lays out the sections, and `src/sections/` holds one folder per section.

## See also

- [Contacts Pane](./contacts-pane.md): people in an address book
- [Other Panes](./other-panes.md): `social`, the Friends view of a person
