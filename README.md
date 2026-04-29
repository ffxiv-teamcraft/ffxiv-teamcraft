# FFXIV Teamcraft — Linux fork

> **This is a personal fork of [ffxiv-teamcraft/ffxiv-teamcraft](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft) with the goal of adding native Linux support to the Electron desktop app.**
> For the upstream project, general support, and the hosted web app see the links below.

[![GitHub Release Date](https://img.shields.io/github/release-date/ffxiv-teamcraft/ffxiv-teamcraft.svg)](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/releases)
[![GitHub issues](https://img.shields.io/github/issues/ffxiv-teamcraft/ffxiv-teamcraft.svg)](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/ffxiv-teamcraft/ffxiv-teamcraft.svg)](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/pulls)
[![Discord](https://img.shields.io/discord/355013337748209665.svg)](https://discord.gg/r6qxt6P)

Collaborative crafting tool for Final Fantasy XIV

https://ffxivteamcraft.com

Discord for support, bugs discussion and contributors: https://discord.gg/r6qxt6P

Wiki for feature documentation and user guides: https://wiki.ffxivteamcraft.com/

## Linux support (this fork)

### Prerequisites

- [XIVLauncher.Core](https://github.com/goatcorp/XIVLauncher.Core) — used to launch FFXIV on Linux. The desktop app expects XIVLauncher's default install location for game configuration data.

### Game Configuration Path

The DAT file watcher (used for inventory sync) reads character data from XIVLauncher's default config directory:

```
~/.xlcore/ffxivConfig/
```

This is the directory that contains your `FFXIV_CHR*` character folders. If your XIVLauncher installation uses a different path, you can override it in the app under **Settings → Game Configuration Path**.

### Packet capture

Native Linux packet capture is not yet implemented. The app runs fully without it — packet-based features (market board history, inventory sync via network, etc.) will not update automatically until the Linux bridge companion is built.

## Development

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![GitHub license](https://img.shields.io/github/license/ffxiv-teamcraft/ffxiv-teamcraft.svg)](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/blob/staging/LICENSE)

## License

MIT

## Responsive tooling

We're using @angular/flex-layout for responsive tooling, their wiki is available on the link below.

https://github.com/angular/flex-layout/wiki/Responsive-API

## Contribute

Contributions guidelines can be found inside [CONTRIBUTING.md](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/blob/staging/CONTRIBUTING.md) file.
