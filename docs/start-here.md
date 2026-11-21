---
sidebar_position: 0
title: Start Here
---

# Start Here

This page explains what SolidOS is and lets you try it in your browser. You do not need an account or any code.

## The problem

Most apps keep your data on their own servers: your contacts in one place, your messages in another, your photos in a third. You cannot easily move that data, see it together, or decide who else can read it.

## The idea

[Solid](https://solidproject.org/) is a set of open standards that lets you keep your data in a **pod**, a personal data store on the web. You choose who hosts your pod, or you host it yourself. Apps read and write the pod with your permission.

**SolidOS** is a data browser for pods. It shows what is in a pod (profiles, folders, address books, chats, documents) and lets you edit it and decide who can see it.

## Try it

### Step 1: Open SolidOS

Open the **[SolidOS Browser](https://solidos.org/docs/browser/?uri=https%3A%2F%2Ftestingsolidos.solidcommunity.net%2Fprofile%2Fcard%23me)**. It runs SolidOS 3.1 and opens a public test profile.

![The SolidOS Browser showing the public test profile: name and role at the top, then Bio, Resume, Follow me on, Skills and Languages cards](/img/getting-started/mashlib-com-profile.png)

### Step 2: Look around

- **The address bar** at the top holds a web address. That address is where the data lives.
- **The page** below it is SolidOS showing that data, here as a profile.
- Change the address to `https://testingsolidos.solidcommunity.net/public/` and press **Go**. The same data browser now shows a folder.

![The folder view: a grid of folders and files, with a grid and list switch at the top right](/img/getting-started/mashlib-com-folder.png)

### Step 3: Follow links

Open a folder or a file by clicking it. Each click loads data from a new web address, which may be on a different pod. SolidOS picks a suitable view for each kind of data. The **⋮** menu at the top right of a file lists the other views it can be shown in.

Everything you see is ordinary data on the web, not rows in one company's database.

## Words you will meet

**Pod**: a place on the web where your data lives. You choose who hosts it.

**WebID**: a web address that identifies you, for example `https://alice.example/profile/card#me`. You log in with it.

**Linked data**: data that refers to other data by web address, so it can point to things on other pods.

**Pane**: a view for one kind of data. The contacts pane shows address books, the chat pane shows chats, the folder pane shows folders. SolidOS offers the panes that fit what you are looking at.

**RDF**: the format pods use for linked data. You do not need to know it to use SolidOS.

## What you can do with your own pod

| Feature | What it does |
|---------|--------------|
| **Profile** | Publish who you are and edit it |
| **Files** | Browse folders, upload and open files |
| **Contacts** | Keep address books and groups |
| **Chat** | Talk with other people who use Solid |
| **Sharing** | Decide who can read or change each file or folder |

## Next steps

**Get a pod.** [Get a Pod](https://solidproject.org/users/get-a-pod) lists providers. Then open your pod's address in the [SolidOS Browser](https://solidos.org/docs/browser/) and use **Log In** at the top right.

**Learn to use SolidOS.** The [SolidOS user guide](https://solidos.org/userguide/) covers logging in, folders, sharing and each view.

**Understand how it works.** [What is SolidOS?](./getting-started/what-is-solidos.md) describes the parts.

**Run it yourself.** [Quick Start](./getting-started/quick-start.md) shows the ways to run SolidOS.

**Write a view of your own.** [Your First Pane](./getting-started/your-first-pane.md) builds one, in one file, in a few minutes.

## Questions

- Something unclear on this site? [Open an issue](https://github.com/solid-docs/docs/issues).
- To talk to other people working on Solid, see the [Solid community](https://solidproject.org/community) page.
