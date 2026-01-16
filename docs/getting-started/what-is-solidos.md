---
sidebar_position: 1
title: What is SolidOS?
description: Introduction to SolidOS, the operating system for Solid
---

# What is SolidOS?

SolidOS is an **operating system for Solid** — a modular, extensible data browser that lets users interact with data stored in Solid pods.

## The Vision

Imagine an operating system where:
- **Data is yours** — stored in your personal Solid pod
- **Apps are modular** — "panes" that render specific data types
- **Everything is linked** — RDF/Linked Data connects it all
- **You control access** — fine-grained permissions on your data

SolidOS makes this real.

## What You See

When you visit a Solid pod with SolidOS, you get an interactive data browser:

![SolidOS Data Browser Interface](/img/solidos-browser-preview.svg)

## Key Components

SolidOS is built from several libraries:

| Component | Purpose |
|-----------|---------|
| **mashlib** | Bundles everything into a deployable data browser |
| **solid-panes** | Collection of panes (modular apps) |
| **solid-ui** | Reusable UI widgets and components |
| **solid-logic** | Core business logic (auth, ACL, store) |
| **rdflib.js** | RDF processing and Linked Data |

## The Pane System

The magic of SolidOS is **panes** — modular applications that know how to render specific data types.

When you navigate to a resource:
1. SolidOS fetches the data
2. It asks each pane: "Can you render this?"
3. The most specific pane wins
4. That pane renders the UI

![Pane Selection Process](/img/pane-selection-flow.svg)

## Where SolidOS Runs

SolidOS can be deployed in multiple ways:

- **Embedded in Solid servers** — solidcommunity.net uses it as the default UI
- **Standalone web app** — host mashlib.js anywhere
- **Desktop app** — Data Kitchen wraps it in Electron
- **Your own app** — embed panes in your applications

## Who Uses SolidOS?

- **solidcommunity.net** — the largest Solid pod provider
- **Inrupt's Pod Spaces** — enterprise Solid deployment
- **Self-hosters** — running Community Solid Server
- **Developers** — building Solid applications

## Next Steps

- [Core Concepts](/docs/getting-started/core-concepts) — understand pods, RDF, and panes
- [Quick Start](/docs/getting-started/quick-start) — run SolidOS locally
- [Your First Pane](/docs/getting-started/your-first-pane) — build something!

## Resources

- **[SolidOS GitHub](https://github.com/SolidOS)** — source code
- **[Solid Project](https://solidproject.org/)** — the Solid ecosystem
- **[Try it live](https://solidos.solidcommunity.net/)** — see SolidOS in action
