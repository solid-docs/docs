---
sidebar_position: 11
title: Media Panes
description: Images, audio, video, slideshows and playlist slots
---

# Media Panes

solid-panes has small panes for media files. Each fetches the file with the logged-in session, so private media plays for someone who may read it, and none of them writes anything.

![The image pane in SolidOS 3.1 showing a PNG file](/img/builtin-panes/image-pane.png)

All of them are in [solid-panes](https://github.com/SolidOS/solid-panes) 5.1.0.

| Pane name | Shows | Label and when it applies | Audience | Source |
|---|---|---|---|---|
| `image` | an image | `Image`, if the subject is a `dct:Image` or its `Content-Type` contains `image/`, and it is not `application/pdf` | everyone | [imagePane.ts](https://github.com/SolidOS/solid-panes/blob/main/src/imagePane.ts) |
| `video` | a video player | `Play video`, if a type of the subject is a `video/*` media-type class | everyone | [videoPane.js](https://github.com/SolidOS/solid-panes/blob/main/src/video/videoPane.js) |
| `audio` | an audio player | `Play audio`, if a type of the subject is an `audio/*` media-type class | everyone | [audioPane.js](https://github.com/SolidOS/solid-panes/blob/main/src/audio/audioPane.js) |
| `slideshow` | a folder of images as a slideshow | `Slideshow`, if the subject is a container holding more than one distinct image | Power User | [slideshowPane.js](https://github.com/SolidOS/solid-panes/blob/main/src/slideshow/slideshowPane.js) |
| `playlistSlot` | a playlist slot, playing its track | `Playlist Slot`, if the subject is a `pbo:PlaylistSlot` (`http://purl.org/ontology/pbo/core#`) | Power User | [playlistPane.js](https://github.com/SolidOS/solid-panes/blob/main/src/playlist/playlistPane.js) |

The media-type classes come from the response's `Content-Type`, which rdflib records as a type of the file (for `audio/mpeg`, the class `http://www.w3.org/ns/iana/media-types/audio/mpeg#Resource`).

## image

Fetches the file, makes a `blob:` URL and shows it in an `<img>`. The image is shown at its own size, up to the width of the pane.

## audio

Shows three lines guessed from the last three parts of the address (for `…/artist/album/track.mp3`: artist, album, track) and an `<audio>` player. When a track ends it plays the next file in the same folder, sorted by address, and at the end of a folder moves on to the next folder. If a folder has `song.mp3` and `song.m4a`, or `song.mp3` and `song 1.mp3`, the extra copy is skipped.

## video

Fetches the file and plays it in a `<video>` element with controls. MP4 files also match the [human-readable pane](./human-readable-pane.md), but `video` is registered earlier and is shown first.

## slideshow

Shows the images in a folder one at a time, with the [better-simple-slideshow](https://github.com/leemark/better-simple-slideshow) script and stylesheet. Its audience is Power User, so the folder pane stays the default for a folder of photos and **Slideshow** appears in the pane menu only for users with that role in their [preferences](./dashboard-and-preferences.md).

## playlistSlot

Plays the track of a playlist slot, with YouTube and plain HTML5 media handled differently.

## Data

The media panes read files, not RDF. The only RDF they look at is the type: `dct:Image` (note: `dct:`, not `dc:`), the media-type class from the `Content-Type`, `pbo:PlaylistSlot`, and the folder listing (`ldp:contains`) for `audio` and `slideshow`.

## See also

- [Folder Pane](./folder-pane.md): **Upload** media files
- [Human-Readable Pane](./human-readable-pane.md): PDF and text
