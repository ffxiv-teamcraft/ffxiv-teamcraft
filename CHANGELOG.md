# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="6.5.7"></a>
## [6.5.7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.5.6...v6.5.7) (2020-01-13)


### Bug Fixes

* **alarms:** fixed an issue with "create all alarms" button not working properly ([b183393](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b183393))
* **db:** fixed an issue with comments crashing in some cases ([61b37e6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/61b37e6))
* **db:** fixed various missing data (fish baits and hidden flag on items) ([baf6025](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/baf6025))
* **desktop:** fixed an issue with google oauth on 2FA accounts ([3f51249](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3f51249)), closes [#1269](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1269)
* **fishing:** fixed an issue with fishes in Eulmore area ([43f4f18](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/43f4f18))
* **fishing:** fixed an issue with fishing state not being detected properly ([2382732](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2382732))
* **list:** fixed an issue with japanese items search ([1227c4f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1227c4f)), closes [#1318](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1318)


### Features

* **fishing-spot:** added new "hour of the day" chart ([0903dfd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0903dfd))
* **list:** lists created before 6.1.0 will now be considered as outdated ([59b3c8c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/59b3c8c))
* **simulator:** added level to craft stats display in main block ([cd26ab6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cd26ab6))



<a name="6.5.6"></a>
## [6.5.6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.5.5...v6.5.6) (2019-12-29)


### Bug Fixes

* **desktop:** fixed log-in with google system ([00a46e4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/00a46e4))
* **desktop:** fixed memory leak when moving to a crowded area ([d5adf18](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d5adf18))
* **levequests:** fixed an issue with global exp not reporting properly ([52c0737](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/52c0737))



<a name="6.5.5"></a>
## [6.5.5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.5.4...v6.5.5) (2019-12-27)


### Bug Fixes

* **desktop:** fixed an issue with start minimized option not being applied properly ([af2cf3d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/af2cf3d))
* **inventory:** fixed an issue with quality lower action not being tracked properly ([d9d0e54](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d9d0e54))
* **list:** fixed an issue with masterbooks not showing properly ([2463cd1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2463cd1))


### Features

* **auth:** added change email button in settings, account section ([69ccaee](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/69ccaee))
* **desktop:** app will now open on the same page you left it ([ff89b8c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ff89b8c))
* **patreon:** new god of the hand: Post Mortem ([af37616](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/af37616))



<a name="6.5.4"></a>
## [6.5.4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.5.3...v6.5.4) (2019-12-26)


### Bug Fixes

* **db:** Fixed gardening showing up on all items and updated link as HTTPS is no longer supported ([b4cf0dc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b4cf0dc))
* **db:** Remove forgotten console.log ([744aa67](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/744aa67))
* **layout:** fixed an issue with IS_CRAFT filter also accepting non-craft rows ([86f6968](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/86f6968))
* **levequests:** leves below lvl 70 now give 3k exp when you're above lvl 70 ([69ce689](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/69ce689))
* **list:** fixed a possible performance issue with item sources ([6ca7eb5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6ca7eb5))
* **list:** fixed an issue with "open in simulator" button crashing ([d5ef37b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d5ef37b))
* **macro-translator:** fixed an issue with new skills not being translated to korean properly ([81d9550](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/81d9550))
* **simulator:** fixed behavior for step state modification system ([1635daf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1635daf))
* **total-trades:** fixed an issue with augmentation tokens not being accounted properly ([8f72a28](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8f72a28))


### Features

* support for korean v5.01 update ([0129db8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0129db8))
* **db:** added 5.18 data ([15d50e6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/15d50e6))
* **list:** added a 'copy to clipboard" button to crystals panel ([12838dc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/12838dc))
* **pcap:** support for 5.18 packets update ([3cc578f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3cc578f))



<a name="6.5.3"></a>
## [6.5.3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.4.2...v6.5.3) (2019-12-22)


### Bug Fixes

* **autofill:** fixed an issue with autofill on gear pieces ([164e7be](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/164e7be))
* **desktop:** fixed an issue with fullscreen state not saved properly ([8588fe4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8588fe4))
* **fishing-spot:** fixed missalignment for hover focus ([62291d1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/62291d1))
* **inventory:** fixed an issue with split action in retainer ([01de086](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/01de086))
* **layout:** various fixes for layouts system with new data layer ([057bf84](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/057bf84))
* **list:** fixed an issue with gatherable final items not showing properly ([40897ab](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/40897ab))
* **list:** fixed an issue with lists not being created properly ([721900e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/721900e))
* **list:** fixed an issue with recipes having yield > 1 ([1260ab9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1260ab9))
* **list:** hotfix for list details not loading properly ([bbbd7a6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bbbd7a6))
* **list:** various performance-related fixes, reverting lazy component changes ([3edd0fc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3edd0fc))
* **log-tracker:** fixed pages labels for masterbook recipes and housing ([1e15213](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1e15213))
* **performances:** added performance mode for large lists and improved performances in general ([57eeb19](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/57eeb19))
* **rotation-overlay:** fixed an issue with overlay using wrong icons ([d1f8d8f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d1f8d8f))
* **search:** fixed an issue with recipe toggle on kr and cn data ([1b1bf4c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1b1bf4c))


### Features

* **desktop:** new overlay: list details ([743f81e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/743f81e))
* added only recipe flag in item picker ([14e90de](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/14e90de))
* added quick search shortcut: Ctrl + Shift + F ([03d76f4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/03d76f4))
* **list:** added a button to reset items of a given display panel ([1009aaa](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1009aaa))
* **lists:** added a setting to enable autofill notification by default ([e0f6f01](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e0f6f01))
* **teams:** added new webhook setting: item progression ([64dd0d3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/64dd0d3))



<a name="6.5.2"></a>
## [6.5.2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.4.2...v6.5.2) (2019-12-21)


### Bug Fixes

* **autofill:** fixed an issue with autofill on gear pieces ([164e7be](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/164e7be))
* **desktop:** fixed an issue with fullscreen state not saved properly ([8588fe4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8588fe4))
* **fishing-spot:** fixed missalignment for hover focus ([62291d1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/62291d1))
* **inventory:** fixed an issue with split action in retainer ([01de086](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/01de086))
* **list:** fixed an issue with gatherable final items not showing properly ([40897ab](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/40897ab))
* **list:** fixed an issue with lists not being created properly ([721900e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/721900e))
* **list:** hotfix for list details not loading properly ([bbbd7a6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bbbd7a6))
* **log-tracker:** fixed pages labels for masterbook recipes and housing ([1e15213](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1e15213))
* **performances:** added performance mode for large lists and improved performances in general ([57eeb19](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/57eeb19))
* **rotation-overlay:** fixed an issue with overlay using wrong icons ([d1f8d8f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d1f8d8f))
* **search:** fixed an issue with recipe toggle on kr and cn data ([1b1bf4c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1b1bf4c))


### Features

* **desktop:** new overlay: list details ([743f81e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/743f81e))
* added only recipe flag in item picker ([14e90de](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/14e90de))
* added quick search shortcut: Ctrl + Shift + F ([03d76f4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/03d76f4))
* **list:** added a button to reset items of a given display panel ([1009aaa](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1009aaa))
* **lists:** added a setting to enable autofill notification by default ([e0f6f01](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e0f6f01))
* **teams:** added new webhook setting: item progression ([64dd0d3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/64dd0d3))



<a name="6.5.1"></a>
## [6.5.1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.4.2...v6.5.1) (2019-12-21)


### Bug Fixes

* **autofill:** fixed an issue with autofill on gear pieces ([164e7be](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/164e7be))
* **desktop:** fixed an issue with fullscreen state not saved properly ([8588fe4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8588fe4))
* **fishing-spot:** fixed missalignment for hover focus ([62291d1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/62291d1))
* **inventory:** fixed an issue with split action in retainer ([01de086](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/01de086))
* **list:** fixed an issue with lists not being created properly ([721900e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/721900e))
* **list:** hotfix for list details not loading properly ([bbbd7a6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bbbd7a6))
* **log-tracker:** fixed pages labels for masterbook recipes and housing ([1e15213](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1e15213))
* **performances:** added performance mode for large lists and improved performances in general ([57eeb19](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/57eeb19))
* **rotation-overlay:** fixed an issue with overlay using wrong icons ([d1f8d8f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d1f8d8f))
* **search:** fixed an issue with recipe toggle on kr and cn data ([1b1bf4c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1b1bf4c))


### Features

* **desktop:** new overlay: list details ([743f81e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/743f81e))
* added only recipe flag in item picker ([14e90de](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/14e90de))
* added quick search shortcut: Ctrl + Shift + F ([03d76f4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/03d76f4))
* **list:** added a button to reset items of a given display panel ([1009aaa](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1009aaa))
* **lists:** added a setting to enable autofill notification by default ([e0f6f01](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e0f6f01))
* **teams:** added new webhook setting: item progression ([64dd0d3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/64dd0d3))



<a name="6.5.0"></a>
# [6.5.0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.4.2...v6.5.0) (2019-12-21)


### Bug Fixes

* **autofill:** fixed an issue with autofill on gear pieces ([164e7be](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/164e7be))
* **desktop:** fixed an issue with fullscreen state not saved properly ([8588fe4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8588fe4))
* **fishing-spot:** fixed missalignment for hover focus ([62291d1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/62291d1))
* **inventory:** fixed an issue with split action in retainer ([01de086](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/01de086))
* **log-tracker:** fixed pages labels for masterbook recipes and housing ([1e15213](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1e15213))
* **performances:** added performance mode for large lists and improved performances in general ([57eeb19](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/57eeb19))
* **rotation-overlay:** fixed an issue with overlay using wrong icons ([d1f8d8f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d1f8d8f))
* **search:** fixed an issue with recipe toggle on kr and cn data ([1b1bf4c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1b1bf4c))


### Features

* **desktop:** new overlay: list details ([743f81e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/743f81e))
* added only recipe flag in item picker ([14e90de](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/14e90de))
* added quick search shortcut: Ctrl + Shift + F ([03d76f4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/03d76f4))
* **list:** added a button to reset items of a given display panel ([1009aaa](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1009aaa))
* **lists:** added a setting to enable autofill notification by default ([e0f6f01](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e0f6f01))
* **teams:** added new webhook setting: item progression ([64dd0d3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/64dd0d3))



<a name="6.4.2"></a>
## [6.4.2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.4.1...v6.4.2) (2019-12-13)


### Bug Fixes

* **core:** go away from version lock when it's up to date ([f3bdc5c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f3bdc5c))
* **db:** removed empty line for used as bait db block ([3ba4ada](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3ba4ada))
* **fishing-reporter:** fixed an issue with Release reporting as miss ([209e767](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/209e767))
* **packets:** reset statuses when switching job ([e8c76e1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e8c76e1))


### Features

* **simulation:** new rotation tip for rotations that require reuse to proc to work ([a7c3344](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a7c3344))



<a name="6.4.1"></a>
## [6.4.1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.4.0...v6.4.1) (2019-12-11)


### Bug Fixes

* **inventory:** fixed an issue with autofill not taking armory into account ([7579b30](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7579b30))
* **list:** fixed an issue with HQ filter in setting blocking input somehow ([74d5657](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/74d5657))
* **log-tracker:** fixed empty pages in log tracker ([2d12345](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2d12345))


### Features

* **inventory:** added retainer sale as inventories in the inventory page ([c369a67](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c369a67))



<a name="6.4.0"></a>
# [6.4.0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.3.3...v6.4.0) (2019-12-10)


### Bug Fixes

* **db:** changed bite times display for easier reading (graph was useless) ([0f1808f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0f1808f))
* **db:** fixed an issue with some place names not displayed properly ([655ba1a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/655ba1a))
* **db:** fixed position name for some npcs ([d08d294](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d08d294))
* **desktop:** fixed an issue with always on top option not saved properly ([4c73767](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4c73767)), closes [#1278](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1278)
* **desktop:** ignore packets inside overlays ([59cfe15](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/59cfe15))
* **fish:** fixed misses detection on fishing reporter ([f4d3c72](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f4d3c72))
* **i18n:** fixed a typo in recipe finder ([76c64c4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/76c64c4))
* **i18n:** fixed missing translation for fishing data reloader ([df3a6dc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/df3a6dc))
* **list:** fixed a bug with item move event counted as item obtention ([80a85e6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/80a85e6))
* **list:** fixed an issue with masterbooks button not being reloaded properly ([0414e32](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0414e32))
* **permissions:** fixed an issue with list permissions propagation ([85f1c24](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/85f1c24))


### Features

* **core:** 5.15 content update ([b6e4683](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b6e4683))
* **core:** gathering popups now use node type as icon ([dc7c259](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/dc7c259))
* **db:** automatically select spot if there's only one available ([9122f22](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9122f22))
* **db:** fishing spot pages ([#1282](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1282)) ([f499c27](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f499c27))
* **desktop:** added an option to autofill only using HQ items when item has HQ flag ([8b34727](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8b34727)), closes [#1281](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1281)
* **desktop:** added overlay for fishing data reporter ([17ebb89](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/17ebb89))
* **desktop:** removed sync in database option entirely, as it was causing too many issues ([0ef7173](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0ef7173))
* **inventory:** added armory containers as tracked inventories ([f287a45](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f287a45))
* **layout:** added an option to show first available vendor on each item of the list ([0d94635](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0d94635))



<a name="6.3.3"></a>
## [6.3.3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.3.2...v6.3.3) (2019-12-03)


### Bug Fixes

* **desktop:** various fixes for sign-in and auto updater ([80c1ad3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/80c1ad3)), closes [#1269](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1269)
* **reporter:** fix for data reporting by adding version number to the data ([ea2420f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ea2420f))
* **solver:** fixed a small issue for when worker isn't supported ([27aa33c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/27aa33c))


### Features

* support for korean v5.00 update ([0fe1d39](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0fe1d39))



<a name="6.3.2"></a>
## [6.3.2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.3.1...v6.3.2) (2019-12-02)


### Bug Fixes

* **desktop:** fixed an issue with desktop app creating too many firewall entries ([b143e4b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b143e4b))
* **fish:** avoid multiple reports for the same event ([8efe8cf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8efe8cf))
* **fishing-data:** fixed statuses tracking and various issues ([ba420f8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ba420f8))
* **inventory:** fixed an issue with inventory updating in database ([066e6f0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/066e6f0))
* **log:** fixed duplicate entries for CRP ([bd18f5e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bd18f5e))
* **resets:** fixed icon in reset timers page for desktop app ([af28c8d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/af28c8d))


### Features

* **db:** add usual details about fishes below graphs ([ee52017](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ee52017))
* **db:** add weather % chances and weather transition % chances when filtering on a spot ([697ff06](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/697ff06))
* **db:** added fish links inside bait db pages ([a9f872e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a9f872e))
* **desktop:** switching to nsis-web to enable differential updates (testing that) ([e758882](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e758882))



<a name="6.3.1"></a>
## [6.3.1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.3.0...v6.3.1) (2019-12-01)


### Bug Fixes

* **db:** hotfix for missing https cert in gubal API ([c6db630](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c6db630))



<a name="6.3.0"></a>
# [6.3.0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.2.12...v6.3.0) (2019-12-01)


### Bug Fixes

* **list:** fixed an issue with item completion not being edited properly ([d2fbf38](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d2fbf38))
* **lists:** fixed an issue with small lists drag events not registering properly ([67e5737](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/67e5737))


### Features

* **db:** added a lot of details on fish db pages, using data captured ([#1262](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1262)) ([7e53923](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7e53923))
* **list:** added a button to fill current list with inventory ([9432222](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9432222))
* **solver:** solver is way faster, as it's now running as a web worker ([b9e51ad](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b9e51ad))



<a name="6.2.12"></a>
## [6.2.12](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.2.11...v6.2.12) (2019-11-30)


### Bug Fixes

* **data:** fixed dungeon names ([1b014b7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1b014b7))
* **profile:** fixed an issue with stats filling not reloading stats after fill operation ([25dbce9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/25dbce9))
* **rotations:** fixed an issue with rotation picker when opening from list ([d3f0028](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d3f0028))


### Features

* **desktop:** added an option inside settings page to enable autofill by default ([ebd0e47](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ebd0e47))



<a name="6.2.11"></a>
## [6.2.11](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.2.10...v6.2.11) (2019-11-28)


### Bug Fixes

* **custom-items:** fixed an issue with custom items not importing properly ([dfc0693](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/dfc0693))
* **desktop:** fixed updateInventorySlot packet ([160980a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/160980a))
* **inventory:** fixed an issue with inventory item names being wrong ([a91ee3a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a91ee3a))
* **optimizer:** updated grammar in optimizer l10n ([37e1c57](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/37e1c57))



<a name="6.2.10"></a>
## [6.2.10](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.2.9...v6.2.10) (2019-11-27)


### Bug Fixes

* **alarms:** fixed a layout issue with compact display mode ([040309d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/040309d))
* **alarms:** fixed an issue when creating an alarm for some items ([be4e1bd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/be4e1bd))
* **layout:** fixed an issue when creating a new layout ([08da8c5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/08da8c5))
* **levequests:** fixed an issue with levequests page being unresponsive ([b7889a1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b7889a1))
* **optimizer:** fixed an issue with ignored containers not affecting total count ([0983e32](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0983e32))



<a name="6.2.9"></a>
## [6.2.9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.2.7...v6.2.9) (2019-11-26)


### Bug Fixes

* fix for playTime packet file in machina wrapper ([b4a3723](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b4a3723))
* **desktop:** fixed an issue with desktop app being started again when in tray ([504ac4e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/504ac4e))
* **list:** fixed an issue breaking offline lists entirely ([8bad892](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8bad892))



<a name="6.2.8"></a>
## [6.2.8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.2.7...v6.2.8) (2019-11-26)


### Bug Fixes

* **desktop:** fixed an issue with desktop app being started again when in tray ([504ac4e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/504ac4e))
* **list:** fixed an issue breaking offline lists entirely ([8bad892](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8bad892))



<a name="6.2.7"></a>
## [6.2.7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.2.6...v6.2.7) (2019-11-24)


### Bug Fixes

* **alarms:** fixed a layout issue with compact display ([ad02575](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ad02575))
* **db:** fixed leve turn-ins count for leves ([66e2944](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/66e2944))
* **desktop:** prevent too many firewall rules addition ([c7295ac](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c7295ac))
* **inventory:** fixed an issue with inventory persistence in database ([b1f4a96](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b1f4a96))
* **optimizer:** added more ignored container for handins and gil inventories ([e8bb672](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e8bb672))
* **packets:** fixed packet capture for inventory stuff ([c1c730a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c1c730a))
* **search:** Fix recipe search not showing any items in some cases ([a13249c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a13249c))
* **search:** fixed an issue with some search terms not returning results at all ([21d5abc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/21d5abc))
* Correct world ID not changing for data uploads when appropriate ([8ab5186](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8ab5186))


### Features

* **core:** added new tip in the pool: Start_desktop_before_game ([d2bf3d5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d2bf3d5))
* **data:** added fishing data capture inside desktop app ([19b44cc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/19b44cc))
* **desktop:** app now stays in tray when closing (with an option to always quit) ([ee85a38](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ee85a38))
* **desktop:** new option to start the app as minimized in tray ([a634072](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a634072))



<a name="6.2.6"></a>
## [6.2.6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.2.4...v6.2.6) (2019-11-16)


### Bug Fixes

* **alarms:** fixed alarm overlay toggle not working properly ([0738167](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0738167))
* **inventory:** fixed an issue with ishgard deliveries counting as if they were obtained ([3bfc38a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3bfc38a))
* **inventory:** inventory search is no longer case-sensitive ([eb88f1b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/eb88f1b))
* **inventory:** inventory sync in database will only happen every 30 seconds now ([29e9bdb](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/29e9bdb))
* **list:** fixed an issue with final items not being marked as done properly ([1ad8106](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1ad8106))
* **list:** smaller lists will now be more reactive ([a96abb8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a96abb8))
* **optimizer:** fixed an issue with inventory optimizer not loading properly ([85239fc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/85239fc))
* **rotation:** rotation picker search is no longer case-sensitive ([73469e4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/73469e4))
* **search:** removed dated items from search results ([7a2f264](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7a2f264))
* **simulator:** fixed an issue with dirty warning popup spawning way too much ([6ce73ee](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6ce73ee))


### Features

* **desktop:** added a button to open a website link in desktop ([7676b39](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7676b39))
* **simulator:** added Ishgard restoration collectability breakpoints ([a51459c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a51459c))
* **simulator:** added total macro duration to macro popup ([65502bf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/65502bf))



<a name="6.2.5"></a>
## [6.2.5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.2.4...v6.2.5) (2019-11-16)


### Bug Fixes

* **alarms:** fixed alarm overlay toggle not working properly ([0738167](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0738167))
* **inventory:** fixed an issue with ishgard deliveries counting as if they were obtained ([3bfc38a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3bfc38a))
* **inventory:** inventory search is no longer case-sensitive ([eb88f1b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/eb88f1b))
* **inventory:** inventory sync in database will only happen every 30 seconds now ([29e9bdb](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/29e9bdb))
* **list:** smaller lists will now be more reactive ([a96abb8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a96abb8))
* **optimizer:** fixed an issue with inventory optimizer not loading properly ([85239fc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/85239fc))
* **rotation:** rotation picker search is no longer case-sensitive ([73469e4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/73469e4))
* **search:** removed dated items from search results ([7a2f264](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7a2f264))
* **simulator:** fixed an issue with dirty warning popup spawning way too much ([6ce73ee](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6ce73ee))


### Features

* **desktop:** added a button to open a website link in desktop ([7676b39](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7676b39))
* **simulator:** added Ishgard restoration collectability breakpoints ([a51459c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a51459c))
* **simulator:** added total macro duration to macro popup ([65502bf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/65502bf))



<a name="6.2.4"></a>
## [6.2.4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.2.3...v6.2.4) (2019-11-13)


### Bug Fixes

* **desktop:** fixed an issue making Teamcraft start in tray bar ([6fad935](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6fad935))
* **inventory:** saving inventory in database will now use less resources and be more reactive ([dd2a46c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/dd2a46c))



<a name="6.2.3"></a>
## [6.2.3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.2.2...v6.2.3) (2019-11-12)


### Bug Fixes

* Update opcode for class stats to fix stat autofill ([8b02a67](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8b02a67))



<a name="6.2.2"></a>
## [6.2.2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.2.1...v6.2.2) (2019-11-12)


### Bug Fixes

* **desktop:** fixed an issue when opening a link from website ([af543f4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/af543f4))
* **list:** fixed an issue with lists not being updated properly ([a57644d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a57644d))
* **macro:** fixed some checkboxes being checked by default ([a6c27d2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a6c27d2))


### Features

* **data:** 5.11 content update ([0fa4afc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0fa4afc))
* **packet-capture:** 5.11 packet structure updates ([dc0b154](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/dc0b154))



<a name="6.2.1"></a>
## [6.2.1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.12...v6.2.1) (2019-11-11)


### Bug Fixes

* **core:** fixed an issue with $key property being overwritten ([5db46a0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5db46a0))
* **links:** fixed an issue with custom links not loading properly ([03e0ab9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/03e0ab9))
* **list:** fixed a bug with colors not being reset properly after list reset ([3df9ced](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3df9ced))
* **list:** fixed an issue with "show craftable amount" option ([7a7d2b2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7a7d2b2))
* **list:** fixed an issue with some replica items not being added properly to a list ([2f98db4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2f98db4))
* **list:** reduced bandwidth usage when updating a list by ~90% ([fd10f19](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fd10f19))
* **log:** fixed an issue with auto mark as done in log not working properly ([7855f0f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7855f0f))
* **marketboard:** fixed an issue with marketboard data sometimes crashing ([cdf7a47](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cdf7a47))
* **perf:** big performance optimization for CPU usage on big lists with autofill ([d2fda9c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d2fda9c)), closes [#1196](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1196)
* **profile:** fixed an issue with character linking with lodestone ID ([6cd11cb](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6cd11cb))
* **rotations:** fixed an issue with favorite rotations breaking in some cases ([ea420c7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ea420c7))
* **search:** fixed an issue with japanese language not working with a short query ([f7d01c3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f7d01c3)), closes [#1211](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1211)
* **settings:** added categories to the settings popup for better display ([b685da8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b685da8))
* **simulator:** fix brand of elements tip incorrectly triggering ([9c34eb1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9c34eb1))
* **simulator:** possible fix for hq ingredients selection being empty ([e2655c9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e2655c9))
* **trades:** currency ignore button now disappears if there's no alternative ([5011e34](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5011e34))
* **ux:** fixed an issue with item names not being updated properly when switching language ([941ec19](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/941ec19))


### Features

* **autofill:** added an option to change notification sound and volume ([47c62fc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/47c62fc))
* **inventory:** you can now search for an item in the inventory page ([24d6a95](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/24d6a95))
* **list:** you can now pin a list to be able to access it easily from anywhere ([986de63](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/986de63))
* **list:** you can now set custom color for list panels ([0b9507b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0b9507b))
* **optimizer:** you can now ignore an entire inventory ([f3948f2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f3948f2))
* **packet capture:** CN-region packet capture is now supported ^^ ([a21e382](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a21e382))
* **simulator:** Remember all macro settings ([6db6f76](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6db6f76))



<a name="6.2.0"></a>
# [6.2.0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.12...v6.2.0) (2019-11-11)


### Bug Fixes

* **links:** fixed an issue with custom links not loading properly ([03e0ab9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/03e0ab9))
* **list:** fixed a bug with colors not being reset properly after list reset ([3df9ced](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3df9ced))
* **list:** fixed an issue with "show craftable amount" option ([7a7d2b2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7a7d2b2))
* **list:** fixed an issue with some replica items not being added properly to a list ([2f98db4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2f98db4))
* **list:** reduced bandwidth usage when updating a list by ~90% ([fd10f19](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fd10f19))
* **marketboard:** fixed an issue with marketboard data sometimes crashing ([cdf7a47](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cdf7a47))
* **perf:** big performance optimization for CPU usage on big lists with autofill ([d2fda9c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d2fda9c)), closes [#1196](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1196)
* **profile:** fixed an issue with character linking with lodestone ID ([6cd11cb](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6cd11cb))
* **rotations:** fixed an issue with favorite rotations breaking in some cases ([ea420c7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ea420c7))
* **search:** fixed an issue with japanese language not working with a short query ([f7d01c3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f7d01c3)), closes [#1211](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1211)
* **settings:** added categories to the settings popup for better display ([b685da8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b685da8))
* **simulator:** fix brand of elements tip incorrectly triggering ([9c34eb1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9c34eb1))
* **simulator:** possible fix for hq ingredients selection being empty ([e2655c9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e2655c9))
* **trades:** currency ignore button now disappears if there's no alternative ([5011e34](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5011e34))


### Features

* **autofill:** added an option to change notification sound and volume ([47c62fc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/47c62fc))
* **inventory:** you can now search for an item in the inventory page ([24d6a95](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/24d6a95))
* **list:** you can now pin a list to be able to access it easily from anywhere ([986de63](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/986de63))
* **list:** you can now set custom color for list panels ([0b9507b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0b9507b))
* **optimizer:** you can now ignore an entire inventory ([f3948f2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f3948f2))
* **packet capture:** CN-region packet capture is now supported ^^ ([a21e382](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a21e382))
* **simulator:** Remember all macro settings ([6db6f76](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6db6f76))



<a name="6.1.12"></a>
## [6.1.12](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.11...v6.1.12) (2019-11-08)


### Bug Fixes

* **list:** better fix for item rows not changing color ([4948dff](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4948dff))
* **list:** performance improvements for CPU usage in lists with autofill ([36127da](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/36127da))


### BREAKING CHANGES

* **list:** Please make sure that everybody using your list has latest version, else you'll have to regenerate the list everytime someone contributes with an outdated version



<a name="6.1.11"></a>
## [6.1.11](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.10...v6.1.11) (2019-11-07)


### Bug Fixes

* **auth:** fixed an issue with deleted characters not being loaded properly ([39e87dc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/39e87dc))
* **desktop:** fixed an issue with firewall permissions not updated properly ([d917d06](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d917d06))
* **list:** fixed an issue with item color not changing properly ([6029fac](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6029fac))
* **lists:** fixed lists page not loading for some users ([2f8ff77](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2f8ff77))


### Features

* **core:** added a version lock system, to avoid outdated versions after this one ([b73d67d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b73d67d))
* **sidebar:** sidebar state is now saved in localstorage ([8d67645](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8d67645))



<a name="6.1.10"></a>
## [6.1.10](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.9...v6.1.10) (2019-11-06)


### Bug Fixes

* **list:** fixed an issue with some lists having no details on their items at all ([4ac02b3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4ac02b3))
* **optimizer:** performance optimizations for inventory optimizer ([68937bd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/68937bd))


### Features

* **fates:** added all positions of fates (kudos to Icarus for the data) ([fc1541d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fc1541d))
* **inventory:** added a button to clear all your inventories at once ([c277e34](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c277e34))
* **inventory:** new setting to track retainer's market inventory too ([a51449c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a51449c)), closes [#1194](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1194)
* **layout:** second default layout: Default layout without vendors ([98616e7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/98616e7))



<a name="6.1.9"></a>
## [6.1.9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.6...v6.1.9) (2019-11-05)


### Bug Fixes

* **inventory:** fixed an issue with price not taking quantity into account ([53499b3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/53499b3))
* **list:** fixed a case where lists would load before lazy data, making them empty ([ec43716](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ec43716))
* **list:** fixed an issue with new lists crashing upon update that is not item update ([cd0f13a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cd0f13a))
* **list:** fixed an issue with some lists not loading properly ([60b9dd2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/60b9dd2))
* **list:** fixed high CPU usage when marking an item as done in a large list ([9fc0706](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9fc0706)), closes [#1196](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1196)
* **lists:** fixed an issue with some lists not loading properly in workshops or team panels ([539f574](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/539f574))
* **rotation-tips:** fixed an issue with "avoid using good actions" tip ([e715f27](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e715f27))
* fixed a case where the confirmation popup for unsaved change popped too often ([5b3db30](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5b3db30))
* **search:** removed dated items from search results ([a7fd33f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a7fd33f))
* **team:** no more hook messages when user doesn't have permission to edit the list ([fa1e163](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fa1e163))


### Features

* **list:** you can now ignore a currency in total panel price popup ([5fcb2f5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5fcb2f5))
* **simulator:** new rotation tip: avoid using actions that require Good ([39c7c64](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/39c7c64))
* **simulator:** remember end of macro sound option ([4551687](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4551687))



<a name="6.1.8"></a>
## [6.1.8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.6...v6.1.8) (2019-11-05)


### Bug Fixes

* **inventory:** fixed an issue with price not taking quantity into account ([53499b3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/53499b3))
* **list:** fixed an issue with new lists crashing upon update that is not item update ([cd0f13a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cd0f13a))
* **rotation-tips:** fixed an issue with "avoid using good actions" tip ([e715f27](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e715f27))
* fixed a case where the confirmation popup for unsaved change popped too often ([5b3db30](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5b3db30))
* **list:** fixed a case where lists would load before lazy data, making them empty ([ec43716](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ec43716))
* **list:** fixed high CPU usage when marking an item as done in a large list ([9fc0706](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9fc0706)), closes [#1196](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1196)
* **search:** removed dated items from search results ([a7fd33f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a7fd33f))
* **team:** no more hook messages when user doesn't have permission to edit the list ([fa1e163](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fa1e163))


### Features

* **list:** you can now ignore a currency in total panel price popup ([5fcb2f5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5fcb2f5))
* **simulator:** new rotation tip: avoid using actions that require Good ([39c7c64](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/39c7c64))
* **simulator:** remember end of macro sound option ([4551687](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4551687))



<a name="6.1.7"></a>
## [6.1.7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.6...v6.1.7) (2019-11-05)


### Bug Fixes

* fixed a case where the confirmation popup for unsaved change popped too often ([5b3db30](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5b3db30))
* **inventory:** fixed an issue with price not taking quantity into account ([53499b3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/53499b3))
* **list:** fixed a case where lists would load before lazy data, making them empty ([ec43716](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ec43716))
* **list:** fixed high CPU usage when marking an item as done in a large list ([9fc0706](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9fc0706)), closes [#1196](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1196)
* **search:** removed dated items from search results ([a7fd33f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a7fd33f))
* **team:** no more hook messages when user doesn't have permission to edit the list ([fa1e163](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fa1e163))


### Features

* **list:** you can now ignore a currency in total panel price popup ([5fcb2f5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5fcb2f5))
* **simulator:** new rotation tip: avoid using actions that require Good ([39c7c64](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/39c7c64))
* **simulator:** remember end of macro sound option ([4551687](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4551687))



<a name="6.1.6"></a>
## [6.1.6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.5...v6.1.6) (2019-11-03)


### Bug Fixes

* **data:** fixed missing folklore book entries ([1a5aea9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1a5aea9))
* **data:** fixed missing folklore book entries for fisher ([5d618b2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5d618b2))
* **db:** fixed xivapi error when searching for ANY type ([017e9e1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/017e9e1))
* **inventory:** don't show items on sale as if they were in retainer's inventory ([d1cfb41](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d1cfb41))
* **list:** fixed realtime position tracking in zone breakdown ([78c0641](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/78c0641))
* **log:** fixed first CRP page showing duplicates ([fd2aaa3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fd2aaa3))
* **optimizer:** fixed an issue with not ignoring a tip anymore clearing the ignored tips ([c60c972](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c60c972))
* **optimizer:** fixed missing translation label ([9855a57](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9855a57))
* **optimizer:** ignoring crystal containers ([f015a2f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f015a2f))
* **simulator:** fixed ingenuity accuracy for lower levels ([aeedfb2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/aeedfb2))


### Features

* **layout:** added new layout row filter: IS_HQ ([d5618d1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d5618d1))
* **list:** you can now enable a notification when you finished an item with autofill ([6839738](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6839738))
* **search:** Ignore HQ and Collectable symbols in search ([b110979](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b110979))



<a name="6.1.5"></a>
## [6.1.5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.4...v6.1.5) (2019-11-02)


### Bug Fixes

* **community-lists:** fixed an out of memory error with community lists loading ([8fa0fb5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8fa0fb5))
* **inventory:** fixed an issue with drag and drop actions not being tracked ([6446396](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6446396))
* **list:** fixed an issue with attached rotations that have been deleted crashing the page ([f23acc2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f23acc2))
* **lists:** fixed an issue with "saving in database" loading indefinitely ([d6154be](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d6154be))
* **optimizer:** removed retainer gear from optimization checks ([f76fa5b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f76fa5b))
* **simulator:** fixed an issue with Ingenuity import with FR language ([0db78e5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0db78e5))
* **simulator:** Use Durability Restorating Tip Later incorrectly triggering ([150c4f6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/150c4f6))


### Features

* **db:** added new search field to quickly hop to another db page ([dc7e227](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/dc7e227))
* **list:** final items display is now persisted in inventory view ([beb944a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/beb944a))
* **optimizer:** new optimizer: items that you have in very small stacks ([8127353](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8127353))



<a name="6.1.4"></a>
## [6.1.4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.3...v6.1.4) (2019-11-01)


### Bug Fixes

* **desktop:** switched back to raw socket as default capture mode ([86fea67](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/86fea67))
* **list:** fixed an issue with lists page breaking on broken lists ([5dd201c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5dd201c))
* **list:** fixed an issue with lists page breaking on broken lists ([cc12b2e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cc12b2e))
* **lists:** fixed an issue with lists disappearing after you opened them ([55ac45f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/55ac45f))
* **lists:** fixed an issue with lists not loaded properly ([6872ccd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6872ccd))
* **optimizer:** fixed an issue with duplicates not being computed properly ([207b37f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/207b37f))
* **search:** fixed list loading popup hanging ([de20d8b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/de20d8b))


### Features

* **layout:** added new ordering: SLOT ([cede9dd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cede9dd))
* **simulator:** support for statusoff Final Appraisal in macro import ([7023125](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7023125))
* **solver:** updated solver for 5.1 rotations ([fde9be9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fde9be9))



<a name="6.1.3"></a>
## [6.1.3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.2...v6.1.3) (2019-10-31)


### Bug Fixes

* **data:** added missing foods ands weathers ([917c578](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/917c578))
* **i18n:** fixed typo in inventory optimizer ([6059a77](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6059a77))
* **inventory-optimizer:** don't consider items that are on sale anymore ([d226c69](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d226c69))
* **list:** fixed an issue with regeneration not taking WVR changes into account ([40fda6b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/40fda6b)), closes [#1173](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1173)
* **stats:** fixed specialist CP bonus not being applied properly ([8882382](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8882382)), closes [#1179](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1179)
* **tips:** fixed IQ tip when using Reflect instead ([bdd8ea3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bdd8ea3))


### Features

* **desktop:** switched back to winpcap monitor by default ([afe3770](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/afe3770))
* **optimizer:** added copy isearch on item name click ([6f67847](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6f67847))
* **simulator:** added a custom action to remove final appraisal in rotation ([2f337d0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2f337d0))
* **simulator:** Option to split macro before byregot's blessing ([1e43bbc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1e43bbc))



<a name="6.1.2"></a>
## [6.1.2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.1...v6.1.2) (2019-10-31)


### Bug Fixes

* **alarms:** fixed an issue with some alarms not showing properly ([37cc2e0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/37cc2e0))
* **data:** multiple missing data fixes ([8c0ee83](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8c0ee83))
* **db:** possible fix for quota exceeded ([ab805b1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ab805b1))



<a name="6.1.1"></a>
## [6.1.1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.1.0...v6.1.1) (2019-10-30)


### Bug Fixes

* **data:** fixed missing map backgrounds ([1bbf34d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1bbf34d))
* **data:** fixed missing map data ([c990493](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c990493))
* **simulator:** fixed final appraisal buff icon ([bd0f812](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bd0f812))
* **simulator:** fixed macro import ([7417a02](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7417a02))
* **simulator:** fixed multiple inaccuracies ([f78906d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f78906d))


### Features

* **levequests:** added label for exp computing with global exp mode ([c6607d1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c6607d1))
* **simulator:** Allow saving stats to profile after apply ([4a09171](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4a09171))
* **simulator:** removed additional actions macro ([f781e1d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f781e1d))
* **simulator:** removed consumables checkbox ([48e0011](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/48e0011))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.16...v6.1.0) (2019-10-30)


### Bug Fixes

* **inventory:** fixed an issue with items being sent via mail or trade ([1bddd19](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1bddd19))
* **inventory:** fixed an issue with marketboard price estimate ([443f4b7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/443f4b7))
* **item-picker:** fixed single item pick in list item addition popup ([72e2fd0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/72e2fd0))


### Features

* **data:** add support for 5.1 data ([d026269](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d026269))
* **inventory:** added inventory optimizer under helpers ([20b8438](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/20b8438))
* **list:** added realtime position marker on zone breakdowns ([ab171be](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ab171be))



<a name="6.0.16"></a>
## [6.0.16](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.15...v6.0.16) (2019-10-27)


### Bug Fixes

* **auth:** fixed an issue with custom characters loading ([154991e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/154991e))
* **desktop:** overlay window sometimes not updating opacity properly ([c1e3237](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c1e3237))
* **list:** fixed an issue with workshop drafts not being shown anymore ([8dacdbe](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8dacdbe))



<a name="6.0.15"></a>
## [6.0.15](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.13...v6.0.15) (2019-10-27)


### Bug Fixes

* **auth:** fixed an issue resetting some user profiles ([9cd85bf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9cd85bf))
* **inventory:** fixed an issue with inventory saving ([3ce8c93](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3ce8c93))
* **inventory:** fixed retainers not being displayed in inventory listings ([12976d2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/12976d2))
* **log:** fixed wrong log tracking loading, showing it as empty ([883a6ef](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/883a6ef))



<a name="6.0.14"></a>
## [6.0.14](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.13...v6.0.14) (2019-10-26)


### Bug Fixes

* **auth:** fixed an issue resetting some user profiles ([9cd85bf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9cd85bf))
* **inventory:** fixed retainers not being displayed in inventory listings ([12976d2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/12976d2))



<a name="6.0.13"></a>
## [6.0.13](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.12...v6.0.13) (2019-10-26)


### Bug Fixes

* **inventory:** fixed an issue with temporary trade inventory ([066c050](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/066c050)), closes [#1147](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1147)
* **list:** fixed item picker single selection ([3ce425c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3ce425c))


### Features

* added support for chinese servers in character linking system ([3f27d0b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3f27d0b))



<a name="6.0.12"></a>
## [6.0.12](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.11...v6.0.12) (2019-10-25)


### Bug Fixes

* **i18n:** fixed grammar error in item picker context ([2e118cc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2e118cc))
* **inventory:** fixed an issue with retainers not reset properly ([eabab6e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/eabab6e))
* **item-picker:** fixed checkbox placement ([f3d3dd1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f3d3dd1))
* **item-picker:** fixed checkbox placement ([c76a469](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c76a469))



<a name="6.0.11"></a>
## [6.0.11](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.10...v6.0.11) (2019-10-24)


### Bug Fixes

* fixed an issue with some switch values not being applied properly ([bb7e34c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bb7e34c))
* **comments:** fixed long comments not being shown properly ([ddbd135](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ddbd135))



<a name="6.0.10"></a>
## [6.0.10](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.9...v6.0.10) (2019-10-23)


### Bug Fixes

* **alarms:** fixed an issue with alarms acting strange when being enabled/disabled ([7467e1c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7467e1c))
* **auth:** changed the way user is persisted in order to fix user destruction bug ([c54fc53](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c54fc53))
* **autofill-stats:** added a message about food effects when updating stats ([f1427e5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f1427e5))
* **discord:** fixed item icons in discord hook messages ([3d708aa](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3d708aa))
* **gc-supply:** fixed broken seal icon ([2e66af0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2e66af0))
* **inventory:** fixed an error randomly happening when autocompleting while afk ([daeec01](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/daeec01))
* **inventory:** fixed an error when trying to load inventory ([b2340ac](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b2340ac))
* **universalis:** removed universalis console logs ([a6d80c7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a6d80c7))
* **ux:** removed warning banners on overlay ([1b7769e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1b7769e))


### Features

* **desktop:** added verbose mode for better KO debugging ([6142e3b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6142e3b))



<a name="6.0.9"></a>
## [6.0.9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.8...v6.0.9) (2019-10-22)


### Features

* **inventory:** inventory persistence in database is now optional ([e29105a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e29105a))



<a name="6.0.8"></a>
## [6.0.8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.6...v6.0.8) (2019-10-22)


### Bug Fixes

* **inventory:** fixed inventory deletion for retainers ([c80f9e9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c80f9e9))
* fixed an issue with checkbox values not being applied properly ([ec7e93e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ec7e93e))
* **inventory:** fixed an issue with inventory tracking not saving data properly ([366a5af](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/366a5af))


### Features

* **inventory:** added a button to manually reset an inventory ([1a6494f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1a6494f))



<a name="6.0.7"></a>
## [6.0.7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.6...v6.0.7) (2019-10-21)


### Bug Fixes

* fixed an issue with checkbox values not being applied properly ([ec7e93e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ec7e93e))
* **inventory:** fixed an issue with inventory tracking not saving data properly ([366a5af](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/366a5af))


### Features

* **inventory:** added a button to manually reset an inventory ([1a6494f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1a6494f))



<a name="6.0.6"></a>
## [6.0.6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.4...v6.0.6) (2019-10-20)


### Bug Fixes

* **desktop:** fixed an error happening randomly with log entries ([77ce7c0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/77ce7c0))
* **firestore:** fixed an issue exponentially breaking database usage ([29528ab](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/29528ab))
* **inventory:** fixed an issue with retainer tracking for right click interactions ([a895508](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a895508))



<a name="6.0.5"></a>
## [6.0.5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.4...v6.0.5) (2019-10-20)


### Bug Fixes

* **desktop:** fixed an error happening randomly with log entries ([77ce7c0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/77ce7c0))
* **inventory:** fixed an issue with retainer tracking for right click interactions ([a895508](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a895508))



<a name="6.0.4"></a>
## [6.0.4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.2...v6.0.4) (2019-10-20)


### Bug Fixes

* **quota:** atomic update will only be used for shared lists now ([ac47566](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ac47566))



<a name="6.0.3"></a>
## [6.0.3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.0...v6.0.3) (2019-10-20)


### Bug Fixes

* **import:** fixed an issue with list link importer ([a3b162b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a3b162b))
* **inventory:** fixed an issue with premium saddlebag not being tracked properly ([a10d0cf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a10d0cf))
* **inventory:** fixed crystals and currencies tracking ([82b6467](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/82b6467))
* **inventory:** fixed FC chest interactions ([6d6b0db](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6d6b0db))
* **lists:** fixed a display bug happening in some lists created with 6.0.0 ([8ca37a7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8ca37a7))
* **lists:** fixed an issue with yield being forced to 1 ([7e77fda](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7e77fda))
* **permissions:** fixes permissions box crashing when opened ([1268840](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1268840))
* **quota:** atomic update will only be used for shared lists now ([ac47566](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ac47566))
* **rotation-picker:** fixed an issue with rotation picker not opening anymore ([7d517cd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7d517cd))


### Features

* **lists:** added amount in inventory inside requirements popup ([a8ced2c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a8ced2c))



<a name="6.0.2"></a>
## [6.0.2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.0...v6.0.2) (2019-10-19)


### Bug Fixes

* **import:** fixed an issue with list link importer ([a3b162b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a3b162b))
* **inventory:** fixed an issue with premium saddlebag not being tracked properly ([a10d0cf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a10d0cf))
* **inventory:** fixed crystals and currencies tracking ([82b6467](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/82b6467))
* **inventory:** fixed FC chest interactions ([6d6b0db](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6d6b0db))
* **lists:** fixed a display bug happening in some lists created with 6.0.0 ([8ca37a7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8ca37a7))
* **lists:** fixed an issue with yield being forced to 1 ([7e77fda](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7e77fda))
* **permissions:** fixes permissions box crashing when opened ([1268840](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1268840))
* **rotation-picker:** fixed an issue with rotation picker not opening anymore ([7d517cd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7d517cd))


### Features

* **lists:** added amount in inventory inside requirements popup ([a8ced2c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a8ced2c))



<a name="6.0.1"></a>
## [6.0.1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v6.0.0...v6.0.1) (2019-10-19)


### Bug Fixes

* **inventory:** fixed an issue with premium saddlebag not being tracked properly ([a10d0cf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a10d0cf))
* **lists:** fixed an issue with yield being forced to 1 ([7e77fda](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7e77fda))
* **permissions:** fixes permissions box crashing when opened ([1268840](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1268840))


### Features

* **lists:** added amount in inventory inside requirements popup ([a8ced2c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a8ced2c))



<a name="6.0.0"></a>
# [6.0.0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.8.5...v6.0.0) (2019-10-19)


### Bug Fixes

* **i18n:** fixed "rp" label in ingame alarm macro generator ([d265bb5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d265bb5))
* **log-tracker:** fixed wrong * label on other masterbook recipes ([52590ff](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/52590ff))
* **search:** fixed an issue with debounce not being applied properly in some cases ([dbe0eeb](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/dbe0eeb))


### Features

* added chinese data for 5.0 update ([172bb0f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/172bb0f))
* **lists:** implemented proper atomic update for list progression input ([840422e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/840422e))
* **lists:** removed all the unnecessary persisted data from lists ([c866760](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c866760))
* **simulator:** added starting quality input for when there's no ingredients data ([7f83248](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7f83248)), closes [#1117](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1117)
* added packet capture features (https://wiki.ffxivteamcraft.com/advanced-features/packet-capture) ([#1113](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1113)) ([73e6eb9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/73e6eb9))
* added support for stats autofilling using packet capture ([e35da0c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e35da0c))



<a name="5.8.5"></a>
## [5.8.5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.8.4...v5.8.5) (2019-09-20)


### Bug Fixes

* **log-tracker:** fixed an issue with offline lists on log tracker ([8bcffc2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8bcffc2))
* **marketboard:** fixed ordering in history tab ([d7d7ef3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d7d7ef3))
* **marketboard:** fixed pricing mode integration ([a0255b2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a0255b2))
* **offline-list:** fixed multiple issues with offline lists ([a9aa6ab](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a9aa6ab))
* **pricing:** fixed an issue with copy to text outputing wrong values ([2ed20a9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2ed20a9))
* **search:** fixed an issue with chinese recipe search ([66ad4d9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/66ad4d9))


### Features

* **layout:** new filter: IS_END_CRAFT_MATERIAL ([8f6a7b8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8f6a7b8))



<a name="5.8.4"></a>
## [5.8.4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.8.3...v5.8.4) (2019-09-17)


### Bug Fixes

* **marketboard:** fixed an issue with marketboard popup's total price and history date ([efb4e99](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/efb4e99))



<a name="5.8.3"></a>
## [5.8.3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.8.2...v5.8.3) (2019-09-17)


### Bug Fixes

* **importer:** fixed an issue with garlandtools importer ([d9d1ea4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d9d1ea4))
* **list:** fixed an issue with lists not being regenerated properly in some cases ([4f63560](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4f63560))


### Features

* **list:** added closest aetheryte to alarm button's tooltip ([191812b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/191812b))



<a name="5.8.2"></a>
## [5.8.2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.8.1...v5.8.2) (2019-09-10)


### Bug Fixes

* **teams:** fixed an issue with webhook sending a message for events it should ignore ([c36c963](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c36c963))


### Features

* **list:** added original url as list description when importing a list from external tool ([3b980c0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3b980c0))
* **list:** added support for import from garlandtools group ([efa0260](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/efa0260))
* **market:** re-enabled marketboard-related features using universalis ([3fd808](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3fd808))



<a name="5.8.1"></a>
## [5.8.1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.8.0...v5.8.1) (2019-09-09)


### Bug Fixes

* **list:** fixed a bug when regenerating an empty list ([4641155](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4641155))
* **list:** fixed a bug when upgrading an ephemeral list to permanent ([79c4f75](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/79c4f75))
* **rotation:** removed rotation key from rotation panel ([68e7f1a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/68e7f1a))



<a name="5.8.0"></a>
# [5.8.0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.7.12...v5.8.0) (2019-09-08)


### Bug Fixes

* **data:** fixed an issue preventing voyages from being extracted properly ([7be9698](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7be9698))
* **db:** fixed fishermen's horizon aetheryte in dravanian forelands map ([bb6844b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bb6844b))
* **progress:** don't show progress for empty operations array ([43100d7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/43100d7))
* **rotations:** fixed an issue with folders content reordering ([16bc62d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/16bc62d))
* **teams:** fixed an issue with list completion not being saved with teams not having a webhook ([476fb6e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/476fb6e))
* **teams:** fixed final items progression not showing inside teams webhook configuration ([b94a33f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b94a33f))
* **xivapi:** better handling of 429 error in community pages ([44a80d0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/44a80d0))


### Features

* **db:** added patch link on all database pages ([5e891dd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5e891dd))
* **list:** added contribution % stats popup, to see how each person contributed to the list ([8067eb0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8067eb0))
* **list:** you can now create offline lists, faster with slower network but cannot be shared ([953c121](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/953c121))
* **list:** you can now link a rotation to an item ([2adeaa7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2adeaa7))
* **patreon:** new supporter: Glanyx ! ([10469c4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/10469c4))
* **settings:** added an option to disable auto search as you type ([38ce10e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/38ce10e))
* **voyages:** added i18n support for voyages ([1f4e356](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1f4e356))
* support for korean v4.56 update ([cc36c24](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cc36c24))
* **log-tracker:** added hide completed items option to FSH tracker ([baa410e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/baa410e))
* **settings:** added Kugane, Crystrium and Eulmore as starting point ([4cd48ed](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4cd48ed))



<a name="5.7.12"></a>
## [5.7.12](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.7.11...v5.7.12) (2019-08-29)


### Bug Fixes

* **rotation-folder:** fixed an issue with rotations loading not working properly ([e964862](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e964862))
* **teams:** fixed an issue with list row assignment not showing team members in some cases ([31c1726](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/31c1726))


### Features

* **patreon:** new supporter: Icknickl Lodien ([c270b3f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c270b3f))



<a name="5.7.11"></a>
## [5.7.11](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.7.10...v5.7.11) (2019-08-27)


### Bug Fixes

* **list:** fixed an issue with lists sometimes crashing with 5.7.10 update ([8037851](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8037851))
* **list:** fixed ordering in text export for tiers system ([1e26797](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1e26797))


### Features

* **log-tracker:** added toggle to hide completes elements on gathering tracker ([69a6217](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/69a6217))
* **profile:** added community rotations to public profile page ([0294f23](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0294f23))



<a name="5.7.10"></a>
## [5.7.10](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.7.9...v5.7.10) (2019-08-24)


### Bug Fixes

* **navigation-map:** fixed total not showing correctly in full navigation path ([ea3904f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ea3904f))


### Features

* **list:** you can now assign multiple users to an item ([bf47202](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bf47202))
* **list:** you can now mark an entire panel as done at once ([d986e2c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d986e2c))
* **list:** you can now undo actions from the history view inside the list ([a1bc9cb](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a1bc9cb))
* **permissions:** you can now share a list with only participate permission ([c187d63](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c187d63))
* **simulator:** excellent and poor now also apply their counterparts properly ([4911059](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4911059))

#### A note about the permission changes

The new permissions system can share lists with an explicit `PARTICIPATE` permission, this means that if you set someone's permission level to `PARTICIPATE` on a list,
it'll show inside of their lists page, same applies for workshops. This is meant to share lists easily without having to give a link and mark it as favorite.


<a name="5.7.9"></a>
## [5.7.9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.7.8...v5.7.9) (2019-08-23)


### Bug Fixes

* **db:** fixed position for raw petalite ([b372443](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b372443))
* **layout:** fixed an issue with some filters not using zone breakdown properly ([ce903e3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ce903e3))


### Features

* **navigation:** added total of items needed for a given navigation step ([2f78b46](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2f78b46))
* **search:** better fuzzy search (e.g: "facet fending" now returns proper results) ([c7565b8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c7565b8))



<a name="5.7.8"></a>
## [5.7.8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.7.7...v5.7.8) (2019-08-15)


### Bug Fixes

* **i18n:** fixed missing translation in search placeholder ([71550f5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/71550f5))
* **list:** fixed icon priority for wolf marks ([d915ce5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d915ce5))


### Features

* **alarms:** added closest aetheryte to the compact display and better layout for slot ([0596345](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0596345))
* **db:** updated data with newest monsters positions ([887a9e5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/887a9e5))
* **desktop:** better updating system with button inside topbar ([958a02f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/958a02f))



<a name="5.7.7"></a>
## [5.7.7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.7.6...v5.7.7) (2019-08-08)


### Bug Fixes

* **core:** fixed cdn data loading ([a2bc425](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a2bc425))
* **i18n:** fixed wrong translation files loading ([0cc98bd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0cc98bd))
* **simulator:** fixed a bug with Hasty Touch missing quotes in aactions macro ([e69f76c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e69f76c))



<a name="5.7.6"></a>
## [5.7.6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.7.5...v5.7.6) (2019-08-07)


### Bug Fixes

* **auth:** fixed a bug preventing korean users from linking character ([220496a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/220496a))



<a name="5.7.5"></a>
## [5.7.5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.7.4...v5.7.5) (2019-08-06)


### Bug Fixes

* **desktop:** fixed broken icons on desktop app ([e2f5cef](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e2f5cef))
* **marketboard:** disabled all marketboard features ([73a6ca4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/73a6ca4))
* **reset-timers:** fixed an issue with weekly timer not working properly right after its tick ([d691d4f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d691d4f))
* **simulator:** fixed an issue with IQ stacks not applied properly in safe mode ([7b0ff65](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7b0ff65))


### Features

* amount of list text export not consider the done amount ([4baabea](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4baabea))
* **core:** moved hosting to cdn in order to reduce costs an have better cache ([#1075](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1075)) ([8063b27](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8063b27))
* **simulator:** added context menu to set state on a given simulation step ([e36a6b4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e36a6b4))
* **simulator:** added hasty touch to aactions macro if there's enough place for it ([00034bd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/00034bd))



<a name="5.7.4"></a>
## [5.7.4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.7.2...v5.7.4) (2019-08-05)


### Bug Fixes

* **core:** fixed an issue with character fetching ([df16fdb](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/df16fdb))
* **core:** fixed an issue with character stats fetching ([f28e081](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f28e081))
* **db:** fixed fates being displayed in a panel labelled "Crafting actions" ([dc3824b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/dc3824b))
* **layout:** fixed an issue with filter context not being used properly in zone breakdown ([b930d28](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b930d28))
* **simulator:** fixed an issue with tricks of the trade on safe mode ([e8e2f5e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e8e2f5e))
* **tips:** fixed a bug with ingenuity before byregot not being computed properly ([01cdd32](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/01cdd32))
* **tips:** fixed a bug with piece by piece tip not showing properly ([446ff9d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/446ff9d))
* **tips:** fixed a bug with reflect tip showing when it shouldn't ([0042614](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0042614))


### Features

* added reset timers page, to display ingame reset timers and setup alarms for them ([c0edfed](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c0edfed))



<a name="5.7.3"></a>
## [5.7.3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.7.2...v5.7.3) (2019-08-05)


### Bug Fixes

* **core:** fixed an issue with character fetching ([df16fdb](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/df16fdb))
* **db:** fixed fates being displayed in a panel labelled "Crafting actions" ([dc3824b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/dc3824b))
* **layout:** fixed an issue with filter context not being used properly in zone breakdown ([b930d28](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b930d28))
* **simulator:** fixed an issue with tricks of the trade on safe mode ([e8e2f5e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e8e2f5e))
* **tips:** fixed a bug with ingenuity before byregot not being computed properly ([01cdd32](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/01cdd32))
* **tips:** fixed a bug with piece by piece tip not showing properly ([446ff9d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/446ff9d))
* **tips:** fixed a bug with reflect tip showing when it shouldn't ([0042614](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0042614))


### Features

* added reset timers page, to display ingame reset timers and setup alarms for them ([c0edfed](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c0edfed))



<a name="5.7.2"></a>
## [5.7.2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.7.1...v5.7.2) (2019-08-02)


### Bug Fixes

* **db:** removed simulator button for airship parts ([62616a2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/62616a2))
* **layout:** fixed white scrips not being filtered properly ([eb488a4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/eb488a4))
* **list:** quick item addition popup now shows all items, not only recipes ([89bbee8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/89bbee8))
* **macro-translator:** fixed an issue with some macros not being translated properly ([c002d04](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c002d04))
* **profile:** fixed masterbook order for CUL ([e81a65c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e81a65c))
* **search:** FC crafts now show under Recipes results ([193a272](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/193a272))
* **simulator:** fixed a bug with min stats popup hanging browser forever ([23afdfc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/23afdfc))
* **tooltip:** fixed a bug with missing bonus on some foods ([85afcf7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/85afcf7))



<a name="5.7.1"></a>
## [5.7.1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.19...v5.7.1) (2019-08-01)


### Bug Fixes

* **alarms:** no longer forcing compact mode on mobile viewports ([35e2ec1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/35e2ec1))
* **auth:** fixed an issue with blank character association popup ([f600f9a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f600f9a))
* **custom-simulator:** fixed progress and durability being inverted ([1757ed2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1757ed2))
* **db:** fixed an issue with map: comment links ([3e461c0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3e461c0))
* **layout:** fixed an issue with new tomes not filtered properly ([1130816](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1130816))
* **recipe-finder:** fixed empty results with recipe finder ([293958d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/293958d)), closes [#1061](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/1061)
* **simulator:** fixed an issue with minimum stats popup and quality ([b0b6ee0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b0b6ee0))
* **trade:** added new tomestones ([00f62a6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/00f62a6))


### Features

* **auth:** added disclaimer when linking a character with suspicious situation to avoid data loss ([eea41ba](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/eea41ba))
* **community-lists:** added GNB, DNC and expansion tags ([a041cca](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a041cca))
* **community-rotations:** added Reuse tag ([b7d4964](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b7d4964))
* **data:** added new masterbooks ([b6a8caa](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b6a8caa))
* **data:** added new rlvl entries for community rotations ([2d5f6ed](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2d5f6ed))
* **db:** added link from masterbooks to unlocked items ([a7412c2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a7412c2))
* **db:** added patch db pages ([dcdca77](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/dcdca77))
* **search:** added an option to disable search history ([d0caabf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d0caabf))
* new patreon supporter: Scrapper Spart ([072c66b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/072c66b))
* **simulator:** progress bar and durability now change color for better visual feedback. ([d13e580](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d13e580))
* **teams:** added webhook option for item completion notification ([0edb09f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0edb09f))



<a name="5.7.0"></a>
# [5.7.0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.19...v5.7.0) (2019-08-01)


### Bug Fixes

* **alarms:** no longer forcing compact mode on mobile viewports ([35e2ec1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/35e2ec1))
* **custom-simulator:** fixed progress and durability being inverted ([1757ed2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1757ed2))
* **db:** fixed an issue with map: comment links ([3e461c0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3e461c0))
* **simulator:** fixed an issue with minimum stats popup and quality ([b0b6ee0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b0b6ee0))
* **trade:** added new tomestones ([00f62a6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/00f62a6))


### Features

* **auth:** added disclaimer when linking a character with suspicious situation to avoid data loss ([eea41ba](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/eea41ba))
* **community-lists:** added GNB, DNC and expansion tags ([a041cca](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a041cca))
* **community-rotations:** added Reuse tag ([b7d4964](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b7d4964))
* **data:** added new masterbooks ([b6a8caa](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b6a8caa))
* **data:** added new rlvl entries for community rotations ([2d5f6ed](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2d5f6ed))
* **db:** added link from masterbooks to unlocked items ([a7412c2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a7412c2))
* **db:** added patch db pages ([dcdca77](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/dcdca77))
* **search:** added an option to disable search history ([d0caabf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d0caabf))
* **simulator:** progress bar and durability now change color for better visual feedback. ([d13e580](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d13e580))



<a name="5.6.19"></a>
## [5.6.19](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.18...v5.6.19) (2019-07-30)


### Bug Fixes

* **simulator:** custom recipe configuration is now properly saved with the rotation ([b758f9b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b758f9b))
* **simulator:** fixed an issue with min stats popup affecting simulation itself ([cbcd6ff](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cbcd6ff))
* changed some icons inside sidebar ([8afed77](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8afed77))


### Features

* complete revamp of the sidebar menu ([6987611](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6987611))
* **alarms:** changed compact mode for a super compact mode using lists ([893f7ab](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/893f7ab))
* support for Korean v4.55 update ([5ec6ee5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5ec6ee5))
* **data:** 5.05 patch content ([e7b6d71](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e7b6d71))
* **search:** added support for patch search (input patch:<patch #> in search box) ([929ab3b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/929ab3b))



<a name="5.6.18"></a>
## [5.6.18](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.17...v5.6.18) (2019-07-22)


### Bug Fixes

* **currency-spending:** fixed infinite loading issue with poetics on twintania ([1623159](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1623159))
* **db:** fixed action cost display ([b24634c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b24634c))
* **desktop:** fixed an issue with alarms not having proper icons ([d0ab90d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d0ab90d))
* **search:** fixed the way "worn_by" filter works to handle it better ([6a97139](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6a97139))
* **simulator:** fixed a display bug with some consumables ([6a42105](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6a42105))


### Features

* **search:** added support for bonus and stats filters ([d6be91f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d6be91f))
* **search:** support for new xivapi search filter method using arrays ([4b3be4d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4b3be4d))



<a name="5.6.17"></a>
## [5.6.17](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.15...v5.6.17) (2019-07-17)


### Bug Fixes

* fixed an issue with some items not being added to lists properly ([5a22f21](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5a22f21))
* **auth:** fixed an issue with account not being created properly ([8050761](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8050761))
* **db:** fixed missplaced Tailfeather aetheryte ([338cb0a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/338cb0a))
* **search:** converted "worn by" filter to use job categories instead ([d1cf398](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d1cf398))
* **search:** fixed broken filters ([289e86b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/289e86b))
* **search:** fixed missing jobs in worn_by filter ([ebad0a9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ebad0a9))



<a name="5.6.16"></a>
## [5.6.16](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.15...v5.6.16) (2019-07-16)


### Bug Fixes

* **search:** converted "worn by" filter to use job categories instead ([d1cf398](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d1cf398))
* fixed an issue with some items not being added to lists properly ([5a22f21](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5a22f21))



<a name="5.6.15"></a>
## [5.6.15](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.14...v5.6.15) (2019-07-16)


### Bug Fixes

* added error message for when firestore is unreachable ([8a0faa3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8a0faa3))
* **ariyala:** fixed an issue with materia counts on materias with 0% chances to meld ([c88f6e6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c88f6e6))
* **auth:** fixed an issue with character not showing up in top-right corner ([a777672](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a777672))
* **item:** fixed monster drops not always showing properly ([fa5cf3c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fa5cf3c))
* **search:** fixed an issue with "Worn by" filter not being accurate ([1861b29](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1861b29))
* **simulator:** fixed an issue preventing confirmation message on ingredient name copy ([066eeab](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/066eeab))


### Features

* **core:** 5.01 content update ([118e6c8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/118e6c8))



<a name="5.6.14"></a>
## [5.6.14](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.13...v5.6.14) (2019-07-15)


### Bug Fixes

* **ariyala:** fixed an issue with rings count being wrong ([e511155](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e511155))
* **desktop:** fixed alarm overlay opening from tray ([797789a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/797789a))
* **levequests:** fixed layout for smaller resolutions ([fa5c50e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fa5c50e))
* **simulator:** fixed precision issue with Delicate Synthesis ([a7148a4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a7148a4))
* **simulator:** hide overlay button if rotation isn't saved ([026c5ce](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/026c5ce))
* **ux:** various UX fixes for an easier first-time use ([8f07cc9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8f07cc9))


### Features

* **db:** added collectability informations in item pages ([f799021](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f799021))
* **levequests:** "add selection to list" button is now also at the bottom of the page ([8e66195](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8e66195))
* **search:** revamped search to support partial name search ([79c2efb](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/79c2efb))
* **simulator:** clicking on hq ingredients name will now copy the item's name in clipboard ([cdaeab7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cdaeab7))



<a name="5.6.13"></a>
## [5.6.13](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.12...v5.6.13) (2019-07-14)


### Bug Fixes

* fixed opensearch protocol ([e5eef82](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e5eef82))
* **ariyala:** fix 'hands' slot incorrectly regarded as tool ([72b6c3b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/72b6c3b))
* **desktop:** fixed an issue with alarms overlay ([96ef909](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/96ef909))
* **simulator:** fixed recipe informations display on rotation picker ([d106108](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d106108))


### Features

* **desktop:** added rotation overlay ([d8022d3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d8022d3))



<a name="5.6.12"></a>
## [5.6.12](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.11...v5.6.12) (2019-07-13)


### Bug Fixes

* **ariyala:** fixed issue with fighting materias not imported properly ([91d582a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/91d582a))
* **desktop:** fixed clickthrough setting applying on restart ([e9c8d89](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e9c8d89))


### Features

* added proper error detection for http requests ([a20a48e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a20a48e))



<a name="5.6.11"></a>
## [5.6.11](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.10...v5.6.11) (2019-07-12)


### Bug Fixes

* **ariyala:** support ariyala HTTPS link import ([2f1e0b9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2f1e0b9))
* solve some linting issues ([bcdedfa](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bcdedfa))
* **simulator:** ingenuity fixes on lower levels and solver improvements ([02005b9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/02005b9))
* **simulator:** simulator sidebar button now acts like a link ([14a8f4b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/14a8f4b))
* **ui:** fixed alignment in levequests page ([927f55d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/927f55d))


### Features

* enhance ariyala link parser with materia estimator ([6b01711](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6b01711))
* **db:** added links syntax support in comments ([8b75371](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8b75371))
* **inventory:** added isearch copy on icon click ([05c7f36](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/05c7f36))
* **simulator:** added copy on click on recipe's name ([95bf4a7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/95bf4a7))



<a name="5.6.10"></a>
## [5.6.10](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.9...v5.6.10) (2019-07-11)


### Bug Fixes

* **alarms:** fixed wrong label for folder alarms addition box ([43dceab](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/43dceab))
* **ariyala:** fixed ariyala import with new materias ([f5ebcf7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f5ebcf7))
* **macro-translator:** fixed an issue with japanese macros not detected properly ([7cd54c3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7cd54c3))
* **profile:** fixed an issue with DoL stats not being editable ([c1bf2a9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c1bf2a9))
* **profile:** fixed order for stats in profile and editor ([3fcd946](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3fcd946))
* **simulator:** fixed an issue with IQ placement tip and new trained actions ([5cdbd1c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5cdbd1c))


### Features

* **solver:** added support for seeded solver runs ([d38aec0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d38aec0))
* added nex patreon supporter: Forgiven Ignorance | Cerberus ([d8febd6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d8febd6))



<a name="5.6.9"></a>
## [5.6.9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.8...v5.6.9) (2019-07-10)


### Bug Fixes

* **community-lists:** fixed an issue with some tag filters not applying properly ([2eef252](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2eef252))
* **db:** fixed broken action icons ([f7eb62f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f7eb62f))
* **db:** possible fix for "missing name" map pages with deep link preview ([5976ce4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5976ce4))
* **layout:** fixed wrong translation in default layout ([fc78909](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fc78909))
* **pricing:** fixed an issue with end items that can be purchased having wrong price ([cd46024](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cd46024))
* **profile:** fixed an issue with stats propagation with save for all ([ed1c43b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ed1c43b))
* **rotation-tip:** fixed an issue with SH2 tip and observe combos ([519a924](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/519a924))
* **simulator:** fixed an issue with Delicate Touch's level restriction ([45b89a7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/45b89a7))
* **simulator:** fixed an issue with double reclaim in aactions macro ([a2de2ea](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a2de2ea))


### Features

* **db:** added more monster drop data thanks to Etherealrose ([ea21105](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ea21105))
* **desktop:** you can now make overlay clickthrough in settings ([494685d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/494685d))
* **layout:** added new filter: IS_FATE_ITEM ([cc01329](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cc01329))
* **patreon:** added 3 new patreon supporters ([3566c72](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3566c72))
* **search:** changed default search type for "Any" ([1ad8ea4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1ad8ea4))
* **settings:** added a setting to always default leves exp as HQ delivery ([9bc1aa2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9bc1aa2))



<a name="5.6.8"></a>
## [5.6.8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.7...v5.6.8) (2019-07-06)


### Bug Fixes

* **db:** fixed wrong preview on some monsters ([c1a7901](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c1a7901))
* removed wrong monster positions in data ([8321941](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8321941))
* **simulator:** fixed an issue with HQ ingredients not available when coming from a list ([978ef80](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/978ef80))
* **simulator:** fixed an issue with macrolock not applied on each macro ([c596e74](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c596e74))


### Features

* **simulator:** consumables checkbox is now persisted in localstorage ([ff0a755](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ff0a755))



<a name="5.6.7"></a>
## [5.6.7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.6...v5.6.7) (2019-07-05)


### Bug Fixes

* disabled cache entirely to prevent issues with data ([ce6e1ce](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ce6e1ce))
* fixed a missing icon for SSR ([4c6b8af](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4c6b8af))


### Features

* **reduction:** added fish reduction data thanks to Hiems Whiterock and M'aila Batih ([40938a3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/40938a3))
* **solver:** improved solver accuracy and removed safe mode from it ([8540da0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8540da0))



<a name="5.6.6"></a>
## [5.6.6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.5...v5.6.6) (2019-07-04)


### Bug Fixes

* **gathering-location:** fixed duplicates issue with missing coords ([5280de1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5280de1))
* **item:** fixed an issue with gathering node coords ([e8f1161](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e8f1161))
* **simulator:** fixed an issue with force failed action feature ([6ade21e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6ade21e))


### Features

* **list:** zone breakdown group feature now handles bicolor gems properly ([18b46a7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/18b46a7))
* **solver:** improved solver results overall ([de541e1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/de541e1))



<a name="5.6.5"></a>
## [5.6.5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.2...v5.6.5) (2019-07-04)


### Bug Fixes

* **db:** fixed missing map on some item pages ([b6763d5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b6763d5))
* **db:** fixed positions for some monsters and nodes ([7e7eb72](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7e7eb72))
* **db:** fixed wrong location for some gathering nodes ([126ae8a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/126ae8a))
* **levequests:** fixed issue with levequests page with exp impact feature ([190a98a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/190a98a))
* **log-tracker:** fixed an issue with CRP 1-5 page having duplicates ([23fed08](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/23fed08))
* **search:** autocomplete is now showing terms in the correct order ([14b5e8a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/14b5e8a))
* **simulator:** fixed an issue with piece by piece tip ([3368704](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3368704))
* **simulator:** fixed missing parameters in recipe configuration ([d34e5e5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d34e5e5))
* **solver:** fixed screen freeze when solver is running ([8f401d5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8f401d5))


### Features

* **db:** added turn in amount in crafting leve pages ([db7137e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/db7137e))
* added support for new folklore books ([8fb9fec](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8fb9fec))
* **simulator:** added a rotation solver ([9c16b55](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9c16b55))
* **simulator:** added an option to have macrolock at the beginning of macros ([0427d41](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0427d41))
* **simulator:** added simulator link to sidebar ([eae36f5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/eae36f5))



<a name="5.6.4"></a>
## [5.6.4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.2...v5.6.4) (2019-07-04)


### Bug Fixes

* **db:** fixed missing map on some item pages ([b6763d5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b6763d5))
* **db:** fixed wrong location for some gathering nodes ([126ae8a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/126ae8a))
* **levequests:** fixed issue with levequests page with exp impact feature ([190a98a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/190a98a))
* **log-tracker:** fixed an issue with CRP 1-5 page having duplicates ([23fed08](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/23fed08))
* **simulator:** fixed an issue with piece by piece tip ([3368704](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3368704))


### Features

* **db:** added turn in amount in crafting leve pages ([db7137e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/db7137e))
* added support for new folklore books ([8fb9fec](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8fb9fec))
* **simulator:** added a rotation solver ([9c16b55](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9c16b55))
* **simulator:** added an option to have macrolock at the beginning of macros ([0427d41](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0427d41))
* **simulator:** added simulator link to sidebar ([eae36f5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/eae36f5))



<a name="5.6.3"></a>
## [5.6.3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.2...v5.6.3) (2019-07-03)


### Bug Fixes

* **db:** fixed missing map on some item pages ([b6763d5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b6763d5))
* **db:** fixed wrong location for some gathering nodes ([126ae8a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/126ae8a))
* **levequests:** fixed issue with levequests page with exp impact feature ([190a98a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/190a98a))
* **log-tracker:** fixed an issue with CRP 1-5 page having duplicates ([23fed08](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/23fed08))
* **simulator:** fixed an issue with piece by piece tip ([3368704](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3368704))


### Features

* **db:** added turn in amount in crafting leve pages ([db7137e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/db7137e))
* added support for new folklore books ([8fb9fec](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8fb9fec))
* **simulator:** added a rotation solver ([9c16b55](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9c16b55))
* **simulator:** added an option to have macrolock at the beginning of macros ([0427d41](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0427d41))
* **simulator:** added simulator link to sidebar ([eae36f5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/eae36f5))



<a name="5.6.2"></a>
## [5.6.2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.1...v5.6.2) (2019-07-01)


### Bug Fixes

* **db:** better display for trading informations ([e7be2f6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e7be2f6))
* **db:** fixed an issue preventing display of items as quest rewards ([3e05120](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3e05120))
* **db:** fixed broken unicode char in quest names ([00d0031](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/00d0031))
* **db:** updated data with aetherytes fixes ([632545b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/632545b))
* **log-tracker:** fixed mislabelled housing pages ([c54cdf3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c54cdf3))
* **simulator:** doesn't account for great strides on 100 efficiency quality preview anymore ([acbcf1c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/acbcf1c))
* **simulator:** fixed an issue on macro import with some actions ([843f00e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/843f00e))
* **simulator:** fixed missing buff icons ([59e5d3d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/59e5d3d))


### Features

* **db:** added quest chain lengths on quest pages ([5e21f8f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5e21f8f))
* **db:** added starting point on quests when it is known ([9a249c4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9a249c4))
* **db:** updated data for aetherytes, npcs, monsters and nodes ([9c9356c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9c9356c))
* **simulator:** updated simulator with latest accurate formula ([11a5fff](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/11a5fff))



<a name="5.6.1"></a>
## [5.6.1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.6.0...v5.6.1) (2019-06-29)


### Bug Fixes

* **db:** added missing fates data ([dd12b08](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/dd12b08))
* **db:** UI fixes for map and item pages ([e108a04](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e108a04))
* **desktop:** fixed url share button ([4c5e3e9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4c5e3e9))


### Features

* **db:** added link between new levemete and its leves ([f09ef59](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f09ef59))
* **db:** updated monsters, npcs, nodes and aetherytes ([50e4e60](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/50e4e60))
* **simulator:** added current control indicator and 100% efficiency actions result ([094a7cd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/094a7cd))
* **simulator:** now showing control bonus in simulator footer ([f729444](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f729444))



<a name="5.6.0"></a>
# [5.6.0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.5.9...v5.6.0) (2019-06-29)


### Bug Fixes

* **auth:** fixed an issue with newly created accounts not able to link character ([de0c34c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/de0c34c))
* **data-extraction:** added a queue system to avoid spamming xivapi too hard ([0abb193](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0abb193))
* **rotation-picker:** fixed an issue with selection buttons not aligned properly ([0d7cb09](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0d7cb09))
* **simulator:** fixed an issue with brand of elements not being usable ([db3ecf5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/db3ecf5))
* **simulator:** fixed an issue with delicate synth not working properly ([7eef75c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7eef75c))
* **ux:** changed the order of stats in edition popup to reflect the order in the profile ([687e7f0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/687e7f0))


### Features

* **desktop:** added a button to copy current url to clipboard ([8934ace](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8934ace))
* **rotation-tips:** removed all rotation tips using byregot's brow ([ec6b1e6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ec6b1e6))
* **simulator:** added new shadowbringers actions ([854db61](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/854db61))
* added everything from Shadowbringers expansion ([046b9d4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/046b9d4))
* added some of the new data for shadowbringers ([a3c499a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a3c499a))
* implemented new currencies inside incons ordering for trades ([8c65b4c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8c65b4c))



<a name="5.5.9"></a>
## [5.5.9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.5.8...v5.5.9) (2019-06-25)


### Bug Fixes

* **currency-spending:** fixed an issue with search loading infinitely ([7e9c1aa](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7e9c1aa))
* **db:** fixed quest page for quests with no journal entries ([c5f456c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c5f456c))
* **log-tracker:** fixed wrong label for a quarrying log page ([7e00cac](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7e00cac))
* desktop download button is now hidden in collapsed sidebar mode ([ed63d03](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ed63d03))
* sidebar icons are now smaller to avoid scrolling bar to appear on 1080p ([a09067d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a09067d))
* **search:** possible fix for japanese input systems ([41c7561](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/41c7561))
* **simulator:** display Byregot warning for IG usage only when clvl < rlvl ([81182ca](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/81182ca))


### Features

* added a blog system for news and updates ([433d596](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/433d596))
* **list:** you can now add items as collectable from the list ([ffedcad](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ffedcad))



<a name="5.5.8"></a>
## [5.5.8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.5.7...v5.5.8) (2019-06-23)


### Bug Fixes

* fixed an issue with list display being entirely broken ([425394f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/425394f))



<a name="5.5.7"></a>
## [5.5.7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.5.6...v5.5.7) (2019-06-23)


### Bug Fixes

* fixed broken icon after GT's icons cleanup ([450c38b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/450c38b))
* **auth:** fixed an issue with anonymous accounts converted to user ones being logged out ([72914e4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/72914e4))
* **db:** fixed an issue with dark matter cluster page crashing ([515edb9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/515edb9))
* **list:** fixed wrong amount count with potions ([7928867](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7928867)), closes [#983](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/983)
* **recipe-finder:** fixed an issue with cart not shown when no recipes are found ([f9951d7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f9951d7)), closes [#982](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/982)


### Features

* added currency spending guide to find best item to buy with currency for gil ([022176e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/022176e)), closes [#978](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/978)



<a name="5.5.6"></a>
## [5.5.6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.5.5...v5.5.6) (2019-06-19)


### Bug Fixes

* **layout:** fixed an issue with collapse if done not working properly ([58ca722](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/58ca722))
* **search:** fixed an issue with filters not resetting properly ([b99be7a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b99be7a)), closes [#976](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/976)
* Recipe Finder Pagination ([2690c28](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2690c28))


### Features

* **pricing:** you can now input desired earning amount to have it applied on final items ([06fa265](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/06fa265))



<a name="5.5.5"></a>
## [5.5.5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.5.4...v5.5.5) (2019-06-18)


### Features

* support for Korean 4.50 update ([e6cc1b4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e6cc1b4))
* **gc-supply:** added a button to sort inventory by item name ([09d6409](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/09d6409))
* **gc-supply:** added item count to possible deliveries ([7d40ebb](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7d40ebb))
* **recipe-finder:** added a clear button for the list of items ([a30606e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a30606e))
* **recipe-finder:** added an intermediate popup for clipboard content analysis ([2309e85](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2309e85))
* **recipe-finder:** inventory is now using a panel with a button to copy it to clipboard ([f4de922](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f4de922))
* **recipe-finder:** paginator is now also on top of results list ([0953d9a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0953d9a))
* **recipe-finder:** result recipes are now ordered properly (job and level) ([61214f1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/61214f1))
* **recipe-finder:** you can now see the recipes that are not at your level ([b745e91](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b745e91))



<a name="5.5.4"></a>
## [5.5.4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.5.3...v5.5.4) (2019-06-17)


### Bug Fixes

* **db:** fixed an issue with external links not showing properly ([da2eb86](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/da2eb86))
* **desktop:** fixed oauth flow for google and facebook ([42c0e45](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/42c0e45))
* **layout:** fixed an issue with collapsed by default and collapse when done ([b431bff](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b431bff))
* **layout:** fixed missing translation ([9d2dd05](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9d2dd05))


### Features

* **recipe-finder:** added support for retainer inventory grabber extension ([23318a4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/23318a4))
* **support:** added a new supporter: Walnut Bread Trading Co ! ([f8c8688](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f8c8688))



<a name="5.5.3"></a>
## [5.5.3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.5.2...v5.5.3) (2019-06-16)


### Bug Fixes

* **fishing-log:** log order should now be closer to ingame log order ([83e9e60](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/83e9e60))
* **layout:** fixed a bug with collapsed by default not applying properly ([e7009dd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e7009dd))


### Features

* **db:** added achievement as possible data source ([3fc7528](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3fc7528))



<a name="5.5.2"></a>
## [5.5.2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.5.1...v5.5.2) (2019-06-14)


### Bug Fixes

* **db:** fixed an issue with foods showing only two bonuses ([fd72403](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fd72403))
* **desktop:** removed menu bar ([4846ae0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4846ae0))
* **simulator:** fixed a bug with level not applied correctly ([857a216](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/857a216))
* **simulator:** fixed a wrong tip about byregot's brow appearing while it shouldn't ([031ee74](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/031ee74))


### Features

* **db:** added FFXIV Collect links on achievement pages ([0367c40](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0367c40))
* **search:** added a suffix on input fields for easy input clear ([1619814](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1619814))



<a name="5.5.1"></a>
## [5.5.1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.5.0...v5.5.1) (2019-06-13)


### Bug Fixes

* **db:** fixed an issue with some items not rendering properly ([fc232e3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fc232e3))



<a name="5.5.0"></a>
# [5.5.0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.17...v5.5.0) (2019-06-12)


### Bug Fixes

* **item-tooltip:** fixed an issue with items without HQ stats bonuses ([133c4f9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/133c4f9))
* **desktop:** fixed auto update check not checking properly on startup ([07dd123](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/07dd123))
* **layout:** fixed an issue with NOT modifier on rows with one filter only ([59e3153](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/59e3153))
* **levequests:** fixed a layout issue with levequests page ([d15dcaf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d15dcaf))
* **trades:** fixed a wrong count in total currencies needed for trade ([799d645](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/799d645))
* **ux:** changed alarm icon everywhere to always match the bell one for consistency ([937d9ef](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/937d9ef))


### Features

* added a recipe finder system ([e1bc1af](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e1bc1af948aaed11d58a5e123576247e992f65e6))
* **pricing:** added a new feature to check for cheaper precrafts inside marketboard ([ca919d8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ca919d8))
* **db:** added links to FFXIV Collect on relevant item pages ([a64d7e8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a64d7e8))
* **db:** added orchestrion sample preview ([a695cce](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a695cce))
* **db:** added a setting to put comments at top or bottom of content pages ([e260280](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e260280))
* **db:** added recipe job and level for items used in crafts ([83a291b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/83a291b))
* **db:** new db pages for achievements ([9a8d8cc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9a8d8cc))
* **desktop:** updated electron to latest stable version (5.0.3) ([f26e579](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/f26e579))
* **layout:** added support for zone breakdown with vendors and trades ([b1d7383](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b1d7383))
* **layout:** marketboard informations button can now be switched to menu instead of button ([ec54bf3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ec54bf3))
* **list-details:** added item count for details panels ([615c319](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/615c319))
* **rotation-picker:** added tooltip for names that are too long to read ([fb224d2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fb224d2))
* **settings:** new setting to mark items as done in log as they are done in a list ([237a01b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/237a01b))



<a name="5.4.17"></a>
## [5.4.17](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.16...v5.4.17) (2019-06-09)


### Bug Fixes

* **db:** fixed a bug with comment links and comments posting ([2041e63](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2041e63))
* **db:** show banner only if there is one to show ([335f818](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/335f818))


### Features

* **db:** you now get notifications for replies to your comments in database ([ebd36ea](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ebd36ea))



<a name="5.4.16"></a>
## [5.4.16](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.14...v5.4.16) (2019-06-08)


### Bug Fixes

* **auth:** fixed an issue with newly created accounts and character linking ([d3fd8c7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d3fd8c7))
* **db:** brought back translation in action page ([ef7ed27](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ef7ed27))
* **db:** fixed location for gridania map on fishes ([0f2313d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0f2313d))
* **layout:** fixed panels reordering popup ([768ba26](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/768ba26))
* **layout:** job order now works properly with gathering ([5ee6362](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5ee6362))
* **levequests:** fixed a layout issue with levequests page ([c36e322](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c36e322))
* **levequests:** fixed layout display for levequests search results ([edccd9e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/edccd9e))
* **lists:** fixed an issue with lists ordering inside team panels ([47fb55d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/47fb55d))
* **simulator:** couple of corrections with the new tips ([eb768a2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/eb768a2))


### Features

* **db:** added full comments system with xivdb comments imported ([#956](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/956)) ([8026021](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8026021))
* **db:** added marketboard button to item pages ([1ea8c42](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1ea8c42))
* **layout:** you can now collapse a layout panel by default ([4d72cb7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4d72cb7))
* **log-tracker:** log tracking is now tied to your character ([420632d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/420632d)), closes [#911](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/911)
* **search:** new search type: ANY, that just searches using all the types at once ([1ac91ce](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1ac91ce))
* **simulator:** added new tips from Kumaa and The Balance ([070b48b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/070b48b)), closes [#955](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/955)
* **simulator:** you can now set an action to failed using right click ([870fb2d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/870fb2d)), closes [#844](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/844)



<a name="5.4.15"></a>
## [5.4.15](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.14...v5.4.15) (2019-06-08)


### Bug Fixes

* **db:** brought back translation in action page ([ef7ed27](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ef7ed27))
* **db:** fixed location for gridania map on fishes ([0f2313d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0f2313d))
* **layout:** fixed panels reordering popup ([768ba26](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/768ba26))
* **layout:** job order now works properly with gathering ([5ee6362](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5ee6362))
* **levequests:** fixed layout display for levequests search results ([edccd9e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/edccd9e))
* **lists:** fixed an issue with lists ordering inside team panels ([47fb55d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/47fb55d))


### Features

* **db:** added full comments system with xivdb comments imported ([#956](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/956)) ([8026021](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8026021))
* **db:** added marketboard button to item pages ([1ea8c42](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1ea8c42))
* **layout:** you can now collapse a layout panel by default ([4d72cb7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4d72cb7))
* **log-tracker:** log tracking is now tied to your character ([420632d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/420632d)), closes [#911](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/911)
* **search:** new search type: ANY, that just searches using all the types at once ([1ac91ce](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1ac91ce))
* **simulator:** added new tips from Kumaa and The Balance ([070b48b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/070b48b)), closes [#955](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/955)
* **simulator:** you can now set an action to failed using right click ([870fb2d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/870fb2d)), closes [#844](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/844)



<a name="5.4.14"></a>
## [5.4.14](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.13...v5.4.14) (2019-06-02)


### Bug Fixes

* **db:** fixed db pages for PotD and HoH ([aefdc66](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/aefdc66))
* **db:** layout fix for trade details component ([8a066da](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8a066da))
* **log-tracker:** removed duplicate gig head for fishing log tracker ([6cecee2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6cecee2))
* **reduced-by:** removed area name as it's almost always wrong and hard to maintain properly ([35ee428](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/35ee428))
* **seo:** fixed item names and descriptions inside link previews ([50b1b24](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/50b1b24))
* **seo:** fixed urls inside sitemap files ([d19deac](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d19deac))


### Features

* **db:** add zh-places data ([3e6a0ae](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3e6a0ae))
* **db:** better details for crafting actions ([09611be](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/09611be))
* **db:** update zh-data to 4.5 ([24a0fe6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/24a0fe6))
* **i18n:** updated zh item and place names ([77b6aea](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/77b6aea))
* **macro-translator:** added ZH translation support ([7725cb7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7725cb7))
* **search:** added search history system to the search page (can be cleared inside settings) ([2090026](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2090026))



<a name="5.4.13"></a>
## [5.4.13](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.12...v5.4.13) (2019-06-01)


### Bug Fixes

* **list:** fixed a bug with behemoth wall trophy ([cadda5f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cadda5f))
* **map:** fixed a bug with aetheryte name tooltip not showing ([2489bb8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2489bb8))



<a name="5.4.12"></a>
## [5.4.12](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.11...v5.4.12) (2019-05-31)


### Bug Fixes

* **db:** fixed an issue with amount not taken into account for list addition ([3c1b826](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3c1b826))
* **desktop:** enabled hardware acceleration with a -noHA flag to disable it ([bc6236a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bc6236a))
* **pricing:** benefits text is now white ([90663c7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/90663c7)), closes [#942](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/942)
* **theme:** fixed wrong name for orange theme, making it unusable ([b73214b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b73214b))


### Features

* server side rendering for better SEO ([#943](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/943)) ([fd4f13c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fd4f13c))
* **db:** you can now add any item to a list from the item page ([3db5ed0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3db5ed0))
* **reduction:** added gatherer icon for reduction details ([7b8d141](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7b8d141))
* **simulator:** you can now add actions to a rotation even if craft is complete ([5e17ad9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/5e17ad9))



<a name="5.4.11"></a>
## [5.4.11](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.10...v5.4.11) (2019-05-27)


### Bug Fixes

* **settings:** fixed blank settings page ([3a6ef5a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3a6ef5a))
* **style:** fixed color issues and alignment in various places ([94baf38](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/94baf38))


### Features

* **db:** added status type to db status page ([a349413](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a349413))



<a name="5.4.10"></a>
## [5.4.10](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.9...v5.4.10) (2019-05-27)


### Bug Fixes

* **layout:** fixed layout display for smaller resolutions ([54d0a81](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/54d0a81))
* **theme:** default theme is now darker and fixed custom theme system ([ac1218d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ac1218d))
* **theme:** fixed an issue with aetheryte names sometimes not showing up properly ([6f7c12d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6f7c12d))



<a name="5.4.9"></a>
## [5.4.9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.8...v5.4.9) (2019-05-26)


### Bug Fixes

* **theme:** fixed app crash when theme is not defined ([54fad3a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/54fad3a))



<a name="5.4.8"></a>
## [5.4.8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.7...v5.4.8) (2019-05-26)


### Bug Fixes

* **db:** fixed broken 3D preview for minions ([e2a4cd8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e2a4cd8))
* **db:** fixed broken pages because of GameContentLinks not mandatory anymore ([0f6ff50](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0f6ff50))
* **desktop:** disabled hardware acceleration for better rendering ([4ad1c53](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4ad1c53))
* **tip:** better line break management ([0747773](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0747773))


### Features

* **style:** changed default theme and custom theme system ([#933](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/933)) ([4c3ab54](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4c3ab54))



<a name="5.4.7"></a>
## [5.4.7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.5...v5.4.7) (2019-05-25)


### Bug Fixes

* **db:** fixed trait descriptions colors ([ca758a5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ca758a5))
* **desktop:** fixed a possible crash when applying settings ([0144f87](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0144f87))


### Features

* **alarms:** you can now see the note inside the alarms overlay ([4029497](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4029497))
* Teamcraft now displays random tips inside the topbar ([2563962](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2563962))
* **db:** added support for 3D model viewer on mounts and minions ([4de110e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4de110e))
* **log-tracker:** added item name color based on rarity ([fe12751](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fe12751))
* **map:** added aetheryte shard names and more accurate aetheryte names overall ([a90549d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a90549d))



<a name="5.4.6"></a>
## [5.4.6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.5...v5.4.6) (2019-05-25)


### Bug Fixes

* **db:** fixed trait descriptions colors ([ca758a5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ca758a5))
* **desktop:** fixed a possible crash when applying settings ([0144f87](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0144f87))


### Features

* **alarms:** you can now see the note inside the alarms overlay ([4029497](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4029497))
* Teamcraft now displays random tips inside the topbar ([2563962](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2563962))
* **log-tracker:** added item name color based on rarity ([fe12751](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/fe12751))
* **map:** added aetheryte shard names and more accurate aetheryte names overall ([a90549d](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a90549d))



<a name="5.4.5"></a>
## [5.4.5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.4...v5.4.5) (2019-05-24)


### Bug Fixes

* **list:** fixed an issue with progression when an item is final and material ([c4bef2b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c4bef2b))
* **perf:** performance improvements for UI text pipe ([072488f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/072488f))


### Features

* **db:** added text color for items based on rarity ([0a1c1c0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0a1c1c0))
* **db:** item pages now include a model viewer from garlandtools ([1aa1701](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1aa1701))
* **db:** items that are obtained from reduction now have alarm integration ([c088579](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c088579))



<a name="5.4.4"></a>
## [5.4.4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.2...v5.4.4) (2019-05-21)


### Bug Fixes

* **auth:** added a security to avoid user data loss on network error ([d68cb35](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d68cb35))
* **db:** coords are now rounded to first decimal ([90171d3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/90171d3))
* **db:** fixed an issue with some nodes having map id set to 0 ([6e26bb7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6e26bb7))
* **desktop:** fixed broken language icons on db pages ([8921774](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8921774))
* **list:** fixed an issue with progression not applied properly in some cases ([11e4c27](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/11e4c27)), closes [#920](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/920)


### Features

* **db:** added trait support with links to actions ([8be25b4](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8be25b4))
* **db:** Teamcraft now includes all Actions status Statuses inside the database ([b523403](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b523403))
* **db:** UX improvements on map page ([4ce18f0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4ce18f0))
* **layout:** default layout now uses reversed tiers for vendors panel ([ebad648](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/ebad648))



<a name="5.4.3"></a>
## [5.4.3](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.2...v5.4.3) (2019-05-20)


### Bug Fixes

* **desktop:** fixed broken language icons on db pages ([8921774](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8921774))
* **list:** fixed an issue with progression not applied properly in some cases ([11e4c27](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/11e4c27)), closes [#920](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/issues/920)


### Features

* **db:** Teamcraft now includes all Actions status Statuses inside the database ([b523403](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b523403))
* **db:** UX improvements on map page ([4ce18f0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4ce18f0))



<a name="5.4.2"></a>
## [5.4.2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.4.1...v5.4.2) (2019-05-19)


### Bug Fixes

* **list:** fixed an issue with amount input on crafts not applying properly to mats ([42f5faf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/42f5faf))
* **map-page:** removed nodes with inexistant items (event items) ([bf3712c](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bf3712c))
* **simulator:** fixed an issue with recipe changes resetting stats in custom mode ([956bcd2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/956bcd2))


### Features

* **db:** added individual pages for gathering nodes ([9a8b4ad](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/9a8b4ad))
* **desynth:** added database link to desynth item results ([7332dcd](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7332dcd))
* **map:** added position on map markers hover ([768da97](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/768da97))



<a name="5.4.1"></a>
## [5.4.1](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.3.11...v5.4.1) (2019-05-18)


### Bug Fixes

* **alarms:** fixed an issue with groups randomly reordering themselves on time tick ([8f02591](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8f02591))
* fixed mogboard link to make it work with new version ([c1953a2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c1953a2))
* **db:** better number format for npc positions ([8bc4646](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8bc4646))
* **db:** fixed empty notification when adding an item to a list ([6c0753b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/6c0753b))
* **log-tracker:** removed timed nodes from optimized path ([3234932](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3234932))
* **teams:** fixed an issue preventing team members to input progression on lists ([8985c4f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8985c4f))
* **ux:** multiple changes to the UI design ([cd24189](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cd24189))


### Features

* Teamcraft now includes a FATE database ([d516e15](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d516e15))
* Teamcraft now includes a levequests database ([e6296f7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e6296f7))
* Teamcraft now includes a lore finder ([e14e6c8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e14e6c8))
* Teamcraft now includes a map database ([e0a73b0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e0a73b0))
* Teamcraft now includes a monster database ([93cfa92](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/93cfa92))
* Teamcraft now includes a npc database ([2c3d9c0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2c3d9c0))
* Teamcraft now includes a quest database ([e2e39b2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e2e39b2))
* Teamcraft now includes an instance database ([276fbb8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/276fbb8))
* Teamcraft now includes an item database ([0469df5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0469df5))
* **teams:** added new webhook setting for final items progress notification ([1113411](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1113411))



<a name="5.4.0"></a>
# [5.4.0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.3.11...v5.4.0) (2019-05-18)


### Bug Fixes

* **alarms:** fixed an issue with groups randomly reordering themselves on time tick ([8f02591](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/8f02591))
* fixed mogboard link to make it work with new version ([c1953a2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c1953a2))
* **log-tracker:** removed timed nodes from optimized path ([3234932](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3234932))
* **ux:** multiple changes to the UI design ([cd24189](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/cd24189))


### Features

* Teamcraft now includes a FATE database ([d516e15](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d516e15))
* Teamcraft now includes a levequests database ([e6296f7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e6296f7))
* Teamcraft now includes a lore finder ([e14e6c8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e14e6c8))
* Teamcraft now includes a map database ([e0a73b0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e0a73b0))
* Teamcraft now includes a monster database ([93cfa92](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/93cfa92))
* Teamcraft now includes a npc database ([2c3d9c0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2c3d9c0))
* Teamcraft now includes a quest database ([e2e39b2](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/e2e39b2))
* Teamcraft now includes an instance database ([276fbb8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/276fbb8))
* Teamcraft now includes an item database ([0469df5](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/0469df5))
* **teams:** added new webhook setting for final items progress notification ([1113411](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1113411))



<a name="5.3.11"></a>
## [5.3.11](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.3.10...v5.3.11) (2019-05-06)


### Bug Fixes

* **alarms:** fixed an issue with some specific fishes having wrong timers ([950abcb](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/950abcb))
* **rotation-picker:** fixed an issue with rotation picker sometimes freezing ([c238db8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c238db8))
* **simulator:** fixed a display issue with lg resolution ([813a20f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/813a20f))



<a name="5.3.10"></a>
## [5.3.10](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.3.9...v5.3.10) (2019-05-05)


### Bug Fixes

* **display:** fixed layout issues in simulator on tablet ([c55b521](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c55b521))
* fixed an issue with some panels not opening properly on safari ([780260f](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/780260f))


### Features

* **desynth-guide:** added pagination to results to display all of them ([3b183b8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3b183b8))
* **rotations:** rotation picker now respects order and folders ([7918bdc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/7918bdc))



<a name="5.3.9"></a>
## [5.3.9](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.3.8...v5.3.9) (2019-05-04)


### Bug Fixes

* **teams:** fixed an issue with lists loading when you have multiple teams ([b3e1fdf](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/b3e1fdf))


### Features

* **alarms:** you can now enable/disable alarms individually ([a465acc](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a465acc))
* **gathering-location:** a message is now shown if an item already has an alarm ([1811953](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1811953))



<a name="5.3.8"></a>
## [5.3.8](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.3.7...v5.3.8) (2019-05-03)


### Bug Fixes

* **alarms-overlay:** fixed an issue with bottom scroll not properly aligned ([2136edb](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2136edb))
* **ci:** fixed an issue with build in CI env ([bf90e1e](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/bf90e1e))
* **desktop:** fixed an error message sometimes showing when closing desktop app ([c5d15d0](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c5d15d0))


### Features

* **desktop:** mouse back/forward buttons are now properly bound to the app ([c1ef788](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c1ef788))
* **layout:** added support for reversed tiers display ([1955fde](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1955fde))
* **levequests:** starting level now defaults to current level on profile ([3a8a08b](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/3a8a08b))
* **list:** you can now create ephemeral lists with name input ([d521ef7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/d521ef7))
* **pricing:** you can now setup discounts on pricing mode, saved inside localstorage ([a390d39](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/a390d39))



<a name="5.3.7"></a>
## [5.3.7](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/compare/v5.3.6...v5.3.7) (2019-05-02)


### Bug Fixes

* **custom-alarms:** fixed an issue with map names not displayed with some languages ([c945eb6](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/c945eb6))
* **custom-alarms:** you can no longer create alarms for impossible weathers ([2a15a33](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/2a15a33))
* **list:** fixed an issue with some FC workshop crafts not having accurate ingredients count ([1e86164](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/1e86164))
* **pricing:** fixed an issue with some crafts not showing proper price in rare cases ([4deef7a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4deef7a))


### Features

* **custom-alarms:** added support for korean map names ([4be5500](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4be5500))
* **marketboard:** added an option to disable cross world prices in marketboard api ([4bb843a](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/commit/4bb843a))



<a name="5.3.6"></a>
## [5.3.6](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.3.5...v5.3.6) (2019-05-01)


### Bug Fixes

* **alarms:** fixed an issue with some custom alarms not working properly ([1108f31](https://github.com/Supamiu/ffxiv-teamcraft/commit/1108f31))
* **fishng-log-tracker:** fixed an issue with transitions not being shown properly ([4b77277](https://github.com/Supamiu/ffxiv-teamcraft/commit/4b77277))



<a name="5.3.5"></a>
## [5.3.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.3.4...v5.3.5) (2019-04-30)


### Features

* support for Korean 4.45 update ([6159a7d](https://github.com/Supamiu/ffxiv-teamcraft/commit/6159a7d))
* **desktop:** closing the app now properly closes all the opened overlays ([9050f69](https://github.com/Supamiu/ffxiv-teamcraft/commit/9050f69))
* **simulator:** new rotation tip: byregot's brow instead of blessing when at 5 IQ stacks ([896715c](https://github.com/Supamiu/ffxiv-teamcraft/commit/896715c))



<a name="5.3.4"></a>
## [5.3.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.3.3...v5.3.4) (2019-04-28)


### Bug Fixes

* **alarms:** "add all alarms" button now can't add an already registered alarm ([df3f42d](https://github.com/Supamiu/ffxiv-teamcraft/commit/df3f42d))
* **simulator:** fixed an issue with custom rotations sometimes not user correct stats ([b585b8c](https://github.com/Supamiu/ffxiv-teamcraft/commit/b585b8c))


### Features

* **layout:** new dialog box in layout editor to easily reorder panels ([8eb3e7c](https://github.com/Supamiu/ffxiv-teamcraft/commit/8eb3e7c))
* **requirements:** added recipe requirement amount ([0e366e5](https://github.com/Supamiu/ffxiv-teamcraft/commit/0e366e5))



<a name="5.3.3"></a>
## [5.3.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.3.2...v5.3.3) (2019-04-27)


### Bug Fixes

* **community-rotations:** changed labels colors for easier reading ([2221ef6](https://github.com/Supamiu/ffxiv-teamcraft/commit/2221ef6))
* **inventory:** fixed wrong import breaking inventory view ([f497434](https://github.com/Supamiu/ffxiv-teamcraft/commit/f497434))
* **pricing:** better alignment for prices labels ([47fda21](https://github.com/Supamiu/ffxiv-teamcraft/commit/47fda21))
* **settings:** favorite aetherytes max count is now 4 ([2066bf4](https://github.com/Supamiu/ffxiv-teamcraft/commit/2066bf4))
* **simulator:** fixed an issue with job not being swapped properly on recipe change ([605e028](https://github.com/Supamiu/ffxiv-teamcraft/commit/605e028))
* **simulator:** tablets will now use mobile display too ([5106776](https://github.com/Supamiu/ffxiv-teamcraft/commit/5106776))
* **translation:** fixed a wrong translation label ([48c8312](https://github.com/Supamiu/ffxiv-teamcraft/commit/48c8312))


### Features

* **custom-items:** added weathers display in custom alarms display ([445e4db](https://github.com/Supamiu/ffxiv-teamcraft/commit/445e4db))
* **list:** max list size is now 800kB, was 300kB ([71966a6](https://github.com/Supamiu/ffxiv-teamcraft/commit/71966a6))
* **lists:** favorite lists now show in the lists page ([475bf95](https://github.com/Supamiu/ffxiv-teamcraft/commit/475bf95))



<a name="5.3.2"></a>
## [5.3.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.3.1...v5.3.2) (2019-04-25)


### Bug Fixes

* **alarms:** fixed an issue with cache breaking some weather-dependant alarms ([ce82dcb](https://github.com/Supamiu/ffxiv-teamcraft/commit/ce82dcb))
* **desynth:** fixed an issue with lower levels and better formula accuracy ([346a51f](https://github.com/Supamiu/ffxiv-teamcraft/commit/346a51f))
* **marketboard:** fixed an issue with vendor final items not priced properly ([11a11da](https://github.com/Supamiu/ffxiv-teamcraft/commit/11a11da))
* **teams:** fixed a permission issue with lists linked to teams ([2cc2d39](https://github.com/Supamiu/ffxiv-teamcraft/commit/2cc2d39))


### Features

* **alarms:** added support for weather and transition on custom alarms ([ef5d43f](https://github.com/Supamiu/ffxiv-teamcraft/commit/ef5d43f))
* **inventory:** added a toggle button in inventory view to hide final items ([3c0e2b3](https://github.com/Supamiu/ffxiv-teamcraft/commit/3c0e2b3))
* **layout:** added a quick layout swap menu in list details ([0ee7b33](https://github.com/Supamiu/ffxiv-teamcraft/commit/0ee7b33))
* **marketboard:** added support for cross world marketbard data ([0260cbd](https://github.com/Supamiu/ffxiv-teamcraft/commit/0260cbd))
* **tooltip:** added item search category to tooltip data ([77e5f74](https://github.com/Supamiu/ffxiv-teamcraft/commit/77e5f74))



<a name="5.3.1"></a>
## [5.3.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.3.0...v5.3.1) (2019-04-24)


### Bug Fixes

* **core:** fixed a wrong import breaking live maps ([9de9fce](https://github.com/Supamiu/ffxiv-teamcraft/commit/9de9fce))



<a name="5.3.0"></a>
# [5.3.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.16...v5.3.0) (2019-04-24)


### Bug Fixes

* **gathering-location:** fixed an issue with smaller window sizes display ([4f71710](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f71710))
* **item-tags:** fixed an issue with duplicated tags inside autocompletion ([2e05bca](https://github.com/Supamiu/ffxiv-teamcraft/commit/2e05bca))


### Features

* new desynth guide page to provide easy desynth leveling guidance ([c54efd8](https://github.com/Supamiu/ffxiv-teamcraft/commit/c54efd8))
* new page to explain how to help the project, with or without money :) ([83a28f5](https://github.com/Supamiu/ffxiv-teamcraft/commit/83a28f5))
* **log-tracker:** you are no longer redirected to the list when adding items to a list ([9bf1622](https://github.com/Supamiu/ffxiv-teamcraft/commit/9bf1622))
* **sidebar:** removed social fabs with collapsed sidebar ([adad3aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/adad3aa))



<a name="5.2.16"></a>
## [5.2.16](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.15...v5.2.16) (2019-04-22)


### Bug Fixes

* **log-tracker:** fixed a display issue with first selected tab ([31c00f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/31c00f0))
* **zone-breakdown:** fixed an issue with zones reordering themselves randomly ([f519f41](https://github.com/Supamiu/ffxiv-teamcraft/commit/f519f41))



<a name="5.2.15"></a>
## [5.2.15](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.14...v5.2.15) (2019-04-21)


### Bug Fixes

* **auth:** fixed an issue with some accounts missing defaultLodestoneId ([dcda153](https://github.com/Supamiu/ffxiv-teamcraft/commit/dcda153))
* **desktop:** fixed an issue for window show event when you only have overlay ([fb7f0ae](https://github.com/Supamiu/ffxiv-teamcraft/commit/fb7f0ae))
* **overlay:** fixed extra blank space in alarm overlay ([843889b](https://github.com/Supamiu/ffxiv-teamcraft/commit/843889b))


### Features

* **reduction:** added node data (including FSH) to reduction dialog box ([98b0f81](https://github.com/Supamiu/ffxiv-teamcraft/commit/98b0f81))



<a name="5.2.14"></a>
## [5.2.14](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.13...v5.2.14) (2019-04-19)


### Bug Fixes

* **fishing:** fixed an issue with some fishes' details popup inside list ([af6a587](https://github.com/Supamiu/ffxiv-teamcraft/commit/af6a587))


### Features

* **alarms:** alarms buttons inside list details are now sorted by spawn hour ([5ef3b78](https://github.com/Supamiu/ffxiv-teamcraft/commit/5ef3b78))
* **kr:** added korean servers to the servers list when adding a character ([b46c47a](https://github.com/Supamiu/ffxiv-teamcraft/commit/b46c47a))
* **list:** added a button to input items as "obtained from external source" to improve tracking ([8ff34f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/8ff34f0))
* **list:** new setting to show remaining todo amount instead of total ([8a73a87](https://github.com/Supamiu/ffxiv-teamcraft/commit/8a73a87))
* **reduction:** added integrated timers to reduction details popup ([d7e4cbe](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7e4cbe))
* **settings:** added a setting to always show all alarms no matter how much are available ([e21ef56](https://github.com/Supamiu/ffxiv-teamcraft/commit/e21ef56))



<a name="5.2.13"></a>
## [5.2.13](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.12...v5.2.13) (2019-04-18)


### Bug Fixes

* **gc-supply:** fixed missing deliveries for DoL ([af8c98a](https://github.com/Supamiu/ffxiv-teamcraft/commit/af8c98a))
* **layout:** fixed wrong label on some default layout panel ([88fcbc7](https://github.com/Supamiu/ffxiv-teamcraft/commit/88fcbc7))
* **log-tracker:** fixed an issue with "mark as done" button inside list details on crafts ([41794f4](https://github.com/Supamiu/ffxiv-teamcraft/commit/41794f4))
* **log-tracker:** fixed wrong page labeling for deliveries ([eaaa5e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/eaaa5e4)), closes [#866](https://github.com/Supamiu/ffxiv-teamcraft/issues/866)
* **overlay:** changed title inside html for alarms overlay window ([4f9eb23](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f9eb23)), closes [#859](https://github.com/Supamiu/ffxiv-teamcraft/issues/859)
* **ux:** "open list" button is now the only primary button on list panel header ([7a5e67e](https://github.com/Supamiu/ffxiv-teamcraft/commit/7a5e67e))
* **ux:** changed button colors on some panels for better attention management ([cc1d075](https://github.com/Supamiu/ffxiv-teamcraft/commit/cc1d075))
* **ux:** copy list button on own list panel is now a setting ([f8464fc](https://github.com/Supamiu/ffxiv-teamcraft/commit/f8464fc))


### Features

* **theme:** new custom theme feature for patreon users ([b5d27c6](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5d27c6))



<a name="5.2.12"></a>
## [5.2.12](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.11...v5.2.12) (2019-04-17)


### Bug Fixes

* **alarms:** fixed an issue with alarms toggle sometimes not adding the alarm to database ([b3570c7](https://github.com/Supamiu/ffxiv-teamcraft/commit/b3570c7))
* **rotation-tips:** fixed an issue with some tips crashing with specific rotations ([be00e6e](https://github.com/Supamiu/ffxiv-teamcraft/commit/be00e6e))
* **simulation:** fixed wrong wait duration for Manipulation ([46aed8f](https://github.com/Supamiu/ffxiv-teamcraft/commit/46aed8f))
* **simulator:** better drag and drop behavior ([b5630db](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5630db))


### Features

* **community-rotations:** added a tag to show rotation's targeted durability ([a349291](https://github.com/Supamiu/ffxiv-teamcraft/commit/a349291))
* **community-rotations:** better rlvl search ranges for rotations ([44315aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/44315aa))
* **list:** new button in completion popup to empty the list ([9c34c9c](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c34c9c))
* **overlay:** moved the mute toggle to topbar for better layout inside overlay ([2ae80aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/2ae80aa))
* **seo:** better seo for better link previews on discord ([b8ee1b8](https://github.com/Supamiu/ffxiv-teamcraft/commit/b8ee1b8))



<a name="5.2.11"></a>
## [5.2.11](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.10...v5.2.11) (2019-04-16)


### Features

* **log-tracker:** added a menu item on item rows to mark item as done in the log ([80f7770](https://github.com/Supamiu/ffxiv-teamcraft/commit/80f7770))
* **log-tracker:** you can now generate a list for the 50 first uncompleted items ([141f39e](https://github.com/Supamiu/ffxiv-teamcraft/commit/141f39e))
* **log-tracker:** you can now hide completed recipes ([7ed8d95](https://github.com/Supamiu/ffxiv-teamcraft/commit/7ed8d95))



<a name="5.2.10"></a>
## [5.2.10](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.9...v5.2.10) (2019-04-15)


### Bug Fixes

* **alarms:** fixed an issue with alarms page not loading ([6d3ad18](https://github.com/Supamiu/ffxiv-teamcraft/commit/6d3ad18))



<a name="5.2.9"></a>
## [5.2.9](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.8...v5.2.9) (2019-04-15)


### Bug Fixes

* **teams:** better fix for cases where team doesn't detach properly ([155df8b](https://github.com/Supamiu/ffxiv-teamcraft/commit/155df8b))


### Features

* **gathering-location:** added timer display to search results ([9b19476](https://github.com/Supamiu/ffxiv-teamcraft/commit/9b19476))
* **gc-supply:** GC supply page now generated a quicklist directly ([38d62c9](https://github.com/Supamiu/ffxiv-teamcraft/commit/38d62c9))
* **list-row:** added more details to the gatheredBy details box for timed nodes ([8796904](https://github.com/Supamiu/ffxiv-teamcraft/commit/8796904))
* **navigation:** you can now check items as done from navigation popup ([84480a4](https://github.com/Supamiu/ffxiv-teamcraft/commit/84480a4)), closes [#510](https://github.com/Supamiu/ffxiv-teamcraft/issues/510)
* **profile:** badges system for a sense of pride and accomplishment ([199278b](https://github.com/Supamiu/ffxiv-teamcraft/commit/199278b)), closes [#322](https://github.com/Supamiu/ffxiv-teamcraft/issues/322)



<a name="5.2.8"></a>
## [5.2.8](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.7...v5.2.8) (2019-04-14)


### Bug Fixes

* **gc-supply:** level range is now 0 - (-3), was 0 - (-2) ([4be0428](https://github.com/Supamiu/ffxiv-teamcraft/commit/4be0428))
* **icon:** better res icon for community rotations menu ([a841699](https://github.com/Supamiu/ffxiv-teamcraft/commit/a841699))
* **lists:** fixed an issue with team detach feature that didn't save properly ([599c14b](https://github.com/Supamiu/ffxiv-teamcraft/commit/599c14b))
* **rotation-tips:** ingenuity I tip now only shows if it doesn't affect HQ% ([92260d1](https://github.com/Supamiu/ffxiv-teamcraft/commit/92260d1))


### Features

* **alarms:** added a button on alarm group panels to add multiple alarms at once to the group ([4f2399a](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f2399a))
* **gathering-location:** added a new button to add alarm directly to a group ([056afa1](https://github.com/Supamiu/ffxiv-teamcraft/commit/056afa1))



<a name="5.2.7"></a>
## [5.2.7](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.6...v5.2.7) (2019-04-12)


### Features

* **gc-supply:** reworked display for item selection and fixed a bug with level ranges ([bf2a10b](https://github.com/Supamiu/ffxiv-teamcraft/commit/bf2a10b))



<a name="5.2.6"></a>
## [5.2.6](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.5...v5.2.6) (2019-04-11)


### Bug Fixes

* **gc-supply:** fixed an issue with wrong import breaking the page ([3c8a447](https://github.com/Supamiu/ffxiv-teamcraft/commit/3c8a447))



<a name="5.2.5"></a>
## [5.2.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.3...v5.2.5) (2019-04-11)


### Features

* new feature: GC supply list generator ([fe2f1a0](https://github.com/Supamiu/ffxiv-teamcraft/commit/fe2f1a0)), closes [#596](https://github.com/Supamiu/ffxiv-teamcraft/issues/596)
* **alarms:** added a folder icon to sidebar to show folder name ([c22c807](https://github.com/Supamiu/ffxiv-teamcraft/commit/c22c807))
* **alarms:** new button to toggle groups collapse state ([f03a1f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/f03a1f1))



<a name="5.2.4"></a>
## [5.2.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.3...v5.2.4) (2019-04-10)


### Bug Fixes

* **fishing-log:** fixed an issue with spearfishing log not being loaded properly ([bf17350](https://github.com/Supamiu/ffxiv-teamcraft/commit/bf17350))
* **rotations:** saving a community rotation as new doesn't create a community rotation anymore ([529c71f](https://github.com/Supamiu/ffxiv-teamcraft/commit/529c71f))



<a name="5.2.3"></a>
## [5.2.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.2...v5.2.3) (2019-04-10)


### Bug Fixes

* **community-rotations:** fixed an issue with tags filter not working ([3ba6c0a](https://github.com/Supamiu/ffxiv-teamcraft/commit/3ba6c0a))
* **community-rotations:** you cannot select DoL sets for simulation anymore ([dceccc0](https://github.com/Supamiu/ffxiv-teamcraft/commit/dceccc0))
* **custom-simulator:** rotation stats are now only applied the first time ([1c95c81](https://github.com/Supamiu/ffxiv-teamcraft/commit/1c95c81))
* **layout:** fixed an issue with layout with korean names not being exportable ([f7c2867](https://github.com/Supamiu/ffxiv-teamcraft/commit/f7c2867))


### Features

* **profile:** added job levels to public profile page ([9f8a357](https://github.com/Supamiu/ffxiv-teamcraft/commit/9f8a357))
* **rotations:** added a warning if the set used for simulation isn't spec on spec rotation ([a2fe5e0](https://github.com/Supamiu/ffxiv-teamcraft/commit/a2fe5e0))
* **teams:** discord notification for progress now includes total required ([7209e44](https://github.com/Supamiu/ffxiv-teamcraft/commit/7209e44))



<a name="5.2.2"></a>
## [5.2.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.2.1...v5.2.2) (2019-04-09)


### Bug Fixes

* **alarms:** better display for long timers ([d1ce8b8](https://github.com/Supamiu/ffxiv-teamcraft/commit/d1ce8b8))
* **alarms:** fixed a timer with nodes that spawn twice a day ([cc5257f](https://github.com/Supamiu/ffxiv-teamcraft/commit/cc5257f))
* **alarms:** fixed an issue with some alarm timers not being accurate at all ([1565f51](https://github.com/Supamiu/ffxiv-teamcraft/commit/1565f51))
* **alarms:** fixed an issue with weather-only based alarms not showing up properly ([bffb60c](https://github.com/Supamiu/ffxiv-teamcraft/commit/bffb60c)), closes [#833](https://github.com/Supamiu/ffxiv-teamcraft/issues/833)
* **auth:** fixed an issue that randomly prevents a user from loading the website ([086da6b](https://github.com/Supamiu/ffxiv-teamcraft/commit/086da6b))
* **core:** fixed wrong imports issue causing some pages and features to break randomly ([5580693](https://github.com/Supamiu/ffxiv-teamcraft/commit/5580693))
* **desktop:** fixed an issue with desktop app not being closed properly ([2accce0](https://github.com/Supamiu/ffxiv-teamcraft/commit/2accce0))
* **desktop:** fixed missing community rotation icon on desktop app ([cca383f](https://github.com/Supamiu/ffxiv-teamcraft/commit/cca383f))
* **desktop:** fixed missing icons on desktop app ([b0e4afa](https://github.com/Supamiu/ffxiv-teamcraft/commit/b0e4afa)), closes [#836](https://github.com/Supamiu/ffxiv-teamcraft/issues/836)
* **layout:** fixed an issue with specific tag panels not being added properly ([4e1c35d](https://github.com/Supamiu/ffxiv-teamcraft/commit/4e1c35d))
* **log-tracker:** fixed an issue with map not changing properly when switching fishing hole ([74ce69f](https://github.com/Supamiu/ffxiv-teamcraft/commit/74ce69f))


### Features

* **alarms:** added mute toggle inside sidebar and overlay ([df5e934](https://github.com/Supamiu/ffxiv-teamcraft/commit/df5e934))
* **community-rotations:** you can now select which stats set is used for the simulation ([b066890](https://github.com/Supamiu/ffxiv-teamcraft/commit/b066890))
* **list:** item tags button is now handled as a standard button ([d38397f](https://github.com/Supamiu/ffxiv-teamcraft/commit/d38397f))
* **simulator:** custom rotations now save stats to the rotation to reuse them ([98519f8](https://github.com/Supamiu/ffxiv-teamcraft/commit/98519f8))



<a name="5.2.1"></a>
## [5.2.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.1.8...v5.2.1) (2019-04-08)


### Bug Fixes

* **alarms:** fixed an issue with "early by 0.5 Eorzean hours" setting ([45da636](https://github.com/Supamiu/ffxiv-teamcraft/commit/45da636)), closes [#827](https://github.com/Supamiu/ffxiv-teamcraft/issues/827)
* **fishing-log:** fixed bad imports causing random loading issues ([bdb9d02](https://github.com/Supamiu/ffxiv-teamcraft/commit/bdb9d02))
* **layout:** adding a new panel now adds it at the beginning of the panels display ([311f38f](https://github.com/Supamiu/ffxiv-teamcraft/commit/311f38f))
* **list:** fixed an issue with lists not being detached from the team properly in some cases ([ae1ca5c](https://github.com/Supamiu/ffxiv-teamcraft/commit/ae1ca5c))
* **pricing:** fixed an issue with items having low hq price and hq amount set to 0 ([26b852b](https://github.com/Supamiu/ffxiv-teamcraft/commit/26b852b))
* **search:** draft items can't be searched anymore, as they aren't real items ([5194f4b](https://github.com/Supamiu/ffxiv-teamcraft/commit/5194f4b))
* **simulator:** fixed an issue with anonymous and level form ([e36b015](https://github.com/Supamiu/ffxiv-teamcraft/commit/e36b015))


### Features

* **alarms:** added support for weather inside alarms ([e4f5db5](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4f5db5))
* **alarms:** better support for long timers ([e84f367](https://github.com/Supamiu/ffxiv-teamcraft/commit/e84f367))
* **alarms:** show more details about timed nodes for other items on same node ([90a51df](https://github.com/Supamiu/ffxiv-teamcraft/commit/90a51df)), closes [#751](https://github.com/Supamiu/ffxiv-teamcraft/issues/751)
* **alarms:** support for weather transitions inside alarms ([c84b7aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/c84b7aa))
* **alarms:** you can now create alarms for weather-dependant items ([63bb18b](https://github.com/Supamiu/ffxiv-teamcraft/commit/63bb18b))
* **auth:** creating an account from an anonymous access now transfers lists and user data ([8c39a7d](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c39a7d))
* **community-rotations:** added simulation result and macro copy button ([614261e](https://github.com/Supamiu/ffxiv-teamcraft/commit/614261e))
* **core:** added a link to the wiki inside the header bar ([8aebb86](https://github.com/Supamiu/ffxiv-teamcraft/commit/8aebb86))
* **core:** added a warning dialog if you're leaving a page with unsaved changes ([f677939](https://github.com/Supamiu/ffxiv-teamcraft/commit/f677939)), closes [#749](https://github.com/Supamiu/ffxiv-teamcraft/issues/749)
* **desktop:** added context menu on tray icon to open alarm overlay ([ca3d09e](https://github.com/Supamiu/ffxiv-teamcraft/commit/ca3d09e))
* **fishing:** added more data for fishing, inside lists, gathering-locations and log ([3d577d5](https://github.com/Supamiu/ffxiv-teamcraft/commit/3d577d5))
* **fishing:** added more data for the spearfishing items ([d17cf65](https://github.com/Supamiu/ffxiv-teamcraft/commit/d17cf65))
* **fishing:** new tooltips for fishes to show basic informations about them ([e4b2da9](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4b2da9))
* **fsh:** added support for fish eyes duration ([c5e93c4](https://github.com/Supamiu/ffxiv-teamcraft/commit/c5e93c4)), closes [#732](https://github.com/Supamiu/ffxiv-teamcraft/issues/732)
* **gathering-location:** added hookset to fish data display ([c7c208d](https://github.com/Supamiu/ffxiv-teamcraft/commit/c7c208d))
* **layout:** added item row buttons customization ([a9d138f](https://github.com/Supamiu/ffxiv-teamcraft/commit/a9d138f)), closes [#782](https://github.com/Supamiu/ffxiv-teamcraft/issues/782)
* **levequests:** you can now plan leves for FSH too ([642484a](https://github.com/Supamiu/ffxiv-teamcraft/commit/642484a))
* **list:** you can now remove an item from a list directly inside list details page ([192329d](https://github.com/Supamiu/ffxiv-teamcraft/commit/192329d))
* **log-tracker:** you can now properly track BTN/MIN progression inside log tracker ([60ffc63](https://github.com/Supamiu/ffxiv-teamcraft/commit/60ffc63)), closes [#732](https://github.com/Supamiu/ffxiv-teamcraft/issues/732)
* **simulator:** added community rotations system ([52cf4cd](https://github.com/Supamiu/ffxiv-teamcraft/commit/52cf4cd)), closes [#764](https://github.com/Supamiu/ffxiv-teamcraft/issues/764)
* **simulator:** added durability timing rotation tip ([c9b8050](https://github.com/Supamiu/ffxiv-teamcraft/commit/c9b8050))
* **simulator:** added information label about how much quality is missing to reach 100% ([fb0f7c5](https://github.com/Supamiu/ffxiv-teamcraft/commit/fb0f7c5))
* **simulator:** added patient touch timing tip ([a634131](https://github.com/Supamiu/ffxiv-teamcraft/commit/a634131))
* added auto completion on tags input box ([30c25e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/30c25e4)), closes [#774](https://github.com/Supamiu/ffxiv-teamcraft/issues/774)
* **simulator:** new rotation tips system to help people with rotations creation ([96d0725](https://github.com/Supamiu/ffxiv-teamcraft/commit/96d0725)), closes [#714](https://github.com/Supamiu/ffxiv-teamcraft/issues/714)
* **teams:** added officier member level to give permission to assign items to members ([38250f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/38250f0)), closes [#722](https://github.com/Supamiu/ffxiv-teamcraft/issues/722)
* **ux:** you can now add lists to workshops using a selection dialog box ([af73b59](https://github.com/Supamiu/ffxiv-teamcraft/commit/af73b59)), closes [#796](https://github.com/Supamiu/ffxiv-teamcraft/issues/796)
* **ux:** you can now add rotations to folders using a selection dialog box ([2aaa511](https://github.com/Supamiu/ffxiv-teamcraft/commit/2aaa511)), closes [#810](https://github.com/Supamiu/ffxiv-teamcraft/issues/810)
* you can now add tags on items ([441b110](https://github.com/Supamiu/ffxiv-teamcraft/commit/441b110)), closes [#774](https://github.com/Supamiu/ffxiv-teamcraft/issues/774)
* you can now filter inside panels based on tags ([f735da4](https://github.com/Supamiu/ffxiv-teamcraft/commit/f735da4)), closes [#774](https://github.com/Supamiu/ffxiv-teamcraft/issues/774)



<a name="5.2.0"></a>
# [5.2.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.1.8...v5.2.0) (2019-04-08)


### Bug Fixes

* **alarms:** fixed an issue with "early by 0.5 Eorzean hours" setting ([45da636](https://github.com/Supamiu/ffxiv-teamcraft/commit/45da636)), closes [#827](https://github.com/Supamiu/ffxiv-teamcraft/issues/827)
* **layout:** adding a new panel now adds it at the beginning of the panels display ([311f38f](https://github.com/Supamiu/ffxiv-teamcraft/commit/311f38f))
* **list:** fixed an issue with lists not being detached from the team properly in some cases ([ae1ca5c](https://github.com/Supamiu/ffxiv-teamcraft/commit/ae1ca5c))
* **pricing:** fixed an issue with items having low hq price and hq amount set to 0 ([26b852b](https://github.com/Supamiu/ffxiv-teamcraft/commit/26b852b))
* **search:** draft items can't be searched anymore, as they aren't real items ([5194f4b](https://github.com/Supamiu/ffxiv-teamcraft/commit/5194f4b))
* **simulator:** fixed an issue with anonymous and level form ([e36b015](https://github.com/Supamiu/ffxiv-teamcraft/commit/e36b015))


### Features

* **alarms:** added support for weather inside alarms ([e4f5db5](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4f5db5))
* **alarms:** better support for long timers ([e84f367](https://github.com/Supamiu/ffxiv-teamcraft/commit/e84f367))
* **alarms:** show more details about timed nodes for other items on same node ([90a51df](https://github.com/Supamiu/ffxiv-teamcraft/commit/90a51df)), closes [#751](https://github.com/Supamiu/ffxiv-teamcraft/issues/751)
* **alarms:** support for weather transitions inside alarms ([c84b7aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/c84b7aa))
* **alarms:** you can now create alarms for weather-dependant items ([63bb18b](https://github.com/Supamiu/ffxiv-teamcraft/commit/63bb18b))
* **auth:** creating an account from an anonymous access now transfers lists and user data ([8c39a7d](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c39a7d))
* **core:** added a link to the wiki inside the header bar ([8aebb86](https://github.com/Supamiu/ffxiv-teamcraft/commit/8aebb86))
* **core:** added a warning dialog if you're leaving a page with unsaved changes ([f677939](https://github.com/Supamiu/ffxiv-teamcraft/commit/f677939)), closes [#749](https://github.com/Supamiu/ffxiv-teamcraft/issues/749)
* **desktop:** added context menu on tray icon to open alarm overlay ([ca3d09e](https://github.com/Supamiu/ffxiv-teamcraft/commit/ca3d09e))
* **fishing:** added more data for fishing, inside lists, gathering-locations and log ([3d577d5](https://github.com/Supamiu/ffxiv-teamcraft/commit/3d577d5))
* **fishing:** added more data for the spearfishing items ([d17cf65](https://github.com/Supamiu/ffxiv-teamcraft/commit/d17cf65))
* **fishing:** new tooltips for fishes to show basic informations about them ([e4b2da9](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4b2da9))
* **fsh:** added support for fish eyes duration ([c5e93c4](https://github.com/Supamiu/ffxiv-teamcraft/commit/c5e93c4)), closes [#732](https://github.com/Supamiu/ffxiv-teamcraft/issues/732)
* you can now filter inside panels based on tags ([f735da4](https://github.com/Supamiu/ffxiv-teamcraft/commit/f735da4)), closes [#774](https://github.com/Supamiu/ffxiv-teamcraft/issues/774)
* **gathering-location:** added hookset to fish data display ([c7c208d](https://github.com/Supamiu/ffxiv-teamcraft/commit/c7c208d))
* **layout:** added item row buttons customization ([a9d138f](https://github.com/Supamiu/ffxiv-teamcraft/commit/a9d138f)), closes [#782](https://github.com/Supamiu/ffxiv-teamcraft/issues/782)
* **levequests:** you can now plan leves for FSH too ([642484a](https://github.com/Supamiu/ffxiv-teamcraft/commit/642484a))
* **list:** you can now remove an item from a list directly inside list details page ([192329d](https://github.com/Supamiu/ffxiv-teamcraft/commit/192329d))
* **log-tracker:** you can now properly track BTN/MIN progression inside log tracker ([60ffc63](https://github.com/Supamiu/ffxiv-teamcraft/commit/60ffc63)), closes [#732](https://github.com/Supamiu/ffxiv-teamcraft/issues/732)
* **simulator:** added community rotations system ([52cf4cd](https://github.com/Supamiu/ffxiv-teamcraft/commit/52cf4cd)), closes [#764](https://github.com/Supamiu/ffxiv-teamcraft/issues/764)
* **simulator:** added durability timing rotation tip ([c9b8050](https://github.com/Supamiu/ffxiv-teamcraft/commit/c9b8050))
* **simulator:** added information label about how much quality is missing to reach 100% ([fb0f7c5](https://github.com/Supamiu/ffxiv-teamcraft/commit/fb0f7c5))
* **simulator:** added patient touch timing tip ([a634131](https://github.com/Supamiu/ffxiv-teamcraft/commit/a634131))
* **simulator:** new rotation tips system to help people with rotations creation ([96d0725](https://github.com/Supamiu/ffxiv-teamcraft/commit/96d0725)), closes [#714](https://github.com/Supamiu/ffxiv-teamcraft/issues/714)
* **teams:** added officier member level to give permission to assign items to members ([38250f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/38250f0)), closes [#722](https://github.com/Supamiu/ffxiv-teamcraft/issues/722)
* added auto completion on tags input box ([30c25e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/30c25e4)), closes [#774](https://github.com/Supamiu/ffxiv-teamcraft/issues/774)
* **ux:** you can now add lists to workshops using a selection dialog box ([af73b59](https://github.com/Supamiu/ffxiv-teamcraft/commit/af73b59)), closes [#796](https://github.com/Supamiu/ffxiv-teamcraft/issues/796)
* **ux:** you can now add rotations to folders using a selection dialog box ([2aaa511](https://github.com/Supamiu/ffxiv-teamcraft/commit/2aaa511)), closes [#810](https://github.com/Supamiu/ffxiv-teamcraft/issues/810)
* you can now add tags on items ([441b110](https://github.com/Supamiu/ffxiv-teamcraft/commit/441b110)), closes [#774](https://github.com/Supamiu/ffxiv-teamcraft/issues/774)



<a name="5.1.8"></a>
## [5.1.8](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.1.7...v5.1.8) (2019-03-31)


### Bug Fixes

* **market:** fixed marketboard interactions (popup and pricing mode) ([d5aea99](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5aea99))
* **overlay:** clicking on the item icon wont open garlandtools anymore inside overlay ([23c993c](https://github.com/Supamiu/ffxiv-teamcraft/commit/23c993c))


### Features

* **search:** support Korean item type ([916a995](https://github.com/Supamiu/ffxiv-teamcraft/commit/916a995))



<a name="5.1.7"></a>
## [5.1.7](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.1.6...v5.1.7) (2019-03-26)


### Features

* **core:** updated data with 4.56 patch content ([3fa19ea](https://github.com/Supamiu/ffxiv-teamcraft/commit/3fa19ea))



<a name="5.1.6"></a>
## [5.1.6](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.1.5...v5.1.6) (2019-03-25)


### Bug Fixes

* **alarms:** fixed an issue with ingame macro generation on DE version ([c4c802b](https://github.com/Supamiu/ffxiv-teamcraft/commit/c4c802b))
* **lists:** fixed an issue with data extraction on final items ([ffbe1e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/ffbe1e4))
* **permissions:** fixed an issue with workshop permissions propagation ([4ed8c68](https://github.com/Supamiu/ffxiv-teamcraft/commit/4ed8c68))


### Features

* **desktop:** settings changes are now applied to the overlay too ([dc711f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/dc711f1))
* **sidebar:** added tooltips on navigation icons when sidebar is collapsed ([18a3a13](https://github.com/Supamiu/ffxiv-teamcraft/commit/18a3a13))
* **simulator:** proper implementation for recipe affinity ([36f1200](https://github.com/Supamiu/ffxiv-teamcraft/commit/36f1200))



<a name="5.1.5"></a>
## [5.1.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.1.4...v5.1.5) (2019-03-24)


### Bug Fixes

* **alarms:** fixed a display issue when two alarms have same remaining time ([5de91c2](https://github.com/Supamiu/ffxiv-teamcraft/commit/5de91c2))
* **core:** fixed an error message poping because of last firestore update ([3ae1c8c](https://github.com/Supamiu/ffxiv-teamcraft/commit/3ae1c8c))
* **list:** fixed an issue with missing instance name, needs list regeneration ([a48210f](https://github.com/Supamiu/ffxiv-teamcraft/commit/a48210f))
* **map:** fixed an issue with platinum ore's location ([bfc6eb2](https://github.com/Supamiu/ffxiv-teamcraft/commit/bfc6eb2))
* **merge:** fixed an issue with merge dialog box when closing new list name input ([ea3baba](https://github.com/Supamiu/ffxiv-teamcraft/commit/ea3baba))


### Features

* **list:** permission level for everyone is now shown on both panel and list details using an icon ([80841bd](https://github.com/Supamiu/ffxiv-teamcraft/commit/80841bd))



<a name="5.1.4"></a>
## [5.1.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.1.3...v5.1.4) (2019-03-23)


### Bug Fixes

* **lists:** better support for big lists, they shouldn't disappear anymore ([a971634](https://github.com/Supamiu/ffxiv-teamcraft/commit/a971634))
* **teams:** fixed an issue with wrong permissions being resolved for team list ([a84e4dc](https://github.com/Supamiu/ffxiv-teamcraft/commit/a84e4dc))


### Features

* **list:** you can now add an item from a list to another list ([caa2042](https://github.com/Supamiu/ffxiv-teamcraft/commit/caa2042))



<a name="5.1.3"></a>
## [5.1.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.1.2...v5.1.3) (2019-03-19)


### Bug Fixes

* **alarms:** fixed an issue with closest aetheryte missing when created from list ([01a9364](https://github.com/Supamiu/ffxiv-teamcraft/commit/01a9364))
* **alarms:** mute toggle is now a proper toggle instead of a confusing button ([1875db3](https://github.com/Supamiu/ffxiv-teamcraft/commit/1875db3))
* **auth:** fixed an issue with character being asked while it shouldn't be ([0e49219](https://github.com/Supamiu/ffxiv-teamcraft/commit/0e49219))
* **custom-items:** inverted both export and import button icons ([353fb35](https://github.com/Supamiu/ffxiv-teamcraft/commit/353fb35))
* **lists:** lists and their content aren't reordered anymore when editing amounts (not retroactive) ([0053aa6](https://github.com/Supamiu/ffxiv-teamcraft/commit/0053aa6))
* **log-tracker:** added translation entry for the * character tooltip ([cfd64be](https://github.com/Supamiu/ffxiv-teamcraft/commit/cfd64be))


### Features

* support for Korean 4.41 update ([16d6cd2](https://github.com/Supamiu/ffxiv-teamcraft/commit/16d6cd2))



<a name="5.1.2"></a>
## [5.1.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.1.1...v5.1.2) (2019-03-18)


### Bug Fixes

* **custom-items:** fixed an issue preventing addition of multiple custom items inside a list ([1983dee](https://github.com/Supamiu/ffxiv-teamcraft/commit/1983dee))
* **desktop:** removed update message banner now that auto updater is fixed ([3e17aa1](https://github.com/Supamiu/ffxiv-teamcraft/commit/3e17aa1))



<a name="5.1.1"></a>
## [5.1.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.1.0...v5.1.1) (2019-03-17)


### Bug Fixes

* **custom-items:** fixed korean and chinese search for item picker ([9182ba8](https://github.com/Supamiu/ffxiv-teamcraft/commit/9182ba8))
* **lists:** "You have no lists" message isn't draggable anymore ([f6d037e](https://github.com/Supamiu/ffxiv-teamcraft/commit/f6d037e))
* **rotations:** fixed an issue duplicating the rotation panel when using drag and drop ([70d8676](https://github.com/Supamiu/ffxiv-teamcraft/commit/70d8676))
* **search:** fixed an issue with korean and chinese search filters ([723b57b](https://github.com/Supamiu/ffxiv-teamcraft/commit/723b57b))



<a name="5.1.0"></a>
# [5.1.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.38...v5.1.0) (2019-03-16)


### Bug Fixes

* **auth:** fixed an issue with some data not loaded properly ([b309073](https://github.com/Supamiu/ffxiv-teamcraft/commit/b309073))
* **list:** fixed an issue with total trade popup not doing proper math ([c73d324](https://github.com/Supamiu/ffxiv-teamcraft/commit/c73d324))
* **search:** fixed a possible issue with search input in some cases ([66b587d](https://github.com/Supamiu/ffxiv-teamcraft/commit/66b587d))
* **search:** fixed an issue with search filters ([0342868](https://github.com/Supamiu/ffxiv-teamcraft/commit/0342868))
* **simulator:** dragging the last action doesn't make it immovable ([17eb9ba](https://github.com/Supamiu/ffxiv-teamcraft/commit/17eb9ba))


### Features

* added russian to the list of available translation languages ([8017e90](https://github.com/Supamiu/ffxiv-teamcraft/commit/8017e90))
* you can now create custom items ([#804](https://github.com/Supamiu/ffxiv-teamcraft/issues/804)) ([afb27c0](https://github.com/Supamiu/ffxiv-teamcraft/commit/afb27c0)), closes [#579](https://github.com/Supamiu/ffxiv-teamcraft/issues/579)
* **lists:** updated lists page display for more usability with teams ([6893cb9](https://github.com/Supamiu/ffxiv-teamcraft/commit/6893cb9))
* **localisation:** you can now search in Korean from Gathering items ([71a7cc7](https://github.com/Supamiu/ffxiv-teamcraft/commit/71a7cc7))
* **log-tracker:** added a confirmation box for the "mark page as done" action ([dae54ee](https://github.com/Supamiu/ffxiv-teamcraft/commit/dae54ee))
* **pricing:** you can now copy a pricing panel content as string ([96015a0](https://github.com/Supamiu/ffxiv-teamcraft/commit/96015a0))
* **simulator:** added a warning message about level 70 quest for stroke of genius ([2e069fb](https://github.com/Supamiu/ffxiv-teamcraft/commit/2e069fb))
* **workshop:** workshop panel now has list count shown ([788d040](https://github.com/Supamiu/ffxiv-teamcraft/commit/788d040))



<a name="5.0.38"></a>
## [5.0.38](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.37...v5.0.38) (2019-03-10)


### Bug Fixes

* fix wrong index ([53c9635](https://github.com/Supamiu/ffxiv-teamcraft/commit/53c9635))
* fixed an issue with some users having ghost characters breaking the app ([916669e](https://github.com/Supamiu/ffxiv-teamcraft/commit/916669e))
* remove header ([7ae0ad6](https://github.com/Supamiu/ffxiv-teamcraft/commit/7ae0ad6))
* **alarms:** default volume is now 50% ([6b366cb](https://github.com/Supamiu/ffxiv-teamcraft/commit/6b366cb))
* **auth:** hotfix for logging action asking for character directly ([894d831](https://github.com/Supamiu/ffxiv-teamcraft/commit/894d831))
* **layout:** fixed an issue with items reordering constantly in some cases ([c8eacfd](https://github.com/Supamiu/ffxiv-teamcraft/commit/c8eacfd))
* **list:** possible fix for "ghost lists" bug ([e09f3bb](https://github.com/Supamiu/ffxiv-teamcraft/commit/e09f3bb))
* **lists:** another try to fix the ghost lists bug ([d8edcbc](https://github.com/Supamiu/ffxiv-teamcraft/commit/d8edcbc))
* **macro-translator:** fixed an issue where skill name match was not case-independent ([dde5e0f](https://github.com/Supamiu/ffxiv-teamcraft/commit/dde5e0f))
* **overlay:** removed giveaway banner from overlay mode ([967e4d4](https://github.com/Supamiu/ffxiv-teamcraft/commit/967e4d4))


### Features

* add class/job in korean ([6a7d3bf](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a7d3bf))
* add Korean resources ([a3183d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/a3183d6))
* add more Korean ([d2a72e9](https://github.com/Supamiu/ffxiv-teamcraft/commit/d2a72e9))
* add more Korean data ([11391ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/11391ac))
* **list:** you can now upgrade an ephemeral list to a permanent one ([f5e45c0](https://github.com/Supamiu/ffxiv-teamcraft/commit/f5e45c0))
* **search:** you can now reset filters (also fixes some filters interactions) ([e1d2400](https://github.com/Supamiu/ffxiv-teamcraft/commit/e1d2400))



<a name="5.0.37"></a>
## [5.0.37](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.36...v5.0.37) (2019-03-01)


### Bug Fixes

* fixed an issue with KO/ZH items search not available inside recipe picker ([6cfc840](https://github.com/Supamiu/ffxiv-teamcraft/commit/6cfc840))
* **desktop:** fixed auto updater ([8fa3bcc](https://github.com/Supamiu/ffxiv-teamcraft/commit/8fa3bcc))
* **layout:** "Other" layout panel display can now be edited properly ([10330a6](https://github.com/Supamiu/ffxiv-teamcraft/commit/10330a6))
* **layout:** fixed an issue with NOT operator on first filter of a chain ([25b30fe](https://github.com/Supamiu/ffxiv-teamcraft/commit/25b30fe))
* **lists:** small fix for list compacts update GCF ([7a20c65](https://github.com/Supamiu/ffxiv-teamcraft/commit/7a20c65))
* **simulator:** rotation macros using 9 cross class skills not adding Reclaim to aactions ([be20b28](https://github.com/Supamiu/ffxiv-teamcraft/commit/be20b28))


### Features

* changed empty message for notifications banner button ([868bf0c](https://github.com/Supamiu/ffxiv-teamcraft/commit/868bf0c))
* updated ant design to 7.0.0 ([4738034](https://github.com/Supamiu/ffxiv-teamcraft/commit/4738034))
* **desktop:** added a button to clear cache inside setting ([0e22826](https://github.com/Supamiu/ffxiv-teamcraft/commit/0e22826))
* **simulator:** updated formulas with latest data input ([5f0e533](https://github.com/Supamiu/ffxiv-teamcraft/commit/5f0e533))



<a name="5.0.36"></a>
## [5.0.36](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.35...v5.0.36) (2019-02-27)


### Bug Fixes

* **list:** fixed an issue with the "isLarge" method sometimes crashing ([6fe7c44](https://github.com/Supamiu/ffxiv-teamcraft/commit/6fe7c44))


### Features

* support for Korean 4.40 update ([dd501cd](https://github.com/Supamiu/ffxiv-teamcraft/commit/dd501cd))
* support Korean item names ([c3d07d7](https://github.com/Supamiu/ffxiv-teamcraft/commit/c3d07d7))
* you cannot add items to lists larger than 300kB anymore to avoid data loss ([1f81998](https://github.com/Supamiu/ffxiv-teamcraft/commit/1f81998))
* **search:** added support for KO and ZH items search ([b770290](https://github.com/Supamiu/ffxiv-teamcraft/commit/b770290))
* **search:** search cap raised to 100 items instead of 50 ([0601cc5](https://github.com/Supamiu/ffxiv-teamcraft/commit/0601cc5))



<a name="5.0.35"></a>
## [5.0.35](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.34...v5.0.35) (2019-02-23)


### Bug Fixes

* **aetheryte:** added missing Ok'undu aetheryte entry manually ([ab00f99](https://github.com/Supamiu/ffxiv-teamcraft/commit/ab00f99)), closes [#649](https://github.com/Supamiu/ffxiv-teamcraft/issues/649)
* **alarms:** fixed alarms sound modification spamming preview sound ([cf07ff4](https://github.com/Supamiu/ffxiv-teamcraft/commit/cf07ff4))
* **comments:** added target name (list or item) inside comment popup ([95a549e](https://github.com/Supamiu/ffxiv-teamcraft/commit/95a549e))
* **list-details:** fixed an issue with crystals count not being reduced properly ([6e59a32](https://github.com/Supamiu/ffxiv-teamcraft/commit/6e59a32))
* **lists:** removed count from own lists's copy button ([786ba4c](https://github.com/Supamiu/ffxiv-teamcraft/commit/786ba4c))



<a name="5.0.34"></a>
## [5.0.34](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.33...v5.0.34) (2019-02-21)


### Bug Fixes

* **list-details:** added scrollbar to user assignment menu ([2d5bf4d](https://github.com/Supamiu/ffxiv-teamcraft/commit/2d5bf4d)), closes [#781](https://github.com/Supamiu/ffxiv-teamcraft/issues/781)
* **log-tracker:** fixed an issue with log progression not being saved properly in some cases ([f6695ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/f6695ac))
* **simulator:** actions that need GOOD or EXCELLENT are now disabled in safe mode ([c868cf0](https://github.com/Supamiu/ffxiv-teamcraft/commit/c868cf0))


### Features

* added close button to giveaway announcement ([afbb1c0](https://github.com/Supamiu/ffxiv-teamcraft/commit/afbb1c0))
* **lists:** you can now copy a list directly from /lists page ([5f28db7](https://github.com/Supamiu/ffxiv-teamcraft/commit/5f28db7))
* **tooltips:** added tooltips details for foods ([9633464](https://github.com/Supamiu/ffxiv-teamcraft/commit/9633464))



<a name="5.0.33"></a>
## [5.0.33](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.32...v5.0.33) (2019-02-20)


### Bug Fixes

* **alarms:** fixed an issue with alarms spawning at 12AM ([e4eed0b](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4eed0b))
* **auth:** character association popup showing up after each login ([760933a](https://github.com/Supamiu/ffxiv-teamcraft/commit/760933a)), closes [#777](https://github.com/Supamiu/ffxiv-teamcraft/issues/777)


### Features

* added banner announcement for 1k discord members giveaway ([e3b1ce1](https://github.com/Supamiu/ffxiv-teamcraft/commit/e3b1ce1))



<a name="5.0.32"></a>
## [5.0.32](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.30...v5.0.32) (2019-02-19)


### Bug Fixes

* final fix for external languages system ([38d60e1](https://github.com/Supamiu/ffxiv-teamcraft/commit/38d60e1))
* fixed an issue breaking display after zh items addition ([41988ed](https://github.com/Supamiu/ffxiv-teamcraft/commit/41988ed))
* **vendors:** fixed an issue with vendors extraction not being done properly in some cases ([b5374d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5374d6))



<a name="5.0.31"></a>
## [5.0.31](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.30...v5.0.31) (2019-02-19)


### Bug Fixes

* fixed an issue breaking display after zh items addition ([41988ed](https://github.com/Supamiu/ffxiv-teamcraft/commit/41988ed))



<a name="5.0.30"></a>
## [5.0.30](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.29...v5.0.30) (2019-02-18)


### Bug Fixes

* remove the unsupported zh search in garland and fix the wrong file name ([c1a80eb](https://github.com/Supamiu/ffxiv-teamcraft/commit/c1a80eb))
* **favorites:** fixed an issue with favorites not loading in desktop app ([f53fc0b](https://github.com/Supamiu/ffxiv-teamcraft/commit/f53fc0b)), closes [#768](https://github.com/Supamiu/ffxiv-teamcraft/issues/768)
* **list-merge:** added an information about big lists not being mergeable ([eaab1e5](https://github.com/Supamiu/ffxiv-teamcraft/commit/eaab1e5))
* **vendors:** fixed an issue with vendors extractor and some items ([1d50192](https://github.com/Supamiu/ffxiv-teamcraft/commit/1d50192))


### Features

* big data chunks are now lazy loaded, for better build performances ([c2e1218](https://github.com/Supamiu/ffxiv-teamcraft/commit/c2e1218)), closes [#767](https://github.com/Supamiu/ffxiv-teamcraft/issues/767)
* support Chinese item names ([8213caf](https://github.com/Supamiu/ffxiv-teamcraft/commit/8213caf))



<a name="5.0.29"></a>
## [5.0.29](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.28...v5.0.29) (2019-02-17)


### Bug Fixes

* **levequests:** fixed an issue with item count not always accurate ([6dfa822](https://github.com/Supamiu/ffxiv-teamcraft/commit/6dfa822))
* **pricing:** fixed an issue with items that cannot be HQ being priced wrong ([75224fb](https://github.com/Supamiu/ffxiv-teamcraft/commit/75224fb))



<a name="5.0.28"></a>
## [5.0.28](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.27...v5.0.28) (2019-02-15)


### Bug Fixes

* **levequests:** fixed an issue with new data structure changes ([ae71229](https://github.com/Supamiu/ffxiv-teamcraft/commit/ae71229))
* **pricing:** fixed an issue with minimum craft cost being wrong when nq price > hq price ([ae1fc12](https://github.com/Supamiu/ffxiv-teamcraft/commit/ae1fc12))


### Features

* **list-details:** added a toggle to disable auto HQ flags ([4e9d865](https://github.com/Supamiu/ffxiv-teamcraft/commit/4e9d865))
* **rotations:** new search input box inside the rotation picker drawer ([17ed767](https://github.com/Supamiu/ffxiv-teamcraft/commit/17ed767))



<a name="5.0.27"></a>
## [5.0.27](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.26...v5.0.27) (2019-02-14)


### Bug Fixes

* fixed an issue with cloud functions crashing for list compacts update ([4c1a61c](https://github.com/Supamiu/ffxiv-teamcraft/commit/4c1a61c))
* **layout:** fixed an issue with tiers system breaking items ordering ([a5ff317](https://github.com/Supamiu/ffxiv-teamcraft/commit/a5ff317))
* **lists:** fixed an issue with lists order breaking after adding a new list ([204fa2b](https://github.com/Supamiu/ffxiv-teamcraft/commit/204fa2b))
* **permissions:** fixed an issue with readonly permission ([5d4172a](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d4172a))
* **pricing:** fixed an issue with preferred copy type not implemented properly ([e8a49ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/e8a49ab))


### Features

* **layout:** added new layout filter: IS_TRADE, matches all trades but gil ones ([2352a7c](https://github.com/Supamiu/ffxiv-teamcraft/commit/2352a7c))
* **log-tracker:** added completion count next to each page name ([712b1fc](https://github.com/Supamiu/ffxiv-teamcraft/commit/712b1fc))
* **time:** added a click action on eorzean clock to change format ([ab18c48](https://github.com/Supamiu/ffxiv-teamcraft/commit/ab18c48))



<a name="5.0.26"></a>
## [5.0.26](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.25...v5.0.26) (2019-02-13)


### Bug Fixes

* **list-details:** fixed an issue with team members assignment ([4f95d63](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f95d63))



<a name="5.0.25"></a>
## [5.0.25](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.24...v5.0.25) (2019-02-12)


### Bug Fixes

* **gathering-location:** fixed an issue with ephemeral node status ([28a722e](https://github.com/Supamiu/ffxiv-teamcraft/commit/28a722e))
* **list:** fixed an issue with some lists being deleted in details while they still exist ([d268520](https://github.com/Supamiu/ffxiv-teamcraft/commit/d268520))
* **simulator:** fixed an issue with specialist stats toggle ([f82421b](https://github.com/Supamiu/ffxiv-teamcraft/commit/f82421b))
* **simulator:** fixed an issue with the bonus from consumables being ceiled instead of floored ([aab8b88](https://github.com/Supamiu/ffxiv-teamcraft/commit/aab8b88))


### Features

* support for 4.55 update ([c825217](https://github.com/Supamiu/ffxiv-teamcraft/commit/c825217))



<a name="5.0.24"></a>
## [5.0.24](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.23...v5.0.24) (2019-02-10)


### Bug Fixes

* **list:** fixed an issue with display freeze and reordering ([c888309](https://github.com/Supamiu/ffxiv-teamcraft/commit/c888309))
* **list-details:** fixed an issue with completed panels being empty when opened ([4491c26](https://github.com/Supamiu/ffxiv-teamcraft/commit/4491c26))
* **list-details:** fixed an issue with teams permissions not being handled properly ([235a3ad](https://github.com/Supamiu/ffxiv-teamcraft/commit/235a3ad))
* **simulator:** fixed a bug with import from crafting optimizer not working with Basic Synthesis ([4a1e4fc](https://github.com/Supamiu/ffxiv-teamcraft/commit/4a1e4fc))



<a name="5.0.23"></a>
## [5.0.23](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.22...v5.0.23) (2019-02-07)


### Bug Fixes

* **simulator:** fixed an issue with rotations loading inside simulator ([b20da3f](https://github.com/Supamiu/ffxiv-teamcraft/commit/b20da3f))



<a name="5.0.22"></a>
## [5.0.22](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.21...v5.0.22) (2019-02-06)


### Bug Fixes

* **gathering-location:** fixed an issue with hidden items not being found by search system ([5138d7c](https://github.com/Supamiu/ffxiv-teamcraft/commit/5138d7c))
* **layout:** fixed an issue with completed panels being empty even once collapsed ([75db2ec](https://github.com/Supamiu/ffxiv-teamcraft/commit/75db2ec))
* **pricing:** fixed a bug with price changing when it shouldn't, due to messy sort ([374be6a](https://github.com/Supamiu/ffxiv-teamcraft/commit/374be6a))
* **search:** fixed an issue with filters not being initialized properly ([cc22d17](https://github.com/Supamiu/ffxiv-teamcraft/commit/cc22d17))
* **simulator:** fixed an issue with rotation swap inside simulator ([9cdbe1d](https://github.com/Supamiu/ffxiv-teamcraft/commit/9cdbe1d))



<a name="5.0.21"></a>
## [5.0.21](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.20...v5.0.21) (2019-02-05)


### Bug Fixes

* **layout:** fixed an issue with some layout filters breaking the UI ([d3cd623](https://github.com/Supamiu/ffxiv-teamcraft/commit/d3cd623))
* **simulator:** fixed an issue resetting rotation to last saved state after you apply configuration ([bf602ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/bf602ab))


### Features

* **search:** added possibility to have multiple categories selected in filters ([11f830a](https://github.com/Supamiu/ffxiv-teamcraft/commit/11f830a)), closes [#680](https://github.com/Supamiu/ffxiv-teamcraft/issues/680)
* **simulator:** added new failure condition: missing inner quiet ([01aa35b](https://github.com/Supamiu/ffxiv-teamcraft/commit/01aa35b))
* added opensearch to the website ([8b0ff5a](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b0ff5a))



<a name="5.0.20"></a>
## [5.0.20](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.19...v5.0.20) (2019-01-29)


### Bug Fixes

* **simulator:** fixed an issue with buff ticks not being started properly ([5e78364](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e78364))
* **simulator:** restored initial wait duration for Comfort Zone and manipulation II ([33084b6](https://github.com/Supamiu/ffxiv-teamcraft/commit/33084b6))



<a name="5.0.19"></a>
## [5.0.19](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.18...v5.0.19) (2019-01-29)


### Bug Fixes

* fixed an issue with some items not being added to a list properly ([b7c3fd2](https://github.com/Supamiu/ffxiv-teamcraft/commit/b7c3fd2)), closes [#739](https://github.com/Supamiu/ffxiv-teamcraft/issues/739)


### Features

* **list:** you can now add items to a list directly from list details panel ([2d9edce](https://github.com/Supamiu/ffxiv-teamcraft/commit/2d9edce)), closes [#529](https://github.com/Supamiu/ffxiv-teamcraft/issues/529)
* **simulator:** Add consumables to generated macros ([#717](https://github.com/Supamiu/ffxiv-teamcraft/issues/717)) ([59c0819](https://github.com/Supamiu/ffxiv-teamcraft/commit/59c0819))
* **simulator:** changed buffs bar for a floating bar on mobile ([46b3384](https://github.com/Supamiu/ffxiv-teamcraft/commit/46b3384))
* **simulator:** you can now see why a rotation fails ([6b70c97](https://github.com/Supamiu/ffxiv-teamcraft/commit/6b70c97)), closes [#661](https://github.com/Supamiu/ffxiv-teamcraft/issues/661)



<a name="5.0.18"></a>
## [5.0.18](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.17...v5.0.18) (2019-01-27)


### Bug Fixes

* **permissions:** fixed an issue with list deletion button ([d3be009](https://github.com/Supamiu/ffxiv-teamcraft/commit/d3be009))



<a name="5.0.17"></a>
## [5.0.17](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.16...v5.0.17) (2019-01-27)


### Bug Fixes

* **list-panel:** fixed an issue with buttons sometimes hidden even if you had permissions ([ff87bbf](https://github.com/Supamiu/ffxiv-teamcraft/commit/ff87bbf))
* **perfs:** item names cache is now shared across the app properly ([c37866b](https://github.com/Supamiu/ffxiv-teamcraft/commit/c37866b))
* **perfs:** lists are now unloaded upon leaving details page ([a0c75d1](https://github.com/Supamiu/ffxiv-teamcraft/commit/a0c75d1))


### Features

* **patreon:** added new patreon supporter to loading screen: Qih "Kweh" Mewrilah ([3eb131b](https://github.com/Supamiu/ffxiv-teamcraft/commit/3eb131b))



<a name="5.0.16"></a>
## [5.0.16](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.15...v5.0.16) (2019-01-24)


### Bug Fixes

* **layout:** fixed an issue with large lists not being shown properly in some cases ([2b1d0d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/2b1d0d8)), closes [#733](https://github.com/Supamiu/ffxiv-teamcraft/issues/733)



<a name="5.0.15"></a>
## [5.0.15](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.14...v5.0.15) (2019-01-23)


### Bug Fixes

* **layout:** fixed an issue with tomes filter ([9bee1e5](https://github.com/Supamiu/ffxiv-teamcraft/commit/9bee1e5))
* fixed an issue with desktop app not loading item names properly ([3ee4fb7](https://github.com/Supamiu/ffxiv-teamcraft/commit/3ee4fb7))
* fixed an issue with some masterbook icons not showing properly ([82bbfe4](https://github.com/Supamiu/ffxiv-teamcraft/commit/82bbfe4))


### Features

* **layout:** new `IS_DUNGEON_DROP` filter ([d73e53d](https://github.com/Supamiu/ffxiv-teamcraft/commit/d73e53d))



<a name="5.0.14"></a>
## [5.0.14](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.13...v5.0.14) (2019-01-23)


### Bug Fixes

* fixed an issue with old /home routes not being redirected properly ([96a234e](https://github.com/Supamiu/ffxiv-teamcraft/commit/96a234e))
* **layout:** fixed a bug with ASC and DESC being inverted for layout ordering ([d5b27d0](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5b27d0))
* **pricing:** fixed a bug where filling prices with MB would just load infinitely ([262dddf](https://github.com/Supamiu/ffxiv-teamcraft/commit/262dddf))
* **profile:** added glamour masterbooks to the profile editor for masterbooks ([4a7c092](https://github.com/Supamiu/ffxiv-teamcraft/commit/4a7c092))
* **teams:** fixed an issue stopping team lists from loading ([dc94314](https://github.com/Supamiu/ffxiv-teamcraft/commit/dc94314))
* fixed an issue with tooltip sometimes crashing for no reason ([6382f4a](https://github.com/Supamiu/ffxiv-teamcraft/commit/6382f4a))
* fixed some issues with search component sometimes firing errors ([0ba46d3](https://github.com/Supamiu/ffxiv-teamcraft/commit/0ba46d3))


### Features

* new crafting log tracker ([6b467d0](https://github.com/Supamiu/ffxiv-teamcraft/commit/6b467d0)), closes [#724](https://github.com/Supamiu/ffxiv-teamcraft/issues/724)
* **layout:** new layout filter available: FROM_BEAST_TRIBE ([9a7db4d](https://github.com/Supamiu/ffxiv-teamcraft/commit/9a7db4d))
* **layout:** new option to remove duplicates from zone breakdown, per panel ([79e3f5b](https://github.com/Supamiu/ffxiv-teamcraft/commit/79e3f5b)), closes [#723](https://github.com/Supamiu/ffxiv-teamcraft/issues/723)
* **list-details:** added a way to tag an item as not required HQ at all ([944878d](https://github.com/Supamiu/ffxiv-teamcraft/commit/944878d))
* **list-panel:** added color change for odd rows to make them easier to read ([8b2c16d](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b2c16d))
* **log-tracker:** added "*" character next to page names if they are needed for achievement ([aa8e03a](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa8e03a))
* **pricing:** added a warning for when an item is cheaper at NPC than the current price value ([549e246](https://github.com/Supamiu/ffxiv-teamcraft/commit/549e246))
* **pricing:** added an icon for when price shown is from crafting ([68692c9](https://github.com/Supamiu/ffxiv-teamcraft/commit/68692c9))



<a name="5.0.13"></a>
## [5.0.13](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.12...v5.0.13) (2019-01-20)


### Bug Fixes

* **alarms:** fixed an issue with closest aetheryte tp not showing properly ([2add519](https://github.com/Supamiu/ffxiv-teamcraft/commit/2add519))
* **search:** fixed a bug with some search terms ([9568fdb](https://github.com/Supamiu/ffxiv-teamcraft/commit/9568fdb))
* **settings:** fixed a missing translation in general settings ([7f39752](https://github.com/Supamiu/ffxiv-teamcraft/commit/7f39752))
* **simulator:** fixed position of "XIV" inside macro export button ([7b06d75](https://github.com/Supamiu/ffxiv-teamcraft/commit/7b06d75))


### Features

* **alarms:** added confirmation message for alarms deletion ([e3b5dec](https://github.com/Supamiu/ffxiv-teamcraft/commit/e3b5dec))
* added a message in every page to show when a new version is available ([ff7e4a8](https://github.com/Supamiu/ffxiv-teamcraft/commit/ff7e4a8))
* added new patreon supporter: Morphean Knights ([cf58678](https://github.com/Supamiu/ffxiv-teamcraft/commit/cf58678))
* **settings:** new option to remove panel borders ([d40baab](https://github.com/Supamiu/ffxiv-teamcraft/commit/d40baab))
* **simulator:** added new safe mode to make 100% safe rotations easily ([c939f99](https://github.com/Supamiu/ffxiv-teamcraft/commit/c939f99)), closes [#713](https://github.com/Supamiu/ffxiv-teamcraft/issues/713)



<a name="5.0.12"></a>
## [5.0.12](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.11...v5.0.12) (2019-01-17)


### Bug Fixes

* **list-details:** "hide completed rows" is now properly persisted inside local storage ([71a7ab0](https://github.com/Supamiu/ffxiv-teamcraft/commit/71a7ab0)), closes [#715](https://github.com/Supamiu/ffxiv-teamcraft/issues/715)
* **list-details:** optimized navigation route button is now next to zone name ([04781a8](https://github.com/Supamiu/ffxiv-teamcraft/commit/04781a8))
* **permissions:** fixed a bug with permissions not applying properly in some cases ([e941eb2](https://github.com/Supamiu/ffxiv-teamcraft/commit/e941eb2))


### Features

* **alarms:** gathering location and alarms now have better support for ephemeral nodes ([a658281](https://github.com/Supamiu/ffxiv-teamcraft/commit/a658281)), closes [#568](https://github.com/Supamiu/ffxiv-teamcraft/issues/568)
* **layout:** new option to see how many items you can craft on craftable rows ([c2727ae](https://github.com/Supamiu/ffxiv-teamcraft/commit/c2727ae))
* **permissions:** added default permission level setting in settings page ([b5eeecc](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5eeecc))
* **permissions:** added propagate permissions button inside workshop permissions popup ([a0c2eea](https://github.com/Supamiu/ffxiv-teamcraft/commit/a0c2eea))



<a name="5.0.11"></a>
## [5.0.11](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.10...v5.0.11) (2019-01-16)


### Bug Fixes

* **alarms:** alarms now show only the first 8 alarms to avoid spamming the UI ([0e4f21e](https://github.com/Supamiu/ffxiv-teamcraft/commit/0e4f21e))
* **gathering-location:** fixed an issue with some nodes being filtered while they shouldn't be ([2a6222b](https://github.com/Supamiu/ffxiv-teamcraft/commit/2a6222b)), closes [#706](https://github.com/Supamiu/ffxiv-teamcraft/issues/706)
* **layout:** fixed default layout filter for token trades panel ([1d213b3](https://github.com/Supamiu/ffxiv-teamcraft/commit/1d213b3))
* **layout:** layout export now takes the whole layout into account, not only panels ([e2863b3](https://github.com/Supamiu/ffxiv-teamcraft/commit/e2863b3))
* **layout:** voidrake and lavender aren't filtered in tokens panel in default layout anymore ([4479e64](https://github.com/Supamiu/ffxiv-teamcraft/commit/4479e64))


### Features

* **layout:** default sort (JOB) now sorts following ingame log ([69dd7b7](https://github.com/Supamiu/ffxiv-teamcraft/commit/69dd7b7)), closes [#621](https://github.com/Supamiu/ffxiv-teamcraft/issues/621)
* **lists:** community lists and list panels are now lazy loading ([d743bcb](https://github.com/Supamiu/ffxiv-teamcraft/commit/d743bcb))



<a name="5.0.10"></a>
## [5.0.10](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.9...v5.0.10) (2019-01-14)


### Bug Fixes

* fixed style for devtools button in desktop app ([11a2f27](https://github.com/Supamiu/ffxiv-teamcraft/commit/11a2f27))
* **simulator:** fixed a freeze happening in some cases with byregot's blessing ([7f116f8](https://github.com/Supamiu/ffxiv-teamcraft/commit/7f116f8))
* **workshop:** fixed an issue with workshop details when some of the lists were deleted ([8160f91](https://github.com/Supamiu/ffxiv-teamcraft/commit/8160f91))


### Features

* lists and rotations can now be opened using double click on name ([43993a3](https://github.com/Supamiu/ffxiv-teamcraft/commit/43993a3)), closes [#700](https://github.com/Supamiu/ffxiv-teamcraft/issues/700)
* **gathering-location:** added compact display toggle ([546dd60](https://github.com/Supamiu/ffxiv-teamcraft/commit/546dd60)), closes [#684](https://github.com/Supamiu/ffxiv-teamcraft/issues/684)
* **inventory:** items in inventory are now sorted by id ([c07ef3b](https://github.com/Supamiu/ffxiv-teamcraft/commit/c07ef3b))
* **layout:** recipe default order type is now JOB, followed by LEVEL ([4f2acb6](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f2acb6))
* **list:** show a check mark next to panel name if it's collapsed because it's done ([d1e25ba](https://github.com/Supamiu/ffxiv-teamcraft/commit/d1e25ba))



<a name="5.0.9"></a>
## [5.0.9](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.8...v5.0.9) (2019-01-13)


### Bug Fixes

* fixed a bug with some layouts freezing the app entirely ([5b0c7d1](https://github.com/Supamiu/ffxiv-teamcraft/commit/5b0c7d1))
* **list-panel:** fixed an issue with tags showing twice ([7ec391a](https://github.com/Supamiu/ffxiv-teamcraft/commit/7ec391a))
* fixed an issue with +/- input when item is done ([365fefe](https://github.com/Supamiu/ffxiv-teamcraft/commit/365fefe))
* fixed an issue with new profiles and the "show only what I can do" checkbox ([da98309](https://github.com/Supamiu/ffxiv-teamcraft/commit/da98309))


### Features

* **desktop:** added a button in settings to show devtools when using desktop app ([cf7f0df](https://github.com/Supamiu/ffxiv-teamcraft/commit/cf7f0df))
* **profile:** "Save for All" doesn't propagate specialist state anymore ([33f093f](https://github.com/Supamiu/ffxiv-teamcraft/commit/33f093f)), closes [#699](https://github.com/Supamiu/ffxiv-teamcraft/issues/699)



<a name="5.0.8"></a>
## [5.0.8](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.7...v5.0.8) (2019-01-13)


### Bug Fixes

* fixed an issue showing infinite loader when list isn't found ([1626962](https://github.com/Supamiu/ffxiv-teamcraft/commit/1626962))
* fixed an issue with lists reordering when you change item amounts ([ea29372](https://github.com/Supamiu/ffxiv-teamcraft/commit/ea29372))
* **alarms:** fixed colors for spawned and played state ([b321403](https://github.com/Supamiu/ffxiv-teamcraft/commit/b321403))



<a name="5.0.7"></a>
## [5.0.7](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.6...v5.0.7) (2019-01-12)


### Bug Fixes

* **alarms:** changed spawned and played colors for alarms ([43b6955](https://github.com/Supamiu/ffxiv-teamcraft/commit/43b6955)), closes [#697](https://github.com/Supamiu/ffxiv-teamcraft/issues/697)
* **simulator:** fixed link to the item details on the icon ([3af6491](https://github.com/Supamiu/ffxiv-teamcraft/commit/3af6491))


### Features

* **search:** "only recipes" check is now persisted inside the localstorage ([28fb058](https://github.com/Supamiu/ffxiv-teamcraft/commit/28fb058))



<a name="5.0.6"></a>
## [5.0.6](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.4...v5.0.6) (2019-01-11)


### Bug Fixes

* **pricing:** fixed an issue with first pricing opening showing wrong values ([8f0a885](https://github.com/Supamiu/ffxiv-teamcraft/commit/8f0a885))
* fixed an issue with wrong location name for fishes ([5e84abd](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e84abd))
* **pricing:** fixed an issue with incorrect pricing in some cases ([e088da3](https://github.com/Supamiu/ffxiv-teamcraft/commit/e088da3))


### Features

* added a share link copy button inside list details page ([877bc27](https://github.com/Supamiu/ffxiv-teamcraft/commit/877bc27))
* added Ize and Erwan as patreon supporters in the loading screen ([78c5585](https://github.com/Supamiu/ffxiv-teamcraft/commit/78c5585))



<a name="5.0.5"></a>
## [5.0.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.4...v5.0.5) (2019-01-10)


### Bug Fixes

* **pricing:** fixed an issue with first pricing opening showing wrong values ([8f0a885](https://github.com/Supamiu/ffxiv-teamcraft/commit/8f0a885))


### Features

* added Ize and Erwan as patreon supporters in the loading screen ([78c5585](https://github.com/Supamiu/ffxiv-teamcraft/commit/78c5585))



<a name="5.0.4"></a>
## [5.0.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.2...v5.0.4) (2019-01-09)


### Bug Fixes

* **desktop:** fixed random crash happening in desktop app ([8673861](https://github.com/Supamiu/ffxiv-teamcraft/commit/8673861))
* **favorites:** fixed favorites display sometimes not showing lists ([6986eec](https://github.com/Supamiu/ffxiv-teamcraft/commit/6986eec))
* **list-details:** airship prototype aren't acounted as masterbooks anymore ([4bd1e8d](https://github.com/Supamiu/ffxiv-teamcraft/commit/4bd1e8d))
* **pricing:** fixed an issue with vendor price not being used properly for precrafts ([84ea004](https://github.com/Supamiu/ffxiv-teamcraft/commit/84ea004))


### Features

* **workshop:** you can now add a list to a workshop using the menu directly ([46091dd](https://github.com/Supamiu/ffxiv-teamcraft/commit/46091dd))

<a name="5.0.3"></a>
## [5.0.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.2...v5.0.3) (2019-01-08)


### Bug Fixes

* **desktop:** added disclaimer about broken auto updater for desktop app ([b765870](https://github.com/Supamiu/ffxiv-teamcraft/commit/b765870))
* **list-picker:** fixed an issue with some broken lists breaking the list picker (again) ([a7ac4e1](https://github.com/Supamiu/ffxiv-teamcraft/commit/a7ac4e1))
* **user-picker:** server search is no longer case sensitive ([9dcadb0](https://github.com/Supamiu/ffxiv-teamcraft/commit/9dcadb0))



<a name="5.0.2"></a>
## [5.0.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.1...v5.0.2) (2019-01-08)


### Bug Fixes

* **list-picker:** fiwed an issue with some broken lists breaking the list picker ([7c233ee](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c233ee))



<a name="5.0.1"></a>
## [5.0.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.14...v5.0.1) (2019-01-08)


### Bug Fixes

* fixed an issue with lists creation and vendors extraction ([c5581fd](https://github.com/Supamiu/ffxiv-teamcraft/commit/c5581fd))
* fixed an issue with some ghost lists crashing the application ([1e52a2f](https://github.com/Supamiu/ffxiv-teamcraft/commit/1e52a2f))


### Features

* **list-details:** easy "hide completed rows" override inside list details view ([de4e70d](https://github.com/Supamiu/ffxiv-teamcraft/commit/de4e70d)), closes [#675](https://github.com/Supamiu/ffxiv-teamcraft/issues/675)
* added 4.5 patch support ([0835200](https://github.com/Supamiu/ffxiv-teamcraft/commit/0835200))



<a name="5.0.0"></a>
# [5.0.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.14...v5.0.0) (2019-01-08)


### Features

* **list-details:** easy "hide completed rows" override inside list details view ([de4e70d](https://github.com/Supamiu/ffxiv-teamcraft/commit/de4e70d)), closes [#675](https://github.com/Supamiu/ffxiv-teamcraft/issues/675)
* added 4.5 patch support ([0835200](https://github.com/Supamiu/ffxiv-teamcraft/commit/0835200))



<a name="5.0.0-rc.14"></a>
# [5.0.0-rc.14](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.13...v5.0.0-rc.14) (2019-01-06)


### Bug Fixes

* fixed an issue preventing users from adding an item to a list ([a342246](https://github.com/Supamiu/ffxiv-teamcraft/commit/a342246))



<a name="5.0.0-rc.13"></a>
# [5.0.0-rc.13](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.12...v5.0.0-rc.13) (2019-01-06)


### Bug Fixes

* added margin below note button in list details ([ee805b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/ee805b9))
* fixed a bug allowing you to add 0 items to a list, freezing progress ([533f18a](https://github.com/Supamiu/ffxiv-teamcraft/commit/533f18a))
* fixed a bug preventing comments badge display in the Items panel ([29494b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/29494b9))
* fixed an issue with calculator allowing you to input wrong values ([dc1948a](https://github.com/Supamiu/ffxiv-teamcraft/commit/dc1948a))
* fixed an issue with total price being wrong for gil trades ([234851c](https://github.com/Supamiu/ffxiv-teamcraft/commit/234851c))


### Features

* added information message inside layout dialog about default layout being readonly ([c364a96](https://github.com/Supamiu/ffxiv-teamcraft/commit/c364a96))
* **search:** added button to copy search url to your clipboard ([661988d](https://github.com/Supamiu/ffxiv-teamcraft/commit/661988d))
* **tooltips:** added item kind inside tooltips ([7ddc27f](https://github.com/Supamiu/ffxiv-teamcraft/commit/7ddc27f))



<a name="5.0.0-rc.12"></a>
# [5.0.0-rc.12](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.10...v5.0.0-rc.12) (2019-01-05)


### Bug Fixes

* **desktop:** fixed icon on linux builds, also changed format to deb ([df905dd](https://github.com/Supamiu/ffxiv-teamcraft/commit/df905dd))
* fixed a typo for scrips ([6a1eeec](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a1eeec))
* **desktop:** fixed linux build ([50144cf](https://github.com/Supamiu/ffxiv-teamcraft/commit/50144cf))
* **desktop:** implemented possible fix for auto updater ([c0d4ccd](https://github.com/Supamiu/ffxiv-teamcraft/commit/c0d4ccd))
* **layouts:** layout selection now persists on page reload ([eeec18c](https://github.com/Supamiu/ffxiv-teamcraft/commit/eeec18c))
* fixed an issue with new lists ordering ([5c92e92](https://github.com/Supamiu/ffxiv-teamcraft/commit/5c92e92))
* **simulator:** fixed a bug preventing you from removing consumables of a rotation ([656ef55](https://github.com/Supamiu/ffxiv-teamcraft/commit/656ef55))
* **simulator:** fixed an issue with rotation swapping ([2aa0c4b](https://github.com/Supamiu/ffxiv-teamcraft/commit/2aa0c4b))


### Features

* new "buy a Teamcraft T-shirt" button in search intro ([6291d2a](https://github.com/Supamiu/ffxiv-teamcraft/commit/6291d2a))
* **levequests:** added a link to gamerescape for more details on the leve ([3f659ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/3f659ab))
* **list-panel:** brought back the items counter in list panel header ([8db06af](https://github.com/Supamiu/ffxiv-teamcraft/commit/8db06af))



<a name="5.0.0-rc.11"></a>
# [5.0.0-rc.11](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.10...v5.0.0-rc.11) (2019-01-04)


### Bug Fixes

* **desktop:** fixed icon on linux builds, also changed format to deb ([df905dd](https://github.com/Supamiu/ffxiv-teamcraft/commit/df905dd))
* fixed a typo for scrips ([6a1eeec](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a1eeec))
* **desktop:** implemented possible fix for auto updater ([c0d4ccd](https://github.com/Supamiu/ffxiv-teamcraft/commit/c0d4ccd))
* **layouts:** layout selection now persists on page reload ([eeec18c](https://github.com/Supamiu/ffxiv-teamcraft/commit/eeec18c))


### Features

* **list-panel:** brought back the items counter in list panel header ([8db06af](https://github.com/Supamiu/ffxiv-teamcraft/commit/8db06af))
* new "buy a Teamcraft T-shirt" button in search intro ([6291d2a](https://github.com/Supamiu/ffxiv-teamcraft/commit/6291d2a))



<a name="5.0.0-rc.10"></a>
# [5.0.0-rc.10](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.9...v5.0.0-rc.10) (2019-01-03)


### Bug Fixes

* fixed an issue with amount modification in some specific cases ([beaebff](https://github.com/Supamiu/ffxiv-teamcraft/commit/beaebff))
* removed the quick "hide completed" switch because it needs more stuff ([3dc65d0](https://github.com/Supamiu/ffxiv-teamcraft/commit/3dc65d0)), closes [#675](https://github.com/Supamiu/ffxiv-teamcraft/issues/675)



<a name="5.0.0-rc.9"></a>
# [5.0.0-rc.9](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.8...v5.0.0-rc.9) (2019-01-03)


### Bug Fixes

* **rotations:** fixed an UX issue with rotation folders drag and drop ([c700b7c](https://github.com/Supamiu/ffxiv-teamcraft/commit/c700b7c))


### Features

* added a checkbox to hide or show completed items easily ([da3c583](https://github.com/Supamiu/ffxiv-teamcraft/commit/da3c583)), closes [#675](https://github.com/Supamiu/ffxiv-teamcraft/issues/675)
* **levequests:** applied better display for start => end of leves ([036bf8a](https://github.com/Supamiu/ffxiv-teamcraft/commit/036bf8a))
* list inventory display layout option ([698e8cc](https://github.com/Supamiu/ffxiv-teamcraft/commit/698e8cc))



<a name="5.0.0-rc.8"></a>
# [5.0.0-rc.8](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.7...v5.0.0-rc.8) (2019-01-02)


### Bug Fixes

* **alarms:** fixed a display error with alarm aetherytes ([c2977f5](https://github.com/Supamiu/ffxiv-teamcraft/commit/c2977f5))
* **community-lists:** hide the paginator if there's no results ([fe6530e](https://github.com/Supamiu/ffxiv-teamcraft/commit/fe6530e))
* **levequests:** fixed an issue with crafts amount inside some leves ([bd7420a](https://github.com/Supamiu/ffxiv-teamcraft/commit/bd7420a))
* **list:** fixed a bug with team assignation and community lists ([998d401](https://github.com/Supamiu/ffxiv-teamcraft/commit/998d401))


### Features

* **desktop:** added support for linux desktop build ([123a970](https://github.com/Supamiu/ffxiv-teamcraft/commit/123a970))
* **import:** added callback queryparam ([9fbb298](https://github.com/Supamiu/ffxiv-teamcraft/commit/9fbb298))
* **theme:** added red and purple themes ([f8ae9c7](https://github.com/Supamiu/ffxiv-teamcraft/commit/f8ae9c7))



<a name="5.0.0-rc.7"></a>
# [5.0.0-rc.7](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.4...v5.0.0-rc.7) (2019-01-01)


### Bug Fixes

* craft and gathering buttons always last for better display ([b8334cf](https://github.com/Supamiu/ffxiv-teamcraft/commit/b8334cf))
* **merge:** fixed a bad import causing merge popup to ([4899618](https://github.com/Supamiu/ffxiv-teamcraft/commit/4899618))
* fixed an issue with ephemeral lists deletion ([87e2f75](https://github.com/Supamiu/ffxiv-teamcraft/commit/87e2f75))
* fixed ordering in rotations and lists ([5d2fbd1](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d2fbd1))
* implemented a possible fix for merge popup, needs more testing ([189864c](https://github.com/Supamiu/ffxiv-teamcraft/commit/189864c))
* large lists details panels are now collapsed by default ([7fe04df](https://github.com/Supamiu/ffxiv-teamcraft/commit/7fe04df))
* only show warning icon if all of the available books are missing ([1e3bfd3](https://github.com/Supamiu/ffxiv-teamcraft/commit/1e3bfd3))


### Features

* **alarms:** you can now delete alarms inside the drawer and the overlay ([bc8cfaa](https://github.com/Supamiu/ffxiv-teamcraft/commit/bc8cfaa))
* **desktop:** added "install update" button for when update if found and downloaded ([b94ea4f](https://github.com/Supamiu/ffxiv-teamcraft/commit/b94ea4f))
* **levequests:** added exp computing system ([ba64948](https://github.com/Supamiu/ffxiv-teamcraft/commit/ba64948))
* **merge:** added a checkbox to delete lists after merging them ([3eb5ccf](https://github.com/Supamiu/ffxiv-teamcraft/commit/3eb5ccf))



<a name="5.0.0-rc.6"></a>
# [5.0.0-rc.6](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.4...v5.0.0-rc.6) (2019-01-01)


### Bug Fixes

* craft and gathering buttons always last for better display ([b8334cf](https://github.com/Supamiu/ffxiv-teamcraft/commit/b8334cf))
* fixed ordering in rotations and lists ([5d2fbd1](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d2fbd1))
* implemented a possible fix for merge popup, needs more testing ([189864c](https://github.com/Supamiu/ffxiv-teamcraft/commit/189864c))
* large lists details panels are now collapsed by default ([7fe04df](https://github.com/Supamiu/ffxiv-teamcraft/commit/7fe04df))
* only show warning icon if all of the available books are missing ([1e3bfd3](https://github.com/Supamiu/ffxiv-teamcraft/commit/1e3bfd3))


### Features

* **alarms:** you can now delete alarms inside the drawer and the overlay ([bc8cfaa](https://github.com/Supamiu/ffxiv-teamcraft/commit/bc8cfaa))
* **desktop:** added "install update" button for when update if found and downloaded ([b94ea4f](https://github.com/Supamiu/ffxiv-teamcraft/commit/b94ea4f))
* **levequests:** added exp computing system ([ba64948](https://github.com/Supamiu/ffxiv-teamcraft/commit/ba64948))



<a name="5.0.0-rc.5"></a>
# [5.0.0-rc.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.4...v5.0.0-rc.5) (2018-12-30)


### Bug Fixes

* fixed ordering in rotations and lists ([5d2fbd1](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d2fbd1))


### Features

* **desktop:** added "install update" button for when update if found and downloaded ([b94ea4f](https://github.com/Supamiu/ffxiv-teamcraft/commit/b94ea4f))
* **levequests:** added exp computing system ([ba64948](https://github.com/Supamiu/ffxiv-teamcraft/commit/ba64948))



<a name="5.0.0-rc.4"></a>
# [5.0.0-rc.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.3...v5.0.0-rc.4) (2018-12-29)


### Bug Fixes

* collectible additions should now carry over regeneration ([b10be93](https://github.com/Supamiu/ffxiv-teamcraft/commit/b10be93))
* fixed an issue with "ready to craft" status ([9a36cea](https://github.com/Supamiu/ffxiv-teamcraft/commit/9a36cea))
* fixed incorrect amount display inside requirements popup ([5775b90](https://github.com/Supamiu/ffxiv-teamcraft/commit/5775b90))
* **fishing:** fixed an issue with fishing map sometimes incorrect ([9a3c707](https://github.com/Supamiu/ffxiv-teamcraft/commit/9a3c707))
* **i18n:** fixed split string that shouldn't be splitted ([d61c8a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/d61c8a2))
* **i18n:** removed useless translation strings ([d02fee3](https://github.com/Supamiu/ffxiv-teamcraft/commit/d02fee3))
* **simulator:** fixed incorrect stacks amount with byregot's miracle ([001ca34](https://github.com/Supamiu/ffxiv-teamcraft/commit/001ca34))


### Features

* added label for calculator inside list rows ([d2b69d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/d2b69d8))
* **list-picker:** you can now search for a list, and they are now ordered properly ([cc05087](https://github.com/Supamiu/ffxiv-teamcraft/commit/cc05087))
* **marketboard:** added proper error message for when xivapi or companion is down ([3a73adc](https://github.com/Supamiu/ffxiv-teamcraft/commit/3a73adc))
* **profile:** you can now edit DoL levels inside profile editor ([68a30ad](https://github.com/Supamiu/ffxiv-teamcraft/commit/68a30ad))



<a name="5.0.0-rc.3"></a>
# [5.0.0-rc.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-rc.2...v5.0.0-rc.3) (2018-12-28)


### Bug Fixes

* fixed an issue with desktop app updater ([d4712b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/d4712b9))


### Features

* added new patreon supporter to loading screen: Modestie ([770337d](https://github.com/Supamiu/ffxiv-teamcraft/commit/770337d))
* show dot on dropdown trigger and comments menu if item has comment(s) ([1ec2cdd](https://github.com/Supamiu/ffxiv-teamcraft/commit/1ec2cdd))



<a name="5.0.0-rc.2"></a>
# [5.0.0-rc.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-beta.4...v5.0.0-rc.2) (2018-12-28)


### Bug Fixes

* added alert to explain teams permissions inside permission popup ([f782748](https://github.com/Supamiu/ffxiv-teamcraft/commit/f782748))
* fixed a performance issue with auth system ([b9aaad3](https://github.com/Supamiu/ffxiv-teamcraft/commit/b9aaad3))
* fixed an error popup sometimes poping in desktop app ([41eaddd](https://github.com/Supamiu/ffxiv-teamcraft/commit/41eaddd))
* fixed an issue with item amount modification in list panel ([f9dac9d](https://github.com/Supamiu/ffxiv-teamcraft/commit/f9dac9d))
* fixed an issue with login and character linking ([7c2e67d](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c2e67d))
* fixed character link popup lodestoneId input field ([8d9d31e](https://github.com/Supamiu/ffxiv-teamcraft/commit/8d9d31e))
* fixed color on error message alerts ([a605548](https://github.com/Supamiu/ffxiv-teamcraft/commit/a605548))
* reduced bundle size by setting icons loading to dynamic ([aff1ab6](https://github.com/Supamiu/ffxiv-teamcraft/commit/aff1ab6))
* renaming a rotation or changing its stats doesn't require save anymore ([b8878d7](https://github.com/Supamiu/ffxiv-teamcraft/commit/b8878d7))
* **i18n:** fixed a typo in english strings ([930a297](https://github.com/Supamiu/ffxiv-teamcraft/commit/930a297))
* **levequests:** fixed an issue with exp display in search results ([b9b3e46](https://github.com/Supamiu/ffxiv-teamcraft/commit/b9b3e46))
* **pricing:** dont replace price if not available inside mb ([17cc23e](https://github.com/Supamiu/ffxiv-teamcraft/commit/17cc23e))


### Features

* you can now assign a list to a team from the /lists page ([0d63eae](https://github.com/Supamiu/ffxiv-teamcraft/commit/0d63eae))
* **simulator:** added search capability to consumables select boxes ([502b967](https://github.com/Supamiu/ffxiv-teamcraft/commit/502b967))
* **teams:** you can now configure team webhook to send only a given type of message ([77e6bb7](https://github.com/Supamiu/ffxiv-teamcraft/commit/77e6bb7))



<a name="5.0.0-rc.1"></a>
# 5.0.0-rc.1 (2018-12-27)


### Bug Fixes

* fixed a bug with list deletion and ordering ([b4ba6ef](https://github.com/Supamiu/ffxiv-teamcraft/commit/b4ba6ef))
* fixed an issue with list regeneration being way too slow ([09f2ecf](https://github.com/Supamiu/ffxiv-teamcraft/commit/09f2ecf))
* fixed an issue with requirements popup not linking to garlandtools properly ([6785939](https://github.com/Supamiu/ffxiv-teamcraft/commit/6785939))
* fixed an issue with teams loading, preventing discord hook connection ([da7f37d](https://github.com/Supamiu/ffxiv-teamcraft/commit/da7f37d)), closes [#664](https://github.com/Supamiu/ffxiv-teamcraft/issues/664)
* fixed community lists page ([2785c80](https://github.com/Supamiu/ffxiv-teamcraft/commit/2785c80))
* fixed sidebar behavior on mobile devices ([c06d065](https://github.com/Supamiu/ffxiv-teamcraft/commit/c06d065))


### Features

* new nav buttons for the desktop app ([47096e5](https://github.com/Supamiu/ffxiv-teamcraft/commit/47096e5))



<a name="5.0.0-rc.0"></a>
# 5.0.0-rc.0 (2018-12-26)


### Bug Fixes

* deleting a list from completion dialog now navigates back to the lists page ([154b0a7](https://github.com/Supamiu/ffxiv-teamcraft/commit/154b0a7))
* fixed a bug with permissions popup deleting ephemeral lists ([7a9dc5d](https://github.com/Supamiu/ffxiv-teamcraft/commit/7a9dc5d))
* fixed an issue freezing the simulator in some cases ([19feab5](https://github.com/Supamiu/ffxiv-teamcraft/commit/19feab5))
* fixed an issue with ariyala sets import for DoH/DoL ([68e7894](https://github.com/Supamiu/ffxiv-teamcraft/commit/68e7894))
* fixed an issue with first time login and character association ([05e46b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/05e46b9))
* fixed an issue with list display in anonymous mode ([560f9a8](https://github.com/Supamiu/ffxiv-teamcraft/commit/560f9a8))
* fixed an issue with list item amount update moving the panel ([0a473e0](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a473e0))
* fixed an issue with macro translator and /aaction clear ([a950324](https://github.com/Supamiu/ffxiv-teamcraft/commit/a950324))
* fixed an issue with maps loading inside alarms page ([fd0fe77](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd0fe77))
* fixed an issue with patreon login showing an error message ([afb7bd1](https://github.com/Supamiu/ffxiv-teamcraft/commit/afb7bd1))
* fixed change detector inside list rows ([10e5566](https://github.com/Supamiu/ffxiv-teamcraft/commit/10e5566))
* fixed icon color inside layout editor ([859a088](https://github.com/Supamiu/ffxiv-teamcraft/commit/859a088))
* fixed item links inside gathering-locations component ([7deec17](https://github.com/Supamiu/ffxiv-teamcraft/commit/7deec17))
* fixed main layout side on mobile ([8c5ae28](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c5ae28))
* fixed missing icon issue with some gathering cards ([f434bcd](https://github.com/Supamiu/ffxiv-teamcraft/commit/f434bcd))
* fixed name display in levequests page ([e5bd8a6](https://github.com/Supamiu/ffxiv-teamcraft/commit/e5bd8a6))
* fixes for aot build (more perfs) ([9bc1a55](https://github.com/Supamiu/ffxiv-teamcraft/commit/9bc1a55))
* pricing mode MB integration doesn't override vendor prices anymore ([b8b7ec0](https://github.com/Supamiu/ffxiv-teamcraft/commit/b8b7ec0))
* removed useless margin under the notification box ([eb07a25](https://github.com/Supamiu/ffxiv-teamcraft/commit/eb07a25))
* you can now properly set level filters to 70-70 ([8277235](https://github.com/Supamiu/ffxiv-teamcraft/commit/8277235))


### Features

* adaptative filter for list details ([e4a54e1](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4a54e1))
* added a reset password button inside the login box ([dcece3d](https://github.com/Supamiu/ffxiv-teamcraft/commit/dcece3d))
* added autofocus on search fields ([8342222](https://github.com/Supamiu/ffxiv-teamcraft/commit/8342222))
* better handling of network issues when loading user ([f195f66](https://github.com/Supamiu/ffxiv-teamcraft/commit/f195f66))
* change pricing result color based on benefits amount ([ac01161](https://github.com/Supamiu/ffxiv-teamcraft/commit/ac01161))
* copy button for earning category in pricing ([a7abccf](https://github.com/Supamiu/ffxiv-teamcraft/commit/a7abccf)), closes [#545](https://github.com/Supamiu/ffxiv-teamcraft/issues/545)
* deep linking for mogboard inside marketboard popup ([dbcf9ef](https://github.com/Supamiu/ffxiv-teamcraft/commit/dbcf9ef))
* generated ingame alarm macros now repeat properly ([5e3b945](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e3b945))
* new loader that spawns upon navigation for better UX ([872587e](https://github.com/Supamiu/ffxiv-teamcraft/commit/872587e))
* now showing a warning if results.length >= 50 in search page ([ff9942b](https://github.com/Supamiu/ffxiv-teamcraft/commit/ff9942b))
* pressing enter inside amount input in list details now applies the amount properly ([969dc94](https://github.com/Supamiu/ffxiv-teamcraft/commit/969dc94))
* reduced amount of iterations for the reliability report to 200 ([7c9664e](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c9664e))
* **simulator:** macros can now split on latest possible Reclaim point. ([e6c5678](https://github.com/Supamiu/ffxiv-teamcraft/commit/e6c5678))
* **simulator:** removed an entirely-deliberate console.log statement. ([b5985ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5985ac))



<a name="5.0.0-rc.1"></a>
# [5.0.0-rc.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-beta.4...v5.0.0-rc.1) (2018-12-27)


### Bug Fixes

* fixed a bug with list deletion and ordering ([b4ba6ef](https://github.com/Supamiu/ffxiv-teamcraft/commit/b4ba6ef))
* fixed an issue with list regeneration being way too slow ([09f2ecf](https://github.com/Supamiu/ffxiv-teamcraft/commit/09f2ecf))
* fixed an issue with requirements popup not linking to garlandtools properly ([6785939](https://github.com/Supamiu/ffxiv-teamcraft/commit/6785939))
* fixed an issue with teams loading, preventing discord hook connection ([da7f37d](https://github.com/Supamiu/ffxiv-teamcraft/commit/da7f37d)), closes [#664](https://github.com/Supamiu/ffxiv-teamcraft/issues/664)
* fixed community lists page ([2785c80](https://github.com/Supamiu/ffxiv-teamcraft/commit/2785c80))
* fixed sidebar behavior on mobile devices ([c06d065](https://github.com/Supamiu/ffxiv-teamcraft/commit/c06d065))


### Features

* new nav buttons for the desktop app ([47096e5](https://github.com/Supamiu/ffxiv-teamcraft/commit/47096e5))



<a name="5.0.0-rc.0"></a>
# 5.0.0-rc.0 (2018-12-26)


### Bug Fixes

* deleting a list from completion dialog now navigates back to the lists page ([154b0a7](https://github.com/Supamiu/ffxiv-teamcraft/commit/154b0a7))
* fixed a bug with permissions popup deleting ephemeral lists ([7a9dc5d](https://github.com/Supamiu/ffxiv-teamcraft/commit/7a9dc5d))
* fixed an issue freezing the simulator in some cases ([19feab5](https://github.com/Supamiu/ffxiv-teamcraft/commit/19feab5))
* fixed an issue with ariyala sets import for DoH/DoL ([68e7894](https://github.com/Supamiu/ffxiv-teamcraft/commit/68e7894))
* fixed an issue with first time login and character association ([05e46b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/05e46b9))
* fixed an issue with list display in anonymous mode ([560f9a8](https://github.com/Supamiu/ffxiv-teamcraft/commit/560f9a8))
* fixed an issue with list item amount update moving the panel ([0a473e0](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a473e0))
* fixed an issue with macro translator and /aaction clear ([a950324](https://github.com/Supamiu/ffxiv-teamcraft/commit/a950324))
* fixed an issue with maps loading inside alarms page ([fd0fe77](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd0fe77))
* fixed an issue with patreon login showing an error message ([afb7bd1](https://github.com/Supamiu/ffxiv-teamcraft/commit/afb7bd1))
* fixed change detector inside list rows ([10e5566](https://github.com/Supamiu/ffxiv-teamcraft/commit/10e5566))
* fixed icon color inside layout editor ([859a088](https://github.com/Supamiu/ffxiv-teamcraft/commit/859a088))
* fixed item links inside gathering-locations component ([7deec17](https://github.com/Supamiu/ffxiv-teamcraft/commit/7deec17))
* fixed main layout side on mobile ([8c5ae28](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c5ae28))
* fixed missing icon issue with some gathering cards ([f434bcd](https://github.com/Supamiu/ffxiv-teamcraft/commit/f434bcd))
* fixed name display in levequests page ([e5bd8a6](https://github.com/Supamiu/ffxiv-teamcraft/commit/e5bd8a6))
* fixes for aot build (more perfs) ([9bc1a55](https://github.com/Supamiu/ffxiv-teamcraft/commit/9bc1a55))
* pricing mode MB integration doesn't override vendor prices anymore ([b8b7ec0](https://github.com/Supamiu/ffxiv-teamcraft/commit/b8b7ec0))
* removed useless margin under the notification box ([eb07a25](https://github.com/Supamiu/ffxiv-teamcraft/commit/eb07a25))
* you can now properly set level filters to 70-70 ([8277235](https://github.com/Supamiu/ffxiv-teamcraft/commit/8277235))


### Features

* adaptative filter for list details ([e4a54e1](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4a54e1))
* added a reset password button inside the login box ([dcece3d](https://github.com/Supamiu/ffxiv-teamcraft/commit/dcece3d))
* added autofocus on search fields ([8342222](https://github.com/Supamiu/ffxiv-teamcraft/commit/8342222))
* better handling of network issues when loading user ([f195f66](https://github.com/Supamiu/ffxiv-teamcraft/commit/f195f66))
* change pricing result color based on benefits amount ([ac01161](https://github.com/Supamiu/ffxiv-teamcraft/commit/ac01161))
* copy button for earning category in pricing ([a7abccf](https://github.com/Supamiu/ffxiv-teamcraft/commit/a7abccf)), closes [#545](https://github.com/Supamiu/ffxiv-teamcraft/issues/545)
* deep linking for mogboard inside marketboard popup ([dbcf9ef](https://github.com/Supamiu/ffxiv-teamcraft/commit/dbcf9ef))
* generated ingame alarm macros now repeat properly ([5e3b945](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e3b945))
* new loader that spawns upon navigation for better UX ([872587e](https://github.com/Supamiu/ffxiv-teamcraft/commit/872587e))
* now showing a warning if results.length >= 50 in search page ([ff9942b](https://github.com/Supamiu/ffxiv-teamcraft/commit/ff9942b))
* pressing enter inside amount input in list details now applies the amount properly ([969dc94](https://github.com/Supamiu/ffxiv-teamcraft/commit/969dc94))
* reduced amount of iterations for the reliability report to 200 ([7c9664e](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c9664e))
* **simulator:** macros can now split on latest possible Reclaim point. ([e6c5678](https://github.com/Supamiu/ffxiv-teamcraft/commit/e6c5678))
* **simulator:** removed an entirely-deliberate console.log statement. ([b5985ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5985ac))



<a name="5.0.0-rc.0"></a>
# [5.0.0-rc.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v5.0.0-beta.4...v5.0.0-rc.0) (2018-12-26)


### Bug Fixes

* deleting a list from completion dialog now navigates back to the lists page ([154b0a7](https://github.com/Supamiu/ffxiv-teamcraft/commit/154b0a7))
* fixed a bug with permissions popup deleting ephemeral lists ([7a9dc5d](https://github.com/Supamiu/ffxiv-teamcraft/commit/7a9dc5d))
* fixed an issue freezing the simulator in some cases ([19feab5](https://github.com/Supamiu/ffxiv-teamcraft/commit/19feab5))
* fixed an issue with ariyala sets import for DoH/DoL ([68e7894](https://github.com/Supamiu/ffxiv-teamcraft/commit/68e7894))
* fixed an issue with first time login and character association ([05e46b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/05e46b9))
* fixed an issue with list display in anonymous mode ([560f9a8](https://github.com/Supamiu/ffxiv-teamcraft/commit/560f9a8))
* fixed an issue with list item amount update moving the panel ([0a473e0](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a473e0))
* fixed an issue with macro translator and /aaction clear ([a950324](https://github.com/Supamiu/ffxiv-teamcraft/commit/a950324))
* fixed an issue with maps loading inside alarms page ([fd0fe77](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd0fe77))
* fixed an issue with patreon login showing an error message ([afb7bd1](https://github.com/Supamiu/ffxiv-teamcraft/commit/afb7bd1))
* fixed change detector inside list rows ([10e5566](https://github.com/Supamiu/ffxiv-teamcraft/commit/10e5566))
* fixed icon color inside layout editor ([859a088](https://github.com/Supamiu/ffxiv-teamcraft/commit/859a088))
* fixed item links inside gathering-locations component ([7deec17](https://github.com/Supamiu/ffxiv-teamcraft/commit/7deec17))
* fixed main layout side on mobile ([8c5ae28](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c5ae28))
* fixed missing icon issue with some gathering cards ([f434bcd](https://github.com/Supamiu/ffxiv-teamcraft/commit/f434bcd))
* fixed name display in levequests page ([e5bd8a6](https://github.com/Supamiu/ffxiv-teamcraft/commit/e5bd8a6))
* fixes for aot build (more perfs) ([9bc1a55](https://github.com/Supamiu/ffxiv-teamcraft/commit/9bc1a55))
* pricing mode MB integration doesn't override vendor prices anymore ([b8b7ec0](https://github.com/Supamiu/ffxiv-teamcraft/commit/b8b7ec0))
* removed useless margin under the notification box ([eb07a25](https://github.com/Supamiu/ffxiv-teamcraft/commit/eb07a25))
* you can now properly set level filters to 70-70 ([8277235](https://github.com/Supamiu/ffxiv-teamcraft/commit/8277235))


### Features

* adaptative filter for list details ([e4a54e1](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4a54e1))
* added a reset password button inside the login box ([dcece3d](https://github.com/Supamiu/ffxiv-teamcraft/commit/dcece3d))
* added autofocus on search fields ([8342222](https://github.com/Supamiu/ffxiv-teamcraft/commit/8342222))
* better handling of network issues when loading user ([f195f66](https://github.com/Supamiu/ffxiv-teamcraft/commit/f195f66))
* change pricing result color based on benefits amount ([ac01161](https://github.com/Supamiu/ffxiv-teamcraft/commit/ac01161))
* copy button for earning category in pricing ([a7abccf](https://github.com/Supamiu/ffxiv-teamcraft/commit/a7abccf)), closes [#545](https://github.com/Supamiu/ffxiv-teamcraft/issues/545)
* deep linking for mogboard inside marketboard popup ([dbcf9ef](https://github.com/Supamiu/ffxiv-teamcraft/commit/dbcf9ef))
* generated ingame alarm macros now repeat properly ([5e3b945](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e3b945))
* new loader that spawns upon navigation for better UX ([872587e](https://github.com/Supamiu/ffxiv-teamcraft/commit/872587e))
* now showing a warning if results.length >= 50 in search page ([ff9942b](https://github.com/Supamiu/ffxiv-teamcraft/commit/ff9942b))
* pressing enter inside amount input in list details now applies the amount properly ([969dc94](https://github.com/Supamiu/ffxiv-teamcraft/commit/969dc94))
* reduced amount of iterations for the reliability report to 200 ([7c9664e](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c9664e))
* **simulator:** macros can now split on latest possible Reclaim point. ([e6c5678](https://github.com/Supamiu/ffxiv-teamcraft/commit/e6c5678))
* **simulator:** removed an entirely-deliberate console.log statement. ([b5985ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5985ac))



<a name="5.0.0-beta.4"></a>
# [5.0.0-beta.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.9...v5.0.0-beta.4) (2018-12-17)


### Bug Fixes

* "copy to clipboard" now properly copies the crystals too ([545b751](https://github.com/Supamiu/ffxiv-teamcraft/commit/545b751))
* added progression popup for list clone operation ([ffc6762](https://github.com/Supamiu/ffxiv-teamcraft/commit/ffc6762))
* alarm cards are no longer waiting for map to show text ([166e48a](https://github.com/Supamiu/ffxiv-teamcraft/commit/166e48a))
* changed order of buttons inside rotation panel ([f8d5eb8](https://github.com/Supamiu/ffxiv-teamcraft/commit/f8d5eb8))
* don't try to show icon if recipe is a workshop recipe (shows ADV) ([96ad2eb](https://github.com/Supamiu/ffxiv-teamcraft/commit/96ad2eb))
* fish informations are now loaded using https ([24ff989](https://github.com/Supamiu/ffxiv-teamcraft/commit/24ff989))
* fixed a display issue with simulator's quality bar ([ecf7d71](https://github.com/Supamiu/ffxiv-teamcraft/commit/ecf7d71))
* fixed aetheryte name not showing in alarms page ([b674f69](https://github.com/Supamiu/ffxiv-teamcraft/commit/b674f69))
* fixed an issue deleting ephemeral lists in some cases ([ed6bd39](https://github.com/Supamiu/ffxiv-teamcraft/commit/ed6bd39))
* fixed an issue displaying your badges on other's public profile ([e5215f8](https://github.com/Supamiu/ffxiv-teamcraft/commit/e5215f8))
* fixed an issue wih closest aetheryte on fishing informations ([6d2f47a](https://github.com/Supamiu/ffxiv-teamcraft/commit/6d2f47a))
* fixed an issue with buttons shrinking in search results ([fb42df3](https://github.com/Supamiu/ffxiv-teamcraft/commit/fb42df3))
* fixed an issue with free company id being null by default now ([be7d187](https://github.com/Supamiu/ffxiv-teamcraft/commit/be7d187))
* fixed an issue with gathering location search ([c9f1b30](https://github.com/Supamiu/ffxiv-teamcraft/commit/c9f1b30))
* fixed an issue with layout not saving properly ([4b359af](https://github.com/Supamiu/ffxiv-teamcraft/commit/4b359af))
* fixed an issue with layout ordering not properly handled ([907a849](https://github.com/Supamiu/ffxiv-teamcraft/commit/907a849))
* fixed an issue with list regeneration ([ca56677](https://github.com/Supamiu/ffxiv-teamcraft/commit/ca56677))
* fixed an issue with patreon status auth ([9f6054e](https://github.com/Supamiu/ffxiv-teamcraft/commit/9f6054e))
* fixed an issue with some layout filters ([c5ac852](https://github.com/Supamiu/ffxiv-teamcraft/commit/c5ac852))
* fixed an issue with the new theming system ([57ba493](https://github.com/Supamiu/ffxiv-teamcraft/commit/57ba493))
* fixed map id for fishing informations ([386e64d](https://github.com/Supamiu/ffxiv-teamcraft/commit/386e64d))
* fixed min width on alarm cards ([6fae7a4](https://github.com/Supamiu/ffxiv-teamcraft/commit/6fae7a4))
* fixed patreon oauth on desktop app ([b1033aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/b1033aa))
* hide contacts inside user picker when you are adding a contact ([44f3dbf](https://github.com/Supamiu/ffxiv-teamcraft/commit/44f3dbf))


### Features

* added a button to copy a whole list as text for chats integration ([fa4986e](https://github.com/Supamiu/ffxiv-teamcraft/commit/fa4986e)), closes [#654](https://github.com/Supamiu/ffxiv-teamcraft/issues/654)
* added a flag on custom alarms for items that spawn twice a day ([30f952f](https://github.com/Supamiu/ffxiv-teamcraft/commit/30f952f))
* added crafter icon in search results ([0092adb](https://github.com/Supamiu/ffxiv-teamcraft/commit/0092adb))
* added level labels next to gathering and crafting icons ([1a7c7c3](https://github.com/Supamiu/ffxiv-teamcraft/commit/1a7c7c3))
* added node type icon inside alarms overlay ([2f961fc](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f961fc))
* added the import endpoint for external websites ([e5844cf](https://github.com/Supamiu/ffxiv-teamcraft/commit/e5844cf))
* clicking on the check icon when item is done now resets its progression ([b98ae1c](https://github.com/Supamiu/ffxiv-teamcraft/commit/b98ae1c))
* collectable threshold inside simulator ([4173f79](https://github.com/Supamiu/ffxiv-teamcraft/commit/4173f79)), closes [#654](https://github.com/Supamiu/ffxiv-teamcraft/issues/654)
* custom links and templates are now properly implemented with their respective page ([d93af7c](https://github.com/Supamiu/ffxiv-teamcraft/commit/d93af7c))
* custom links and templates management page ([94e1e2f](https://github.com/Supamiu/ffxiv-teamcraft/commit/94e1e2f))
* item icons now link to garlandtools ([21e2389](https://github.com/Supamiu/ffxiv-teamcraft/commit/21e2389)), closes [#654](https://github.com/Supamiu/ffxiv-teamcraft/issues/654)
* list import from ariyala and CaaS ([1be042a](https://github.com/Supamiu/ffxiv-teamcraft/commit/1be042a))
* new reset password and patreon connection buttons in settings ([c6f2133](https://github.com/Supamiu/ffxiv-teamcraft/commit/c6f2133))
* popup on list completion now shows properly ([ec4cc5c](https://github.com/Supamiu/ffxiv-teamcraft/commit/ec4cc5c))
* proper sign configuration for desktop app ([a6b2e7c](https://github.com/Supamiu/ffxiv-teamcraft/commit/a6b2e7c))
* rotation folders ordering using drag and drop ([9d48c52](https://github.com/Supamiu/ffxiv-teamcraft/commit/9d48c52))
* support for fishing informations inside lists and alarms ([22e26b4](https://github.com/Supamiu/ffxiv-teamcraft/commit/22e26b4))
* support for fishing nodes in gathering-location component ([0f27ae3](https://github.com/Supamiu/ffxiv-teamcraft/commit/0f27ae3))
* support for item tooltips ([9f16dbb](https://github.com/Supamiu/ffxiv-teamcraft/commit/9f16dbb)), closes [#654](https://github.com/Supamiu/ffxiv-teamcraft/issues/654)
* theming system is now properly connected in settings ([00f3f78](https://github.com/Supamiu/ffxiv-teamcraft/commit/00f3f78))
* update icon for desktop version ([f02264d](https://github.com/Supamiu/ffxiv-teamcraft/commit/f02264d))
* updated folklores for fishing ([e2dd45b](https://github.com/Supamiu/ffxiv-teamcraft/commit/e2dd45b))
* you can now autofill prices in pricing mode for a full panel ([1797845](https://github.com/Supamiu/ffxiv-teamcraft/commit/1797845))
* you can now create custom links on lists, workshops, rotations and rotation folders ([a636b37](https://github.com/Supamiu/ffxiv-teamcraft/commit/a636b37))



<a name="5.0.0-beta.3"></a>
# 5.0.0-beta.3 (2018-12-06)


### Bug Fixes

* "create new list" button is now on top of the drawer ([00f8c25](https://github.com/Supamiu/ffxiv-teamcraft/commit/00f8c25))
* disabled list import button as it's delayed for now ([8584df1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8584df1))
* fixed a stupid template typo I made ([aa22e4f](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa22e4f))
* fixed an issue with desktop app boot ([846c04d](https://github.com/Supamiu/ffxiv-teamcraft/commit/846c04d))
* fixed an issue with hunting details popup positions ([93f4ae7](https://github.com/Supamiu/ffxiv-teamcraft/commit/93f4ae7))
* fixed an issue with list deletion ([b6397fd](https://github.com/Supamiu/ffxiv-teamcraft/commit/b6397fd))
* fixed an issue with list deletion ([a2390d4](https://github.com/Supamiu/ffxiv-teamcraft/commit/a2390d4))
* fixed an issue with list layout not hiding completed recipes properly when enabled ([3b5d5d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/3b5d5d6))
* fixed an issue with lists search ([1f68e3b](https://github.com/Supamiu/ffxiv-teamcraft/commit/1f68e3b))
* fixed an issue with profile verification and parsing ([be4c3a5](https://github.com/Supamiu/ffxiv-teamcraft/commit/be4c3a5))
* fixed an issue with rotation folders not being deletable ([d6f4a37](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6f4a37))
* fixed an issue with some lists not showing properly ([6972255](https://github.com/Supamiu/ffxiv-teamcraft/commit/6972255))
* fixed an issue with the completed rows filter in layout system ([76d607b](https://github.com/Supamiu/ffxiv-teamcraft/commit/76d607b))
* fixed dev electron startup ([6b70daf](https://github.com/Supamiu/ffxiv-teamcraft/commit/6b70daf))
* you can now export a rotation to macro even if it's not saved ([7307926](https://github.com/Supamiu/ffxiv-teamcraft/commit/7307926))


### Features

* alarms overlay for desktop app ([c8aebd4](https://github.com/Supamiu/ffxiv-teamcraft/commit/c8aebd4))
* better implementation for custom protocol ([fd25ffe](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd25ffe))
* desktop app is ready with secure oauth ! ([69b5316](https://github.com/Supamiu/ffxiv-teamcraft/commit/69b5316))
* larger scrollbars and navigation stae persistance for desktop app ([53695ee](https://github.com/Supamiu/ffxiv-teamcraft/commit/53695ee)), closes [#602](https://github.com/Supamiu/ffxiv-teamcraft/issues/602)
* proper support for custom protocol ([b09bda8](https://github.com/Supamiu/ffxiv-teamcraft/commit/b09bda8))
* support for korean in macro import inside simulator ([6ffa6e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/6ffa6e4))
* vendor map name is now shown inside vendors panel ([ebca986](https://github.com/Supamiu/ffxiv-teamcraft/commit/ebca986))
* you can now create and share rotation fodlers ([12fb7a6](https://github.com/Supamiu/ffxiv-teamcraft/commit/12fb7a6))



<a name="5.0.0-beta.2"></a>
# 5.0.0-beta.2 (2018-12-02)


### Bug Fixes

* "create all alarms" no longer creates cluster alarms ([fd3a4de](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd3a4de))


### Features

* custom alarms support ([3dd8c97](https://github.com/Supamiu/ffxiv-teamcraft/commit/3dd8c97)), closes [#587](https://github.com/Supamiu/ffxiv-teamcraft/issues/587)



<a name="5.0.0-beta.1"></a>
# 5.0.0-beta.1 (2018-12-02)


### Bug Fixes

* added a "not found" message for rotations not found ([f7a164a](https://github.com/Supamiu/ffxiv-teamcraft/commit/f7a164a))
* added a guard for list update sometimes breaking the list in compact mode ([34e9538](https://github.com/Supamiu/ffxiv-teamcraft/commit/34e9538))
* alarms in sidebar no longer ordered by group ([51cb94d](https://github.com/Supamiu/ffxiv-teamcraft/commit/51cb94d))
* anonymous commissions ([2a37246](https://github.com/Supamiu/ffxiv-teamcraft/commit/2a37246)), closes [#533](https://github.com/Supamiu/ffxiv-teamcraft/issues/533)
* beta is now properly connected to the beta database ([ec7f070](https://github.com/Supamiu/ffxiv-teamcraft/commit/ec7f070))
* better handling of multiple lists deletion in a short time ([342fbb0](https://github.com/Supamiu/ffxiv-teamcraft/commit/342fbb0))
* better loading management for lists page ([2f47121](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f47121))
* better messages for teams tracking hook system ([a7016b3](https://github.com/Supamiu/ffxiv-teamcraft/commit/a7016b3))
* better support for characters not added yet in xivapi ([a60e7f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/a60e7f1))
* changing alarm group mute state wont collapse panel anymore ([983e3bd](https://github.com/Supamiu/ffxiv-teamcraft/commit/983e3bd))
* custom recipe params now applied as they are changed ([10df578](https://github.com/Supamiu/ffxiv-teamcraft/commit/10df578))
* display message on user not found in user picker ([86e3d1e](https://github.com/Supamiu/ffxiv-teamcraft/commit/86e3d1e))
* fix for alarms spawn state not being handled properly ([fcf6fd0](https://github.com/Supamiu/ffxiv-teamcraft/commit/fcf6fd0))
* fix for drag and drop issues inside simulator ([2efc0ec](https://github.com/Supamiu/ffxiv-teamcraft/commit/2efc0ec))
* fixed a bug showing a warning inside macro popup while it shouldn't ([4747299](https://github.com/Supamiu/ffxiv-teamcraft/commit/4747299))
* fixed a bug where "select all" button would stay selected but not link to any list ([4b5ba19](https://github.com/Supamiu/ffxiv-teamcraft/commit/4b5ba19))
* fixed a bug with consumables being applied twice in some cases ([e9ef0da](https://github.com/Supamiu/ffxiv-teamcraft/commit/e9ef0da))
* fixed a bug with simulator and ingenuity in lower level crafts ([9c817f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c817f0))
* fixed a double notification issue for team member assignment ([90d6e20](https://github.com/Supamiu/ffxiv-teamcraft/commit/90d6e20))
* fixed a missing translation in alarms creation ([f9a44d0](https://github.com/Supamiu/ffxiv-teamcraft/commit/f9a44d0))
* fixed a priority issue on pricing system ([7da5c31](https://github.com/Supamiu/ffxiv-teamcraft/commit/7da5c31))
* fixed a small issue with alarms page ([9cb6992](https://github.com/Supamiu/ffxiv-teamcraft/commit/9cb6992))
* fixed a wrong translation key for hook messages ([0695f1a](https://github.com/Supamiu/ffxiv-teamcraft/commit/0695f1a))
* fixed an error in console inside teams page ([96eeb99](https://github.com/Supamiu/ffxiv-teamcraft/commit/96eeb99))
* fixed an error poping inside lists page for deleted lists in workshops ([4dbf100](https://github.com/Supamiu/ffxiv-teamcraft/commit/4dbf100))
* fixed an issue hiding the sidebar on mobile ([f0473e0](https://github.com/Supamiu/ffxiv-teamcraft/commit/f0473e0))
* fixed an issue making min stats popup freeze tab ([983e3a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/983e3a2))
* fixed an issue making prices a bit off in pricing mode ([08b698b](https://github.com/Supamiu/ffxiv-teamcraft/commit/08b698b))
* fixed an issue making register on google button show an unrelated error ([9fcd167](https://github.com/Supamiu/ffxiv-teamcraft/commit/9fcd167))
* fixed an issue preventing alarms from ringing ([f46d715](https://github.com/Supamiu/ffxiv-teamcraft/commit/f46d715))
* fixed an issue preventing anonymous user from using cross-class skills in simulator ([7708ecb](https://github.com/Supamiu/ffxiv-teamcraft/commit/7708ecb))
* fixed an issue preventing anonymous users to load a list ([e6834bd](https://github.com/Supamiu/ffxiv-teamcraft/commit/e6834bd))
* fixed an issue preventing gathering location page to create alarms ([69ac345](https://github.com/Supamiu/ffxiv-teamcraft/commit/69ac345)), closes [#478](https://github.com/Supamiu/ffxiv-teamcraft/issues/478)
* fixed an issue preventing korean users to register properly ([d361b78](https://github.com/Supamiu/ffxiv-teamcraft/commit/d361b78))
* fixed an issue preventing user update save in db ([700c3ea](https://github.com/Supamiu/ffxiv-teamcraft/commit/700c3ea))
* fixed an issue preventing users from saving their books in some conditions ([e4b7311](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4b7311))
* fixed an issue that was applying rating to both users ([fab53c3](https://github.com/Supamiu/ffxiv-teamcraft/commit/fab53c3))
* fixed an issue with airship crafts not added properly ([f5c604e](https://github.com/Supamiu/ffxiv-teamcraft/commit/f5c604e))
* fixed an issue with alarms not being deleted properly ([1b9a84d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b9a84d))
* fixed an issue with alarms not having proper map id ([7c9c44a](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c9c44a))
* fixed an issue with alarms not ringing properly ([a2780f8](https://github.com/Supamiu/ffxiv-teamcraft/commit/a2780f8))
* fixed an issue with amount modification breaking lists ([7c73073](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c73073))
* fixed an issue with books not being saved in profile page ([449a353](https://github.com/Supamiu/ffxiv-teamcraft/commit/449a353))
* fixed an issue with change detection inside pricing mode ([0a9a690](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a9a690))
* fixed an issue with favorite rotations not showing properly ([e434dd1](https://github.com/Supamiu/ffxiv-teamcraft/commit/e434dd1))
* fixed an issue with first login creating an infinite loading for character informations ([8d704f4](https://github.com/Supamiu/ffxiv-teamcraft/commit/8d704f4))
* fixed an issue with freshly created accounts ([258ece9](https://github.com/Supamiu/ffxiv-teamcraft/commit/258ece9))
* fixed an issue with HQ icon on new xivapi market data structure ([23f2281](https://github.com/Supamiu/ffxiv-teamcraft/commit/23f2281))
* fixed an issue with item addition in lists ([6086d87](https://github.com/Supamiu/ffxiv-teamcraft/commit/6086d87))
* fixed an issue with korean accounts stats popup in profile ([7b754df](https://github.com/Supamiu/ffxiv-teamcraft/commit/7b754df))
* fixed an issue with layout panel deletion ([597dec1](https://github.com/Supamiu/ffxiv-teamcraft/commit/597dec1))
* fixed an issue with list export format not being correct ([34d7d43](https://github.com/Supamiu/ffxiv-teamcraft/commit/34d7d43))
* fixed an issue with list picker when not logged in ([0142e5d](https://github.com/Supamiu/ffxiv-teamcraft/commit/0142e5d))
* fixed an issue with list regeneration ([827bedb](https://github.com/Supamiu/ffxiv-teamcraft/commit/827bedb))
* fixed an issue with lists ordering and drag and drop ([15b38a7](https://github.com/Supamiu/ffxiv-teamcraft/commit/15b38a7))
* fixed an issue with lists page when you have no teams ([ed7e094](https://github.com/Supamiu/ffxiv-teamcraft/commit/ed7e094))
* fixed an issue with migrated rotations not opening properly ([c71bf88](https://github.com/Supamiu/ffxiv-teamcraft/commit/c71bf88))
* fixed an issue with non-recipe items added to lists crashing the GCF ([5eec159](https://github.com/Supamiu/ffxiv-teamcraft/commit/5eec159))
* fixed an issue with rotation export ([a956f48](https://github.com/Supamiu/ffxiv-teamcraft/commit/a956f48))
* fixed an issue with rotation picker and masterbooks ([46d41c7](https://github.com/Supamiu/ffxiv-teamcraft/commit/46d41c7))
* fixed an issue with settings page not being shown properly ([995f38b](https://github.com/Supamiu/ffxiv-teamcraft/commit/995f38b))
* fixed an issue with simulator not using proper icons for some actions ([eba5a07](https://github.com/Supamiu/ffxiv-teamcraft/commit/eba5a07))
* fixed an issue with simulator stats not applying properly on form submit ([91f4a6a](https://github.com/Supamiu/ffxiv-teamcraft/commit/91f4a6a))
* fixed an issue with some wrong translation variable bindings ([3c3df56](https://github.com/Supamiu/ffxiv-teamcraft/commit/3c3df56))
* fixed an issue with team invite notifications not showing properly ([8ebd5ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/8ebd5ab))
* fixed an issue with teams not being properly handled ([cd2a4e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/cd2a4e6))
* fixed an issue with trade-related filters in layouts ([30374d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/30374d8)), closes [#477](https://github.com/Supamiu/ffxiv-teamcraft/issues/477)
* fixed blank space in lists page ([e5ee64e](https://github.com/Supamiu/ffxiv-teamcraft/commit/e5ee64e))
* fixed display of lists page on mobile ([29a49cb](https://github.com/Supamiu/ffxiv-teamcraft/commit/29a49cb))
* fixed double anonymous warning error ([29fe271](https://github.com/Supamiu/ffxiv-teamcraft/commit/29fe271))
* fixed empty alarms page message placement ([af51afc](https://github.com/Supamiu/ffxiv-teamcraft/commit/af51afc))
* fixed error messages being shown when trying to log in using oauth ([d23428d](https://github.com/Supamiu/ffxiv-teamcraft/commit/d23428d))
* fixed false error in GCF ([4bc0155](https://github.com/Supamiu/ffxiv-teamcraft/commit/4bc0155))
* fixed firebase warning message at startup ([ffebefb](https://github.com/Supamiu/ffxiv-teamcraft/commit/ffebefb))
* fixed inventory view width ([fa378aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/fa378aa)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* fixed list duplicates if you are the owner of a FC-wide shared list ([57ccac9](https://github.com/Supamiu/ffxiv-teamcraft/commit/57ccac9))
* fixed list picker to handle cancellation better ([55a6474](https://github.com/Supamiu/ffxiv-teamcraft/commit/55a6474))
* fixed performance issue with list index change and deletion ([611547b](https://github.com/Supamiu/ffxiv-teamcraft/commit/611547b))
* fixed performance issues with search page ([79270b7](https://github.com/Supamiu/ffxiv-teamcraft/commit/79270b7))
* fixed position and style issues with reduction popup ([d7730a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7730a2))
* fixed precraft pricing in pricing mode ([800fae5](https://github.com/Supamiu/ffxiv-teamcraft/commit/800fae5))
* fixed some drag and drop issues, including timeline jitter in simulator ([7765d9e](https://github.com/Supamiu/ffxiv-teamcraft/commit/7765d9e)), closes [#422](https://github.com/Supamiu/ffxiv-teamcraft/issues/422)
* fixed some issues with pricing mode ([b7029d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/b7029d6))
* fixed some translations for teams ([28bb6f7](https://github.com/Supamiu/ffxiv-teamcraft/commit/28bb6f7))
* fixed the levequests page ([2ce73d0](https://github.com/Supamiu/ffxiv-teamcraft/commit/2ce73d0))
* fixed width issue with consumable selectors in simulator ([5945008](https://github.com/Supamiu/ffxiv-teamcraft/commit/5945008))
* fixed wrong link in search page intro list ([5d02cb2](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d02cb2))
* fixes for FC-wide permissions ([9694320](https://github.com/Supamiu/ffxiv-teamcraft/commit/9694320))
* fixes for list progression checks ([8b718c7](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b718c7))
* fixes related to firebase auth update ([009fd0d](https://github.com/Supamiu/ffxiv-teamcraft/commit/009fd0d))
* fixes some styles and lists regeneration ([90a1ca6](https://github.com/Supamiu/ffxiv-teamcraft/commit/90a1ca6))
* fixes to the webhook system ([4ca9f69](https://github.com/Supamiu/ffxiv-teamcraft/commit/4ca9f69))
* forgot to convert date to eorzean date in timer restauration ([03ea454](https://github.com/Supamiu/ffxiv-teamcraft/commit/03ea454))
* hide share button in simulator for non-persisted rotations ([9543b38](https://github.com/Supamiu/ffxiv-teamcraft/commit/9543b38))
* HQ icon now appears properly for items required in end crafts on mobile size ([5e25d22](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e25d22))
* last small fixes for beta compliance ([dbd2fc4](https://github.com/Supamiu/ffxiv-teamcraft/commit/dbd2fc4))
* layout index changes now save properly ([11604a9](https://github.com/Supamiu/ffxiv-teamcraft/commit/11604a9))
* lint fixes for build process ([29f55f5](https://github.com/Supamiu/ffxiv-teamcraft/commit/29f55f5))
* List UI style problems on small screens ([3348300](https://github.com/Supamiu/ffxiv-teamcraft/commit/3348300)), closes [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473) [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473)
* no server history message ([a98605e](https://github.com/Supamiu/ffxiv-teamcraft/commit/a98605e))
* notification markdown ([4f6183e](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f6183e))
* selected job not saved in custom rotation ([4d15caf](https://github.com/Supamiu/ffxiv-teamcraft/commit/4d15caf)), closes [#455](https://github.com/Supamiu/ffxiv-teamcraft/issues/455)
* show as dirty if you're using a non-persisted rotation ([237dd96](https://github.com/Supamiu/ffxiv-teamcraft/commit/237dd96))
* **macro-translator:** force quotes for korean translations ([dd69a7c](https://github.com/Supamiu/ffxiv-teamcraft/commit/dd69a7c))
* show simulator button only if the item has a recipe ([c4dc282](https://github.com/Supamiu/ffxiv-teamcraft/commit/c4dc282))
* small fixes for general UX ([7cacddb](https://github.com/Supamiu/ffxiv-teamcraft/commit/7cacddb))
* various fixes for alarms and gathering location ([90bff65](https://github.com/Supamiu/ffxiv-teamcraft/commit/90bff65))
* various fixes to the alarm styles ([9691eec](https://github.com/Supamiu/ffxiv-teamcraft/commit/9691eec))
* you can now apply up to 3 commissions at a time without a high rate ([99912a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/99912a2))
* you cannot delete the lists you added as favorite anymore ([a8c41b6](https://github.com/Supamiu/ffxiv-teamcraft/commit/a8c41b6))


### Features

* ability to remove item from a list in list panel ([026c6ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/026c6ac)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* **desktop:** new toggle button in settings to always have Teamcraft on top ([ddd4351](https://github.com/Supamiu/ffxiv-teamcraft/commit/ddd4351))
* "collapse when done" layout option ([765385b](https://github.com/Supamiu/ffxiv-teamcraft/commit/765385b))
* "regenerate all lists" button in lists page ([40c5aac](https://github.com/Supamiu/ffxiv-teamcraft/commit/40c5aac))
* 4.4 data and support for positions on npcs for trades and vendors ([bdd4a30](https://github.com/Supamiu/ffxiv-teamcraft/commit/bdd4a30)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to change item amount from list details view ([ddf4914](https://github.com/Supamiu/ffxiv-teamcraft/commit/ddf4914))
* ability to check an item as "working on it" ([ac8fd9b](https://github.com/Supamiu/ffxiv-teamcraft/commit/ac8fd9b)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to delete an alarm group and its alarms at the same time ([1bc30a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/1bc30a2))
* ability to have a note on lists ([afd4f1f](https://github.com/Supamiu/ffxiv-teamcraft/commit/afd4f1f)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to mark a list as community list ([0bc21ea](https://github.com/Supamiu/ffxiv-teamcraft/commit/0bc21ea)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to mark an item as required HQ manually ([5cb6b27](https://github.com/Supamiu/ffxiv-teamcraft/commit/5cb6b27)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to mute/unmute alarms from alarms page ([92a684a](https://github.com/Supamiu/ffxiv-teamcraft/commit/92a684a))
* about page ([ceba34d](https://github.com/Supamiu/ffxiv-teamcraft/commit/ceba34d))
* action tooltips ([8d0d5a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8d0d5a1))
* add alarm logic to the item row component ([852ec61](https://github.com/Supamiu/ffxiv-teamcraft/commit/852ec61))
* add button to logout in the character association dialog box when it's mandatory ([3ea450b](https://github.com/Supamiu/ffxiv-teamcraft/commit/3ea450b))
* add commission creation date in the commission panel and details ([935b223](https://github.com/Supamiu/ffxiv-teamcraft/commit/935b223))
* add filters and sorting to levequests ([a1fc2bc](https://github.com/Supamiu/ffxiv-teamcraft/commit/a1fc2bc))
* add list regeneration feature ([852261c](https://github.com/Supamiu/ffxiv-teamcraft/commit/852261c))
* add new God of Hand tier patreon supporter to loading screen ([14821e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/14821e4))
* add support for crystals tracking in layout system ([e164020](https://github.com/Supamiu/ffxiv-teamcraft/commit/e164020)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* add support for different layout types ([a675a38](https://github.com/Supamiu/ffxiv-teamcraft/commit/a675a38)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* add support for fcId in database storage (useful for rules) ([eb86c1a](https://github.com/Supamiu/ffxiv-teamcraft/commit/eb86c1a))
* add support for trade sources icon ([aa89104](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa89104)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* add tag to outdated lists in /lists page ([86bf6f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/86bf6f0))
* added all the buttons for item details (except the trade one), no dialog details for now ([a37fe03](https://github.com/Supamiu/ffxiv-teamcraft/commit/a37fe03)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* added closest aetheryte to gatheredBy details popup ([7cb86b1](https://github.com/Supamiu/ffxiv-teamcraft/commit/7cb86b1))
* added delete button for workshops ([e1ad6c0](https://github.com/Supamiu/ffxiv-teamcraft/commit/e1ad6c0))
* added enter key listener for list amount edition validation ([4ce7b5e](https://github.com/Supamiu/ffxiv-teamcraft/commit/4ce7b5e))
* added language selector inside topbar, hidden in mobile view ([8bddb14](https://github.com/Supamiu/ffxiv-teamcraft/commit/8bddb14))
* added search page files and anonymous warning message ([e2346c2](https://github.com/Supamiu/ffxiv-teamcraft/commit/e2346c2))
* added support for recipe layout options in layout dialog ([83c0a56](https://github.com/Supamiu/ffxiv-teamcraft/commit/83c0a56))
* added warning message for community lists without tags ([7a51267](https://github.com/Supamiu/ffxiv-teamcraft/commit/7a51267))
* alarm options and fixes for hoursBefore option ([f1c143f](https://github.com/Supamiu/ffxiv-teamcraft/commit/f1c143f))
* alarms bell service now implemented properly ([4c0d173](https://github.com/Supamiu/ffxiv-teamcraft/commit/4c0d173))
* alarms page cleanup, user friendly messages and loader ([ce4827b](https://github.com/Supamiu/ffxiv-teamcraft/commit/ce4827b))
* alarms page finished ! ([1ee5faf](https://github.com/Supamiu/ffxiv-teamcraft/commit/1ee5faf))
* alarms persistence system done. ([3293441](https://github.com/Supamiu/ffxiv-teamcraft/commit/3293441))
* alarms sidebar now complete ([9ef67c4](https://github.com/Supamiu/ffxiv-teamcraft/commit/9ef67c4))
* alarms sidebar now shows coords for each alarm ([c37e024](https://github.com/Supamiu/ffxiv-teamcraft/commit/c37e024))
* amount display for crystals ([8afffaa](https://github.com/Supamiu/ffxiv-teamcraft/commit/8afffaa))
* amount modification in list panels ([50edd50](https://github.com/Supamiu/ffxiv-teamcraft/commit/50edd50))
* base template for layout system, WIP ([3aa52da](https://github.com/Supamiu/ffxiv-teamcraft/commit/3aa52da))
* better performances for tags adjustments ([207fd92](https://github.com/Supamiu/ffxiv-teamcraft/commit/207fd92))
* better support for default consumables in rotations ([e22d94f](https://github.com/Supamiu/ffxiv-teamcraft/commit/e22d94f))
* big performance improvements for big lists ([4304bdf](https://github.com/Supamiu/ffxiv-teamcraft/commit/4304bdf))
* button on alarm card to copy ingame alarm macro ([724ba8c](https://github.com/Supamiu/ffxiv-teamcraft/commit/724ba8c))
* calculator button for easy add/remove operations ([586d8e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/586d8e6)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* change rotation button inside simulator ([8981554](https://github.com/Supamiu/ffxiv-teamcraft/commit/8981554))
* character verification in profile editor ([6a0c9a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a0c9a1))
* checkboxes and bulk addition in search, plus lists state fixes ([7976f56](https://github.com/Supamiu/ffxiv-teamcraft/commit/7976f56))
* commission board history ([d2554d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/d2554d6)), closes [#519](https://github.com/Supamiu/ffxiv-teamcraft/issues/519)
* community lists page ([c1ed79f](https://github.com/Supamiu/ffxiv-teamcraft/commit/c1ed79f))
* contacts system in the profile editor page ([cb11388](https://github.com/Supamiu/ffxiv-teamcraft/commit/cb11388)), closes [#571](https://github.com/Supamiu/ffxiv-teamcraft/issues/571)
* defined notifications language on team level ([6f44e85](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f44e85))
* delete button for characters in profile editor ([9cb7ec1](https://github.com/Supamiu/ffxiv-teamcraft/commit/9cb7ec1))
* display amount of unread notifications in sidebar ([ca9ee6a](https://github.com/Supamiu/ffxiv-teamcraft/commit/ca9ee6a))
* drag and drop system for lists, needs polish ([14bcf3e](https://github.com/Supamiu/ffxiv-teamcraft/commit/14bcf3e))
* ephemeral lists deletion system ([6109333](https://github.com/Supamiu/ffxiv-teamcraft/commit/6109333))
* error message for outdated lists when you can't regenerate it by yourself ([71c3652](https://github.com/Supamiu/ffxiv-teamcraft/commit/71c3652))
* FC-wide permissions ([a80cdb6](https://github.com/Supamiu/ffxiv-teamcraft/commit/a80cdb6))
* ffxivgardening.com links ! ([aa0da9b](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa0da9b))
* ffxivgathering links for seeds ([5ba7364](https://github.com/Supamiu/ffxiv-teamcraft/commit/5ba7364))
* first basic implementation of list details page ([81b3a27](https://github.com/Supamiu/ffxiv-teamcraft/commit/81b3a27))
* first draft for electron version ([ed24cf8](https://github.com/Supamiu/ffxiv-teamcraft/commit/ed24cf8))
* first implementation of alarms page ([32600c1](https://github.com/Supamiu/ffxiv-teamcraft/commit/32600c1))
* first implementation of gathering-location page ([d6006ad](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6006ad))
* first implementation of settings popup, few things to put inside of it for now ([aa97e3d](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa97e3d))
* first implementation of workshop state fragment and a bit of template ([535bd61](https://github.com/Supamiu/ffxiv-teamcraft/commit/535bd61))
* first iteration for monster drop details ([183b55e](https://github.com/Supamiu/ffxiv-teamcraft/commit/183b55e)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* first part of rotations page ([1b2f77d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b2f77d))
* first part of simulator ready for testing ([bd965fa](https://github.com/Supamiu/ffxiv-teamcraft/commit/bd965fa))
* first part of the character verification system ([695c156](https://github.com/Supamiu/ffxiv-teamcraft/commit/695c156))
* first part of the profile editor page ([2f653d5](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f653d5))
* first pass for teams system: ([1b39cce](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b39cce))
* first pass for the new notifications system, now we need something to use it ! :D ([4569c6c](https://github.com/Supamiu/ffxiv-teamcraft/commit/4569c6c))
* fixes to navbar links and topbar icons ([1809bbf](https://github.com/Supamiu/ffxiv-teamcraft/commit/1809bbf))
* gathering details popup ! ([5e6e1ad](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e6e1ad))
* gathering location page polish + alarms tweak to have one alarm per node instead of per spawn ([c8fe642](https://github.com/Supamiu/ffxiv-teamcraft/commit/c8fe642))
* gil transaction log now shown on archived commissions ([b5ff24d](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5ff24d)), closes [#469](https://github.com/Supamiu/ffxiv-teamcraft/issues/469)
* group lists by workshop in lists merge popup ([d73d080](https://github.com/Supamiu/ffxiv-teamcraft/commit/d73d080))
* groups implementation done, with clean drag and drop behavior. ([6a51369](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a51369))
* implemented classic register/login ([e956f8e](https://github.com/Supamiu/ffxiv-teamcraft/commit/e956f8e))
* implemented some of the buttons inside right panel in simulator ([94ce913](https://github.com/Supamiu/ffxiv-teamcraft/commit/94ce913))
* informations about required folklore in alarms page ([256418f](https://github.com/Supamiu/ffxiv-teamcraft/commit/256418f)), closes [#614](https://github.com/Supamiu/ffxiv-teamcraft/issues/614)
* instance details popup ([fd94ee5](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd94ee5)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* integrated timer and first tests for alarms state management ([5bc8a9b](https://github.com/Supamiu/ffxiv-teamcraft/commit/5bc8a9b))
* inventory view ([2cef59a](https://github.com/Supamiu/ffxiv-teamcraft/commit/2cef59a)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* isearch macro copy button ([5ff0d68](https://github.com/Supamiu/ffxiv-teamcraft/commit/5ff0d68))
* item relationships (requires/requiredBy) dialog box ([43affd3](https://github.com/Supamiu/ffxiv-teamcraft/commit/43affd3))
* item row states (craftable, has all base ingredients) ([ff3782e](https://github.com/Supamiu/ffxiv-teamcraft/commit/ff3782e))
* KO support in macro translator ([41710bf](https://github.com/Supamiu/ffxiv-teamcraft/commit/41710bf))
* layout export button ([bec2ac7](https://github.com/Supamiu/ffxiv-teamcraft/commit/bec2ac7))
* layout import ([b1b7012](https://github.com/Supamiu/ffxiv-teamcraft/commit/b1b7012))
* levequests ([f7ffe4d](https://github.com/Supamiu/ffxiv-teamcraft/commit/f7ffe4d))
* levequests page improvements ([a6d3425](https://github.com/Supamiu/ffxiv-teamcraft/commit/a6d3425))
* list history dialog box ([6acea36](https://github.com/Supamiu/ffxiv-teamcraft/commit/6acea36)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* list reset button ([507c7b2](https://github.com/Supamiu/ffxiv-teamcraft/commit/507c7b2)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* list tracking is now properly linked to teams system ([9c3b83c](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c3b83c))
* list-panel component and list state logic ([6f5cc6c](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f5cc6c))
* lists merge support ([c78c4ca](https://github.com/Supamiu/ffxiv-teamcraft/commit/c78c4ca))
* login implementation for oauth ([117e78a](https://github.com/Supamiu/ffxiv-teamcraft/commit/117e78a))
* macro translator ([0f57211](https://github.com/Supamiu/ffxiv-teamcraft/commit/0f57211))
* marketboard button now available in search page ([6721188](https://github.com/Supamiu/ffxiv-teamcraft/commit/6721188))
* marketboard details box now includes history ([5376561](https://github.com/Supamiu/ffxiv-teamcraft/commit/5376561))
* marketboard informations system ([137575a](https://github.com/Supamiu/ffxiv-teamcraft/commit/137575a))
* migrated craft job icons to xivapi set ([6c28f06](https://github.com/Supamiu/ffxiv-teamcraft/commit/6c28f06))
* migrated map system to use only map ids ([a2f3ff4](https://github.com/Supamiu/ffxiv-teamcraft/commit/a2f3ff4)), closes [#261](https://github.com/Supamiu/ffxiv-teamcraft/issues/261)
* migrating users storage from firebase to firestore ([3b78672](https://github.com/Supamiu/ffxiv-teamcraft/commit/3b78672))
* more details for crystals ! ([ab0ed2a](https://github.com/Supamiu/ffxiv-teamcraft/commit/ab0ed2a)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* more details for gathering informations ([a886bd2](https://github.com/Supamiu/ffxiv-teamcraft/commit/a886bd2))
* more details for ventures and alarms ([c12f22f](https://github.com/Supamiu/ffxiv-teamcraft/commit/c12f22f))
* more display stuff for notifications system ([76258a7](https://github.com/Supamiu/ffxiv-teamcraft/commit/76258a7))
* more monsters location data ([723952c](https://github.com/Supamiu/ffxiv-teamcraft/commit/723952c))
* more position data ! ([3f05f6b](https://github.com/Supamiu/ffxiv-teamcraft/commit/3f05f6b))
* more progression on simulator ([bc1b9a0](https://github.com/Supamiu/ffxiv-teamcraft/commit/bc1b9a0))
* more skeleton parts for the simulator page ([7f050ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/7f050ac))
* multiple nodes spawning at the same time pop multiple notifications ([1e3419b](https://github.com/Supamiu/ffxiv-teamcraft/commit/1e3419b)), closes [#430](https://github.com/Supamiu/ffxiv-teamcraft/issues/430)
* new --native-topbar (or -nt) launch flag for native window decorator ([3494ee2](https://github.com/Supamiu/ffxiv-teamcraft/commit/3494ee2)), closes [#531](https://github.com/Supamiu/ffxiv-teamcraft/issues/531)
* new "add all alarms for this item" menu option ([e457dcc](https://github.com/Supamiu/ffxiv-teamcraft/commit/e457dcc))
* new $10 patreon supporter name in loading messages ([5e56e3a](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e56e3a))
* new closestAetheryte pipe ([5421c60](https://github.com/Supamiu/ffxiv-teamcraft/commit/5421c60))
* new comments system is now available ([a4ae9ff](https://github.com/Supamiu/ffxiv-teamcraft/commit/a4ae9ff)), closes [#572](https://github.com/Supamiu/ffxiv-teamcraft/issues/572) [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576) [#625](https://github.com/Supamiu/ffxiv-teamcraft/issues/625)
* new favorites system ([4e3c015](https://github.com/Supamiu/ffxiv-teamcraft/commit/4e3c015)), closes [#574](https://github.com/Supamiu/ffxiv-teamcraft/issues/574)
* new history system for lists to see who added/removed things ([41527d7](https://github.com/Supamiu/ffxiv-teamcraft/commit/41527d7)), closes [#435](https://github.com/Supamiu/ffxiv-teamcraft/issues/435)
* new layout configuration modal ([d6c68c0](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6c68c0)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* new permissions system is now ready ! ([28a2046](https://github.com/Supamiu/ffxiv-teamcraft/commit/28a2046))
* new progress popup service for easy progression display ([6dcf7f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/6dcf7f0))
* new search box inside lists page ([b751f12](https://github.com/Supamiu/ffxiv-teamcraft/commit/b751f12))
* new team system with assignable items and notifications ([75ff821](https://github.com/Supamiu/ffxiv-teamcraft/commit/75ff821)), closes [#463](https://github.com/Supamiu/ffxiv-teamcraft/issues/463)
* new teams system is now complete and ready to be tested ! ([034cd4d](https://github.com/Supamiu/ffxiv-teamcraft/commit/034cd4d)), closes [#573](https://github.com/Supamiu/ffxiv-teamcraft/issues/573)
* notification now shown when public list is commented ([4163eb6](https://github.com/Supamiu/ffxiv-teamcraft/commit/4163eb6)), closes [#279](https://github.com/Supamiu/ffxiv-teamcraft/issues/279)
* notifications badge is now a counter ([7aa637d](https://github.com/Supamiu/ffxiv-teamcraft/commit/7aa637d))
* optimized compact lists even more by removing useless finalItems details ([3602e99](https://github.com/Supamiu/ffxiv-teamcraft/commit/3602e99))
* optimized navigation map ([47fd5d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/47fd5d8))
* persistence and more template for layouts system ([5437018](https://github.com/Supamiu/ffxiv-teamcraft/commit/5437018))
* pricing mode v5 is now ready to be tested ([6a223e7](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a223e7))
* progress on search page, still needs some features ([0a105e9](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a105e9)), closes [#569](https://github.com/Supamiu/ffxiv-teamcraft/issues/569)
* proper compacts system for powerful perfs in /lists and /community-lists ([e515a67](https://github.com/Supamiu/ffxiv-teamcraft/commit/e515a67))
* proper implementation for lists reordering using ngx-dnd ([1cd9c41](https://github.com/Supamiu/ffxiv-teamcraft/commit/1cd9c41))
* proper intro for search page ([df0215d](https://github.com/Supamiu/ffxiv-teamcraft/commit/df0215d))
* proper support for lists not found and list deletion ([b115d58](https://github.com/Supamiu/ffxiv-teamcraft/commit/b115d58))
* public profile page ([85d9e18](https://github.com/Supamiu/ffxiv-teamcraft/commit/85d9e18))
* recipe selection for custom rotations ([cbf049c](https://github.com/Supamiu/ffxiv-teamcraft/commit/cbf049c))
* reduction details popup ([f3d9b24](https://github.com/Supamiu/ffxiv-teamcraft/commit/f3d9b24))
* registration migrated to 5.0 ([d3ce1e1](https://github.com/Supamiu/ffxiv-teamcraft/commit/d3ce1e1))
* rename rotation button in rotation panel ([6f88fd8](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f88fd8))
* rename team and remove members is now possible ([a06428b](https://github.com/Supamiu/ffxiv-teamcraft/commit/a06428b))
* reworked tags dialog box ([bdd0eb7](https://github.com/Supamiu/ffxiv-teamcraft/commit/bdd0eb7)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* right clicking on a timer button now creates an alarm in default group without opening menu ([4f75486](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f75486))
* rotations favorite system ([8e3b7f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8e3b7f1))
* rotations picker for simulator ([4efeb2e](https://github.com/Supamiu/ffxiv-teamcraft/commit/4efeb2e))
* rotations state fragment and more ([2f1ba6e](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f1ba6e))
* search menu moved under the home button in sidebar ([fcfd34c](https://github.com/Supamiu/ffxiv-teamcraft/commit/fcfd34c))
* search page with shareable urls, still work to do but this is a first step ([2796ce9](https://github.com/Supamiu/ffxiv-teamcraft/commit/2796ce9)), closes [#569](https://github.com/Supamiu/ffxiv-teamcraft/issues/569)
* search system linked with list state ([1c14de7](https://github.com/Supamiu/ffxiv-teamcraft/commit/1c14de7))
* separate category for community lists in lists page ([8c89ce9](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c89ce9))
* show thresholds in simulator for collectibility and satisfaction ratings ([d5ebe67](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5ebe67)), closes [#503](https://github.com/Supamiu/ffxiv-teamcraft/issues/503)
* simulator is now totally ready for production ([156a4f6](https://github.com/Supamiu/ffxiv-teamcraft/commit/156a4f6))
* skeleton components for simulator rework ([cc5e8a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/cc5e8a1))
* snapshot mode support and icons for the buttons ([1c62b8d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1c62b8d))
* social buttons in sidebar ([d51f10b](https://github.com/Supamiu/ffxiv-teamcraft/commit/d51f10b))
* specialist toggle now adds/removes 20/20 properly ([9677bf2](https://github.com/Supamiu/ffxiv-teamcraft/commit/9677bf2))
* standard simulator yay ! ([1b72492](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b72492))
* stats edition in profile editor ([fa98a3e](https://github.com/Supamiu/ffxiv-teamcraft/commit/fa98a3e))
* support for "add all alarms at once" button ([3027430](https://github.com/Supamiu/ffxiv-teamcraft/commit/3027430)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for advanced search filters in search page ([baad9ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/baad9ab)), closes [#569](https://github.com/Supamiu/ffxiv-teamcraft/issues/569)
* support for better hook messages with fancy stuff ([1ae3731](https://github.com/Supamiu/ffxiv-teamcraft/commit/1ae3731))
* support for consumables and custom recipe configuration ([afec763](https://github.com/Supamiu/ffxiv-teamcraft/commit/afec763))
* support for hide completed/used rows in layouts system ([df4cb45](https://github.com/Supamiu/ffxiv-teamcraft/commit/df4cb45)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for Ingenuity 1 and 2 inside simulator ([5d540a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d540a2))
* support for korean accounts ([0ffa949](https://github.com/Supamiu/ffxiv-teamcraft/commit/0ffa949)), closes [#639](https://github.com/Supamiu/ffxiv-teamcraft/issues/639)
* support for list clone button ([c91e805](https://github.com/Supamiu/ffxiv-teamcraft/commit/c91e805)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for masterbook icons ([23922b3](https://github.com/Supamiu/ffxiv-teamcraft/commit/23922b3)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for multiple recipes for a single item inside final items ([371b1c6](https://github.com/Supamiu/ffxiv-teamcraft/commit/371b1c6))
* support for reduction node alarms ([733619e](https://github.com/Supamiu/ffxiv-teamcraft/commit/733619e)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for reductions in gathering locations page ([1bc3998](https://github.com/Supamiu/ffxiv-teamcraft/commit/1bc3998))
* support for stats modification inside simulator, first part of consumables configuration ([04d3421](https://github.com/Supamiu/ffxiv-teamcraft/commit/04d3421))
* support for verification inside permissions system ([f982a58](https://github.com/Supamiu/ffxiv-teamcraft/commit/f982a58))
* support for verification status in user picker dialog box ([d5e9510](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5e9510))
* total price in trades popup ([d7b0993](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7b0993))
* total price popup ([bfe2759](https://github.com/Supamiu/ffxiv-teamcraft/commit/bfe2759))
* trade details popup ([f92760c](https://github.com/Supamiu/ffxiv-teamcraft/commit/f92760c))
* updated simulator to add next tier theorical values ([d50cdd9](https://github.com/Supamiu/ffxiv-teamcraft/commit/d50cdd9))
* vendors details popup ([eabec3b](https://github.com/Supamiu/ffxiv-teamcraft/commit/eabec3b)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ventures details popup ([78ef657](https://github.com/Supamiu/ffxiv-teamcraft/commit/78ef657))
* voyage details popup ([d7c2a12](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7c2a12))
* warning for missing masterbook with easy addition to profile ([bd5fe35](https://github.com/Supamiu/ffxiv-teamcraft/commit/bd5fe35))
* workshop system & small revamp of lists storage in state ([f8afc52](https://github.com/Supamiu/ffxiv-teamcraft/commit/f8afc52))
* workshops are now listed in the list-picker ([c9b391c](https://github.com/Supamiu/ffxiv-teamcraft/commit/c9b391c))
* workshops ordering using drag and drop ([e87c875](https://github.com/Supamiu/ffxiv-teamcraft/commit/e87c875))
* WRITE permission implementation for the workshops ([5b5899e](https://github.com/Supamiu/ffxiv-teamcraft/commit/5b5899e))
* you can now add all alarms for a given list using a single button ([7e58675](https://github.com/Supamiu/ffxiv-teamcraft/commit/7e58675)), closes [#465](https://github.com/Supamiu/ffxiv-teamcraft/issues/465)
* you can now add notes to your alarms ([fac1a42](https://github.com/Supamiu/ffxiv-teamcraft/commit/fac1a42)), closes [#431](https://github.com/Supamiu/ffxiv-teamcraft/issues/431)
* you can now assign a list to a team ! ([66ff6f2](https://github.com/Supamiu/ffxiv-teamcraft/commit/66ff6f2))
* you can now choose your preferred copy mode (item name or /isearch) ([13064cf](https://github.com/Supamiu/ffxiv-teamcraft/commit/13064cf))
* you can now copy item names in pricing mode too ([3a7db42](https://github.com/Supamiu/ffxiv-teamcraft/commit/3a7db42))
* **pricing:** add toggle button to switch math to formulas that think you'll sell everything ([3d2495e](https://github.com/Supamiu/ffxiv-teamcraft/commit/3d2495e))



<a name="5.0.0-beta.3"></a>
# [5.0.0-beta.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.9...v5.0.0-beta.3) (2018-12-06)


### Bug Fixes

* "create new list" button is now on top of the drawer ([00f8c25](https://github.com/Supamiu/ffxiv-teamcraft/commit/00f8c25))
* disabled list import button as it's delayed for now ([8584df1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8584df1))
* fixed a stupid template typo I made ([aa22e4f](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa22e4f))
* fixed an issue with desktop app boot ([846c04d](https://github.com/Supamiu/ffxiv-teamcraft/commit/846c04d))
* fixed an issue with hunting details popup positions ([93f4ae7](https://github.com/Supamiu/ffxiv-teamcraft/commit/93f4ae7))
* fixed an issue with list deletion ([b6397fd](https://github.com/Supamiu/ffxiv-teamcraft/commit/b6397fd))
* fixed an issue with list deletion ([a2390d4](https://github.com/Supamiu/ffxiv-teamcraft/commit/a2390d4))
* fixed an issue with list layout not hiding completed recipes properly when enabled ([3b5d5d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/3b5d5d6))
* fixed an issue with lists search ([1f68e3b](https://github.com/Supamiu/ffxiv-teamcraft/commit/1f68e3b))
* fixed an issue with profile verification and parsing ([be4c3a5](https://github.com/Supamiu/ffxiv-teamcraft/commit/be4c3a5))
* fixed an issue with rotation folders not being deletable ([d6f4a37](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6f4a37))
* fixed an issue with some lists not showing properly ([6972255](https://github.com/Supamiu/ffxiv-teamcraft/commit/6972255))
* fixed an issue with the completed rows filter in layout system ([76d607b](https://github.com/Supamiu/ffxiv-teamcraft/commit/76d607b))
* fixed dev electron startup ([6b70daf](https://github.com/Supamiu/ffxiv-teamcraft/commit/6b70daf))
* you can now export a rotation to macro even if it's not saved ([7307926](https://github.com/Supamiu/ffxiv-teamcraft/commit/7307926))


### Features

* alarms overlay for desktop app ([c8aebd4](https://github.com/Supamiu/ffxiv-teamcraft/commit/c8aebd4))
* better implementation for custom protocol ([fd25ffe](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd25ffe))
* desktop app is ready with secure oauth ! ([69b5316](https://github.com/Supamiu/ffxiv-teamcraft/commit/69b5316))
* larger scrollbars and navigation state persistance for desktop app ([53695ee](https://github.com/Supamiu/ffxiv-teamcraft/commit/53695ee)), closes [#602](https://github.com/Supamiu/ffxiv-teamcraft/issues/602)
* proper support for custom protocol ([b09bda8](https://github.com/Supamiu/ffxiv-teamcraft/commit/b09bda8))
* support for korean in macro import inside simulator ([6ffa6e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/6ffa6e4))
* vendor map name is now shown inside vendors panel ([ebca986](https://github.com/Supamiu/ffxiv-teamcraft/commit/ebca986))
* you can now create and share rotation folders ([12fb7a6](https://github.com/Supamiu/ffxiv-teamcraft/commit/12fb7a6))



<a name="5.0.0-beta.2"></a>
# 5.0.0-beta.2 (2018-12-02)


### Bug Fixes

* "create all alarms" no longer creates cluster alarms ([fd3a4de](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd3a4de))


### Features

* custom alarms support ([3dd8c97](https://github.com/Supamiu/ffxiv-teamcraft/commit/3dd8c97)), closes [#587](https://github.com/Supamiu/ffxiv-teamcraft/issues/587)



<a name="5.0.0-beta.1"></a>
# 5.0.0-beta.1 (2018-12-02)


### Bug Fixes

* added a "not found" message for rotations not found ([f7a164a](https://github.com/Supamiu/ffxiv-teamcraft/commit/f7a164a))
* added a guard for list update sometimes breaking the list in compact mode ([34e9538](https://github.com/Supamiu/ffxiv-teamcraft/commit/34e9538))
* alarms in sidebar no longer ordered by group ([51cb94d](https://github.com/Supamiu/ffxiv-teamcraft/commit/51cb94d))
* anonymous commissions ([2a37246](https://github.com/Supamiu/ffxiv-teamcraft/commit/2a37246)), closes [#533](https://github.com/Supamiu/ffxiv-teamcraft/issues/533)
* beta is now properly connected to the beta database ([ec7f070](https://github.com/Supamiu/ffxiv-teamcraft/commit/ec7f070))
* better handling of multiple lists deletion in a short time ([342fbb0](https://github.com/Supamiu/ffxiv-teamcraft/commit/342fbb0))
* better loading management for lists page ([2f47121](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f47121))
* better messages for teams tracking hook system ([a7016b3](https://github.com/Supamiu/ffxiv-teamcraft/commit/a7016b3))
* better support for characters not added yet in xivapi ([a60e7f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/a60e7f1))
* changing alarm group mute state wont collapse panel anymore ([983e3bd](https://github.com/Supamiu/ffxiv-teamcraft/commit/983e3bd))
* custom recipe params now applied as they are changed ([10df578](https://github.com/Supamiu/ffxiv-teamcraft/commit/10df578))
* display message on user not found in user picker ([86e3d1e](https://github.com/Supamiu/ffxiv-teamcraft/commit/86e3d1e))
* fix for alarms spawn state not being handled properly ([fcf6fd0](https://github.com/Supamiu/ffxiv-teamcraft/commit/fcf6fd0))
* fix for drag and drop issues inside simulator ([2efc0ec](https://github.com/Supamiu/ffxiv-teamcraft/commit/2efc0ec))
* fixed a bug showing a warning inside macro popup while it shouldn't ([4747299](https://github.com/Supamiu/ffxiv-teamcraft/commit/4747299))
* fixed a bug where "select all" button would stay selected but not link to any list ([4b5ba19](https://github.com/Supamiu/ffxiv-teamcraft/commit/4b5ba19))
* fixed a bug with consumables being applied twice in some cases ([e9ef0da](https://github.com/Supamiu/ffxiv-teamcraft/commit/e9ef0da))
* fixed a bug with simulator and ingenuity in lower level crafts ([9c817f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c817f0))
* fixed a double notification issue for team member assignment ([90d6e20](https://github.com/Supamiu/ffxiv-teamcraft/commit/90d6e20))
* fixed a missing translation in alarms creation ([f9a44d0](https://github.com/Supamiu/ffxiv-teamcraft/commit/f9a44d0))
* fixed a priority issue on pricing system ([7da5c31](https://github.com/Supamiu/ffxiv-teamcraft/commit/7da5c31))
* fixed a small issue with alarms page ([9cb6992](https://github.com/Supamiu/ffxiv-teamcraft/commit/9cb6992))
* fixed a wrong translation key for hook messages ([0695f1a](https://github.com/Supamiu/ffxiv-teamcraft/commit/0695f1a))
* fixed an error in console inside teams page ([96eeb99](https://github.com/Supamiu/ffxiv-teamcraft/commit/96eeb99))
* fixed an error poping inside lists page for deleted lists in workshops ([4dbf100](https://github.com/Supamiu/ffxiv-teamcraft/commit/4dbf100))
* fixed an issue hiding the sidebar on mobile ([f0473e0](https://github.com/Supamiu/ffxiv-teamcraft/commit/f0473e0))
* fixed an issue making min stats popup freeze tab ([983e3a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/983e3a2))
* fixed an issue making prices a bit off in pricing mode ([08b698b](https://github.com/Supamiu/ffxiv-teamcraft/commit/08b698b))
* fixed an issue making register on google button show an unrelated error ([9fcd167](https://github.com/Supamiu/ffxiv-teamcraft/commit/9fcd167))
* fixed an issue preventing alarms from ringing ([f46d715](https://github.com/Supamiu/ffxiv-teamcraft/commit/f46d715))
* fixed an issue preventing anonymous user from using cross-class skills in simulator ([7708ecb](https://github.com/Supamiu/ffxiv-teamcraft/commit/7708ecb))
* fixed an issue preventing anonymous users to load a list ([e6834bd](https://github.com/Supamiu/ffxiv-teamcraft/commit/e6834bd))
* fixed an issue preventing gathering location page to create alarms ([69ac345](https://github.com/Supamiu/ffxiv-teamcraft/commit/69ac345)), closes [#478](https://github.com/Supamiu/ffxiv-teamcraft/issues/478)
* fixed an issue preventing korean users to register properly ([d361b78](https://github.com/Supamiu/ffxiv-teamcraft/commit/d361b78))
* fixed an issue preventing user update save in db ([700c3ea](https://github.com/Supamiu/ffxiv-teamcraft/commit/700c3ea))
* fixed an issue preventing users from saving their books in some conditions ([e4b7311](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4b7311))
* fixed an issue that was applying rating to both users ([fab53c3](https://github.com/Supamiu/ffxiv-teamcraft/commit/fab53c3))
* fixed an issue with airship crafts not added properly ([f5c604e](https://github.com/Supamiu/ffxiv-teamcraft/commit/f5c604e))
* fixed an issue with alarms not being deleted properly ([1b9a84d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b9a84d))
* fixed an issue with alarms not having proper map id ([7c9c44a](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c9c44a))
* fixed an issue with alarms not ringing properly ([a2780f8](https://github.com/Supamiu/ffxiv-teamcraft/commit/a2780f8))
* fixed an issue with amount modification breaking lists ([7c73073](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c73073))
* fixed an issue with books not being saved in profile page ([449a353](https://github.com/Supamiu/ffxiv-teamcraft/commit/449a353))
* fixed an issue with change detection inside pricing mode ([0a9a690](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a9a690))
* fixed an issue with favorite rotations not showing properly ([e434dd1](https://github.com/Supamiu/ffxiv-teamcraft/commit/e434dd1))
* fixed an issue with first login creating an infinite loading for character informations ([8d704f4](https://github.com/Supamiu/ffxiv-teamcraft/commit/8d704f4))
* fixed an issue with freshly created accounts ([258ece9](https://github.com/Supamiu/ffxiv-teamcraft/commit/258ece9))
* fixed an issue with HQ icon on new xivapi market data structure ([23f2281](https://github.com/Supamiu/ffxiv-teamcraft/commit/23f2281))
* fixed an issue with item addition in lists ([6086d87](https://github.com/Supamiu/ffxiv-teamcraft/commit/6086d87))
* fixed an issue with korean accounts stats popup in profile ([7b754df](https://github.com/Supamiu/ffxiv-teamcraft/commit/7b754df))
* fixed an issue with layout panel deletion ([597dec1](https://github.com/Supamiu/ffxiv-teamcraft/commit/597dec1))
* fixed an issue with list export format not being correct ([34d7d43](https://github.com/Supamiu/ffxiv-teamcraft/commit/34d7d43))
* fixed an issue with list picker when not logged in ([0142e5d](https://github.com/Supamiu/ffxiv-teamcraft/commit/0142e5d))
* fixed an issue with list regeneration ([827bedb](https://github.com/Supamiu/ffxiv-teamcraft/commit/827bedb))
* fixed an issue with lists ordering and drag and drop ([15b38a7](https://github.com/Supamiu/ffxiv-teamcraft/commit/15b38a7))
* fixed an issue with lists page when you have no teams ([ed7e094](https://github.com/Supamiu/ffxiv-teamcraft/commit/ed7e094))
* fixed an issue with migrated rotations not opening properly ([c71bf88](https://github.com/Supamiu/ffxiv-teamcraft/commit/c71bf88))
* fixed an issue with non-recipe items added to lists crashing the GCF ([5eec159](https://github.com/Supamiu/ffxiv-teamcraft/commit/5eec159))
* fixed an issue with rotation export ([a956f48](https://github.com/Supamiu/ffxiv-teamcraft/commit/a956f48))
* fixed an issue with rotation picker and masterbooks ([46d41c7](https://github.com/Supamiu/ffxiv-teamcraft/commit/46d41c7))
* fixed an issue with settings page not being shown properly ([995f38b](https://github.com/Supamiu/ffxiv-teamcraft/commit/995f38b))
* fixed an issue with simulator not using proper icons for some actions ([eba5a07](https://github.com/Supamiu/ffxiv-teamcraft/commit/eba5a07))
* fixed an issue with simulator stats not applying properly on form submit ([91f4a6a](https://github.com/Supamiu/ffxiv-teamcraft/commit/91f4a6a))
* fixed an issue with some wrong translation variable bindings ([3c3df56](https://github.com/Supamiu/ffxiv-teamcraft/commit/3c3df56))
* fixed an issue with team invite notifications not showing properly ([8ebd5ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/8ebd5ab))
* fixed an issue with teams not being properly handled ([cd2a4e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/cd2a4e6))
* fixed an issue with trade-related filters in layouts ([30374d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/30374d8)), closes [#477](https://github.com/Supamiu/ffxiv-teamcraft/issues/477)
* fixed blank space in lists page ([e5ee64e](https://github.com/Supamiu/ffxiv-teamcraft/commit/e5ee64e))
* fixed display of lists page on mobile ([29a49cb](https://github.com/Supamiu/ffxiv-teamcraft/commit/29a49cb))
* fixed double anonymous warning error ([29fe271](https://github.com/Supamiu/ffxiv-teamcraft/commit/29fe271))
* fixed empty alarms page message placement ([af51afc](https://github.com/Supamiu/ffxiv-teamcraft/commit/af51afc))
* fixed error messages being shown when trying to log in using oauth ([d23428d](https://github.com/Supamiu/ffxiv-teamcraft/commit/d23428d))
* fixed false error in GCF ([4bc0155](https://github.com/Supamiu/ffxiv-teamcraft/commit/4bc0155))
* fixed firebase warning message at startup ([ffebefb](https://github.com/Supamiu/ffxiv-teamcraft/commit/ffebefb))
* fixed inventory view width ([fa378aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/fa378aa)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* fixed list duplicates if you are the owner of a FC-wide shared list ([57ccac9](https://github.com/Supamiu/ffxiv-teamcraft/commit/57ccac9))
* fixed list picker to handle cancellation better ([55a6474](https://github.com/Supamiu/ffxiv-teamcraft/commit/55a6474))
* fixed performance issue with list index change and deletion ([611547b](https://github.com/Supamiu/ffxiv-teamcraft/commit/611547b))
* fixed performance issues with search page ([79270b7](https://github.com/Supamiu/ffxiv-teamcraft/commit/79270b7))
* fixed position and style issues with reduction popup ([d7730a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7730a2))
* fixed precraft pricing in pricing mode ([800fae5](https://github.com/Supamiu/ffxiv-teamcraft/commit/800fae5))
* fixed some drag and drop issues, including timeline jitter in simulator ([7765d9e](https://github.com/Supamiu/ffxiv-teamcraft/commit/7765d9e)), closes [#422](https://github.com/Supamiu/ffxiv-teamcraft/issues/422)
* fixed some issues with pricing mode ([b7029d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/b7029d6))
* fixed some translations for teams ([28bb6f7](https://github.com/Supamiu/ffxiv-teamcraft/commit/28bb6f7))
* fixed the levequests page ([2ce73d0](https://github.com/Supamiu/ffxiv-teamcraft/commit/2ce73d0))
* fixed width issue with consumable selectors in simulator ([5945008](https://github.com/Supamiu/ffxiv-teamcraft/commit/5945008))
* fixed wrong link in search page intro list ([5d02cb2](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d02cb2))
* fixes for FC-wide permissions ([9694320](https://github.com/Supamiu/ffxiv-teamcraft/commit/9694320))
* fixes for list progression checks ([8b718c7](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b718c7))
* fixes related to firebase auth update ([009fd0d](https://github.com/Supamiu/ffxiv-teamcraft/commit/009fd0d))
* fixes some styles and lists regeneration ([90a1ca6](https://github.com/Supamiu/ffxiv-teamcraft/commit/90a1ca6))
* fixes to the webhook system ([4ca9f69](https://github.com/Supamiu/ffxiv-teamcraft/commit/4ca9f69))
* forgot to convert date to eorzean date in timer restauration ([03ea454](https://github.com/Supamiu/ffxiv-teamcraft/commit/03ea454))
* hide share button in simulator for non-persisted rotations ([9543b38](https://github.com/Supamiu/ffxiv-teamcraft/commit/9543b38))
* HQ icon now appears properly for items required in end crafts on mobile size ([5e25d22](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e25d22))
* last small fixes for beta compliance ([dbd2fc4](https://github.com/Supamiu/ffxiv-teamcraft/commit/dbd2fc4))
* layout index changes now save properly ([11604a9](https://github.com/Supamiu/ffxiv-teamcraft/commit/11604a9))
* lint fixes for build process ([29f55f5](https://github.com/Supamiu/ffxiv-teamcraft/commit/29f55f5))
* List UI style problems on small screens ([3348300](https://github.com/Supamiu/ffxiv-teamcraft/commit/3348300)), closes [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473) [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473)
* no server history message ([a98605e](https://github.com/Supamiu/ffxiv-teamcraft/commit/a98605e))
* notification markdown ([4f6183e](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f6183e))
* selected job not saved in custom rotation ([4d15caf](https://github.com/Supamiu/ffxiv-teamcraft/commit/4d15caf)), closes [#455](https://github.com/Supamiu/ffxiv-teamcraft/issues/455)
* show as dirty if you're using a non-persisted rotation ([237dd96](https://github.com/Supamiu/ffxiv-teamcraft/commit/237dd96))
* **macro-translator:** force quotes for korean translations ([dd69a7c](https://github.com/Supamiu/ffxiv-teamcraft/commit/dd69a7c))
* show simulator button only if the item has a recipe ([c4dc282](https://github.com/Supamiu/ffxiv-teamcraft/commit/c4dc282))
* small fixes for general UX ([7cacddb](https://github.com/Supamiu/ffxiv-teamcraft/commit/7cacddb))
* various fixes for alarms and gathering location ([90bff65](https://github.com/Supamiu/ffxiv-teamcraft/commit/90bff65))
* various fixes to the alarm styles ([9691eec](https://github.com/Supamiu/ffxiv-teamcraft/commit/9691eec))
* you can now apply up to 3 commissions at a time without a high rate ([99912a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/99912a2))
* you cannot delete the lists you added as favorite anymore ([a8c41b6](https://github.com/Supamiu/ffxiv-teamcraft/commit/a8c41b6))


### Features

* ability to remove item from a list in list panel ([026c6ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/026c6ac)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* **desktop:** new toggle button in settings to always have Teamcraft on top ([ddd4351](https://github.com/Supamiu/ffxiv-teamcraft/commit/ddd4351))
* "collapse when done" layout option ([765385b](https://github.com/Supamiu/ffxiv-teamcraft/commit/765385b))
* "regenerate all lists" button in lists page ([40c5aac](https://github.com/Supamiu/ffxiv-teamcraft/commit/40c5aac))
* 4.4 data and support for positions on npcs for trades and vendors ([bdd4a30](https://github.com/Supamiu/ffxiv-teamcraft/commit/bdd4a30)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to change item amount from list details view ([ddf4914](https://github.com/Supamiu/ffxiv-teamcraft/commit/ddf4914))
* ability to check an item as "working on it" ([ac8fd9b](https://github.com/Supamiu/ffxiv-teamcraft/commit/ac8fd9b)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to delete an alarm group and its alarms at the same time ([1bc30a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/1bc30a2))
* ability to have a note on lists ([afd4f1f](https://github.com/Supamiu/ffxiv-teamcraft/commit/afd4f1f)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to mark a list as community list ([0bc21ea](https://github.com/Supamiu/ffxiv-teamcraft/commit/0bc21ea)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to mark an item as required HQ manually ([5cb6b27](https://github.com/Supamiu/ffxiv-teamcraft/commit/5cb6b27)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to mute/unmute alarms from alarms page ([92a684a](https://github.com/Supamiu/ffxiv-teamcraft/commit/92a684a))
* about page ([ceba34d](https://github.com/Supamiu/ffxiv-teamcraft/commit/ceba34d))
* action tooltips ([8d0d5a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8d0d5a1))
* add alarm logic to the item row component ([852ec61](https://github.com/Supamiu/ffxiv-teamcraft/commit/852ec61))
* add button to logout in the character association dialog box when it's mandatory ([3ea450b](https://github.com/Supamiu/ffxiv-teamcraft/commit/3ea450b))
* add commission creation date in the commission panel and details ([935b223](https://github.com/Supamiu/ffxiv-teamcraft/commit/935b223))
* add filters and sorting to levequests ([a1fc2bc](https://github.com/Supamiu/ffxiv-teamcraft/commit/a1fc2bc))
* add list regeneration feature ([852261c](https://github.com/Supamiu/ffxiv-teamcraft/commit/852261c))
* add new God of Hand tier patreon supporter to loading screen ([14821e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/14821e4))
* add support for crystals tracking in layout system ([e164020](https://github.com/Supamiu/ffxiv-teamcraft/commit/e164020)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* add support for different layout types ([a675a38](https://github.com/Supamiu/ffxiv-teamcraft/commit/a675a38)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* add support for fcId in database storage (useful for rules) ([eb86c1a](https://github.com/Supamiu/ffxiv-teamcraft/commit/eb86c1a))
* add support for trade sources icon ([aa89104](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa89104)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* add tag to outdated lists in /lists page ([86bf6f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/86bf6f0))
* added all the buttons for item details (except the trade one), no dialog details for now ([a37fe03](https://github.com/Supamiu/ffxiv-teamcraft/commit/a37fe03)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* added closest aetheryte to gatheredBy details popup ([7cb86b1](https://github.com/Supamiu/ffxiv-teamcraft/commit/7cb86b1))
* added delete button for workshops ([e1ad6c0](https://github.com/Supamiu/ffxiv-teamcraft/commit/e1ad6c0))
* added enter key listener for list amount edition validation ([4ce7b5e](https://github.com/Supamiu/ffxiv-teamcraft/commit/4ce7b5e))
* added language selector inside topbar, hidden in mobile view ([8bddb14](https://github.com/Supamiu/ffxiv-teamcraft/commit/8bddb14))
* added search page files and anonymous warning message ([e2346c2](https://github.com/Supamiu/ffxiv-teamcraft/commit/e2346c2))
* added support for recipe layout options in layout dialog ([83c0a56](https://github.com/Supamiu/ffxiv-teamcraft/commit/83c0a56))
* added warning message for community lists without tags ([7a51267](https://github.com/Supamiu/ffxiv-teamcraft/commit/7a51267))
* alarm options and fixes for hoursBefore option ([f1c143f](https://github.com/Supamiu/ffxiv-teamcraft/commit/f1c143f))
* alarms bell service now implemented properly ([4c0d173](https://github.com/Supamiu/ffxiv-teamcraft/commit/4c0d173))
* alarms page cleanup, user friendly messages and loader ([ce4827b](https://github.com/Supamiu/ffxiv-teamcraft/commit/ce4827b))
* alarms page finished ! ([1ee5faf](https://github.com/Supamiu/ffxiv-teamcraft/commit/1ee5faf))
* alarms persistence system done. ([3293441](https://github.com/Supamiu/ffxiv-teamcraft/commit/3293441))
* alarms sidebar now complete ([9ef67c4](https://github.com/Supamiu/ffxiv-teamcraft/commit/9ef67c4))
* alarms sidebar now shows coords for each alarm ([c37e024](https://github.com/Supamiu/ffxiv-teamcraft/commit/c37e024))
* amount display for crystals ([8afffaa](https://github.com/Supamiu/ffxiv-teamcraft/commit/8afffaa))
* amount modification in list panels ([50edd50](https://github.com/Supamiu/ffxiv-teamcraft/commit/50edd50))
* base template for layout system, WIP ([3aa52da](https://github.com/Supamiu/ffxiv-teamcraft/commit/3aa52da))
* better performances for tags adjustments ([207fd92](https://github.com/Supamiu/ffxiv-teamcraft/commit/207fd92))
* better support for default consumables in rotations ([e22d94f](https://github.com/Supamiu/ffxiv-teamcraft/commit/e22d94f))
* big performance improvements for big lists ([4304bdf](https://github.com/Supamiu/ffxiv-teamcraft/commit/4304bdf))
* button on alarm card to copy ingame alarm macro ([724ba8c](https://github.com/Supamiu/ffxiv-teamcraft/commit/724ba8c))
* calculator button for easy add/remove operations ([586d8e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/586d8e6)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* change rotation button inside simulator ([8981554](https://github.com/Supamiu/ffxiv-teamcraft/commit/8981554))
* character verification in profile editor ([6a0c9a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a0c9a1))
* checkboxes and bulk addition in search, plus lists state fixes ([7976f56](https://github.com/Supamiu/ffxiv-teamcraft/commit/7976f56))
* commission board history ([d2554d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/d2554d6)), closes [#519](https://github.com/Supamiu/ffxiv-teamcraft/issues/519)
* community lists page ([c1ed79f](https://github.com/Supamiu/ffxiv-teamcraft/commit/c1ed79f))
* contacts system in the profile editor page ([cb11388](https://github.com/Supamiu/ffxiv-teamcraft/commit/cb11388)), closes [#571](https://github.com/Supamiu/ffxiv-teamcraft/issues/571)
* defined notifications language on team level ([6f44e85](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f44e85))
* delete button for characters in profile editor ([9cb7ec1](https://github.com/Supamiu/ffxiv-teamcraft/commit/9cb7ec1))
* display amount of unread notifications in sidebar ([ca9ee6a](https://github.com/Supamiu/ffxiv-teamcraft/commit/ca9ee6a))
* drag and drop system for lists, needs polish ([14bcf3e](https://github.com/Supamiu/ffxiv-teamcraft/commit/14bcf3e))
* ephemeral lists deletion system ([6109333](https://github.com/Supamiu/ffxiv-teamcraft/commit/6109333))
* error message for outdated lists when you can't regenerate it by yourself ([71c3652](https://github.com/Supamiu/ffxiv-teamcraft/commit/71c3652))
* FC-wide permissions ([a80cdb6](https://github.com/Supamiu/ffxiv-teamcraft/commit/a80cdb6))
* ffxivgardening.com links ! ([aa0da9b](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa0da9b))
* ffxivgathering links for seeds ([5ba7364](https://github.com/Supamiu/ffxiv-teamcraft/commit/5ba7364))
* first basic implementation of list details page ([81b3a27](https://github.com/Supamiu/ffxiv-teamcraft/commit/81b3a27))
* first draft for electron version ([ed24cf8](https://github.com/Supamiu/ffxiv-teamcraft/commit/ed24cf8))
* first implementation of alarms page ([32600c1](https://github.com/Supamiu/ffxiv-teamcraft/commit/32600c1))
* first implementation of gathering-location page ([d6006ad](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6006ad))
* first implementation of settings popup, few things to put inside of it for now ([aa97e3d](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa97e3d))
* first implementation of workshop state fragment and a bit of template ([535bd61](https://github.com/Supamiu/ffxiv-teamcraft/commit/535bd61))
* first iteration for monster drop details ([183b55e](https://github.com/Supamiu/ffxiv-teamcraft/commit/183b55e)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* first part of rotations page ([1b2f77d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b2f77d))
* first part of simulator ready for testing ([bd965fa](https://github.com/Supamiu/ffxiv-teamcraft/commit/bd965fa))
* first part of the character verification system ([695c156](https://github.com/Supamiu/ffxiv-teamcraft/commit/695c156))
* first part of the profile editor page ([2f653d5](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f653d5))
* first pass for teams system: ([1b39cce](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b39cce))
* first pass for the new notifications system, now we need something to use it ! :D ([4569c6c](https://github.com/Supamiu/ffxiv-teamcraft/commit/4569c6c))
* fixes to navbar links and topbar icons ([1809bbf](https://github.com/Supamiu/ffxiv-teamcraft/commit/1809bbf))
* gathering details popup ! ([5e6e1ad](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e6e1ad))
* gathering location page polish + alarms tweak to have one alarm per node instead of per spawn ([c8fe642](https://github.com/Supamiu/ffxiv-teamcraft/commit/c8fe642))
* gil transaction log now shown on archived commissions ([b5ff24d](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5ff24d)), closes [#469](https://github.com/Supamiu/ffxiv-teamcraft/issues/469)
* group lists by workshop in lists merge popup ([d73d080](https://github.com/Supamiu/ffxiv-teamcraft/commit/d73d080))
* groups implementation done, with clean drag and drop behavior. ([6a51369](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a51369))
* implemented classic register/login ([e956f8e](https://github.com/Supamiu/ffxiv-teamcraft/commit/e956f8e))
* implemented some of the buttons inside right panel in simulator ([94ce913](https://github.com/Supamiu/ffxiv-teamcraft/commit/94ce913))
* informations about required folklore in alarms page ([256418f](https://github.com/Supamiu/ffxiv-teamcraft/commit/256418f)), closes [#614](https://github.com/Supamiu/ffxiv-teamcraft/issues/614)
* instance details popup ([fd94ee5](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd94ee5)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* integrated timer and first tests for alarms state management ([5bc8a9b](https://github.com/Supamiu/ffxiv-teamcraft/commit/5bc8a9b))
* inventory view ([2cef59a](https://github.com/Supamiu/ffxiv-teamcraft/commit/2cef59a)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* isearch macro copy button ([5ff0d68](https://github.com/Supamiu/ffxiv-teamcraft/commit/5ff0d68))
* item relationships (requires/requiredBy) dialog box ([43affd3](https://github.com/Supamiu/ffxiv-teamcraft/commit/43affd3))
* item row states (craftable, has all base ingredients) ([ff3782e](https://github.com/Supamiu/ffxiv-teamcraft/commit/ff3782e))
* KO support in macro translator ([41710bf](https://github.com/Supamiu/ffxiv-teamcraft/commit/41710bf))
* layout export button ([bec2ac7](https://github.com/Supamiu/ffxiv-teamcraft/commit/bec2ac7))
* layout import ([b1b7012](https://github.com/Supamiu/ffxiv-teamcraft/commit/b1b7012))
* levequests ([f7ffe4d](https://github.com/Supamiu/ffxiv-teamcraft/commit/f7ffe4d))
* levequests page improvements ([a6d3425](https://github.com/Supamiu/ffxiv-teamcraft/commit/a6d3425))
* list history dialog box ([6acea36](https://github.com/Supamiu/ffxiv-teamcraft/commit/6acea36)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* list reset button ([507c7b2](https://github.com/Supamiu/ffxiv-teamcraft/commit/507c7b2)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* list tracking is now properly linked to teams system ([9c3b83c](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c3b83c))
* list-panel component and list state logic ([6f5cc6c](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f5cc6c))
* lists merge support ([c78c4ca](https://github.com/Supamiu/ffxiv-teamcraft/commit/c78c4ca))
* login implementation for oauth ([117e78a](https://github.com/Supamiu/ffxiv-teamcraft/commit/117e78a))
* macro translator ([0f57211](https://github.com/Supamiu/ffxiv-teamcraft/commit/0f57211))
* marketboard button now available in search page ([6721188](https://github.com/Supamiu/ffxiv-teamcraft/commit/6721188))
* marketboard details box now includes history ([5376561](https://github.com/Supamiu/ffxiv-teamcraft/commit/5376561))
* marketboard informations system ([137575a](https://github.com/Supamiu/ffxiv-teamcraft/commit/137575a))
* migrated craft job icons to xivapi set ([6c28f06](https://github.com/Supamiu/ffxiv-teamcraft/commit/6c28f06))
* migrated map system to use only map ids ([a2f3ff4](https://github.com/Supamiu/ffxiv-teamcraft/commit/a2f3ff4)), closes [#261](https://github.com/Supamiu/ffxiv-teamcraft/issues/261)
* migrating users storage from firebase to firestore ([3b78672](https://github.com/Supamiu/ffxiv-teamcraft/commit/3b78672))
* more details for crystals ! ([ab0ed2a](https://github.com/Supamiu/ffxiv-teamcraft/commit/ab0ed2a)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* more details for gathering informations ([a886bd2](https://github.com/Supamiu/ffxiv-teamcraft/commit/a886bd2))
* more details for ventures and alarms ([c12f22f](https://github.com/Supamiu/ffxiv-teamcraft/commit/c12f22f))
* more display stuff for notifications system ([76258a7](https://github.com/Supamiu/ffxiv-teamcraft/commit/76258a7))
* more monsters location data ([723952c](https://github.com/Supamiu/ffxiv-teamcraft/commit/723952c))
* more position data ! ([3f05f6b](https://github.com/Supamiu/ffxiv-teamcraft/commit/3f05f6b))
* more progression on simulator ([bc1b9a0](https://github.com/Supamiu/ffxiv-teamcraft/commit/bc1b9a0))
* more skeleton parts for the simulator page ([7f050ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/7f050ac))
* multiple nodes spawning at the same time pop multiple notifications ([1e3419b](https://github.com/Supamiu/ffxiv-teamcraft/commit/1e3419b)), closes [#430](https://github.com/Supamiu/ffxiv-teamcraft/issues/430)
* new --native-topbar (or -nt) launch flag for native window decorator ([3494ee2](https://github.com/Supamiu/ffxiv-teamcraft/commit/3494ee2)), closes [#531](https://github.com/Supamiu/ffxiv-teamcraft/issues/531)
* new "add all alarms for this item" menu option ([e457dcc](https://github.com/Supamiu/ffxiv-teamcraft/commit/e457dcc))
* new $10 patreon supporter name in loading messages ([5e56e3a](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e56e3a))
* new closestAetheryte pipe ([5421c60](https://github.com/Supamiu/ffxiv-teamcraft/commit/5421c60))
* new comments system is now available ([a4ae9ff](https://github.com/Supamiu/ffxiv-teamcraft/commit/a4ae9ff)), closes [#572](https://github.com/Supamiu/ffxiv-teamcraft/issues/572) [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576) [#625](https://github.com/Supamiu/ffxiv-teamcraft/issues/625)
* new favorites system ([4e3c015](https://github.com/Supamiu/ffxiv-teamcraft/commit/4e3c015)), closes [#574](https://github.com/Supamiu/ffxiv-teamcraft/issues/574)
* new history system for lists to see who added/removed things ([41527d7](https://github.com/Supamiu/ffxiv-teamcraft/commit/41527d7)), closes [#435](https://github.com/Supamiu/ffxiv-teamcraft/issues/435)
* new layout configuration modal ([d6c68c0](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6c68c0)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* new permissions system is now ready ! ([28a2046](https://github.com/Supamiu/ffxiv-teamcraft/commit/28a2046))
* new progress popup service for easy progression display ([6dcf7f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/6dcf7f0))
* new search box inside lists page ([b751f12](https://github.com/Supamiu/ffxiv-teamcraft/commit/b751f12))
* new team system with assignable items and notifications ([75ff821](https://github.com/Supamiu/ffxiv-teamcraft/commit/75ff821)), closes [#463](https://github.com/Supamiu/ffxiv-teamcraft/issues/463)
* new teams system is now complete and ready to be tested ! ([034cd4d](https://github.com/Supamiu/ffxiv-teamcraft/commit/034cd4d)), closes [#573](https://github.com/Supamiu/ffxiv-teamcraft/issues/573)
* notification now shown when public list is commented ([4163eb6](https://github.com/Supamiu/ffxiv-teamcraft/commit/4163eb6)), closes [#279](https://github.com/Supamiu/ffxiv-teamcraft/issues/279)
* notifications badge is now a counter ([7aa637d](https://github.com/Supamiu/ffxiv-teamcraft/commit/7aa637d))
* optimized compact lists even more by removing useless finalItems details ([3602e99](https://github.com/Supamiu/ffxiv-teamcraft/commit/3602e99))
* optimized navigation map ([47fd5d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/47fd5d8))
* persistence and more template for layouts system ([5437018](https://github.com/Supamiu/ffxiv-teamcraft/commit/5437018))
* pricing mode v5 is now ready to be tested ([6a223e7](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a223e7))
* progress on search page, still needs some features ([0a105e9](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a105e9)), closes [#569](https://github.com/Supamiu/ffxiv-teamcraft/issues/569)
* proper compacts system for powerful perfs in /lists and /community-lists ([e515a67](https://github.com/Supamiu/ffxiv-teamcraft/commit/e515a67))
* proper implementation for lists reordering using ngx-dnd ([1cd9c41](https://github.com/Supamiu/ffxiv-teamcraft/commit/1cd9c41))
* proper intro for search page ([df0215d](https://github.com/Supamiu/ffxiv-teamcraft/commit/df0215d))
* proper support for lists not found and list deletion ([b115d58](https://github.com/Supamiu/ffxiv-teamcraft/commit/b115d58))
* public profile page ([85d9e18](https://github.com/Supamiu/ffxiv-teamcraft/commit/85d9e18))
* recipe selection for custom rotations ([cbf049c](https://github.com/Supamiu/ffxiv-teamcraft/commit/cbf049c))
* reduction details popup ([f3d9b24](https://github.com/Supamiu/ffxiv-teamcraft/commit/f3d9b24))
* registration migrated to 5.0 ([d3ce1e1](https://github.com/Supamiu/ffxiv-teamcraft/commit/d3ce1e1))
* rename rotation button in rotation panel ([6f88fd8](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f88fd8))
* rename team and remove members is now possible ([a06428b](https://github.com/Supamiu/ffxiv-teamcraft/commit/a06428b))
* reworked tags dialog box ([bdd0eb7](https://github.com/Supamiu/ffxiv-teamcraft/commit/bdd0eb7)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* right clicking on a timer button now creates an alarm in default group without opening menu ([4f75486](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f75486))
* rotations favorite system ([8e3b7f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8e3b7f1))
* rotations picker for simulator ([4efeb2e](https://github.com/Supamiu/ffxiv-teamcraft/commit/4efeb2e))
* rotations state fragment and more ([2f1ba6e](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f1ba6e))
* search menu moved under the home button in sidebar ([fcfd34c](https://github.com/Supamiu/ffxiv-teamcraft/commit/fcfd34c))
* search page with shareable urls, still work to do but this is a first step ([2796ce9](https://github.com/Supamiu/ffxiv-teamcraft/commit/2796ce9)), closes [#569](https://github.com/Supamiu/ffxiv-teamcraft/issues/569)
* search system linked with list state ([1c14de7](https://github.com/Supamiu/ffxiv-teamcraft/commit/1c14de7))
* separate category for community lists in lists page ([8c89ce9](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c89ce9))
* show thresholds in simulator for collectibility and satisfaction ratings ([d5ebe67](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5ebe67)), closes [#503](https://github.com/Supamiu/ffxiv-teamcraft/issues/503)
* simulator is now totally ready for production ([156a4f6](https://github.com/Supamiu/ffxiv-teamcraft/commit/156a4f6))
* skeleton components for simulator rework ([cc5e8a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/cc5e8a1))
* snapshot mode support and icons for the buttons ([1c62b8d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1c62b8d))
* social buttons in sidebar ([d51f10b](https://github.com/Supamiu/ffxiv-teamcraft/commit/d51f10b))
* specialist toggle now adds/removes 20/20 properly ([9677bf2](https://github.com/Supamiu/ffxiv-teamcraft/commit/9677bf2))
* standard simulator yay ! ([1b72492](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b72492))
* stats edition in profile editor ([fa98a3e](https://github.com/Supamiu/ffxiv-teamcraft/commit/fa98a3e))
* support for "add all alarms at once" button ([3027430](https://github.com/Supamiu/ffxiv-teamcraft/commit/3027430)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for advanced search filters in search page ([baad9ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/baad9ab)), closes [#569](https://github.com/Supamiu/ffxiv-teamcraft/issues/569)
* support for better hook messages with fancy stuff ([1ae3731](https://github.com/Supamiu/ffxiv-teamcraft/commit/1ae3731))
* support for consumables and custom recipe configuration ([afec763](https://github.com/Supamiu/ffxiv-teamcraft/commit/afec763))
* support for hide completed/used rows in layouts system ([df4cb45](https://github.com/Supamiu/ffxiv-teamcraft/commit/df4cb45)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for Ingenuity 1 and 2 inside simulator ([5d540a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d540a2))
* support for korean accounts ([0ffa949](https://github.com/Supamiu/ffxiv-teamcraft/commit/0ffa949)), closes [#639](https://github.com/Supamiu/ffxiv-teamcraft/issues/639)
* support for list clone button ([c91e805](https://github.com/Supamiu/ffxiv-teamcraft/commit/c91e805)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for masterbook icons ([23922b3](https://github.com/Supamiu/ffxiv-teamcraft/commit/23922b3)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for multiple recipes for a single item inside final items ([371b1c6](https://github.com/Supamiu/ffxiv-teamcraft/commit/371b1c6))
* support for reduction node alarms ([733619e](https://github.com/Supamiu/ffxiv-teamcraft/commit/733619e)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for reductions in gathering locations page ([1bc3998](https://github.com/Supamiu/ffxiv-teamcraft/commit/1bc3998))
* support for stats modification inside simulator, first part of consumables configuration ([04d3421](https://github.com/Supamiu/ffxiv-teamcraft/commit/04d3421))
* support for verification inside permissions system ([f982a58](https://github.com/Supamiu/ffxiv-teamcraft/commit/f982a58))
* support for verification status in user picker dialog box ([d5e9510](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5e9510))
* total price in trades popup ([d7b0993](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7b0993))
* total price popup ([bfe2759](https://github.com/Supamiu/ffxiv-teamcraft/commit/bfe2759))
* trade details popup ([f92760c](https://github.com/Supamiu/ffxiv-teamcraft/commit/f92760c))
* updated simulator to add next tier theorical values ([d50cdd9](https://github.com/Supamiu/ffxiv-teamcraft/commit/d50cdd9))
* vendors details popup ([eabec3b](https://github.com/Supamiu/ffxiv-teamcraft/commit/eabec3b)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ventures details popup ([78ef657](https://github.com/Supamiu/ffxiv-teamcraft/commit/78ef657))
* voyage details popup ([d7c2a12](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7c2a12))
* warning for missing masterbook with easy addition to profile ([bd5fe35](https://github.com/Supamiu/ffxiv-teamcraft/commit/bd5fe35))
* workshop system & small revamp of lists storage in state ([f8afc52](https://github.com/Supamiu/ffxiv-teamcraft/commit/f8afc52))
* workshops are now listed in the list-picker ([c9b391c](https://github.com/Supamiu/ffxiv-teamcraft/commit/c9b391c))
* workshops ordering using drag and drop ([e87c875](https://github.com/Supamiu/ffxiv-teamcraft/commit/e87c875))
* WRITE permission implementation for the workshops ([5b5899e](https://github.com/Supamiu/ffxiv-teamcraft/commit/5b5899e))
* you can now add all alarms for a given list using a single button ([7e58675](https://github.com/Supamiu/ffxiv-teamcraft/commit/7e58675)), closes [#465](https://github.com/Supamiu/ffxiv-teamcraft/issues/465)
* you can now add notes to your alarms ([fac1a42](https://github.com/Supamiu/ffxiv-teamcraft/commit/fac1a42)), closes [#431](https://github.com/Supamiu/ffxiv-teamcraft/issues/431)
* you can now assign a list to a team ! ([66ff6f2](https://github.com/Supamiu/ffxiv-teamcraft/commit/66ff6f2))
* you can now choose your preferred copy mode (item name or /isearch) ([13064cf](https://github.com/Supamiu/ffxiv-teamcraft/commit/13064cf))
* you can now copy item names in pricing mode too ([3a7db42](https://github.com/Supamiu/ffxiv-teamcraft/commit/3a7db42))
* **pricing:** add toggle button to switch math to formulas that think you'll sell everything ([3d2495e](https://github.com/Supamiu/ffxiv-teamcraft/commit/3d2495e))



<a name="5.0.0-beta.2"></a>
# [5.0.0-beta.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.9...v5.0.0-beta.2) (2018-12-02)


### Bug Fixes

* "create all alarms" no longer creates cluster alarms ([fd3a4de](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd3a4de))


### Features

* custom alarms support ([3dd8c97](https://github.com/Supamiu/ffxiv-teamcraft/commit/3dd8c97)), closes [#587](https://github.com/Supamiu/ffxiv-teamcraft/issues/587)



<a name="5.0.0-beta.1"></a>
# 5.0.0-beta.1 (2018-12-02)


### Bug Fixes

* added a "not found" message for rotations not found ([f7a164a](https://github.com/Supamiu/ffxiv-teamcraft/commit/f7a164a))
* added a guard for list update sometimes breaking the list in compact mode ([34e9538](https://github.com/Supamiu/ffxiv-teamcraft/commit/34e9538))
* alarms in sidebar no longer ordered by group ([51cb94d](https://github.com/Supamiu/ffxiv-teamcraft/commit/51cb94d))
* anonymous commissions ([2a37246](https://github.com/Supamiu/ffxiv-teamcraft/commit/2a37246)), closes [#533](https://github.com/Supamiu/ffxiv-teamcraft/issues/533)
* beta is now properly connected to the beta database ([ec7f070](https://github.com/Supamiu/ffxiv-teamcraft/commit/ec7f070))
* better handling of multiple lists deletion in a short time ([342fbb0](https://github.com/Supamiu/ffxiv-teamcraft/commit/342fbb0))
* better loading management for lists page ([2f47121](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f47121))
* better messages for teams tracking hook system ([a7016b3](https://github.com/Supamiu/ffxiv-teamcraft/commit/a7016b3))
* better support for characters not added yet in xivapi ([a60e7f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/a60e7f1))
* changing alarm group mute state wont collapse panel anymore ([983e3bd](https://github.com/Supamiu/ffxiv-teamcraft/commit/983e3bd))
* custom recipe params now applied as they are changed ([10df578](https://github.com/Supamiu/ffxiv-teamcraft/commit/10df578))
* display message on user not found in user picker ([86e3d1e](https://github.com/Supamiu/ffxiv-teamcraft/commit/86e3d1e))
* fix for alarms spawn state not being handled properly ([fcf6fd0](https://github.com/Supamiu/ffxiv-teamcraft/commit/fcf6fd0))
* fix for drag and drop issues inside simulator ([2efc0ec](https://github.com/Supamiu/ffxiv-teamcraft/commit/2efc0ec))
* fixed a bug showing a warning inside macro popup while it shouldn't ([4747299](https://github.com/Supamiu/ffxiv-teamcraft/commit/4747299))
* fixed a bug where "select all" button would stay selected but not link to any list ([4b5ba19](https://github.com/Supamiu/ffxiv-teamcraft/commit/4b5ba19))
* fixed a bug with consumables being applied twice in some cases ([e9ef0da](https://github.com/Supamiu/ffxiv-teamcraft/commit/e9ef0da))
* fixed a bug with simulator and ingenuity in lower level crafts ([9c817f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c817f0))
* fixed a double notification issue for team member assignment ([90d6e20](https://github.com/Supamiu/ffxiv-teamcraft/commit/90d6e20))
* fixed a missing translation in alarms creation ([f9a44d0](https://github.com/Supamiu/ffxiv-teamcraft/commit/f9a44d0))
* fixed a priority issue on pricing system ([7da5c31](https://github.com/Supamiu/ffxiv-teamcraft/commit/7da5c31))
* fixed a small issue with alarms page ([9cb6992](https://github.com/Supamiu/ffxiv-teamcraft/commit/9cb6992))
* fixed a wrong translation key for hook messages ([0695f1a](https://github.com/Supamiu/ffxiv-teamcraft/commit/0695f1a))
* fixed an error in console inside teams page ([96eeb99](https://github.com/Supamiu/ffxiv-teamcraft/commit/96eeb99))
* fixed an error poping inside lists page for deleted lists in workshops ([4dbf100](https://github.com/Supamiu/ffxiv-teamcraft/commit/4dbf100))
* fixed an issue hiding the sidebar on mobile ([f0473e0](https://github.com/Supamiu/ffxiv-teamcraft/commit/f0473e0))
* fixed an issue making min stats popup freeze tab ([983e3a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/983e3a2))
* fixed an issue making prices a bit off in pricing mode ([08b698b](https://github.com/Supamiu/ffxiv-teamcraft/commit/08b698b))
* fixed an issue making register on google button show an unrelated error ([9fcd167](https://github.com/Supamiu/ffxiv-teamcraft/commit/9fcd167))
* fixed an issue preventing alarms from ringing ([f46d715](https://github.com/Supamiu/ffxiv-teamcraft/commit/f46d715))
* fixed an issue preventing anonymous user from using cross-class skills in simulator ([7708ecb](https://github.com/Supamiu/ffxiv-teamcraft/commit/7708ecb))
* fixed an issue preventing anonymous users to load a list ([e6834bd](https://github.com/Supamiu/ffxiv-teamcraft/commit/e6834bd))
* fixed an issue preventing gathering location page to create alarms ([69ac345](https://github.com/Supamiu/ffxiv-teamcraft/commit/69ac345)), closes [#478](https://github.com/Supamiu/ffxiv-teamcraft/issues/478)
* fixed an issue preventing korean users to register properly ([d361b78](https://github.com/Supamiu/ffxiv-teamcraft/commit/d361b78))
* fixed an issue preventing user update save in db ([700c3ea](https://github.com/Supamiu/ffxiv-teamcraft/commit/700c3ea))
* fixed an issue preventing users from saving their books in some conditions ([e4b7311](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4b7311))
* fixed an issue that was applying rating to both users ([fab53c3](https://github.com/Supamiu/ffxiv-teamcraft/commit/fab53c3))
* fixed an issue with airship crafts not added properly ([f5c604e](https://github.com/Supamiu/ffxiv-teamcraft/commit/f5c604e))
* fixed an issue with alarms not being deleted properly ([1b9a84d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b9a84d))
* fixed an issue with alarms not having proper map id ([7c9c44a](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c9c44a))
* fixed an issue with alarms not ringing properly ([a2780f8](https://github.com/Supamiu/ffxiv-teamcraft/commit/a2780f8))
* fixed an issue with amount modification breaking lists ([7c73073](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c73073))
* fixed an issue with books not being saved in profile page ([449a353](https://github.com/Supamiu/ffxiv-teamcraft/commit/449a353))
* fixed an issue with change detection inside pricing mode ([0a9a690](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a9a690))
* fixed an issue with favorite rotations not showing properly ([e434dd1](https://github.com/Supamiu/ffxiv-teamcraft/commit/e434dd1))
* fixed an issue with first login creating an infinite loading for character informations ([8d704f4](https://github.com/Supamiu/ffxiv-teamcraft/commit/8d704f4))
* fixed an issue with freshly created accounts ([258ece9](https://github.com/Supamiu/ffxiv-teamcraft/commit/258ece9))
* fixed an issue with HQ icon on new xivapi market data structure ([23f2281](https://github.com/Supamiu/ffxiv-teamcraft/commit/23f2281))
* fixed an issue with item addition in lists ([6086d87](https://github.com/Supamiu/ffxiv-teamcraft/commit/6086d87))
* fixed an issue with korean accounts stats popup in profile ([7b754df](https://github.com/Supamiu/ffxiv-teamcraft/commit/7b754df))
* fixed an issue with layout panel deletion ([597dec1](https://github.com/Supamiu/ffxiv-teamcraft/commit/597dec1))
* fixed an issue with list export format not being correct ([34d7d43](https://github.com/Supamiu/ffxiv-teamcraft/commit/34d7d43))
* fixed an issue with list picker when not logged in ([0142e5d](https://github.com/Supamiu/ffxiv-teamcraft/commit/0142e5d))
* fixed an issue with list regeneration ([827bedb](https://github.com/Supamiu/ffxiv-teamcraft/commit/827bedb))
* fixed an issue with lists ordering and drag and drop ([15b38a7](https://github.com/Supamiu/ffxiv-teamcraft/commit/15b38a7))
* fixed an issue with lists page when you have no teams ([ed7e094](https://github.com/Supamiu/ffxiv-teamcraft/commit/ed7e094))
* fixed an issue with migrated rotations not opening properly ([c71bf88](https://github.com/Supamiu/ffxiv-teamcraft/commit/c71bf88))
* fixed an issue with non-recipe items added to lists crashing the GCF ([5eec159](https://github.com/Supamiu/ffxiv-teamcraft/commit/5eec159))
* fixed an issue with rotation export ([a956f48](https://github.com/Supamiu/ffxiv-teamcraft/commit/a956f48))
* fixed an issue with rotation picker and masterbooks ([46d41c7](https://github.com/Supamiu/ffxiv-teamcraft/commit/46d41c7))
* fixed an issue with settings page not being shown properly ([995f38b](https://github.com/Supamiu/ffxiv-teamcraft/commit/995f38b))
* fixed an issue with simulator not using proper icons for some actions ([eba5a07](https://github.com/Supamiu/ffxiv-teamcraft/commit/eba5a07))
* fixed an issue with simulator stats not applying properly on form submit ([91f4a6a](https://github.com/Supamiu/ffxiv-teamcraft/commit/91f4a6a))
* fixed an issue with some wrong translation variable bindings ([3c3df56](https://github.com/Supamiu/ffxiv-teamcraft/commit/3c3df56))
* fixed an issue with team invite notifications not showing properly ([8ebd5ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/8ebd5ab))
* fixed an issue with teams not being properly handled ([cd2a4e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/cd2a4e6))
* fixed an issue with trade-related filters in layouts ([30374d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/30374d8)), closes [#477](https://github.com/Supamiu/ffxiv-teamcraft/issues/477)
* fixed blank space in lists page ([e5ee64e](https://github.com/Supamiu/ffxiv-teamcraft/commit/e5ee64e))
* fixed display of lists page on mobile ([29a49cb](https://github.com/Supamiu/ffxiv-teamcraft/commit/29a49cb))
* fixed double anonymous warning error ([29fe271](https://github.com/Supamiu/ffxiv-teamcraft/commit/29fe271))
* fixed empty alarms page message placement ([af51afc](https://github.com/Supamiu/ffxiv-teamcraft/commit/af51afc))
* fixed error messages being shown when trying to log in using oauth ([d23428d](https://github.com/Supamiu/ffxiv-teamcraft/commit/d23428d))
* fixed false error in GCF ([4bc0155](https://github.com/Supamiu/ffxiv-teamcraft/commit/4bc0155))
* fixed firebase warning message at startup ([ffebefb](https://github.com/Supamiu/ffxiv-teamcraft/commit/ffebefb))
* fixed inventory view width ([fa378aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/fa378aa)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* fixed list duplicates if you are the owner of a FC-wide shared list ([57ccac9](https://github.com/Supamiu/ffxiv-teamcraft/commit/57ccac9))
* fixed list picker to handle cancellation better ([55a6474](https://github.com/Supamiu/ffxiv-teamcraft/commit/55a6474))
* fixed performance issue with list index change and deletion ([611547b](https://github.com/Supamiu/ffxiv-teamcraft/commit/611547b))
* fixed performance issues with search page ([79270b7](https://github.com/Supamiu/ffxiv-teamcraft/commit/79270b7))
* fixed position and style issues with reduction popup ([d7730a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7730a2))
* fixed precraft pricing in pricing mode ([800fae5](https://github.com/Supamiu/ffxiv-teamcraft/commit/800fae5))
* fixed some drag and drop issues, including timeline jitter in simulator ([7765d9e](https://github.com/Supamiu/ffxiv-teamcraft/commit/7765d9e)), closes [#422](https://github.com/Supamiu/ffxiv-teamcraft/issues/422)
* fixed some issues with pricing mode ([b7029d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/b7029d6))
* fixed some translations for teams ([28bb6f7](https://github.com/Supamiu/ffxiv-teamcraft/commit/28bb6f7))
* fixed the levequests page ([2ce73d0](https://github.com/Supamiu/ffxiv-teamcraft/commit/2ce73d0))
* fixed width issue with consumable selectors in simulator ([5945008](https://github.com/Supamiu/ffxiv-teamcraft/commit/5945008))
* fixed wrong link in search page intro list ([5d02cb2](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d02cb2))
* fixes for FC-wide permissions ([9694320](https://github.com/Supamiu/ffxiv-teamcraft/commit/9694320))
* fixes for list progression checks ([8b718c7](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b718c7))
* fixes related to firebase auth update ([009fd0d](https://github.com/Supamiu/ffxiv-teamcraft/commit/009fd0d))
* fixes some styles and lists regeneration ([90a1ca6](https://github.com/Supamiu/ffxiv-teamcraft/commit/90a1ca6))
* fixes to the webhook system ([4ca9f69](https://github.com/Supamiu/ffxiv-teamcraft/commit/4ca9f69))
* forgot to convert date to eorzean date in timer restauration ([03ea454](https://github.com/Supamiu/ffxiv-teamcraft/commit/03ea454))
* hide share button in simulator for non-persisted rotations ([9543b38](https://github.com/Supamiu/ffxiv-teamcraft/commit/9543b38))
* HQ icon now appears properly for items required in end crafts on mobile size ([5e25d22](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e25d22))
* last small fixes for beta compliance ([dbd2fc4](https://github.com/Supamiu/ffxiv-teamcraft/commit/dbd2fc4))
* layout index changes now save properly ([11604a9](https://github.com/Supamiu/ffxiv-teamcraft/commit/11604a9))
* lint fixes for build process ([29f55f5](https://github.com/Supamiu/ffxiv-teamcraft/commit/29f55f5))
* List UI style problems on small screens ([3348300](https://github.com/Supamiu/ffxiv-teamcraft/commit/3348300)), closes [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473) [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473)
* no server history message ([a98605e](https://github.com/Supamiu/ffxiv-teamcraft/commit/a98605e))
* notification markdown ([4f6183e](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f6183e))
* selected job not saved in custom rotation ([4d15caf](https://github.com/Supamiu/ffxiv-teamcraft/commit/4d15caf)), closes [#455](https://github.com/Supamiu/ffxiv-teamcraft/issues/455)
* show as dirty if you're using a non-persisted rotation ([237dd96](https://github.com/Supamiu/ffxiv-teamcraft/commit/237dd96))
* **macro-translator:** force quotes for korean translations ([dd69a7c](https://github.com/Supamiu/ffxiv-teamcraft/commit/dd69a7c))
* show simulator button only if the item has a recipe ([c4dc282](https://github.com/Supamiu/ffxiv-teamcraft/commit/c4dc282))
* small fixes for general UX ([7cacddb](https://github.com/Supamiu/ffxiv-teamcraft/commit/7cacddb))
* various fixes for alarms and gathering location ([90bff65](https://github.com/Supamiu/ffxiv-teamcraft/commit/90bff65))
* various fixes to the alarm styles ([9691eec](https://github.com/Supamiu/ffxiv-teamcraft/commit/9691eec))
* you can now apply up to 3 commissions at a time without a high rate ([99912a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/99912a2))
* you cannot delete the lists you added as favorite anymore ([a8c41b6](https://github.com/Supamiu/ffxiv-teamcraft/commit/a8c41b6))


### Features

* ability to remove item from a list in list panel ([026c6ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/026c6ac)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* **desktop:** new toggle button in settings to always have Teamcraft on top ([ddd4351](https://github.com/Supamiu/ffxiv-teamcraft/commit/ddd4351))
* "collapse when done" layout option ([765385b](https://github.com/Supamiu/ffxiv-teamcraft/commit/765385b))
* "regenerate all lists" button in lists page ([40c5aac](https://github.com/Supamiu/ffxiv-teamcraft/commit/40c5aac))
* 4.4 data and support for positions on npcs for trades and vendors ([bdd4a30](https://github.com/Supamiu/ffxiv-teamcraft/commit/bdd4a30)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to change item amount from list details view ([ddf4914](https://github.com/Supamiu/ffxiv-teamcraft/commit/ddf4914))
* ability to check an item as "working on it" ([ac8fd9b](https://github.com/Supamiu/ffxiv-teamcraft/commit/ac8fd9b)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to delete an alarm group and its alarms at the same time ([1bc30a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/1bc30a2))
* ability to have a note on lists ([afd4f1f](https://github.com/Supamiu/ffxiv-teamcraft/commit/afd4f1f)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to mark a list as community list ([0bc21ea](https://github.com/Supamiu/ffxiv-teamcraft/commit/0bc21ea)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to mark an item as required HQ manually ([5cb6b27](https://github.com/Supamiu/ffxiv-teamcraft/commit/5cb6b27)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to mute/unmute alarms from alarms page ([92a684a](https://github.com/Supamiu/ffxiv-teamcraft/commit/92a684a))
* about page ([ceba34d](https://github.com/Supamiu/ffxiv-teamcraft/commit/ceba34d))
* action tooltips ([8d0d5a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8d0d5a1))
* add alarm logic to the item row component ([852ec61](https://github.com/Supamiu/ffxiv-teamcraft/commit/852ec61))
* add button to logout in the character association dialog box when it's mandatory ([3ea450b](https://github.com/Supamiu/ffxiv-teamcraft/commit/3ea450b))
* add commission creation date in the commission panel and details ([935b223](https://github.com/Supamiu/ffxiv-teamcraft/commit/935b223))
* add filters and sorting to levequests ([a1fc2bc](https://github.com/Supamiu/ffxiv-teamcraft/commit/a1fc2bc))
* add list regeneration feature ([852261c](https://github.com/Supamiu/ffxiv-teamcraft/commit/852261c))
* add new God of Hand tier patreon supporter to loading screen ([14821e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/14821e4))
* add support for crystals tracking in layout system ([e164020](https://github.com/Supamiu/ffxiv-teamcraft/commit/e164020)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* add support for different layout types ([a675a38](https://github.com/Supamiu/ffxiv-teamcraft/commit/a675a38)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* add support for fcId in database storage (useful for rules) ([eb86c1a](https://github.com/Supamiu/ffxiv-teamcraft/commit/eb86c1a))
* add support for trade sources icon ([aa89104](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa89104)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* add tag to outdated lists in /lists page ([86bf6f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/86bf6f0))
* added all the buttons for item details (except the trade one), no dialog details for now ([a37fe03](https://github.com/Supamiu/ffxiv-teamcraft/commit/a37fe03)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* added closest aetheryte to gatheredBy details popup ([7cb86b1](https://github.com/Supamiu/ffxiv-teamcraft/commit/7cb86b1))
* added delete button for workshops ([e1ad6c0](https://github.com/Supamiu/ffxiv-teamcraft/commit/e1ad6c0))
* added enter key listener for list amount edition validation ([4ce7b5e](https://github.com/Supamiu/ffxiv-teamcraft/commit/4ce7b5e))
* added language selector inside topbar, hidden in mobile view ([8bddb14](https://github.com/Supamiu/ffxiv-teamcraft/commit/8bddb14))
* added search page files and anonymous warning message ([e2346c2](https://github.com/Supamiu/ffxiv-teamcraft/commit/e2346c2))
* added support for recipe layout options in layout dialog ([83c0a56](https://github.com/Supamiu/ffxiv-teamcraft/commit/83c0a56))
* added warning message for community lists without tags ([7a51267](https://github.com/Supamiu/ffxiv-teamcraft/commit/7a51267))
* alarm options and fixes for hoursBefore option ([f1c143f](https://github.com/Supamiu/ffxiv-teamcraft/commit/f1c143f))
* alarms bell service now implemented properly ([4c0d173](https://github.com/Supamiu/ffxiv-teamcraft/commit/4c0d173))
* alarms page cleanup, user friendly messages and loader ([ce4827b](https://github.com/Supamiu/ffxiv-teamcraft/commit/ce4827b))
* alarms page finished ! ([1ee5faf](https://github.com/Supamiu/ffxiv-teamcraft/commit/1ee5faf))
* alarms persistence system done. ([3293441](https://github.com/Supamiu/ffxiv-teamcraft/commit/3293441))
* alarms sidebar now complete ([9ef67c4](https://github.com/Supamiu/ffxiv-teamcraft/commit/9ef67c4))
* alarms sidebar now shows coords for each alarm ([c37e024](https://github.com/Supamiu/ffxiv-teamcraft/commit/c37e024))
* amount display for crystals ([8afffaa](https://github.com/Supamiu/ffxiv-teamcraft/commit/8afffaa))
* amount modification in list panels ([50edd50](https://github.com/Supamiu/ffxiv-teamcraft/commit/50edd50))
* base template for layout system, WIP ([3aa52da](https://github.com/Supamiu/ffxiv-teamcraft/commit/3aa52da))
* better performances for tags adjustments ([207fd92](https://github.com/Supamiu/ffxiv-teamcraft/commit/207fd92))
* better support for default consumables in rotations ([e22d94f](https://github.com/Supamiu/ffxiv-teamcraft/commit/e22d94f))
* big performance improvements for big lists ([4304bdf](https://github.com/Supamiu/ffxiv-teamcraft/commit/4304bdf))
* button on alarm card to copy ingame alarm macro ([724ba8c](https://github.com/Supamiu/ffxiv-teamcraft/commit/724ba8c))
* calculator button for easy add/remove operations ([586d8e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/586d8e6)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* change rotation button inside simulator ([8981554](https://github.com/Supamiu/ffxiv-teamcraft/commit/8981554))
* character verification in profile editor ([6a0c9a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a0c9a1))
* checkboxes and bulk addition in search, plus lists state fixes ([7976f56](https://github.com/Supamiu/ffxiv-teamcraft/commit/7976f56))
* commission board history ([d2554d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/d2554d6)), closes [#519](https://github.com/Supamiu/ffxiv-teamcraft/issues/519)
* community lists page ([c1ed79f](https://github.com/Supamiu/ffxiv-teamcraft/commit/c1ed79f))
* contacts system in the profile editor page ([cb11388](https://github.com/Supamiu/ffxiv-teamcraft/commit/cb11388)), closes [#571](https://github.com/Supamiu/ffxiv-teamcraft/issues/571)
* defined notifications language on team level ([6f44e85](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f44e85))
* delete button for characters in profile editor ([9cb7ec1](https://github.com/Supamiu/ffxiv-teamcraft/commit/9cb7ec1))
* display amount of unread notifications in sidebar ([ca9ee6a](https://github.com/Supamiu/ffxiv-teamcraft/commit/ca9ee6a))
* drag and drop system for lists, needs polish ([14bcf3e](https://github.com/Supamiu/ffxiv-teamcraft/commit/14bcf3e))
* ephemeral lists deletion system ([6109333](https://github.com/Supamiu/ffxiv-teamcraft/commit/6109333))
* error message for outdated lists when you can't regenerate it by yourself ([71c3652](https://github.com/Supamiu/ffxiv-teamcraft/commit/71c3652))
* FC-wide permissions ([a80cdb6](https://github.com/Supamiu/ffxiv-teamcraft/commit/a80cdb6))
* ffxivgardening.com links ! ([aa0da9b](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa0da9b))
* ffxivgathering links for seeds ([5ba7364](https://github.com/Supamiu/ffxiv-teamcraft/commit/5ba7364))
* first basic implementation of list details page ([81b3a27](https://github.com/Supamiu/ffxiv-teamcraft/commit/81b3a27))
* first draft for electron version ([ed24cf8](https://github.com/Supamiu/ffxiv-teamcraft/commit/ed24cf8))
* first implementation of alarms page ([32600c1](https://github.com/Supamiu/ffxiv-teamcraft/commit/32600c1))
* first implementation of gathering-location page ([d6006ad](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6006ad))
* first implementation of settings popup, few things to put inside of it for now ([aa97e3d](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa97e3d))
* first implementation of workshop state fragment and a bit of template ([535bd61](https://github.com/Supamiu/ffxiv-teamcraft/commit/535bd61))
* first iteration for monster drop details ([183b55e](https://github.com/Supamiu/ffxiv-teamcraft/commit/183b55e)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* first part of rotations page ([1b2f77d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b2f77d))
* first part of simulator ready for testing ([bd965fa](https://github.com/Supamiu/ffxiv-teamcraft/commit/bd965fa))
* first part of the character verification system ([695c156](https://github.com/Supamiu/ffxiv-teamcraft/commit/695c156))
* first part of the profile editor page ([2f653d5](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f653d5))
* first pass for teams system: ([1b39cce](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b39cce))
* first pass for the new notifications system, now we need something to use it ! :D ([4569c6c](https://github.com/Supamiu/ffxiv-teamcraft/commit/4569c6c))
* fixes to navbar links and topbar icons ([1809bbf](https://github.com/Supamiu/ffxiv-teamcraft/commit/1809bbf))
* gathering details popup ! ([5e6e1ad](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e6e1ad))
* gathering location page polish + alarms tweak to have one alarm per node instead of per spawn ([c8fe642](https://github.com/Supamiu/ffxiv-teamcraft/commit/c8fe642))
* gil transaction log now shown on archived commissions ([b5ff24d](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5ff24d)), closes [#469](https://github.com/Supamiu/ffxiv-teamcraft/issues/469)
* group lists by workshop in lists merge popup ([d73d080](https://github.com/Supamiu/ffxiv-teamcraft/commit/d73d080))
* groups implementation done, with clean drag and drop behavior. ([6a51369](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a51369))
* implemented classic register/login ([e956f8e](https://github.com/Supamiu/ffxiv-teamcraft/commit/e956f8e))
* implemented some of the buttons inside right panel in simulator ([94ce913](https://github.com/Supamiu/ffxiv-teamcraft/commit/94ce913))
* informations about required folklore in alarms page ([256418f](https://github.com/Supamiu/ffxiv-teamcraft/commit/256418f)), closes [#614](https://github.com/Supamiu/ffxiv-teamcraft/issues/614)
* instance details popup ([fd94ee5](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd94ee5)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* integrated timer and first tests for alarms state management ([5bc8a9b](https://github.com/Supamiu/ffxiv-teamcraft/commit/5bc8a9b))
* inventory view ([2cef59a](https://github.com/Supamiu/ffxiv-teamcraft/commit/2cef59a)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* isearch macro copy button ([5ff0d68](https://github.com/Supamiu/ffxiv-teamcraft/commit/5ff0d68))
* item relationships (requires/requiredBy) dialog box ([43affd3](https://github.com/Supamiu/ffxiv-teamcraft/commit/43affd3))
* item row states (craftable, has all base ingredients) ([ff3782e](https://github.com/Supamiu/ffxiv-teamcraft/commit/ff3782e))
* KO support in macro translator ([41710bf](https://github.com/Supamiu/ffxiv-teamcraft/commit/41710bf))
* layout import ([b1b7012](https://github.com/Supamiu/ffxiv-teamcraft/commit/b1b7012))
* levequests ([f7ffe4d](https://github.com/Supamiu/ffxiv-teamcraft/commit/f7ffe4d))
* levequests page improvements ([a6d3425](https://github.com/Supamiu/ffxiv-teamcraft/commit/a6d3425))
* list history dialog box ([6acea36](https://github.com/Supamiu/ffxiv-teamcraft/commit/6acea36)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* list reset button ([507c7b2](https://github.com/Supamiu/ffxiv-teamcraft/commit/507c7b2)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* list tracking is now properly linked to teams system ([9c3b83c](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c3b83c))
* list-panel component and list state logic ([6f5cc6c](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f5cc6c))
* lists merge support ([c78c4ca](https://github.com/Supamiu/ffxiv-teamcraft/commit/c78c4ca))
* login implementation for oauth ([117e78a](https://github.com/Supamiu/ffxiv-teamcraft/commit/117e78a))
* macro translator ([0f57211](https://github.com/Supamiu/ffxiv-teamcraft/commit/0f57211))
* marketboard button now available in search page ([6721188](https://github.com/Supamiu/ffxiv-teamcraft/commit/6721188))
* marketboard details box now includes history ([5376561](https://github.com/Supamiu/ffxiv-teamcraft/commit/5376561))
* marketboard informations system ([137575a](https://github.com/Supamiu/ffxiv-teamcraft/commit/137575a))
* migrated craft job icons to xivapi set ([6c28f06](https://github.com/Supamiu/ffxiv-teamcraft/commit/6c28f06))
* migrated map system to use only map ids ([a2f3ff4](https://github.com/Supamiu/ffxiv-teamcraft/commit/a2f3ff4)), closes [#261](https://github.com/Supamiu/ffxiv-teamcraft/issues/261)
* migrating users storage from firebase to firestore ([3b78672](https://github.com/Supamiu/ffxiv-teamcraft/commit/3b78672))
* more details for crystals ! ([ab0ed2a](https://github.com/Supamiu/ffxiv-teamcraft/commit/ab0ed2a)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* more details for gathering informations ([a886bd2](https://github.com/Supamiu/ffxiv-teamcraft/commit/a886bd2))
* more details for ventures and alarms ([c12f22f](https://github.com/Supamiu/ffxiv-teamcraft/commit/c12f22f))
* more display stuff for notifications system ([76258a7](https://github.com/Supamiu/ffxiv-teamcraft/commit/76258a7))
* more monsters location data ([723952c](https://github.com/Supamiu/ffxiv-teamcraft/commit/723952c))
* more position data ! ([3f05f6b](https://github.com/Supamiu/ffxiv-teamcraft/commit/3f05f6b))
* more progression on simulator ([bc1b9a0](https://github.com/Supamiu/ffxiv-teamcraft/commit/bc1b9a0))
* more skeleton parts for the simulator page ([7f050ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/7f050ac))
* multiple nodes spawning at the same time pop multiple notifications ([1e3419b](https://github.com/Supamiu/ffxiv-teamcraft/commit/1e3419b)), closes [#430](https://github.com/Supamiu/ffxiv-teamcraft/issues/430)
* new --native-topbar (or -nt) launch flag for native window decorator ([3494ee2](https://github.com/Supamiu/ffxiv-teamcraft/commit/3494ee2)), closes [#531](https://github.com/Supamiu/ffxiv-teamcraft/issues/531)
* new "add all alarms for this item" menu option ([e457dcc](https://github.com/Supamiu/ffxiv-teamcraft/commit/e457dcc))
* new $10 patreon supporter name in loading messages ([5e56e3a](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e56e3a))
* new closestAetheryte pipe ([5421c60](https://github.com/Supamiu/ffxiv-teamcraft/commit/5421c60))
* new comments system is now available ([a4ae9ff](https://github.com/Supamiu/ffxiv-teamcraft/commit/a4ae9ff)), closes [#572](https://github.com/Supamiu/ffxiv-teamcraft/issues/572) [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576) [#625](https://github.com/Supamiu/ffxiv-teamcraft/issues/625)
* new favorites system ([4e3c015](https://github.com/Supamiu/ffxiv-teamcraft/commit/4e3c015)), closes [#574](https://github.com/Supamiu/ffxiv-teamcraft/issues/574)
* new history system for lists to see who added/removed things ([41527d7](https://github.com/Supamiu/ffxiv-teamcraft/commit/41527d7)), closes [#435](https://github.com/Supamiu/ffxiv-teamcraft/issues/435)
* new layout configuration modal ([d6c68c0](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6c68c0)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* new permissions system is now ready ! ([28a2046](https://github.com/Supamiu/ffxiv-teamcraft/commit/28a2046))
* new progress popup service for easy progression display ([6dcf7f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/6dcf7f0))
* new search box inside lists page ([b751f12](https://github.com/Supamiu/ffxiv-teamcraft/commit/b751f12))
* new team system with assignable items and notifications ([75ff821](https://github.com/Supamiu/ffxiv-teamcraft/commit/75ff821)), closes [#463](https://github.com/Supamiu/ffxiv-teamcraft/issues/463)
* new teams system is now complete and ready to be tested ! ([034cd4d](https://github.com/Supamiu/ffxiv-teamcraft/commit/034cd4d)), closes [#573](https://github.com/Supamiu/ffxiv-teamcraft/issues/573)
* notification now shown when public list is commented ([4163eb6](https://github.com/Supamiu/ffxiv-teamcraft/commit/4163eb6)), closes [#279](https://github.com/Supamiu/ffxiv-teamcraft/issues/279)
* notifications badge is now a counter ([7aa637d](https://github.com/Supamiu/ffxiv-teamcraft/commit/7aa637d))
* optimized compact lists even more by removing useless finalItems details ([3602e99](https://github.com/Supamiu/ffxiv-teamcraft/commit/3602e99))
* optimized navigation map ([47fd5d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/47fd5d8))
* persistence and more template for layouts system ([5437018](https://github.com/Supamiu/ffxiv-teamcraft/commit/5437018))
* pricing mode v5 is now ready to be tested ([6a223e7](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a223e7))
* progress on search page, still needs some features ([0a105e9](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a105e9)), closes [#569](https://github.com/Supamiu/ffxiv-teamcraft/issues/569)
* proper compacts system for powerful perfs in /lists and /community-lists ([e515a67](https://github.com/Supamiu/ffxiv-teamcraft/commit/e515a67))
* proper implementation for lists reordering using ngx-dnd ([1cd9c41](https://github.com/Supamiu/ffxiv-teamcraft/commit/1cd9c41))
* proper intro for search page ([df0215d](https://github.com/Supamiu/ffxiv-teamcraft/commit/df0215d))
* proper support for lists not found and list deletion ([b115d58](https://github.com/Supamiu/ffxiv-teamcraft/commit/b115d58))
* public profile page ([85d9e18](https://github.com/Supamiu/ffxiv-teamcraft/commit/85d9e18))
* recipe selection for custom rotations ([cbf049c](https://github.com/Supamiu/ffxiv-teamcraft/commit/cbf049c))
* reduction details popup ([f3d9b24](https://github.com/Supamiu/ffxiv-teamcraft/commit/f3d9b24))
* registration migrated to 5.0 ([d3ce1e1](https://github.com/Supamiu/ffxiv-teamcraft/commit/d3ce1e1))
* rename rotation button in rotation panel ([6f88fd8](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f88fd8))
* rename team and remove members is now possible ([a06428b](https://github.com/Supamiu/ffxiv-teamcraft/commit/a06428b))
* reworked tags dialog box ([bdd0eb7](https://github.com/Supamiu/ffxiv-teamcraft/commit/bdd0eb7)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* right clicking on a timer button now creates an alarm in default group without opening menu ([4f75486](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f75486))
* rotations favorite system ([8e3b7f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8e3b7f1))
* rotations picker for simulator ([4efeb2e](https://github.com/Supamiu/ffxiv-teamcraft/commit/4efeb2e))
* rotations state fragment and more ([2f1ba6e](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f1ba6e))
* search menu moved under the home button in sidebar ([fcfd34c](https://github.com/Supamiu/ffxiv-teamcraft/commit/fcfd34c))
* search page with shareable urls, still work to do but this is a first step ([2796ce9](https://github.com/Supamiu/ffxiv-teamcraft/commit/2796ce9)), closes [#569](https://github.com/Supamiu/ffxiv-teamcraft/issues/569)
* search system linked with list state ([1c14de7](https://github.com/Supamiu/ffxiv-teamcraft/commit/1c14de7))
* separate category for community lists in lists page ([8c89ce9](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c89ce9))
* show thresholds in simulator for collectibility and satisfaction ratings ([d5ebe67](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5ebe67)), closes [#503](https://github.com/Supamiu/ffxiv-teamcraft/issues/503)
* simulator is now totally ready for production ([156a4f6](https://github.com/Supamiu/ffxiv-teamcraft/commit/156a4f6))
* skeleton components for simulator rework ([cc5e8a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/cc5e8a1))
* snapshot mode support and icons for the buttons ([1c62b8d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1c62b8d))
* social buttons in sidebar ([d51f10b](https://github.com/Supamiu/ffxiv-teamcraft/commit/d51f10b))
* specialist toggle now adds/removes 20/20 properly ([9677bf2](https://github.com/Supamiu/ffxiv-teamcraft/commit/9677bf2))
* standard simulator yay ! ([1b72492](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b72492))
* stats edition in profile editor ([fa98a3e](https://github.com/Supamiu/ffxiv-teamcraft/commit/fa98a3e))
* support for "add all alarms at once" button ([3027430](https://github.com/Supamiu/ffxiv-teamcraft/commit/3027430)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for advanced search filters in search page ([baad9ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/baad9ab)), closes [#569](https://github.com/Supamiu/ffxiv-teamcraft/issues/569)
* support for better hook messages with fancy stuff ([1ae3731](https://github.com/Supamiu/ffxiv-teamcraft/commit/1ae3731))
* support for consumables and custom recipe configuration ([afec763](https://github.com/Supamiu/ffxiv-teamcraft/commit/afec763))
* support for hide completed/used rows in layouts system ([df4cb45](https://github.com/Supamiu/ffxiv-teamcraft/commit/df4cb45)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for Ingenuity 1 and 2 inside simulator ([5d540a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d540a2))
* support for korean accounts ([0ffa949](https://github.com/Supamiu/ffxiv-teamcraft/commit/0ffa949)), closes [#639](https://github.com/Supamiu/ffxiv-teamcraft/issues/639)
* support for list clone button ([c91e805](https://github.com/Supamiu/ffxiv-teamcraft/commit/c91e805)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for masterbook icons ([23922b3](https://github.com/Supamiu/ffxiv-teamcraft/commit/23922b3)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for multiple recipes for a single item inside final items ([371b1c6](https://github.com/Supamiu/ffxiv-teamcraft/commit/371b1c6))
* support for reduction node alarms ([733619e](https://github.com/Supamiu/ffxiv-teamcraft/commit/733619e)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for reductions in gathering locations page ([1bc3998](https://github.com/Supamiu/ffxiv-teamcraft/commit/1bc3998))
* support for stats modification inside simulator, first part of consumables configuration ([04d3421](https://github.com/Supamiu/ffxiv-teamcraft/commit/04d3421))
* support for verification inside permissions system ([f982a58](https://github.com/Supamiu/ffxiv-teamcraft/commit/f982a58))
* support for verification status in user picker dialog box ([d5e9510](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5e9510))
* total price in trades popup ([d7b0993](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7b0993))
* total price popup ([bfe2759](https://github.com/Supamiu/ffxiv-teamcraft/commit/bfe2759))
* trade details popup ([f92760c](https://github.com/Supamiu/ffxiv-teamcraft/commit/f92760c))
* updated simulator to add next tier theorical values ([d50cdd9](https://github.com/Supamiu/ffxiv-teamcraft/commit/d50cdd9))
* vendors details popup ([eabec3b](https://github.com/Supamiu/ffxiv-teamcraft/commit/eabec3b)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ventures details popup ([78ef657](https://github.com/Supamiu/ffxiv-teamcraft/commit/78ef657))
* voyage details popup ([d7c2a12](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7c2a12))
* warning for missing masterbook with easy addition to profile ([bd5fe35](https://github.com/Supamiu/ffxiv-teamcraft/commit/bd5fe35))
* workshop system & small revamp of lists storage in state ([f8afc52](https://github.com/Supamiu/ffxiv-teamcraft/commit/f8afc52))
* workshops are now listed in the list-picker ([c9b391c](https://github.com/Supamiu/ffxiv-teamcraft/commit/c9b391c))
* workshops ordering using drag and drop ([e87c875](https://github.com/Supamiu/ffxiv-teamcraft/commit/e87c875))
* WRITE permission implementation for the workshops ([5b5899e](https://github.com/Supamiu/ffxiv-teamcraft/commit/5b5899e))
* you can now add all alarms for a given list using a single button ([7e58675](https://github.com/Supamiu/ffxiv-teamcraft/commit/7e58675)), closes [#465](https://github.com/Supamiu/ffxiv-teamcraft/issues/465)
* you can now add notes to your alarms ([fac1a42](https://github.com/Supamiu/ffxiv-teamcraft/commit/fac1a42)), closes [#431](https://github.com/Supamiu/ffxiv-teamcraft/issues/431)
* you can now assign a list to a team ! ([66ff6f2](https://github.com/Supamiu/ffxiv-teamcraft/commit/66ff6f2))
* you can now choose your preferred copy mode (item name or /isearch) ([13064cf](https://github.com/Supamiu/ffxiv-teamcraft/commit/13064cf))
* you can now copy item names in pricing mode too ([3a7db42](https://github.com/Supamiu/ffxiv-teamcraft/commit/3a7db42))
* **pricing:** add toggle button to switch math to formulas that think you'll sell everything ([3d2495e](https://github.com/Supamiu/ffxiv-teamcraft/commit/3d2495e))



<a name="5.0.0-beta.1"></a>
# [5.0.0-beta.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.9...v5.0.0-beta.1) (2018-12-01)

### Features

 - "Generate all alarms for this list" button now properly creates a group for the list.
 - Added a menu option to generate all alarms for a given item.
 - Added an option inside settings page to change between isearch and classic name copy on item name click.

### Bug Fixes

 - Fixed every bugs reported in the #beta channel, no proper changelog for now as I needed to dump old stuff in last beta step's changelog.


<a name="5.0.0-beta.0"></a>
# [5.1.0-beta.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.9...v5.1.0-beta.0) (2018-11-30)


**This is the first iteration of Teamcraft v5 beta, changelog is pretty simple: rewrote everything with ngrx, firestore, ant design and better UX.**

### Bug Fixes

* added a "not found" message for rotations not found ([f7a164a](https://github.com/Supamiu/ffxiv-teamcraft/commit/f7a164a))
* added a guard for list update sometimes breaking the list in compact mode ([34e9538](https://github.com/Supamiu/ffxiv-teamcraft/commit/34e9538))
* alarms in sidebar no longer ordered by group ([51cb94d](https://github.com/Supamiu/ffxiv-teamcraft/commit/51cb94d))
* anonymous commissions ([2a37246](https://github.com/Supamiu/ffxiv-teamcraft/commit/2a37246)), closes [#533](https://github.com/Supamiu/ffxiv-teamcraft/issues/533)
* beta is now properly connected to the beta database ([ec7f070](https://github.com/Supamiu/ffxiv-teamcraft/commit/ec7f070))
* better handling of multiple lists deletion in a short time ([342fbb0](https://github.com/Supamiu/ffxiv-teamcraft/commit/342fbb0))
* better loading management for lists page ([2f47121](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f47121))
* better messages for teams tracking hook system ([a7016b3](https://github.com/Supamiu/ffxiv-teamcraft/commit/a7016b3))
* better support for characters not added yet in xivapi ([a60e7f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/a60e7f1))
* changing alarm group mute state wont collapse panel anymore ([983e3bd](https://github.com/Supamiu/ffxiv-teamcraft/commit/983e3bd))
* custom recipe params now applied as they are changed ([10df578](https://github.com/Supamiu/ffxiv-teamcraft/commit/10df578))
* display message on user not found in user picker ([86e3d1e](https://github.com/Supamiu/ffxiv-teamcraft/commit/86e3d1e))
* fix for alarms spawn state not being handled properly ([fcf6fd0](https://github.com/Supamiu/ffxiv-teamcraft/commit/fcf6fd0))
* fix for drag and drop issues inside simulator ([2efc0ec](https://github.com/Supamiu/ffxiv-teamcraft/commit/2efc0ec))
* fixed a bug where "select all" button would stay selected but not link to any list ([4b5ba19](https://github.com/Supamiu/ffxiv-teamcraft/commit/4b5ba19))
* fixed a bug with consumables being applied twice in some cases ([e9ef0da](https://github.com/Supamiu/ffxiv-teamcraft/commit/e9ef0da))
* fixed a double notification issue for team member assignment ([90d6e20](https://github.com/Supamiu/ffxiv-teamcraft/commit/90d6e20))
* fixed a missing translation in alarms creation ([f9a44d0](https://github.com/Supamiu/ffxiv-teamcraft/commit/f9a44d0))
* fixed a priority issue on pricing system ([7da5c31](https://github.com/Supamiu/ffxiv-teamcraft/commit/7da5c31))
* fixed a small issue with alarms page ([9cb6992](https://github.com/Supamiu/ffxiv-teamcraft/commit/9cb6992))
* fixed a wrong translation key for hook messages ([0695f1a](https://github.com/Supamiu/ffxiv-teamcraft/commit/0695f1a))
* fixed an error in console inside teams page ([96eeb99](https://github.com/Supamiu/ffxiv-teamcraft/commit/96eeb99))
* fixed an error poping inside lists page for deleted lists in workshops ([4dbf100](https://github.com/Supamiu/ffxiv-teamcraft/commit/4dbf100))
* fixed an issue hiding the sidebar on mobile ([f0473e0](https://github.com/Supamiu/ffxiv-teamcraft/commit/f0473e0))
* fixed an issue making min stats popup freeze tab ([983e3a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/983e3a2))
* fixed an issue making prices a bit off in pricing mode ([08b698b](https://github.com/Supamiu/ffxiv-teamcraft/commit/08b698b))
* fixed an issue making register on google button show an unrelated error ([9fcd167](https://github.com/Supamiu/ffxiv-teamcraft/commit/9fcd167))
* fixed an issue preventing alarms from ringing ([f46d715](https://github.com/Supamiu/ffxiv-teamcraft/commit/f46d715))
* fixed an issue preventing anonymous user from using cross-class skills in simulator ([7708ecb](https://github.com/Supamiu/ffxiv-teamcraft/commit/7708ecb))
* fixed an issue preventing anonymous users to load a list ([e6834bd](https://github.com/Supamiu/ffxiv-teamcraft/commit/e6834bd))
* fixed an issue preventing gathering location page to create alarms ([69ac345](https://github.com/Supamiu/ffxiv-teamcraft/commit/69ac345)), closes [#478](https://github.com/Supamiu/ffxiv-teamcraft/issues/478)
* fixed an issue preventing korean users to register properly ([d361b78](https://github.com/Supamiu/ffxiv-teamcraft/commit/d361b78))
* fixed an issue preventing user update save in db ([700c3ea](https://github.com/Supamiu/ffxiv-teamcraft/commit/700c3ea))
* fixed an issue preventing users from saving their books in some conditions ([e4b7311](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4b7311))
* fixed an issue that was applying rating to both users ([fab53c3](https://github.com/Supamiu/ffxiv-teamcraft/commit/fab53c3))
* fixed an issue with airship crafts not added properly ([f5c604e](https://github.com/Supamiu/ffxiv-teamcraft/commit/f5c604e))
* fixed an issue with alarms not being deleted properly ([1b9a84d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b9a84d))
* fixed an issue with alarms not having proper map id ([7c9c44a](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c9c44a))
* fixed an issue with alarms not ringing properly ([a2780f8](https://github.com/Supamiu/ffxiv-teamcraft/commit/a2780f8))
* fixed an issue with amount modification breaking lists ([7c73073](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c73073))
* fixed an issue with books not being saved in profile page ([449a353](https://github.com/Supamiu/ffxiv-teamcraft/commit/449a353))
* fixed an issue with change detection inside pricing mode ([0a9a690](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a9a690))
* fixed an issue with first login creating an infinite loading for character informations ([8d704f4](https://github.com/Supamiu/ffxiv-teamcraft/commit/8d704f4))
* fixed an issue with freshly created accounts ([258ece9](https://github.com/Supamiu/ffxiv-teamcraft/commit/258ece9))
* fixed an issue with HQ icon on new xivapi market data structure ([23f2281](https://github.com/Supamiu/ffxiv-teamcraft/commit/23f2281))
* fixed an issue with item addition in lists ([6086d87](https://github.com/Supamiu/ffxiv-teamcraft/commit/6086d87))
* fixed an issue with korean accounts stats popup in profile ([7b754df](https://github.com/Supamiu/ffxiv-teamcraft/commit/7b754df))
* fixed an issue with layout panel deletion ([597dec1](https://github.com/Supamiu/ffxiv-teamcraft/commit/597dec1))
* fixed an issue with list export format not being correct ([34d7d43](https://github.com/Supamiu/ffxiv-teamcraft/commit/34d7d43))
* fixed an issue with list picker when not logged in ([0142e5d](https://github.com/Supamiu/ffxiv-teamcraft/commit/0142e5d))
* fixed an issue with list regeneration ([827bedb](https://github.com/Supamiu/ffxiv-teamcraft/commit/827bedb))
* fixed an issue with lists ordering and drag and drop ([15b38a7](https://github.com/Supamiu/ffxiv-teamcraft/commit/15b38a7))
* fixed an issue with lists page when you have no teams ([ed7e094](https://github.com/Supamiu/ffxiv-teamcraft/commit/ed7e094))
* fixed an issue with migrated rotations not opening properly ([c71bf88](https://github.com/Supamiu/ffxiv-teamcraft/commit/c71bf88))
* fixed an issue with non-recipe items added to lists crashing the GCF ([5eec159](https://github.com/Supamiu/ffxiv-teamcraft/commit/5eec159))
* fixed an issue with rotation export ([a956f48](https://github.com/Supamiu/ffxiv-teamcraft/commit/a956f48))
* fixed an issue with rotation picker and masterbooks ([46d41c7](https://github.com/Supamiu/ffxiv-teamcraft/commit/46d41c7))
* fixed an issue with settings page not being shown properly ([995f38b](https://github.com/Supamiu/ffxiv-teamcraft/commit/995f38b))
* fixed an issue with simulator not using proper icons for some actions ([eba5a07](https://github.com/Supamiu/ffxiv-teamcraft/commit/eba5a07))
* fixed an issue with simulator stats not applying properly on form submit ([91f4a6a](https://github.com/Supamiu/ffxiv-teamcraft/commit/91f4a6a))
* fixed an issue with some wrong translation variable bindings ([3c3df56](https://github.com/Supamiu/ffxiv-teamcraft/commit/3c3df56))
* fixed an issue with team invite notifications not showing properly ([8ebd5ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/8ebd5ab))
* fixed an issue with teams not being properly handled ([cd2a4e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/cd2a4e6))
* fixed an issue with trade-related filters in layouts ([30374d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/30374d8)), closes [#477](https://github.com/Supamiu/ffxiv-teamcraft/issues/477)
* fixed blank space in lists page ([e5ee64e](https://github.com/Supamiu/ffxiv-teamcraft/commit/e5ee64e))
* fixed display of lists page on mobile ([29a49cb](https://github.com/Supamiu/ffxiv-teamcraft/commit/29a49cb))
* fixed double anonymous warning error ([29fe271](https://github.com/Supamiu/ffxiv-teamcraft/commit/29fe271))
* fixed empty alarms page message placement ([af51afc](https://github.com/Supamiu/ffxiv-teamcraft/commit/af51afc))
* fixed error messages being shown when trying to log in using oauth ([d23428d](https://github.com/Supamiu/ffxiv-teamcraft/commit/d23428d))
* fixed false error in GCF ([4bc0155](https://github.com/Supamiu/ffxiv-teamcraft/commit/4bc0155))
* fixed firebase warning message at startup ([ffebefb](https://github.com/Supamiu/ffxiv-teamcraft/commit/ffebefb))
* fixed inventory view width ([fa378aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/fa378aa)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* fixed list duplicates if you are the owner of a FC-wide shared list ([57ccac9](https://github.com/Supamiu/ffxiv-teamcraft/commit/57ccac9))
* fixed list picker to handle cancellation better ([55a6474](https://github.com/Supamiu/ffxiv-teamcraft/commit/55a6474))
* fixed position and style issues with reduction popup ([d7730a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7730a2))
* fixed precraft pricing in pricing mode ([800fae5](https://github.com/Supamiu/ffxiv-teamcraft/commit/800fae5))
* fixed some drag and drop issues, including timeline jitter in simulator ([7765d9e](https://github.com/Supamiu/ffxiv-teamcraft/commit/7765d9e)), closes [#422](https://github.com/Supamiu/ffxiv-teamcraft/issues/422)
* fixed some issues with pricing mode ([b7029d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/b7029d6))
* fixed some translations for teams ([28bb6f7](https://github.com/Supamiu/ffxiv-teamcraft/commit/28bb6f7))
* fixed the levequests page ([2ce73d0](https://github.com/Supamiu/ffxiv-teamcraft/commit/2ce73d0))
* fixed width issue with consumable selectors in simulator ([5945008](https://github.com/Supamiu/ffxiv-teamcraft/commit/5945008))
* fixed wrong link in search page intro list ([5d02cb2](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d02cb2))
* fixes for FC-wide permissions ([9694320](https://github.com/Supamiu/ffxiv-teamcraft/commit/9694320))
* fixes for list progression checks ([8b718c7](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b718c7))
* fixes related to firebase auth update ([009fd0d](https://github.com/Supamiu/ffxiv-teamcraft/commit/009fd0d))
* fixes some styles and lists regeneration ([90a1ca6](https://github.com/Supamiu/ffxiv-teamcraft/commit/90a1ca6))
* fixes to the webhook system ([4ca9f69](https://github.com/Supamiu/ffxiv-teamcraft/commit/4ca9f69))
* forgot to convert date to eorzean date in timer restauration ([03ea454](https://github.com/Supamiu/ffxiv-teamcraft/commit/03ea454))
* HQ icon now appears properly for items required in end crafts on mobile size ([5e25d22](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e25d22))
* last small fixes for beta compliance ([dbd2fc4](https://github.com/Supamiu/ffxiv-teamcraft/commit/dbd2fc4))
* layout index changes now save properly ([11604a9](https://github.com/Supamiu/ffxiv-teamcraft/commit/11604a9))
* lint fixes for build process ([29f55f5](https://github.com/Supamiu/ffxiv-teamcraft/commit/29f55f5))
* List UI style problems on small screens ([3348300](https://github.com/Supamiu/ffxiv-teamcraft/commit/3348300)), closes [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473) [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473)
* no server history message ([a98605e](https://github.com/Supamiu/ffxiv-teamcraft/commit/a98605e))
* notification markdown ([4f6183e](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f6183e))
* selected job not saved in custom rotation ([4d15caf](https://github.com/Supamiu/ffxiv-teamcraft/commit/4d15caf)), closes [#455](https://github.com/Supamiu/ffxiv-teamcraft/issues/455)
* show as dirty if you're using a non-persisted rotation ([237dd96](https://github.com/Supamiu/ffxiv-teamcraft/commit/237dd96))
* show simulator button only if the item has a recipe ([c4dc282](https://github.com/Supamiu/ffxiv-teamcraft/commit/c4dc282))
* small fixes for general UX ([7cacddb](https://github.com/Supamiu/ffxiv-teamcraft/commit/7cacddb))
* **macro-translator:** force quotes for korean translations ([dd69a7c](https://github.com/Supamiu/ffxiv-teamcraft/commit/dd69a7c))
* various fixes for alarms and gathering location ([90bff65](https://github.com/Supamiu/ffxiv-teamcraft/commit/90bff65))
* various fixes to the alarm styles ([9691eec](https://github.com/Supamiu/ffxiv-teamcraft/commit/9691eec))
* you can now apply up to 3 commissions at a time without a high rate ([99912a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/99912a2))
* you cannot delete the lists you added as favorite anymore ([a8c41b6](https://github.com/Supamiu/ffxiv-teamcraft/commit/a8c41b6))


### Features

* workshops ordering using drag and drop ([e87c875](https://github.com/Supamiu/ffxiv-teamcraft/commit/e87c875))
* **desktop:** new toggle button in settings to always have Teamcraft on top ([ddd4351](https://github.com/Supamiu/ffxiv-teamcraft/commit/ddd4351))
* "collapse when done" layout option ([765385b](https://github.com/Supamiu/ffxiv-teamcraft/commit/765385b))
* "regenerate all lists" button in lists page ([40c5aac](https://github.com/Supamiu/ffxiv-teamcraft/commit/40c5aac))
* 4.4 data and support for positions on npcs for trades and vendors ([bdd4a30](https://github.com/Supamiu/ffxiv-teamcraft/commit/bdd4a30)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to change item amount from list details view ([ddf4914](https://github.com/Supamiu/ffxiv-teamcraft/commit/ddf4914))
* ability to check an item as "working on it" ([ac8fd9b](https://github.com/Supamiu/ffxiv-teamcraft/commit/ac8fd9b)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to delete an alarm group and its alarms at the same time ([1bc30a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/1bc30a2))
* ability to have a note on lists ([afd4f1f](https://github.com/Supamiu/ffxiv-teamcraft/commit/afd4f1f)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to mark a list as community list ([0bc21ea](https://github.com/Supamiu/ffxiv-teamcraft/commit/0bc21ea)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to mark an item as required HQ manually ([5cb6b27](https://github.com/Supamiu/ffxiv-teamcraft/commit/5cb6b27)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ability to mute/unmute alarms from alarms page ([92a684a](https://github.com/Supamiu/ffxiv-teamcraft/commit/92a684a))
* ability to remove item from a list in list panel ([026c6ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/026c6ac)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* about page ([ceba34d](https://github.com/Supamiu/ffxiv-teamcraft/commit/ceba34d))
* action tooltips ([8d0d5a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8d0d5a1))
* add alarm logic to the item row component ([852ec61](https://github.com/Supamiu/ffxiv-teamcraft/commit/852ec61))
* add button to logout in the character association dialog box when it's mandatory ([3ea450b](https://github.com/Supamiu/ffxiv-teamcraft/commit/3ea450b))
* add commission creation date in the commission panel and details ([935b223](https://github.com/Supamiu/ffxiv-teamcraft/commit/935b223))
* add filters and sorting to levequests ([a1fc2bc](https://github.com/Supamiu/ffxiv-teamcraft/commit/a1fc2bc))
* add list regeneration feature ([852261c](https://github.com/Supamiu/ffxiv-teamcraft/commit/852261c))
* add new God of Hand tier patreon supporter to loading screen ([14821e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/14821e4))
* add support for crystals tracking in layout system ([e164020](https://github.com/Supamiu/ffxiv-teamcraft/commit/e164020)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* add support for different layout types ([a675a38](https://github.com/Supamiu/ffxiv-teamcraft/commit/a675a38)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* add support for fcId in database storage (useful for rules) ([eb86c1a](https://github.com/Supamiu/ffxiv-teamcraft/commit/eb86c1a))
* add support for trade sources icon ([aa89104](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa89104)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* add tag to outdated lists in /lists page ([86bf6f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/86bf6f0))
* added all the buttons for item details (except the trade one), no dialog details for now ([a37fe03](https://github.com/Supamiu/ffxiv-teamcraft/commit/a37fe03)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* added closest aetheryte to gatheredBy details popup ([7cb86b1](https://github.com/Supamiu/ffxiv-teamcraft/commit/7cb86b1))
* added delete button for workshops ([e1ad6c0](https://github.com/Supamiu/ffxiv-teamcraft/commit/e1ad6c0))
* added search page files and anonymous warning message ([e2346c2](https://github.com/Supamiu/ffxiv-teamcraft/commit/e2346c2))
* added support for recipe layout options in layout dialog ([83c0a56](https://github.com/Supamiu/ffxiv-teamcraft/commit/83c0a56))
* added warning message for community lists without tags ([7a51267](https://github.com/Supamiu/ffxiv-teamcraft/commit/7a51267))
* alarm options and fixes for hoursBefore option ([f1c143f](https://github.com/Supamiu/ffxiv-teamcraft/commit/f1c143f))
* alarms bell service now implemented properly ([4c0d173](https://github.com/Supamiu/ffxiv-teamcraft/commit/4c0d173))
* alarms page cleanup, user friendly messages and loader ([ce4827b](https://github.com/Supamiu/ffxiv-teamcraft/commit/ce4827b))
* alarms page finished ! ([1ee5faf](https://github.com/Supamiu/ffxiv-teamcraft/commit/1ee5faf))
* alarms persistence system done. ([3293441](https://github.com/Supamiu/ffxiv-teamcraft/commit/3293441))
* alarms sidebar now complete ([9ef67c4](https://github.com/Supamiu/ffxiv-teamcraft/commit/9ef67c4))
* alarms sidebar now shows coords for each alarm ([c37e024](https://github.com/Supamiu/ffxiv-teamcraft/commit/c37e024))
* amount display for crystals ([8afffaa](https://github.com/Supamiu/ffxiv-teamcraft/commit/8afffaa))
* amount modification in list panels ([50edd50](https://github.com/Supamiu/ffxiv-teamcraft/commit/50edd50))
* base template for layout system, WIP ([3aa52da](https://github.com/Supamiu/ffxiv-teamcraft/commit/3aa52da))
* better performances for tags adjustments ([207fd92](https://github.com/Supamiu/ffxiv-teamcraft/commit/207fd92))
* better support for default consumables in rotations ([e22d94f](https://github.com/Supamiu/ffxiv-teamcraft/commit/e22d94f))
* big performance improvements for big lists ([4304bdf](https://github.com/Supamiu/ffxiv-teamcraft/commit/4304bdf))
* button on alarm card to copy ingame alarm macro ([724ba8c](https://github.com/Supamiu/ffxiv-teamcraft/commit/724ba8c))
* calculator button for easy add/remove operations ([586d8e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/586d8e6)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* change rotation button inside simulator ([8981554](https://github.com/Supamiu/ffxiv-teamcraft/commit/8981554))
* character verification in profile editor ([6a0c9a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a0c9a1))
* checkboxes and bulk addition in search, plus lists state fixes ([7976f56](https://github.com/Supamiu/ffxiv-teamcraft/commit/7976f56))
* commission board history ([d2554d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/d2554d6)), closes [#519](https://github.com/Supamiu/ffxiv-teamcraft/issues/519)
* community lists page ([c1ed79f](https://github.com/Supamiu/ffxiv-teamcraft/commit/c1ed79f))
* contacts system in the profile editor page ([cb11388](https://github.com/Supamiu/ffxiv-teamcraft/commit/cb11388)), closes [#571](https://github.com/Supamiu/ffxiv-teamcraft/issues/571)
* defined notifications language on team level ([6f44e85](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f44e85))
* delete button for characters in profile editor ([9cb7ec1](https://github.com/Supamiu/ffxiv-teamcraft/commit/9cb7ec1))
* display amount of unread notifications in sidebar ([ca9ee6a](https://github.com/Supamiu/ffxiv-teamcraft/commit/ca9ee6a))
* drag and drop system for lists, needs polish ([14bcf3e](https://github.com/Supamiu/ffxiv-teamcraft/commit/14bcf3e))
* ephemeral lists deletion system ([6109333](https://github.com/Supamiu/ffxiv-teamcraft/commit/6109333))
* error message for outdated lists when you can't regenerate it by yourself ([71c3652](https://github.com/Supamiu/ffxiv-teamcraft/commit/71c3652))
* FC-wide permissions ([a80cdb6](https://github.com/Supamiu/ffxiv-teamcraft/commit/a80cdb6))
* ffxivgardening.com links ! ([aa0da9b](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa0da9b))
* ffxivgathering links for seeds ([5ba7364](https://github.com/Supamiu/ffxiv-teamcraft/commit/5ba7364))
* first basic implementation of list details page ([81b3a27](https://github.com/Supamiu/ffxiv-teamcraft/commit/81b3a27))
* first draft for electron version ([ed24cf8](https://github.com/Supamiu/ffxiv-teamcraft/commit/ed24cf8))
* first implementation of alarms page ([32600c1](https://github.com/Supamiu/ffxiv-teamcraft/commit/32600c1))
* first implementation of gathering-location page ([d6006ad](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6006ad))
* first implementation of settings popup, few things to put inside of it for now ([aa97e3d](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa97e3d))
* first implementation of workshop state fragment and a bit of template ([535bd61](https://github.com/Supamiu/ffxiv-teamcraft/commit/535bd61))
* first iteration for monster drop details ([183b55e](https://github.com/Supamiu/ffxiv-teamcraft/commit/183b55e)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* first part of rotations page ([1b2f77d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b2f77d))
* first part of simulator ready for testing ([bd965fa](https://github.com/Supamiu/ffxiv-teamcraft/commit/bd965fa))
* first part of the character verification system ([695c156](https://github.com/Supamiu/ffxiv-teamcraft/commit/695c156))
* first part of the profile editor page ([2f653d5](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f653d5))
* first pass for teams system: ([1b39cce](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b39cce))
* first pass for the new notifications system, now we need something to use it ! :D ([4569c6c](https://github.com/Supamiu/ffxiv-teamcraft/commit/4569c6c))
* fixes to navbar links and topbar icons ([1809bbf](https://github.com/Supamiu/ffxiv-teamcraft/commit/1809bbf))
* gathering details popup ! ([5e6e1ad](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e6e1ad))
* gathering location page polish + alarms tweak to have one alarm per node instead of per spawn ([c8fe642](https://github.com/Supamiu/ffxiv-teamcraft/commit/c8fe642))
* gil transaction log now shown on archived commissions ([b5ff24d](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5ff24d)), closes [#469](https://github.com/Supamiu/ffxiv-teamcraft/issues/469)
* group lists by workshop in lists merge popup ([d73d080](https://github.com/Supamiu/ffxiv-teamcraft/commit/d73d080))
* groups implementation done, with clean drag and drop behavior. ([6a51369](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a51369))
* implemented classic register/login ([e956f8e](https://github.com/Supamiu/ffxiv-teamcraft/commit/e956f8e))
* implemented some of the buttons inside right panel in simulator ([94ce913](https://github.com/Supamiu/ffxiv-teamcraft/commit/94ce913))
* informations about required folklore in alarms page ([256418f](https://github.com/Supamiu/ffxiv-teamcraft/commit/256418f)), closes [#614](https://github.com/Supamiu/ffxiv-teamcraft/issues/614)
* instance details popup ([fd94ee5](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd94ee5)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* integrated timer and first tests for alarms state management ([5bc8a9b](https://github.com/Supamiu/ffxiv-teamcraft/commit/5bc8a9b))
* inventory view ([2cef59a](https://github.com/Supamiu/ffxiv-teamcraft/commit/2cef59a)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* isearch macro copy button ([5ff0d68](https://github.com/Supamiu/ffxiv-teamcraft/commit/5ff0d68))
* item relationships (requires/requiredBy) dialog box ([43affd3](https://github.com/Supamiu/ffxiv-teamcraft/commit/43affd3))
* item row states (craftable, has all base ingredients) ([ff3782e](https://github.com/Supamiu/ffxiv-teamcraft/commit/ff3782e))
* KO support in macro translator ([41710bf](https://github.com/Supamiu/ffxiv-teamcraft/commit/41710bf))
* layout export button ([bec2ac7](https://github.com/Supamiu/ffxiv-teamcraft/commit/bec2ac7))
* layout import ([b1b7012](https://github.com/Supamiu/ffxiv-teamcraft/commit/b1b7012))
* levequests ([f7ffe4d](https://github.com/Supamiu/ffxiv-teamcraft/commit/f7ffe4d))
* levequests page improvements ([a6d3425](https://github.com/Supamiu/ffxiv-teamcraft/commit/a6d3425))
* list history dialog box ([6acea36](https://github.com/Supamiu/ffxiv-teamcraft/commit/6acea36)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* list reset button ([507c7b2](https://github.com/Supamiu/ffxiv-teamcraft/commit/507c7b2)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* list tracking is now properly linked to teams system ([9c3b83c](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c3b83c))
* list-panel component and list state logic ([6f5cc6c](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f5cc6c))
* lists merge support ([c78c4ca](https://github.com/Supamiu/ffxiv-teamcraft/commit/c78c4ca))
* login implementation for oauth ([117e78a](https://github.com/Supamiu/ffxiv-teamcraft/commit/117e78a))
* macro translator ([0f57211](https://github.com/Supamiu/ffxiv-teamcraft/commit/0f57211))
* marketboard button now available in search page ([6721188](https://github.com/Supamiu/ffxiv-teamcraft/commit/6721188))
* marketboard details box now includes history ([5376561](https://github.com/Supamiu/ffxiv-teamcraft/commit/5376561))
* marketboard informations system ([137575a](https://github.com/Supamiu/ffxiv-teamcraft/commit/137575a))
* migrated craft job icons to xivapi set ([6c28f06](https://github.com/Supamiu/ffxiv-teamcraft/commit/6c28f06))
* migrated map system to use only map ids ([a2f3ff4](https://github.com/Supamiu/ffxiv-teamcraft/commit/a2f3ff4)), closes [#261](https://github.com/Supamiu/ffxiv-teamcraft/issues/261)
* migrating users storage from firebase to firestore ([3b78672](https://github.com/Supamiu/ffxiv-teamcraft/commit/3b78672))
* more details for crystals ! ([ab0ed2a](https://github.com/Supamiu/ffxiv-teamcraft/commit/ab0ed2a)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* more details for gathering informations ([a886bd2](https://github.com/Supamiu/ffxiv-teamcraft/commit/a886bd2))
* more details for ventures and alarms ([c12f22f](https://github.com/Supamiu/ffxiv-teamcraft/commit/c12f22f))
* more display stuff for notifications system ([76258a7](https://github.com/Supamiu/ffxiv-teamcraft/commit/76258a7))
* more monsters location data ([723952c](https://github.com/Supamiu/ffxiv-teamcraft/commit/723952c))
* more position data ! ([3f05f6b](https://github.com/Supamiu/ffxiv-teamcraft/commit/3f05f6b))
* more progression on simulator ([bc1b9a0](https://github.com/Supamiu/ffxiv-teamcraft/commit/bc1b9a0))
* more skeleton parts for the simulator page ([7f050ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/7f050ac))
* multiple nodes spawning at the same time pop multiple notifications ([1e3419b](https://github.com/Supamiu/ffxiv-teamcraft/commit/1e3419b)), closes [#430](https://github.com/Supamiu/ffxiv-teamcraft/issues/430)
* new --native-topbar (or -nt) launch flag for native window decorator ([3494ee2](https://github.com/Supamiu/ffxiv-teamcraft/commit/3494ee2)), closes [#531](https://github.com/Supamiu/ffxiv-teamcraft/issues/531)
* new "add all alarms for this item" menu option ([e457dcc](https://github.com/Supamiu/ffxiv-teamcraft/commit/e457dcc))
* new $10 patreon supporter name in loading messages ([5e56e3a](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e56e3a))
* new closestAetheryte pipe ([5421c60](https://github.com/Supamiu/ffxiv-teamcraft/commit/5421c60))
* new comments system is now available ([a4ae9ff](https://github.com/Supamiu/ffxiv-teamcraft/commit/a4ae9ff)), closes [#572](https://github.com/Supamiu/ffxiv-teamcraft/issues/572) [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576) [#625](https://github.com/Supamiu/ffxiv-teamcraft/issues/625)
* new favorites system ([4e3c015](https://github.com/Supamiu/ffxiv-teamcraft/commit/4e3c015)), closes [#574](https://github.com/Supamiu/ffxiv-teamcraft/issues/574)
* new history system for lists to see who added/removed things ([41527d7](https://github.com/Supamiu/ffxiv-teamcraft/commit/41527d7)), closes [#435](https://github.com/Supamiu/ffxiv-teamcraft/issues/435)
* new layout configuration modal ([d6c68c0](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6c68c0)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* new permissions system is now ready ! ([28a2046](https://github.com/Supamiu/ffxiv-teamcraft/commit/28a2046))
* new progress popup service for easy progression display ([6dcf7f0](https://github.com/Supamiu/ffxiv-teamcraft/commit/6dcf7f0))
* new team system with assignable items and notifications ([75ff821](https://github.com/Supamiu/ffxiv-teamcraft/commit/75ff821)), closes [#463](https://github.com/Supamiu/ffxiv-teamcraft/issues/463)
* new teams system is now complete and ready to be tested ! ([034cd4d](https://github.com/Supamiu/ffxiv-teamcraft/commit/034cd4d)), closes [#573](https://github.com/Supamiu/ffxiv-teamcraft/issues/573)
* notification now shown when public list is commented ([4163eb6](https://github.com/Supamiu/ffxiv-teamcraft/commit/4163eb6)), closes [#279](https://github.com/Supamiu/ffxiv-teamcraft/issues/279)
* notifications badge is now a counter ([7aa637d](https://github.com/Supamiu/ffxiv-teamcraft/commit/7aa637d))
* optimized compact lists even more by removing useless finalItems details ([3602e99](https://github.com/Supamiu/ffxiv-teamcraft/commit/3602e99))
* optimized navigation map ([47fd5d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/47fd5d8))
* persistence and more template for layouts system ([5437018](https://github.com/Supamiu/ffxiv-teamcraft/commit/5437018))
* pricing mode v5 is now ready to be tested ([6a223e7](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a223e7))
* progress on search page, still needs some features ([0a105e9](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a105e9)), closes [#569](https://github.com/Supamiu/ffxiv-teamcraft/issues/569)
* proper compacts system for powerful perfs in /lists and /community-lists ([e515a67](https://github.com/Supamiu/ffxiv-teamcraft/commit/e515a67))
* proper implementation for lists reordering using ngx-dnd ([1cd9c41](https://github.com/Supamiu/ffxiv-teamcraft/commit/1cd9c41))
* proper intro for search page ([df0215d](https://github.com/Supamiu/ffxiv-teamcraft/commit/df0215d))
* proper support for lists not found and list deletion ([b115d58](https://github.com/Supamiu/ffxiv-teamcraft/commit/b115d58))
* public profile page ([85d9e18](https://github.com/Supamiu/ffxiv-teamcraft/commit/85d9e18))
* recipe selection for custom rotations ([cbf049c](https://github.com/Supamiu/ffxiv-teamcraft/commit/cbf049c))
* reduction details popup ([f3d9b24](https://github.com/Supamiu/ffxiv-teamcraft/commit/f3d9b24))
* registration migrated to 5.0 ([d3ce1e1](https://github.com/Supamiu/ffxiv-teamcraft/commit/d3ce1e1))
* rename rotation button in rotation panel ([6f88fd8](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f88fd8))
* rename team and remove members is now possible ([a06428b](https://github.com/Supamiu/ffxiv-teamcraft/commit/a06428b))
* reworked tags dialog box ([bdd0eb7](https://github.com/Supamiu/ffxiv-teamcraft/commit/bdd0eb7)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* right clicking on a timer button now creates an alarm in default group without opening menu ([4f75486](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f75486))
* rotations favorite system ([8e3b7f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8e3b7f1))
* rotations picker for simulator ([4efeb2e](https://github.com/Supamiu/ffxiv-teamcraft/commit/4efeb2e))
* rotations state fragment and more ([2f1ba6e](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f1ba6e))
* search menu moved under the home button in sidebar ([fcfd34c](https://github.com/Supamiu/ffxiv-teamcraft/commit/fcfd34c))
* search page with shareable urls, still work to do but this is a first step ([2796ce9](https://github.com/Supamiu/ffxiv-teamcraft/commit/2796ce9)), closes [#569](https://github.com/Supamiu/ffxiv-teamcraft/issues/569)
* search system linked with list state ([1c14de7](https://github.com/Supamiu/ffxiv-teamcraft/commit/1c14de7))
* separate category for community lists in lists page ([8c89ce9](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c89ce9))
* show thresholds in simulator for collectibility and satisfaction ratings ([d5ebe67](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5ebe67)), closes [#503](https://github.com/Supamiu/ffxiv-teamcraft/issues/503)
* simulator is now totally ready for production ([156a4f6](https://github.com/Supamiu/ffxiv-teamcraft/commit/156a4f6))
* skeleton components for simulator rework ([cc5e8a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/cc5e8a1))
* snapshot mode support and icons for the buttons ([1c62b8d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1c62b8d))
* social buttons in sidebar ([d51f10b](https://github.com/Supamiu/ffxiv-teamcraft/commit/d51f10b))
* specialist toggle now adds/removes 20/20 properly ([9677bf2](https://github.com/Supamiu/ffxiv-teamcraft/commit/9677bf2))
* standard simulator yay ! ([1b72492](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b72492))
* stats edition in profile editor ([fa98a3e](https://github.com/Supamiu/ffxiv-teamcraft/commit/fa98a3e))
* support for "add all alarms at once" button ([3027430](https://github.com/Supamiu/ffxiv-teamcraft/commit/3027430)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for advanced search filters in search page ([baad9ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/baad9ab)), closes [#569](https://github.com/Supamiu/ffxiv-teamcraft/issues/569)
* support for better hook messages with fancy stuff ([1ae3731](https://github.com/Supamiu/ffxiv-teamcraft/commit/1ae3731))
* support for consumables and custom recipe configuration ([afec763](https://github.com/Supamiu/ffxiv-teamcraft/commit/afec763))
* support for hide completed/used rows in layouts system ([df4cb45](https://github.com/Supamiu/ffxiv-teamcraft/commit/df4cb45)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for Ingenuity 1 and 2 inside simulator ([5d540a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d540a2))
* support for korean accounts ([0ffa949](https://github.com/Supamiu/ffxiv-teamcraft/commit/0ffa949)), closes [#639](https://github.com/Supamiu/ffxiv-teamcraft/issues/639)
* support for list clone button ([c91e805](https://github.com/Supamiu/ffxiv-teamcraft/commit/c91e805)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for masterbook icons ([23922b3](https://github.com/Supamiu/ffxiv-teamcraft/commit/23922b3)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for multiple recipes for a single item inside final items ([371b1c6](https://github.com/Supamiu/ffxiv-teamcraft/commit/371b1c6))
* support for reduction node alarms ([733619e](https://github.com/Supamiu/ffxiv-teamcraft/commit/733619e)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* support for reductions in gathering locations page ([1bc3998](https://github.com/Supamiu/ffxiv-teamcraft/commit/1bc3998))
* support for stats modification inside simulator, first part of consumables configuration ([04d3421](https://github.com/Supamiu/ffxiv-teamcraft/commit/04d3421))
* support for verification inside permissions system ([f982a58](https://github.com/Supamiu/ffxiv-teamcraft/commit/f982a58))
* support for verification status in user picker dialog box ([d5e9510](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5e9510))
* total price in trades popup ([d7b0993](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7b0993))
* total price popup ([bfe2759](https://github.com/Supamiu/ffxiv-teamcraft/commit/bfe2759))
* trade details popup ([f92760c](https://github.com/Supamiu/ffxiv-teamcraft/commit/f92760c))
* updated simulator to add next tier theorical values ([d50cdd9](https://github.com/Supamiu/ffxiv-teamcraft/commit/d50cdd9))
* vendors details popup ([eabec3b](https://github.com/Supamiu/ffxiv-teamcraft/commit/eabec3b)), closes [#576](https://github.com/Supamiu/ffxiv-teamcraft/issues/576)
* ventures details popup ([78ef657](https://github.com/Supamiu/ffxiv-teamcraft/commit/78ef657))
* voyage details popup ([d7c2a12](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7c2a12))
* warning for missing masterbook with easy addition to profile ([bd5fe35](https://github.com/Supamiu/ffxiv-teamcraft/commit/bd5fe35))
* workshop system & small revamp of lists storage in state ([f8afc52](https://github.com/Supamiu/ffxiv-teamcraft/commit/f8afc52))
* workshops are now listed in the list-picker ([c9b391c](https://github.com/Supamiu/ffxiv-teamcraft/commit/c9b391c))
* WRITE permission implementation for the workshops ([5b5899e](https://github.com/Supamiu/ffxiv-teamcraft/commit/5b5899e))
* **pricing:** add toggle button to switch math to formulas that think you'll sell everything ([3d2495e](https://github.com/Supamiu/ffxiv-teamcraft/commit/3d2495e))
* you can now add all alarms for a given list using a single button ([7e58675](https://github.com/Supamiu/ffxiv-teamcraft/commit/7e58675)), closes [#465](https://github.com/Supamiu/ffxiv-teamcraft/issues/465)
* you can now add notes to your alarms ([fac1a42](https://github.com/Supamiu/ffxiv-teamcraft/commit/fac1a42)), closes [#431](https://github.com/Supamiu/ffxiv-teamcraft/issues/431)
* you can now assign a list to a team ! ([66ff6f2](https://github.com/Supamiu/ffxiv-teamcraft/commit/66ff6f2))
* you can now choose your preferred copy mode (item name or /isearch) ([13064cf](https://github.com/Supamiu/ffxiv-teamcraft/commit/13064cf))
* you can now copy item names in pricing mode too ([3a7db42](https://github.com/Supamiu/ffxiv-teamcraft/commit/3a7db42))


<a name="4.4.2"></a>
## [4.4.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.9...v4.4.2) (2018-08-06)


### Bug Fixes

* fixed a priority issue on pricing system ([7da5c31](https://github.com/Supamiu/ffxiv-teamcraft/commit/7da5c31))
* fixed an issue making prices a bit off in pricing mode ([08b698b](https://github.com/Supamiu/ffxiv-teamcraft/commit/08b698b))
* fixed an issue with books not being saved in profile page ([449a353](https://github.com/Supamiu/ffxiv-teamcraft/commit/449a353))
* fixed an issue with simulator not using proper icons for some actions ([eba5a07](https://github.com/Supamiu/ffxiv-teamcraft/commit/eba5a07))
* no server history message ([a98605e](https://github.com/Supamiu/ffxiv-teamcraft/commit/a98605e))



### Features

* new $10 patreon supporter name in loading messages ([5e56e3a](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e56e3a))


<a name="4.4.1"></a>
## [4.4.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.9...v4.4.1) (2018-08-04)


### Bug Fixes

* alarms in sidebar no longer ordered by group ([51cb94d](https://github.com/Supamiu/ffxiv-teamcraft/commit/51cb94d))
* anonymous commissions ([2a37246](https://github.com/Supamiu/ffxiv-teamcraft/commit/2a37246)), closes [#533](https://github.com/Supamiu/ffxiv-teamcraft/issues/533)
* custom recipe params now applied as they are changed ([10df578](https://github.com/Supamiu/ffxiv-teamcraft/commit/10df578))
* fixed an issue making prices a bit off in pricing mode ([08b698b](https://github.com/Supamiu/ffxiv-teamcraft/commit/08b698b))
* fixed an issue preventing gathering location page to create alarms ([69ac345](https://github.com/Supamiu/ffxiv-teamcraft/commit/69ac345)), closes [#478](https://github.com/Supamiu/ffxiv-teamcraft/issues/478)
* fixed an issue preventing users from saving their books in some conditions ([e4b7311](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4b7311))
* fixed an issue that was applying rating to both users ([fab53c3](https://github.com/Supamiu/ffxiv-teamcraft/commit/fab53c3))
* fixed an issue with change detection inside pricing mode ([0a9a690](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a9a690))
* fixed an issue with settings page not being shown properly ([995f38b](https://github.com/Supamiu/ffxiv-teamcraft/commit/995f38b))
* fixed an issue with trade-related filters in layouts ([30374d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/30374d8)), closes [#477](https://github.com/Supamiu/ffxiv-teamcraft/issues/477)
* fixed some drag and drop issues, including timeline jitter in simulator ([7765d9e](https://github.com/Supamiu/ffxiv-teamcraft/commit/7765d9e)), closes [#422](https://github.com/Supamiu/ffxiv-teamcraft/issues/422)
* HQ icon now appears properly for items required in end crafts on mobile size ([5e25d22](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e25d22))
* layout index changes now save properly ([11604a9](https://github.com/Supamiu/ffxiv-teamcraft/commit/11604a9))
* List UI style problems on small screens ([3348300](https://github.com/Supamiu/ffxiv-teamcraft/commit/3348300)), closes [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473) [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473)
* selected job not saved in custom rotation ([4d15caf](https://github.com/Supamiu/ffxiv-teamcraft/commit/4d15caf)), closes [#455](https://github.com/Supamiu/ffxiv-teamcraft/issues/455)
* you can now apply up to 3 commissions at a time without a high rate ([99912a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/99912a2))


### Features

* you can now add all alarms for a given list using a single button ([7e58675](https://github.com/Supamiu/ffxiv-teamcraft/commit/7e58675)), closes [#465](https://github.com/Supamiu/ffxiv-teamcraft/issues/465)
* **desktop:** new toggle button in settings to always have Teamcraft on top ([ddd4351](https://github.com/Supamiu/ffxiv-teamcraft/commit/ddd4351))
* add commission creation date in the commission panel and details ([935b223](https://github.com/Supamiu/ffxiv-teamcraft/commit/935b223))
* add new God of Hand tier patreon supporter to loading screen ([14821e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/14821e4))
* commission board history ([d2554d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/d2554d6)), closes [#519](https://github.com/Supamiu/ffxiv-teamcraft/issues/519)
* display amount of unread notifications in sidebar ([ca9ee6a](https://github.com/Supamiu/ffxiv-teamcraft/commit/ca9ee6a))
* gil transaction log now shown on archived commissions ([b5ff24d](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5ff24d)), closes [#469](https://github.com/Supamiu/ffxiv-teamcraft/issues/469)
* multiple nodes spawning at the same time pop multiple notifications ([1e3419b](https://github.com/Supamiu/ffxiv-teamcraft/commit/1e3419b)), closes [#430](https://github.com/Supamiu/ffxiv-teamcraft/issues/430)
* new --native-topbar (or -nt) launch flag for native window decorator ([3494ee2](https://github.com/Supamiu/ffxiv-teamcraft/commit/3494ee2)), closes [#531](https://github.com/Supamiu/ffxiv-teamcraft/issues/531)
* new history system for lists to see who added/removed things ([41527d7](https://github.com/Supamiu/ffxiv-teamcraft/commit/41527d7)), closes [#435](https://github.com/Supamiu/ffxiv-teamcraft/issues/435)
* new team system with assignable items and notifications ([75ff821](https://github.com/Supamiu/ffxiv-teamcraft/commit/75ff821)), closes [#463](https://github.com/Supamiu/ffxiv-teamcraft/issues/463)
* notification now shown when public list is commented ([4163eb6](https://github.com/Supamiu/ffxiv-teamcraft/commit/4163eb6)), closes [#279](https://github.com/Supamiu/ffxiv-teamcraft/issues/279)
* recipe selection for custom rotations ([cbf049c](https://github.com/Supamiu/ffxiv-teamcraft/commit/cbf049c))
* right clicking on a timer button now creates an alarm in default group without opening menu ([4f75486](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f75486))
* **pricing:** add toggle button to switch math to formulas that think you'll sell everything ([3d2495e](https://github.com/Supamiu/ffxiv-teamcraft/commit/3d2495e))
* search menu moved under the home button in sidebar ([fcfd34c](https://github.com/Supamiu/ffxiv-teamcraft/commit/fcfd34c))
* show thresholds in simulator for collectibility and satisfaction ratings ([d5ebe67](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5ebe67)), closes [#503](https://github.com/Supamiu/ffxiv-teamcraft/issues/503)
* updated simulator to add next tier theorical values ([d50cdd9](https://github.com/Supamiu/ffxiv-teamcraft/commit/d50cdd9))
* you can now add notes to your alarms ([fac1a42](https://github.com/Supamiu/ffxiv-teamcraft/commit/fac1a42)), closes [#431](https://github.com/Supamiu/ffxiv-teamcraft/issues/431)



<a name="4.4.0"></a>
# [4.4.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.9...v4.4.0) (2018-08-04)


### Bug Fixes

* alarms in sidebar no longer ordered by group ([51cb94d](https://github.com/Supamiu/ffxiv-teamcraft/commit/51cb94d))
* anonymous commissions ([2a37246](https://github.com/Supamiu/ffxiv-teamcraft/commit/2a37246)), closes [#533](https://github.com/Supamiu/ffxiv-teamcraft/issues/533)
* custom recipe params now applied as they are changed ([10df578](https://github.com/Supamiu/ffxiv-teamcraft/commit/10df578))
* fixed an issue preventing gathering location page to create alarms ([69ac345](https://github.com/Supamiu/ffxiv-teamcraft/commit/69ac345)), closes [#478](https://github.com/Supamiu/ffxiv-teamcraft/issues/478)
* fixed an issue preventing users from saving their books in some conditions ([e4b7311](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4b7311))
* fixed an issue that was applying rating to both users ([fab53c3](https://github.com/Supamiu/ffxiv-teamcraft/commit/fab53c3))
* fixed an issue with change detection inside pricing mode ([0a9a690](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a9a690))
* fixed an issue with trade-related filters in layouts ([30374d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/30374d8)), closes [#477](https://github.com/Supamiu/ffxiv-teamcraft/issues/477)
* fixed some drag and drop issues, including timeline jitter in simulator ([7765d9e](https://github.com/Supamiu/ffxiv-teamcraft/commit/7765d9e)), closes [#422](https://github.com/Supamiu/ffxiv-teamcraft/issues/422)
* HQ icon now appears properly for items required in end crafts on mobile size ([5e25d22](https://github.com/Supamiu/ffxiv-teamcraft/commit/5e25d22))
* layout index changes now save properly ([11604a9](https://github.com/Supamiu/ffxiv-teamcraft/commit/11604a9))
* List UI style problems on small screens ([3348300](https://github.com/Supamiu/ffxiv-teamcraft/commit/3348300)), closes [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473) [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473)
* selected job not saved in custom rotation ([4d15caf](https://github.com/Supamiu/ffxiv-teamcraft/commit/4d15caf)), closes [#455](https://github.com/Supamiu/ffxiv-teamcraft/issues/455)
* you can now apply up to 3 commissions at a time without a high rate ([99912a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/99912a2))


### Features

* display amount of unread notifications in sidebar ([ca9ee6a](https://github.com/Supamiu/ffxiv-teamcraft/commit/ca9ee6a))
* **desktop:** new toggle button in settings to always have Teamcraft on top ([ddd4351](https://github.com/Supamiu/ffxiv-teamcraft/commit/ddd4351))
* add commission creation date in the commission panel and details ([935b223](https://github.com/Supamiu/ffxiv-teamcraft/commit/935b223))
* add new God of Hand tier patreon supporter to loading screen ([14821e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/14821e4))
* commission board history ([d2554d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/d2554d6)), closes [#519](https://github.com/Supamiu/ffxiv-teamcraft/issues/519)
* gil transaction log now shown on archived commissions ([b5ff24d](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5ff24d)), closes [#469](https://github.com/Supamiu/ffxiv-teamcraft/issues/469)
* multiple nodes spawning at the same time pop multiple notifications ([1e3419b](https://github.com/Supamiu/ffxiv-teamcraft/commit/1e3419b)), closes [#430](https://github.com/Supamiu/ffxiv-teamcraft/issues/430)
* new --native-topbar (or -nt) launch flag for native window decorator ([3494ee2](https://github.com/Supamiu/ffxiv-teamcraft/commit/3494ee2)), closes [#531](https://github.com/Supamiu/ffxiv-teamcraft/issues/531)
* new history system for lists to see who added/removed things ([41527d7](https://github.com/Supamiu/ffxiv-teamcraft/commit/41527d7)), closes [#435](https://github.com/Supamiu/ffxiv-teamcraft/issues/435)
* new team system with assignable items and notifications ([75ff821](https://github.com/Supamiu/ffxiv-teamcraft/commit/75ff821)), closes [#463](https://github.com/Supamiu/ffxiv-teamcraft/issues/463)
* **pricing:** add toggle button to switch math to formulas that think you'll sell everything ([3d2495e](https://github.com/Supamiu/ffxiv-teamcraft/commit/3d2495e))
* notification now shown when public list is commented ([4163eb6](https://github.com/Supamiu/ffxiv-teamcraft/commit/4163eb6)), closes [#279](https://github.com/Supamiu/ffxiv-teamcraft/issues/279)
* recipe selection for custom rotations ([cbf049c](https://github.com/Supamiu/ffxiv-teamcraft/commit/cbf049c))
* right clicking on a timer button now creates an alarm in default group without opening menu ([4f75486](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f75486))
* search menu moved under the home button in sidebar ([fcfd34c](https://github.com/Supamiu/ffxiv-teamcraft/commit/fcfd34c))
* show thresholds in simulator for collectibility and satisfaction ratings ([d5ebe67](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5ebe67)), closes [#503](https://github.com/Supamiu/ffxiv-teamcraft/issues/503)
* you can now add all alarms for a given list using a single button ([7e58675](https://github.com/Supamiu/ffxiv-teamcraft/commit/7e58675)), closes [#465](https://github.com/Supamiu/ffxiv-teamcraft/issues/465)
* you can now add notes to your alarms ([fac1a42](https://github.com/Supamiu/ffxiv-teamcraft/commit/fac1a42)), closes [#431](https://github.com/Supamiu/ffxiv-teamcraft/issues/431)



<a name="4.3.9"></a>
## [4.3.9](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.8...v4.3.9) (2018-07-24)


### Bug Fixes

* deleted alarms wont be playing anymore ([81bad1b](https://github.com/Supamiu/ffxiv-teamcraft/commit/81bad1b)), closes [#514](https://github.com/Supamiu/ffxiv-teamcraft/issues/514)
* list recipe simulator links ([e4fafe5](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4fafe5)), closes [#401](https://github.com/Supamiu/ffxiv-teamcraft/issues/401)
* remove ephemeral flag from quick commissions ([19feea3](https://github.com/Supamiu/ffxiv-teamcraft/commit/19feea3))


### Features

* add HQ material cost to total price popup ([f1e6547](https://github.com/Supamiu/ffxiv-teamcraft/commit/f1e6547))
* show levels for retainer ventures ([5bd7958](https://github.com/Supamiu/ffxiv-teamcraft/commit/5bd7958)), closes [#315](https://github.com/Supamiu/ffxiv-teamcraft/issues/315)



<a name="4.3.8"></a>
## [4.3.8](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.7...v4.3.8) (2018-07-17)


### Bug Fixes

* fixed an issue with alarms not deleted properly ([298eb71](https://github.com/Supamiu/ffxiv-teamcraft/commit/298eb71)), closes [#499](https://github.com/Supamiu/ffxiv-teamcraft/issues/499)
* fixed an issue with small desktop window size hiding some buttons ([19e7500](https://github.com/Supamiu/ffxiv-teamcraft/commit/19e7500))
* fixed an issue withr ecipe swap in simulator not updating stats properly ([943de7d](https://github.com/Supamiu/ffxiv-teamcraft/commit/943de7d))
* fixed public profile page rendering ([3ef7435](https://github.com/Supamiu/ffxiv-teamcraft/commit/3ef7435))
* remove open hashes from JP localisation JSON ([7be01fa](https://github.com/Supamiu/ffxiv-teamcraft/commit/7be01fa))
* removed navigation buttons in overlay window ([b173028](https://github.com/Supamiu/ffxiv-teamcraft/commit/b173028))
* spanish localization ([00819b5](https://github.com/Supamiu/ffxiv-teamcraft/commit/00819b5))


### Features

* new dashed border for items with all final ingredients available ([3a71d73](https://github.com/Supamiu/ffxiv-teamcraft/commit/3a71d73)), closes [#491](https://github.com/Supamiu/ffxiv-teamcraft/issues/491)
* quick commission button on search results ([46b999c](https://github.com/Supamiu/ffxiv-teamcraft/commit/46b999c)), closes [#490](https://github.com/Supamiu/ffxiv-teamcraft/issues/490)
* rating shown on profile ([cf4ee18](https://github.com/Supamiu/ffxiv-teamcraft/commit/cf4ee18)), closes [#482](https://github.com/Supamiu/ffxiv-teamcraft/issues/482)



<a name="4.3.7"></a>
## [4.3.7](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.6...v4.3.7) (2018-07-12)


### Bug Fixes

* fixed an issue that was preventing public profile from loading ([5154951](https://github.com/Supamiu/ffxiv-teamcraft/commit/5154951))
* HQ icon now appears properly for items required in end crafts on mobile size ([ff5b697](https://github.com/Supamiu/ffxiv-teamcraft/commit/ff5b697))
* layout index changes now save properly ([c049f5f](https://github.com/Supamiu/ffxiv-teamcraft/commit/c049f5f))
* List UI style problems on small screens ([19c1efe](https://github.com/Supamiu/ffxiv-teamcraft/commit/19c1efe)), closes [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473) [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473)
* **simulator:** fixed default consumables ([99a9c90](https://github.com/Supamiu/ffxiv-teamcraft/commit/99a9c90))



<a name="4.3.6"></a>
## [4.3.6](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.5...v4.3.6) (2018-07-11)


### Bug Fixes

* alarms in sidebar no longer ordered by group ([8047c44](https://github.com/Supamiu/ffxiv-teamcraft/commit/8047c44))
* custom recipe params now applied as they are changed ([148c144](https://github.com/Supamiu/ffxiv-teamcraft/commit/148c144))
* fixed an issue preventing gathering location page to create alarms ([f61d510](https://github.com/Supamiu/ffxiv-teamcraft/commit/f61d510)), closes [#478](https://github.com/Supamiu/ffxiv-teamcraft/issues/478)
* fixed an issue that was applying rating to both users ([3cbe5f9](https://github.com/Supamiu/ffxiv-teamcraft/commit/3cbe5f9))
* fixed an issue with trade-related filters in layouts ([56eccc8](https://github.com/Supamiu/ffxiv-teamcraft/commit/56eccc8)), closes [#477](https://github.com/Supamiu/ffxiv-teamcraft/issues/477)
* selected job not saved in custom rotation ([9edb546](https://github.com/Supamiu/ffxiv-teamcraft/commit/9edb546)), closes [#455](https://github.com/Supamiu/ffxiv-teamcraft/issues/455)
* you can now apply up to 3 commissions at a time without a high rate ([1ef009c](https://github.com/Supamiu/ffxiv-teamcraft/commit/1ef009c))


### Features

* recipe selection for custom rotations ([17726f5](https://github.com/Supamiu/ffxiv-teamcraft/commit/17726f5))

<a name="4.3.5"></a>
## [4.3.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.4...v4.3.5) (2018-07-08)


### Bug Fixes

* HQ icon now appears properly for items required in end crafts on mobile size ([fd67088](https://github.com/Supamiu/ffxiv-teamcraft/commit/fd67088))
* layout index changes now save properly ([395d9f3](https://github.com/Supamiu/ffxiv-teamcraft/commit/395d9f3))
* List UI style problems on small screens ([58805c4](https://github.com/Supamiu/ffxiv-teamcraft/commit/58805c4)), closes [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473) [#473](https://github.com/Supamiu/ffxiv-teamcraft/issues/473)



<a name="4.3.4"></a>
## [4.3.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.3...v4.3.4) (2018-07-07)


### Bug Fixes

* fixed an issue with items amount reduction not being propagated ([822f7f4](https://github.com/Supamiu/ffxiv-teamcraft/commit/822f7f4))
* fixed an issue with layout panel options not moving properly with arrows ([5d614ee](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d614ee))
* fixed an issue with layout panel options not moving properly with arrows ([8c36951](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c36951))
* fixed profile verification process ([f842631](https://github.com/Supamiu/ffxiv-teamcraft/commit/f842631))
* fixed the alarms sidebar timer not ticking properly ([9ffd889](https://github.com/Supamiu/ffxiv-teamcraft/commit/9ffd889))
* hidden action tooltips in simulator ([b40a034](https://github.com/Supamiu/ffxiv-teamcraft/commit/b40a034)), closes [#450](https://github.com/Supamiu/ffxiv-teamcraft/issues/450)
* long commission names now handled properly ([697902a](https://github.com/Supamiu/ffxiv-teamcraft/commit/697902a))


### Features

* new patreon tier implemented: loading message with patron names that have the tier enabled ([73c9792](https://github.com/Supamiu/ffxiv-teamcraft/commit/73c9792))
* **desktop:** new toggle button in settings to always have Teamcraft on top ([95e1022](https://github.com/Supamiu/ffxiv-teamcraft/commit/95e1022))
* **simulator:** add custom delay offset to apply to macro ([a765736](https://github.com/Supamiu/ffxiv-teamcraft/commit/a765736)), closes [#428](https://github.com/Supamiu/ffxiv-teamcraft/issues/428)
* better performances with lazy loading panels for lists ([2db9cec](https://github.com/Supamiu/ffxiv-teamcraft/commit/2db9cec))
* commission page improvements ([3149eb5](https://github.com/Supamiu/ffxiv-teamcraft/commit/3149eb5)), closes [#459](https://github.com/Supamiu/ffxiv-teamcraft/issues/459) [#462](https://github.com/Supamiu/ffxiv-teamcraft/issues/462)
* filters for commission board ([dc0f9d9](https://github.com/Supamiu/ffxiv-teamcraft/commit/dc0f9d9))
* gil transaction log now shown on archived commissions ([8799e02](https://github.com/Supamiu/ffxiv-teamcraft/commit/8799e02)), closes [#469](https://github.com/Supamiu/ffxiv-teamcraft/issues/469)
* multiple nodes spawning at the same time pop multiple notifications ([434d9a5](https://github.com/Supamiu/ffxiv-teamcraft/commit/434d9a5)), closes [#430](https://github.com/Supamiu/ffxiv-teamcraft/issues/430)
* muted alarms now hidden in alarms sidebar ([7e1aac7](https://github.com/Supamiu/ffxiv-teamcraft/commit/7e1aac7)), closes [#452](https://github.com/Supamiu/ffxiv-teamcraft/issues/452)
* windows tray notifications for commission board ([dcae688](https://github.com/Supamiu/ffxiv-teamcraft/commit/dcae688))
* you can now add notes to your alarms ([92b4f07](https://github.com/Supamiu/ffxiv-teamcraft/commit/92b4f07)), closes [#431](https://github.com/Supamiu/ffxiv-teamcraft/issues/431)



<a name="4.3.3"></a>
## [4.3.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.2...v4.3.3) (2018-07-05)


### Bug Fixes

* fixed profile verification process ([2e15a3b](https://github.com/Supamiu/ffxiv-teamcraft/commit/2e15a3b))
* hidden action tooltips in simulator ([8183ed9](https://github.com/Supamiu/ffxiv-teamcraft/commit/8183ed9)), closes [#450](https://github.com/Supamiu/ffxiv-teamcraft/issues/450)
* long commission names now handled properly ([dc868d4](https://github.com/Supamiu/ffxiv-teamcraft/commit/dc868d4))


### Features

* commission page improvements ([ee81195](https://github.com/Supamiu/ffxiv-teamcraft/commit/ee81195)), closes [#459](https://github.com/Supamiu/ffxiv-teamcraft/issues/459) [#462](https://github.com/Supamiu/ffxiv-teamcraft/issues/462)
* muted alarms now hidden in alarms sidebar ([c30c074](https://github.com/Supamiu/ffxiv-teamcraft/commit/c30c074)), closes [#452](https://github.com/Supamiu/ffxiv-teamcraft/issues/452)
* new patreon tier implemented: loading message with patron names that have the tier enabled ([a616f40](https://github.com/Supamiu/ffxiv-teamcraft/commit/a616f40))



<a name="4.3.2"></a>
## [4.3.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.1...v4.3.2) (2018-07-03)


### Bug Fixes

* fixed a bug making commissions disappear. Needs everybody to restart to be fixed ([aac766d](https://github.com/Supamiu/ffxiv-teamcraft/commit/aac766d))
* fixed a bug with user validation process ([4dcb005](https://github.com/Supamiu/ffxiv-teamcraft/commit/4dcb005))
* fixed an issue with precrafts amount update not updating items properly ([d47d44a](https://github.com/Supamiu/ffxiv-teamcraft/commit/d47d44a)), closes [#453](https://github.com/Supamiu/ffxiv-teamcraft/issues/453)


### Features

* **desktop:** new manual update check button ([cbbfc16](https://github.com/Supamiu/ffxiv-teamcraft/commit/cbbfc16)), closes [#448](https://github.com/Supamiu/ffxiv-teamcraft/issues/448)
* added 4.35 recipes and items ([b18454f](https://github.com/Supamiu/ffxiv-teamcraft/commit/b18454f))



<a name="4.3.1"></a>
## [4.3.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.3.0...v4.3.1) (2018-07-01)


### Bug Fixes

* fixed a bug making commissions disappear. Needs everybody to restart to be fixed ([45f2974](https://github.com/Supamiu/ffxiv-teamcraft/commit/45f2974))



<a name="4.3.0"></a>
# [4.3.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.2.3...v4.3.0) (2018-07-01)


### Bug Fixes

* fixed an issue with items amount reduction not being propagated ([94ddcd9](https://github.com/Supamiu/ffxiv-teamcraft/commit/94ddcd9))


### Features

* add free company crafting buffs ([da77168](https://github.com/Supamiu/ffxiv-teamcraft/commit/da77168)), closes [#425](https://github.com/Supamiu/ffxiv-teamcraft/issues/425)
* add specialist stat bonus ([50f16da](https://github.com/Supamiu/ffxiv-teamcraft/commit/50f16da))
* **desktop:** new toggle button in settings to always have Teamcraft on top ([52b3ff2](https://github.com/Supamiu/ffxiv-teamcraft/commit/52b3ff2))
* **simulator:** add custom delay offset to apply to macro ([496ad73](https://github.com/Supamiu/ffxiv-teamcraft/commit/496ad73)), closes [#428](https://github.com/Supamiu/ffxiv-teamcraft/issues/428)
* **simulator:** default consumables WIP ([681af62](https://github.com/Supamiu/ffxiv-teamcraft/commit/681af62)), closes [#426](https://github.com/Supamiu/ffxiv-teamcraft/issues/426)
* filters for commission board ([1995c2d](https://github.com/Supamiu/ffxiv-teamcraft/commit/1995c2d))
* multiple nodes spawning at the same time pop multiple notifications ([e25235e](https://github.com/Supamiu/ffxiv-teamcraft/commit/e25235e)), closes [#430](https://github.com/Supamiu/ffxiv-teamcraft/issues/430)
* new commission board feature ([cdbe315](https://github.com/Supamiu/ffxiv-teamcraft/commit/cdbe315))
* new toggle button to temporarily ignore item in pricing page ([e74767d](https://github.com/Supamiu/ffxiv-teamcraft/commit/e74767d)), closes [#427](https://github.com/Supamiu/ffxiv-teamcraft/issues/427)
* windows tray notifications for commission board ([e9df686](https://github.com/Supamiu/ffxiv-teamcraft/commit/e9df686))



<a name="4.2.3"></a>
## [4.2.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.2.1...v4.2.3) (2018-06-25)


### Bug Fixes

* fixed an issue with final crafts checking removing some ingredients ([1cd48bb](https://github.com/Supamiu/ffxiv-teamcraft/commit/1cd48bb)), closes [#420](https://github.com/Supamiu/ffxiv-teamcraft/issues/420)
* **simulator:** tooltips are now hidden when dragging actions ([24042cd](https://github.com/Supamiu/ffxiv-teamcraft/commit/24042cd)), closes [#423](https://github.com/Supamiu/ffxiv-teamcraft/issues/423)
* fixed an issue with ingredients amount not being set properly (again, fixed properly now) ([570279a](https://github.com/Supamiu/ffxiv-teamcraft/commit/570279a))


### Features

* apply stats to all crafts button ([19f8216](https://github.com/Supamiu/ffxiv-teamcraft/commit/19f8216)), closes [#418](https://github.com/Supamiu/ffxiv-teamcraft/issues/418)



<a name="4.2.2"></a>
## [4.2.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.2.1...v4.2.2) (2018-06-24)


### Bug Fixes

* fixed an issue with final crafts checking removing some ingredients ([1cd48bb](https://github.com/Supamiu/ffxiv-teamcraft/commit/1cd48bb)), closes [#420](https://github.com/Supamiu/ffxiv-teamcraft/issues/420)
* **simulator:** tooltips are now hidden when dragging actions ([24042cd](https://github.com/Supamiu/ffxiv-teamcraft/commit/24042cd)), closes [#423](https://github.com/Supamiu/ffxiv-teamcraft/issues/423)


### Features

* apply stats to all crafts button ([19f8216](https://github.com/Supamiu/ffxiv-teamcraft/commit/19f8216)), closes [#418](https://github.com/Supamiu/ffxiv-teamcraft/issues/418)



<a name="4.2.1"></a>
## [4.2.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.2.0...v4.2.1) (2018-06-22)


### Bug Fixes

* fixed an undefined icon being displayed in total trades popup with gil ([b1cc8bd](https://github.com/Supamiu/ffxiv-teamcraft/commit/b1cc8bd))
* no message on list not found ([0a9ebd3](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a9ebd3)), closes [#412](https://github.com/Supamiu/ffxiv-teamcraft/issues/412)



<a name="4.2.0"></a>
# [4.2.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.1.8...v4.2.0) (2018-06-21)


### Bug Fixes

* fixed an issue with alarms not showing proper location ([9ada75d](https://github.com/Supamiu/ffxiv-teamcraft/commit/9ada75d)), closes [#407](https://github.com/Supamiu/ffxiv-teamcraft/issues/407)
* fixed an issue with gathering-location page not able to create alarm for Rhea ([fcfaed0](https://github.com/Supamiu/ffxiv-teamcraft/commit/fcfaed0))
* fixed an issue with recipe amounts reduction not being applied to ingredients ([68804bb](https://github.com/Supamiu/ffxiv-teamcraft/commit/68804bb)), closes [#407](https://github.com/Supamiu/ffxiv-teamcraft/issues/407)
* **alarms:** fixed an issue with nodes despawning the day after the spawn ([95b8f0d](https://github.com/Supamiu/ffxiv-teamcraft/commit/95b8f0d))
* **desktop:** auto update popup won't open duplicates anymore ([35b6e61](https://github.com/Supamiu/ffxiv-teamcraft/commit/35b6e61))
* removed french translations inside the japanese file ([1a46064](https://github.com/Supamiu/ffxiv-teamcraft/commit/1a46064))
* show list completion dialog only for author only ([b2a8425](https://github.com/Supamiu/ffxiv-teamcraft/commit/b2a8425))


### Features

* "recipes only" filter is now persistent accross the platform (not account-bound) ([65ec2a0](https://github.com/Supamiu/ffxiv-teamcraft/commit/65ec2a0))
* added new checkboxes near recipe search results to add part of a result ([e407626](https://github.com/Supamiu/ffxiv-teamcraft/commit/e407626)), closes [#410](https://github.com/Supamiu/ffxiv-teamcraft/issues/410)
* different color for odd rows in list panels ([355f538](https://github.com/Supamiu/ffxiv-teamcraft/commit/355f538))
* new dialog box to show total cost of a list section (gils and trades) ([13b7eed](https://github.com/Supamiu/ffxiv-teamcraft/commit/13b7eed)), closes [#407](https://github.com/Supamiu/ffxiv-teamcraft/issues/407)
* you can now associate character using lodestoneId, useful for short names ([14a9d5f](https://github.com/Supamiu/ffxiv-teamcraft/commit/14a9d5f)), closes [#392](https://github.com/Supamiu/ffxiv-teamcraft/issues/392)
* you can now choose in which group you create your alarms from lists ([6998eb4](https://github.com/Supamiu/ffxiv-teamcraft/commit/6998eb4))
* **desktop:** added navigation arrows in topbar ([06635ee](https://github.com/Supamiu/ffxiv-teamcraft/commit/06635ee)), closes [#407](https://github.com/Supamiu/ffxiv-teamcraft/issues/407)
* **desktop:** new --multi (or -m) option to open multiple instances ([3575161](https://github.com/Supamiu/ffxiv-teamcraft/commit/3575161)), closes [#411](https://github.com/Supamiu/ffxiv-teamcraft/issues/411)
* **desktop:** you can now set an opacity on overlay ([5df0290](https://github.com/Supamiu/ffxiv-teamcraft/commit/5df0290)), closes [#407](https://github.com/Supamiu/ffxiv-teamcraft/issues/407)
* **simulator:** it is now possible to create folders to organize rotations ([76261c5](https://github.com/Supamiu/ffxiv-teamcraft/commit/76261c5)), closes [#404](https://github.com/Supamiu/ffxiv-teamcraft/issues/404)
* you can now customize echo notification in craft macros ([8a7d164](https://github.com/Supamiu/ffxiv-teamcraft/commit/8a7d164)), closes [#407](https://github.com/Supamiu/ffxiv-teamcraft/issues/407)
* you can now see the job used for the craft in simulator result panel ([25deaa1](https://github.com/Supamiu/ffxiv-teamcraft/commit/25deaa1)), closes [#407](https://github.com/Supamiu/ffxiv-teamcraft/issues/407)



<a name="4.1.8"></a>
## [4.1.8](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.1.7...v4.1.8) (2018-06-09)


### Bug Fixes

* **desktop:** alarms overlay no longer shows muted groups ([b3a6900](https://github.com/Supamiu/ffxiv-teamcraft/commit/b3a6900))


### Features

* new /desktop page that redirects to github latest release ([581f278](https://github.com/Supamiu/ffxiv-teamcraft/commit/581f278))



<a name="4.1.7"></a>
## [4.1.7](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.1.6...v4.1.7) (2018-06-08)


### Bug Fixes

* dungeon and trial icons are now properly displayed ([7c8f7eb](https://github.com/Supamiu/ffxiv-teamcraft/commit/7c8f7eb)), closes [#400](https://github.com/Supamiu/ffxiv-teamcraft/issues/400)
* fixed a critical which was breaking recipes search in production ([8ae4db8](https://github.com/Supamiu/ffxiv-teamcraft/commit/8ae4db8))
* fixed an error with wrong amount in trade popup in some cases ([9cb553d](https://github.com/Supamiu/ffxiv-teamcraft/commit/9cb553d)), closes [#403](https://github.com/Supamiu/ffxiv-teamcraft/issues/403)
* fixed an issue with simulator link on items that have multiple recipes ([059bc9f](https://github.com/Supamiu/ffxiv-teamcraft/commit/059bc9f)), closes [#401](https://github.com/Supamiu/ffxiv-teamcraft/issues/401)


### Features

* updated the /about page ([ccd6250](https://github.com/Supamiu/ffxiv-teamcraft/commit/ccd6250))



<a name="4.1.6"></a>
## [4.1.6](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.1.4...v4.1.6) (2018-06-06)


### Bug Fixes

* fixed a critical which was breaking recipes search in production ([8ae4db8](https://github.com/Supamiu/ffxiv-teamcraft/commit/8ae4db8))
* only show recipe swap button if a rotation is set and pure (saved) ([36d77b2](https://github.com/Supamiu/ffxiv-teamcraft/commit/36d77b2))


### Features

* **desktop:** better flow for auto updater ([68ad385](https://github.com/Supamiu/ffxiv-teamcraft/commit/68ad385))



<a name="4.1.5"></a>
## [4.1.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.1.4...v4.1.5) (2018-06-06)


### Bug Fixes

* only show recipe swap button if a rotation is set and pure (saved) ([36d77b2](https://github.com/Supamiu/ffxiv-teamcraft/commit/36d77b2))


### Features

* **desktop:** better flow for auto updater ([68ad385](https://github.com/Supamiu/ffxiv-teamcraft/commit/68ad385))



<a name="4.1.4"></a>
## [4.1.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.1.3...v4.1.4) (2018-06-05)


### Bug Fixes

* fixed a missing translation in sidebar ([22d5e95](https://github.com/Supamiu/ffxiv-teamcraft/commit/22d5e95))


### Features

* **simulator:** crafter stats now shown in main panel, for easier screenshots ([9db17c9](https://github.com/Supamiu/ffxiv-teamcraft/commit/9db17c9))
* you can now change recipe from the simulator page ([87a2a28](https://github.com/Supamiu/ffxiv-teamcraft/commit/87a2a28)), closes [#395](https://github.com/Supamiu/ffxiv-teamcraft/issues/395)



<a name="4.1.3"></a>
## [4.1.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.1.2...v4.1.3) (2018-06-04)


### Bug Fixes

* fixed an issue that prevented addition of some items ([d387ee3](https://github.com/Supamiu/ffxiv-teamcraft/commit/d387ee3)), closes [#396](https://github.com/Supamiu/ffxiv-teamcraft/issues/396)
* no more sound spam with some items ([b65a44f](https://github.com/Supamiu/ffxiv-teamcraft/commit/b65a44f)), closes [#397](https://github.com/Supamiu/ffxiv-teamcraft/issues/397)


### Features

* new checkbox to search for recipes only in items search page ([9455a4e](https://github.com/Supamiu/ffxiv-teamcraft/commit/9455a4e))



<a name="4.1.2"></a>
## [4.1.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.1.0...v4.1.2) (2018-06-03)


### Bug Fixes

* fixed a bug that prevented alarms from playing ([5bf2273](https://github.com/Supamiu/ffxiv-teamcraft/commit/5bf2273))
* fixed an issue with vendors extractor ([8c50f6c](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c50f6c))



<a name="4.1.1"></a>
## [4.1.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.14...v4.1.1) (2018-06-03)


### Bug Fixes

* fixed an issue with vendors extractor ([8c50f6c](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c50f6c))
* ordering by job no longer hides non-recipe items ([ea27201](https://github.com/Supamiu/ffxiv-teamcraft/commit/ea27201))


<a name="4.1.0"></a>
# [4.1.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.14...v4.1.0) (2018-06-03)


### Bug Fixes

* **alarms:** you can now properly change sound, delay and volume of your alarms ([6ce2a37](https://github.com/Supamiu/ffxiv-teamcraft/commit/6ce2a37))
* change email popup is now loading properly ([39a877a](https://github.com/Supamiu/ffxiv-teamcraft/commit/39a877a)), closes [#387](https://github.com/Supamiu/ffxiv-teamcraft/issues/387)
* completion dialog is no longer shown for public lists ([1c55018](https://github.com/Supamiu/ffxiv-teamcraft/commit/1c55018))
* fixed an error with crafts yielding more than one item ([f772456](https://github.com/Supamiu/ffxiv-teamcraft/commit/f772456))
* fixed an issue that was preventing to add community lists in a workshop ([769c06d](https://github.com/Supamiu/ffxiv-teamcraft/commit/769c06d))
* navigation map no longer takes completed items into account ([fb765dd](https://github.com/Supamiu/ffxiv-teamcraft/commit/fb765dd))


### Features

* **desktop:** you can now use custom sounds as alarm ([e647689](https://github.com/Supamiu/ffxiv-teamcraft/commit/e647689)), closes [#350](https://github.com/Supamiu/ffxiv-teamcraft/issues/350)
* **simulator:** rotation name is suffixed by "*" if there's some unsaved changes ([527f60c](https://github.com/Supamiu/ffxiv-teamcraft/commit/527f60c))
* **simulator:** you can now change the current rotation inside simulator ([21af5d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/21af5d6)), closes [#389](https://github.com/Supamiu/ffxiv-teamcraft/issues/389)
* added the icon of the item in alarms overlay view ([6048ef0](https://github.com/Supamiu/ffxiv-teamcraft/commit/6048ef0))
* control is now properly handled in min stats popup ([dadf1bf](https://github.com/Supamiu/ffxiv-teamcraft/commit/dadf1bf))
* new "Copy as text" button to copy a panel or the whole list as text ([3d9aebb](https://github.com/Supamiu/ffxiv-teamcraft/commit/3d9aebb)), closes [#342](https://github.com/Supamiu/ffxiv-teamcraft/issues/342)
* you can now add almost any item in the game to a list, even if it's not craftable ([fe72840](https://github.com/Supamiu/ffxiv-teamcraft/commit/fe72840)), closes [#336](https://github.com/Supamiu/ffxiv-teamcraft/issues/336)
* you can now organize alarms on groups, mute them by group and reorder using drag & drop ([1017091](https://github.com/Supamiu/ffxiv-teamcraft/commit/1017091)), closes [#366](https://github.com/Supamiu/ffxiv-teamcraft/issues/366)



<a name="4.0.14"></a>
## [4.0.14](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.13...v4.0.14) (2018-05-31)


### Performance Improvements

* **list:** huge performance improvement on lists regeneration ([90feec1](https://github.com/Supamiu/ffxiv-teamcraft/commit/90feec1))



<a name="4.0.13"></a>
## [4.0.13](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.12...v4.0.13) (2018-05-30)


### Bug Fixes

* custom links popup now creates links properly ([ef547c7](https://github.com/Supamiu/ffxiv-teamcraft/commit/ef547c7)), closes [#385](https://github.com/Supamiu/ffxiv-teamcraft/issues/385)
* **simulator:** fixed an issue with Innovative Touch not decreasing durability ([7220dcc](https://github.com/Supamiu/ffxiv-teamcraft/commit/7220dcc)), closes [#386](https://github.com/Supamiu/ffxiv-teamcraft/issues/386)


### Features

* **desktop:** way better window state management (position and size saving properly) ([373cafd](https://github.com/Supamiu/ffxiv-teamcraft/commit/373cafd))
* **simulator:** you can now see & edit rotation name inside simulator ([0d7d435](https://github.com/Supamiu/ffxiv-teamcraft/commit/0d7d435)), closes [#380](https://github.com/Supamiu/ffxiv-teamcraft/issues/380)
* current list shown inside bulk regeneration popup ([c4577b4](https://github.com/Supamiu/ffxiv-teamcraft/commit/c4577b4)), closes [#384](https://github.com/Supamiu/ffxiv-teamcraft/issues/384)
* new button to copy macro fragments to clipboard ([1f4e9cc](https://github.com/Supamiu/ffxiv-teamcraft/commit/1f4e9cc)), closes [#382](https://github.com/Supamiu/ffxiv-teamcraft/issues/382)



<a name="4.0.12"></a>
## [4.0.12](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.11...v4.0.12) (2018-05-29)


### Bug Fixes

* fixed an issue with custom layouts panel sometimes broken ([a9a2868](https://github.com/Supamiu/ffxiv-teamcraft/commit/a9a2868))
* fixed an issue with masterbooks popup in profile page ([83dee12](https://github.com/Supamiu/ffxiv-teamcraft/commit/83dee12))
* fixed an issue with precrafts inside pricing view ([768093b](https://github.com/Supamiu/ffxiv-teamcraft/commit/768093b))
* fixed an issue with pricing view not computing benefits properly ([e3b3459](https://github.com/Supamiu/ffxiv-teamcraft/commit/e3b3459))
* fixed an issue with reduction details popup freezing the app ([6865b77](https://github.com/Supamiu/ffxiv-teamcraft/commit/6865b77)), closes [#383](https://github.com/Supamiu/ffxiv-teamcraft/issues/383)



<a name="4.0.11"></a>
## [4.0.11](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.10...v4.0.11) (2018-05-29)


### Bug Fixes

* fixed an issue with gathering search in some languages (pt, es) ([dbbdc19](https://github.com/Supamiu/ffxiv-teamcraft/commit/dbbdc19))
* fixed an issue with pricing mode showing wrong values for precrafts ([11272b5](https://github.com/Supamiu/ffxiv-teamcraft/commit/11272b5))


### Features

* tags button now present inside list panel header ([e442cf9](https://github.com/Supamiu/ffxiv-teamcraft/commit/e442cf9))



<a name="4.0.10"></a>
## [4.0.10](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.9...v4.0.10) (2018-05-28)


### Bug Fixes

* **simulator:** fixed a bug with new rotation save ([ce3e091](https://github.com/Supamiu/ffxiv-teamcraft/commit/ce3e091))



<a name="4.0.9"></a>
## [4.0.9](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.8...v4.0.9) (2018-05-28)


### Bug Fixes

* layout order by job is no longer flickering ([4c6755b](https://github.com/Supamiu/ffxiv-teamcraft/commit/4c6755b))
* removed reset set button in simulator ([73acaea](https://github.com/Supamiu/ffxiv-teamcraft/commit/73acaea))
* **alarms:** fixed a bug with items search and their seeds (old world fig, etc) ([353a92a](https://github.com/Supamiu/ffxiv-teamcraft/commit/353a92a))
* **mobile:** fixed list panel buttons layout, they're now in the panel content ([fdfd2ed](https://github.com/Supamiu/ffxiv-teamcraft/commit/fdfd2ed)), closes [#360](https://github.com/Supamiu/ffxiv-teamcraft/issues/360)
* **simulator:** fixed a bug that was making simulation action costs hidden ([07576c9](https://github.com/Supamiu/ffxiv-teamcraft/commit/07576c9))
* **simulator:** tooltip now hidden upon drag ([2febfa2](https://github.com/Supamiu/ffxiv-teamcraft/commit/2febfa2))


### Features

* **simulator:** new "Save as new" button on rotations, creates a clone of the current rotation ([03d0548](https://github.com/Supamiu/ffxiv-teamcraft/commit/03d0548))


### Performance Improvements

* performance improvements for community lists ([55e3573](https://github.com/Supamiu/ffxiv-teamcraft/commit/55e3573))



<a name="4.0.8"></a>
## [4.0.8](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.7...v4.0.8) (2018-05-26)


### Bug Fixes

* fixes missing linebreaks when copying macro from firefox ([a571ef6](https://github.com/Supamiu/ffxiv-teamcraft/commit/a571ef6))
* **simulator:** better report amounts for step by step report ([2b29f97](https://github.com/Supamiu/ffxiv-teamcraft/commit/2b29f97))
* **simulator:** brand/name actions no longer taken as cross class action ([ceca859](https://github.com/Supamiu/ffxiv-teamcraft/commit/ceca859)), closes [#373](https://github.com/Supamiu/ffxiv-teamcraft/issues/373)
* **simulator:** fixed an issue with Specialty: Refurbish ([7432a9a](https://github.com/Supamiu/ffxiv-teamcraft/commit/7432a9a)), closes [#371](https://github.com/Supamiu/ffxiv-teamcraft/issues/371)


### Features

* **layout:** you can now order by job in layout panels ([283f01d](https://github.com/Supamiu/ffxiv-teamcraft/commit/283f01d))
* **simulator:** added audio signal for end of cross class setup ([f868827](https://github.com/Supamiu/ffxiv-teamcraft/commit/f868827)), closes [#373](https://github.com/Supamiu/ffxiv-teamcraft/issues/373)



<a name="4.0.7"></a>
## [4.0.7](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.6...v4.0.7) (2018-05-25)


### Bug Fixes

* better auto-update flow for "all users" installation ([f2b6462](https://github.com/Supamiu/ffxiv-teamcraft/commit/f2b6462)), closes [#359](https://github.com/Supamiu/ffxiv-teamcraft/issues/359)
* crafting rotations no longer reappearing out of nowhere ([3e09500](https://github.com/Supamiu/ffxiv-teamcraft/commit/3e09500)), closes [#355](https://github.com/Supamiu/ffxiv-teamcraft/issues/355)
* **simulator:** custom stats now save properly ([fdfb4c6](https://github.com/Supamiu/ffxiv-teamcraft/commit/fdfb4c6)), closes [#365](https://github.com/Supamiu/ffxiv-teamcraft/issues/365)
* **simulator:** way better design for failed actions, thanks to Aurora Phoenix ([3f7bcad](https://github.com/Supamiu/ffxiv-teamcraft/commit/3f7bcad))
* fixed an issue with shared lists not being visible ([f6eca9f](https://github.com/Supamiu/ffxiv-teamcraft/commit/f6eca9f))
* multi-crafter items now using correct stats in simulator ([fe9f0f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/fe9f0f1)), closes [#361](https://github.com/Supamiu/ffxiv-teamcraft/issues/361)
* no more duplicated tags in lists ([461cdad](https://github.com/Supamiu/ffxiv-teamcraft/commit/461cdad)), closes [#357](https://github.com/Supamiu/ffxiv-teamcraft/issues/357)
* rotations name generation now properly done (not retroactive) ([adf4c8f](https://github.com/Supamiu/ffxiv-teamcraft/commit/adf4c8f))
* rotations now save/copy properly, no more lost rotations ! ([6797621](https://github.com/Supamiu/ffxiv-teamcraft/commit/6797621)), closes [#363](https://github.com/Supamiu/ffxiv-teamcraft/issues/363)
* you can no longer add an empty id as contact ([6e074e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/6e074e4)), closes [#358](https://github.com/Supamiu/ffxiv-teamcraft/issues/358)


### Features

* added timers for duskglow aethersand in alarms page ([c9ceb8a](https://github.com/Supamiu/ffxiv-teamcraft/commit/c9ceb8a))
* **simulator:** added possibility to have end of macro sound ([d521342](https://github.com/Supamiu/ffxiv-teamcraft/commit/d521342))
* **simulator:** generated macro now includes /aaction setup ([ea71447](https://github.com/Supamiu/ffxiv-teamcraft/commit/ea71447)), closes [#368](https://github.com/Supamiu/ffxiv-teamcraft/issues/368)
* alarms page now adds all spawns of an item at once ([4536352](https://github.com/Supamiu/ffxiv-teamcraft/commit/4536352))
* default layout is now the one made by tataru taru ! ([6188914](https://github.com/Supamiu/ffxiv-teamcraft/commit/6188914))
* new collapsible panel in lists for community lists ([3d7f2d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/3d7f2d6))
* **simulator:** new step by step report popup ([9095c3d](https://github.com/Supamiu/ffxiv-teamcraft/commit/9095c3d)), closes [#364](https://github.com/Supamiu/ffxiv-teamcraft/issues/364)



<a name="4.0.6"></a>
## [4.0.6](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.5...v4.0.6) (2018-05-24)


### Bug Fixes

* better auto-update flow for "all users" installation ([f2b6462](https://github.com/Supamiu/ffxiv-teamcraft/commit/f2b6462)), closes [#359](https://github.com/Supamiu/ffxiv-teamcraft/issues/359)
* crafting rotations no longer reappearing out of nowhere ([3e09500](https://github.com/Supamiu/ffxiv-teamcraft/commit/3e09500)), closes [#355](https://github.com/Supamiu/ffxiv-teamcraft/issues/355)
* multi-crafter items now using correct stats in simulator ([fe9f0f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/fe9f0f1)), closes [#361](https://github.com/Supamiu/ffxiv-teamcraft/issues/361)
* no more duplicated tags in lists ([461cdad](https://github.com/Supamiu/ffxiv-teamcraft/commit/461cdad)), closes [#357](https://github.com/Supamiu/ffxiv-teamcraft/issues/357)
* rotations name generation now properly done (not retroactive) ([adf4c8f](https://github.com/Supamiu/ffxiv-teamcraft/commit/adf4c8f))
* rotations now save/copy properly, no more lost rotations ! ([6797621](https://github.com/Supamiu/ffxiv-teamcraft/commit/6797621)), closes [#363](https://github.com/Supamiu/ffxiv-teamcraft/issues/363)
* you can no longer add an empty id as contact ([6e074e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/6e074e4)), closes [#358](https://github.com/Supamiu/ffxiv-teamcraft/issues/358)


### Features

* added 4.3 currencies ([#356](https://github.com/Supamiu/ffxiv-teamcraft/issues/356)) ([155dfd7](https://github.com/Supamiu/ffxiv-teamcraft/commit/155dfd7))
* added timers for duskglow aethersand in alarms page ([c9ceb8a](https://github.com/Supamiu/ffxiv-teamcraft/commit/c9ceb8a))
* new collapsible panel in lists for community lists ([3d7f2d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/3d7f2d6))



<a name="4.0.5"></a>
## [4.0.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.4...v4.0.5) (2018-05-23)


### Bug Fixes

* **desktop:** only one instance can run at a given time now ([6860273](https://github.com/Supamiu/ffxiv-teamcraft/commit/6860273)), closes [#353](https://github.com/Supamiu/ffxiv-teamcraft/issues/353)
* **simulator:** consumables are now order by name, hq first ([fc17369](https://github.com/Supamiu/ffxiv-teamcraft/commit/fc17369))
* facebook oauth (mainly config on fb side) ([d7628b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/d7628b9))
* **simulator:** fixed a bug with rotations being renamed upon saving ([c2b8c96](https://github.com/Supamiu/ffxiv-teamcraft/commit/c2b8c96))



<a name="4.0.4"></a>
## [4.0.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.3...v4.0.4) (2018-05-22)


### Features

* new foods added to simulator ([0a18197](https://github.com/Supamiu/ffxiv-teamcraft/commit/0a18197))



<a name="4.0.3"></a>
## [4.0.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.1...v4.0.3) (2018-05-22)


### Bug Fixes

* external links are now opened inside OS default browser ([b42bcf2](https://github.com/Supamiu/ffxiv-teamcraft/commit/b42bcf2))
* fixed an issue with profile component and custom sets ([6b4c55d](https://github.com/Supamiu/ffxiv-teamcraft/commit/6b4c55d))
* simulator is now working even with lodestone maintenance ([68cd942](https://github.com/Supamiu/ffxiv-teamcraft/commit/68cd942))
* **simulator:** corrected action wait duration for macro generation ([796ea58](https://github.com/Supamiu/ffxiv-teamcraft/commit/796ea58))
* **simulator:** fixed an issue with lodestone maintenance ([77b7d69](https://github.com/Supamiu/ffxiv-teamcraft/commit/77b7d69))
* **simulator:** fixed an issue with stats not being loaded properly, causing a crash ([3544e0c](https://github.com/Supamiu/ffxiv-teamcraft/commit/3544e0c))


### Features

* **desktop:** new share button inside list details page ([92b83e1](https://github.com/Supamiu/ffxiv-teamcraft/commit/92b83e1))
* 4.3 data: item names, new npcs, new places, new weather ([83aa499](https://github.com/Supamiu/ffxiv-teamcraft/commit/83aa499))



<a name="4.0.2"></a>
## [4.0.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.1...v4.0.2) (2018-05-22)


### Bug Fixes

* external links are now opened inside OS default browser ([b42bcf2](https://github.com/Supamiu/ffxiv-teamcraft/commit/b42bcf2))
* fixed an issue with profile component and custom sets ([6b4c55d](https://github.com/Supamiu/ffxiv-teamcraft/commit/6b4c55d))
* **simulator:** fixed an issue with stats not being loaded properly, causing a crash ([3544e0c](https://github.com/Supamiu/ffxiv-teamcraft/commit/3544e0c))
* simulator is now working even with lodestone maintenance ([68cd942](https://github.com/Supamiu/ffxiv-teamcraft/commit/68cd942))


### Features

* **desktop:** new share button inside list details page ([92b83e1](https://github.com/Supamiu/ffxiv-teamcraft/commit/92b83e1))
* 4.3 data: item names, new npcs, new places, new weather ([83aa499](https://github.com/Supamiu/ffxiv-teamcraft/commit/83aa499))



<a name="4.0.1"></a>
## [4.0.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.0-beta.1...v4.0.1) (2018-05-21)


### Bug Fixes

* better approach for gatherings page alarm creation button ([0685a6f](https://github.com/Supamiu/ffxiv-teamcraft/commit/0685a6f)), closes [#346](https://github.com/Supamiu/ffxiv-teamcraft/issues/346)
* broken HQ icons in simulator page ([f10186f](https://github.com/Supamiu/ffxiv-teamcraft/commit/f10186f))
* community lists sometimes reloading with no reason ([17e63e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/17e63e6))
* fixed an issue with alarms persistence ([922a39b](https://github.com/Supamiu/ffxiv-teamcraft/commit/922a39b))
* fixed an issue with ffxivcrafting amount in mobile layouts ([3be1005](https://github.com/Supamiu/ffxiv-teamcraft/commit/3be1005))
* fixed an issue with profile component and custom sets ([6b4c55d](https://github.com/Supamiu/ffxiv-teamcraft/commit/6b4c55d))
* Food and medicine names are now shown in loaded rotation configuration ([b5d70f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5d70f1))
* masterbooks not saving in some cases ([ad2c245](https://github.com/Supamiu/ffxiv-teamcraft/commit/ad2c245))
* sometimes some or all lists don't show until page refresh ([8b053c1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b053c1)), closes [#344](https://github.com/Supamiu/ffxiv-teamcraft/issues/344)
* tags not saved properly ([ad8e9c9](https://github.com/Supamiu/ffxiv-teamcraft/commit/ad8e9c9))
* tiers display with non-crafts is now possible ([4ce9d36](https://github.com/Supamiu/ffxiv-teamcraft/commit/4ce9d36))
* wiki page broken in some cases ([2210db8](https://github.com/Supamiu/ffxiv-teamcraft/commit/2210db8))
* wrong amounts in some FC crafts with strange behavior ([e81cf0b](https://github.com/Supamiu/ffxiv-teamcraft/commit/e81cf0b)), closes [#337](https://github.com/Supamiu/ffxiv-teamcraft/issues/337)
* wrong level for crafters fetched from xivdb ([122ab11](https://github.com/Supamiu/ffxiv-teamcraft/commit/122ab11))


### Features

* **simulator:** you can now rename your rotations ([aaa80af](https://github.com/Supamiu/ffxiv-teamcraft/commit/aaa80af))
* contacts system for easy permissions management ([2846feb](https://github.com/Supamiu/ffxiv-teamcraft/commit/2846feb)), closes [#319](https://github.com/Supamiu/ffxiv-teamcraft/issues/319)
* it's now possible to propagate permissions of a workshop to lists in it ([9e2aae1](https://github.com/Supamiu/ffxiv-teamcraft/commit/9e2aae1)), closes [#347](https://github.com/Supamiu/ffxiv-teamcraft/issues/347)
* level requirements are now implemented inside simulator ([6ecc077](https://github.com/Supamiu/ffxiv-teamcraft/commit/6ecc077)), closes [#340](https://github.com/Supamiu/ffxiv-teamcraft/issues/340) [#339](https://github.com/Supamiu/ffxiv-teamcraft/issues/339)
* you can now edit crafter stats in profile ([47967b1](https://github.com/Supamiu/ffxiv-teamcraft/commit/47967b1))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.0-beta.1...v4.0.0) (2018-05-21)


### Bug Fixes

* better approach for gatherings page alarm creation button ([0685a6f](https://github.com/Supamiu/ffxiv-teamcraft/commit/0685a6f)), closes [#346](https://github.com/Supamiu/ffxiv-teamcraft/issues/346)
* broken HQ icons in simulator page ([f10186f](https://github.com/Supamiu/ffxiv-teamcraft/commit/f10186f))
* community lists sometimes reloading with no reason ([17e63e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/17e63e6))
* fixed an issue with alarms persistence ([922a39b](https://github.com/Supamiu/ffxiv-teamcraft/commit/922a39b))
* fixed an issue with ffxivcrafting amount in mobile layouts ([3be1005](https://github.com/Supamiu/ffxiv-teamcraft/commit/3be1005))
* Food and medicine names are now shown in loaded rotation configuration ([b5d70f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5d70f1))
* masterbooks not saving in some cases ([ad2c245](https://github.com/Supamiu/ffxiv-teamcraft/commit/ad2c245))
* sometimes some or all lists don't show until page refresh ([8b053c1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b053c1)), closes [#344](https://github.com/Supamiu/ffxiv-teamcraft/issues/344)
* tags not saved properly ([ad8e9c9](https://github.com/Supamiu/ffxiv-teamcraft/commit/ad8e9c9))
* tiers display with non-crafts is now possible ([4ce9d36](https://github.com/Supamiu/ffxiv-teamcraft/commit/4ce9d36))
* wiki page broken in some cases ([2210db8](https://github.com/Supamiu/ffxiv-teamcraft/commit/2210db8))
* wrong amounts in some FC crafts with strange behavior ([e81cf0b](https://github.com/Supamiu/ffxiv-teamcraft/commit/e81cf0b)), closes [#337](https://github.com/Supamiu/ffxiv-teamcraft/issues/337)
* wrong level for crafters fetched from xivdb ([122ab11](https://github.com/Supamiu/ffxiv-teamcraft/commit/122ab11))


### Features

* **simulator:** you can now rename your rotations ([aaa80af](https://github.com/Supamiu/ffxiv-teamcraft/commit/aaa80af))
* contacts system for easy permissions management ([2846feb](https://github.com/Supamiu/ffxiv-teamcraft/commit/2846feb)), closes [#319](https://github.com/Supamiu/ffxiv-teamcraft/issues/319)
* it's now possible to propagate permissions of a workshop to lists in it ([9e2aae1](https://github.com/Supamiu/ffxiv-teamcraft/commit/9e2aae1)), closes [#347](https://github.com/Supamiu/ffxiv-teamcraft/issues/347)
* level requirements are now implemented inside simulator ([6ecc077](https://github.com/Supamiu/ffxiv-teamcraft/commit/6ecc077)), closes [#340](https://github.com/Supamiu/ffxiv-teamcraft/issues/340) [#339](https://github.com/Supamiu/ffxiv-teamcraft/issues/339)
* you can now edit crafter stats in profile ([47967b1](https://github.com/Supamiu/ffxiv-teamcraft/commit/47967b1))



<a name="4.0.0-rc.2"></a>
# [4.0.0-rc.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.6.1...v4.0.0-rc.2) (2018-05-20)


### Bug Fixes

* better approach for gatherings page alarm creation button ([0685a6f](https://github.com/Supamiu/ffxiv-teamcraft/commit/0685a6f)), closes [#346](https://github.com/Supamiu/ffxiv-teamcraft/issues/346)
* broken HQ icons in simulator page ([f10186f](https://github.com/Supamiu/ffxiv-teamcraft/commit/f10186f))
* classic login considering email as not verified ([89a8254](https://github.com/Supamiu/ffxiv-teamcraft/commit/89a8254))
* community lists sometimes reloading with no reason ([17e63e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/17e63e6))
* crafter levels are now taken from lodestone profile, will be more reactive to changes ([010e76c](https://github.com/Supamiu/ffxiv-teamcraft/commit/010e76c))
* fixed a bug that was blocking items in workshop lists ([7717364](https://github.com/Supamiu/ffxiv-teamcraft/commit/7717364))
* fixed an issue with alarms persistence ([922a39b](https://github.com/Supamiu/ffxiv-teamcraft/commit/922a39b))
* fixed an issue with ffxivcrafting amount in mobile layouts ([3be1005](https://github.com/Supamiu/ffxiv-teamcraft/commit/3be1005))
* fixed issues with firebase SDK 5 migration ([1167078](https://github.com/Supamiu/ffxiv-teamcraft/commit/1167078))
* Food and medicine names are now shown in loaded rotation configuration ([b5d70f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5d70f1))
* gathering location search broken with some strange nodes ([33bc01a](https://github.com/Supamiu/ffxiv-teamcraft/commit/33bc01a))
* masterbooks not saving in some cases ([ad2c245](https://github.com/Supamiu/ffxiv-teamcraft/commit/ad2c245))
* slot is now shown ([b3e6b5f](https://github.com/Supamiu/ffxiv-teamcraft/commit/b3e6b5f))
* sometimes some or all lists don't show until page refresh ([8b053c1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b053c1)), closes [#344](https://github.com/Supamiu/ffxiv-teamcraft/issues/344)
* tags not saved properly ([ad8e9c9](https://github.com/Supamiu/ffxiv-teamcraft/commit/ad8e9c9))
* wrong level for crafters fetched from xivdb ([122ab11](https://github.com/Supamiu/ffxiv-teamcraft/commit/122ab11))
* **angular6:** lists page sometimes stuck on loading ([d19c3b4](https://github.com/Supamiu/ffxiv-teamcraft/commit/d19c3b4))
* **mobile:** fixed a bug with sidebar not scrollable on mobile view ([1a9b989](https://github.com/Supamiu/ffxiv-teamcraft/commit/1a9b989))
* **simulator:** fixed an issue with users having no gearsets ([cb718aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/cb718aa))
* **simulator:** it's no longer possible to edit stats without a job selected ([e0022e8](https://github.com/Supamiu/ffxiv-teamcraft/commit/e0022e8)), closes [#338](https://github.com/Supamiu/ffxiv-teamcraft/issues/338)


### Features

* **desktop:** new overlay window for alarms ([14cde5a](https://github.com/Supamiu/ffxiv-teamcraft/commit/14cde5a))
* **desktop:** new topbar for better UX ([0d35da3](https://github.com/Supamiu/ffxiv-teamcraft/commit/0d35da3))
* **simulator:** you can now rename your rotations ([aaa80af](https://github.com/Supamiu/ffxiv-teamcraft/commit/aaa80af))



<a name="4.0.0-rc.1"></a>
# [4.0.0-rc.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.0-beta.1...v4.0.0-rc.1) (2018-05-20)


### Bug Fixes

* better approach for gatherings page alarm creation button ([0685a6f](https://github.com/Supamiu/ffxiv-teamcraft/commit/0685a6f)), closes [#346](https://github.com/Supamiu/ffxiv-teamcraft/issues/346)
* broken HQ icons in simulator page ([f10186f](https://github.com/Supamiu/ffxiv-teamcraft/commit/f10186f))
* community lists sometimes reloading with no reason ([17e63e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/17e63e6))
* fixed an issue with alarms persistence ([922a39b](https://github.com/Supamiu/ffxiv-teamcraft/commit/922a39b))
* fixed an issue with ffxivcrafting amount in mobile layouts ([3be1005](https://github.com/Supamiu/ffxiv-teamcraft/commit/3be1005))
* Food and medicine names are now shown in loaded rotation configuration ([b5d70f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5d70f1))
* masterbooks not saving in some cases ([ad2c245](https://github.com/Supamiu/ffxiv-teamcraft/commit/ad2c245))
* sometimes some or all lists don't show until page refresh ([8b053c1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b053c1)), closes [#344](https://github.com/Supamiu/ffxiv-teamcraft/issues/344)
* tags not saved properly ([ad8e9c9](https://github.com/Supamiu/ffxiv-teamcraft/commit/ad8e9c9))


### Features

* **simulator:** you can now rename your rotations ([aaa80af](https://github.com/Supamiu/ffxiv-teamcraft/commit/aaa80af))



<a name="4.0.0-rc.0"></a>
# [4.0.0-rc.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.0-beta.1...v4.0.0-rc.0) (2018-05-20)


### Bug Fixes

* community lists sometimes reloading with no reason ([17e63e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/17e63e6))
* masterbooks not saving in some cases ([ad2c245](https://github.com/Supamiu/ffxiv-teamcraft/commit/ad2c245))
* sometimes some or all lists don't show until page refresh ([8b053c1](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b053c1)), closes [#344](https://github.com/Supamiu/ffxiv-teamcraft/issues/344)
* tags not saved properly ([ad8e9c9](https://github.com/Supamiu/ffxiv-teamcraft/commit/ad8e9c9))



<a name="4.0.0-beta.1"></a>
# [4.0.0-beta.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2018-05-20)


### Bug Fixes

* fixed a bug that was blocking items in workshop lists ([7717364](https://github.com/Supamiu/ffxiv-teamcraft/commit/7717364))


### Features

* **desktop:** new topbar for better UX ([0d35da3](https://github.com/Supamiu/ffxiv-teamcraft/commit/0d35da3))



<a name="4.0.0-beta.0"></a>
# [4.0.0-beta.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.6.1...v4.0.0-beta.0) (2018-05-19)


### Bug Fixes

* **angular6:** lists page sometimes stuck on loading ([d19c3b4](https://github.com/Supamiu/ffxiv-teamcraft/commit/d19c3b4))
* **mobile:** fixed a bug with sidebar not scrollable on mobile view ([1a9b989](https://github.com/Supamiu/ffxiv-teamcraft/commit/1a9b989))
* **simulator:** fixed an issue with users having no gearsets ([cb718aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/cb718aa))
* **simulator:** it's no longer possible to edit stats without a job selected ([e0022e8](https://github.com/Supamiu/ffxiv-teamcraft/commit/e0022e8)), closes [#338](https://github.com/Supamiu/ffxiv-teamcraft/issues/338)
* classic login considering email as not verified ([89a8254](https://github.com/Supamiu/ffxiv-teamcraft/commit/89a8254))
* crafter levels are now taken from lodestone profile, will be more reactive to changes ([010e76c](https://github.com/Supamiu/ffxiv-teamcraft/commit/010e76c))
* fixed issues with firebase SDK 5 migration ([1167078](https://github.com/Supamiu/ffxiv-teamcraft/commit/1167078))
* gathering location search broken with some strange nodes ([33bc01a](https://github.com/Supamiu/ffxiv-teamcraft/commit/33bc01a))
* slot is now shown ([b3e6b5f](https://github.com/Supamiu/ffxiv-teamcraft/commit/b3e6b5f))


### Features

* **desktop:** new overlay window for alarms ([14cde5a](https://github.com/Supamiu/ffxiv-teamcraft/commit/14cde5a))



<a name="3.6.1"></a>
## [3.6.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.6.0...v3.6.1) (2018-05-10)


### Bug Fixes

* **simulator:** fixed buffs duration not handled properly in snapshot mode ([d6835b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6835b9))
* **simulator:** you don't need an account anymore for custom mode ([aa81872](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa81872))
* byregot's brow can now only be used with 2 or more Inner Quiet stacks ([c87285e](https://github.com/Supamiu/ffxiv-teamcraft/commit/c87285e))


### Features

* **simulator:** actions can now be dragged inside rotation (https://i.imgur.com/68jTydA.gifv) ([48b6eee](https://github.com/Supamiu/ffxiv-teamcraft/commit/48b6eee))
* **simulator:** added links to external simulators inside crafting menu ([1edc7a6](https://github.com/Supamiu/ffxiv-teamcraft/commit/1edc7a6))
* **simulator:** food names are now sorted alphabetically, hq first ([40ddb37](https://github.com/Supamiu/ffxiv-teamcraft/commit/40ddb37))
* **simulator:** you can now save custom stats for your crafting jobs ([3784e1f](https://github.com/Supamiu/ffxiv-teamcraft/commit/3784e1f))


### Performance Improvements

* improved display performances on large lists ([a96a51c](https://github.com/Supamiu/ffxiv-teamcraft/commit/a96a51c))



<a name="3.6.0"></a>
# [3.6.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.5.1...v3.6.0) (2018-05-06)


### Bug Fixes

* fixed a bug with xivdb links in non-EN languages ([ece88f5](https://github.com/Supamiu/ffxiv-teamcraft/commit/ece88f5)), closes [#332](https://github.com/Supamiu/ffxiv-teamcraft/issues/332)
* folklore icon missing in some cases ([40a2d16](https://github.com/Supamiu/ffxiv-teamcraft/commit/40a2d16))
* inventory view was broken ([4ff8397](https://github.com/Supamiu/ffxiv-teamcraft/commit/4ff8397))
* material amount now properly updated when adding crafts that uses them ([d6cfd2b](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6cfd2b)), closes [#330](https://github.com/Supamiu/ffxiv-teamcraft/issues/330)
* wiki page fallback to english wasn't working properly ([1cf1f78](https://github.com/Supamiu/ffxiv-teamcraft/commit/1cf1f78))
* **simulator:** Ingenuity II not imported properly from a crafting optimizer export ([70382d1](https://github.com/Supamiu/ffxiv-teamcraft/commit/70382d1)), closes [#333](https://github.com/Supamiu/ffxiv-teamcraft/issues/333)
* **wiki:** links for external tools weren't working properly ([e012884](https://github.com/Supamiu/ffxiv-teamcraft/commit/e012884))
* **wiki:** page considered not found while it was when in english ([95e4b79](https://github.com/Supamiu/ffxiv-teamcraft/commit/95e4b79))
* **wiki:** wiki external links now open in new tab ([81bfef1](https://github.com/Supamiu/ffxiv-teamcraft/commit/81bfef1))


### Features

* add ES language support ([690ac68](https://github.com/Supamiu/ffxiv-teamcraft/commit/690ac68))
* **patrons:** custom links available for crafting rotations ([1c36ac4](https://github.com/Supamiu/ffxiv-teamcraft/commit/1c36ac4))
* **wiki:** new wiki page for crafting simulator ([c1411e0](https://github.com/Supamiu/ffxiv-teamcraft/commit/c1411e0))
* new compact mode for alarms page ([5eee2d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/5eee2d8))
* new simulator page to create and share rotations ([9a5bd3a](https://github.com/Supamiu/ffxiv-teamcraft/commit/9a5bd3a)), closes [#335](https://github.com/Supamiu/ffxiv-teamcraft/issues/335)
* pop-up for reset or delete list once it's completed ([bb202b6](https://github.com/Supamiu/ffxiv-teamcraft/commit/bb202b6)), closes [#321](https://github.com/Supamiu/ffxiv-teamcraft/issues/321)



<a name="3.5.1"></a>
## [3.5.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.5.0...v3.5.1) (2018-04-23)


### Bug Fixes

* final permissions system fix, thanks javascript references ([358e81f](https://github.com/Supamiu/ffxiv-teamcraft/commit/358e81f))
* gathering item location can't find non-timed nodes ([b893772](https://github.com/Supamiu/ffxiv-teamcraft/commit/b893772))
* login sometimes triggers an email spam and a temporary ban from logging in from firebase ([3f5e310](https://github.com/Supamiu/ffxiv-teamcraft/commit/3f5e310)), closes [#316](https://github.com/Supamiu/ffxiv-teamcraft/issues/316)
* map name was sometimes incorrect ([3739e36](https://github.com/Supamiu/ffxiv-teamcraft/commit/3739e36)), closes [#325](https://github.com/Supamiu/ffxiv-teamcraft/issues/325)
* permissions fixes with workshops ([a0236be](https://github.com/Supamiu/ffxiv-teamcraft/commit/a0236be))
* updated translations to avoid confusion with shared items (which are only write access items) ([3d213ca](https://github.com/Supamiu/ffxiv-teamcraft/commit/3d213ca))


### Features

* features page has been removed for a new wiki system ([ea7226a](https://github.com/Supamiu/ffxiv-teamcraft/commit/ea7226a))
* features page is now replaced with the wiki ([14fa86c](https://github.com/Supamiu/ffxiv-teamcraft/commit/14fa86c))
* folklore book now shown (to know which book to buy) ([531d5f9](https://github.com/Supamiu/ffxiv-teamcraft/commit/531d5f9))
* portuguese translation ([fa56ea4](https://github.com/Supamiu/ffxiv-teamcraft/commit/fa56ea4))
* two new layout filters: IS_TOME_TRADE and IS_SCRIPT_TRADE ([85e2494](https://github.com/Supamiu/ffxiv-teamcraft/commit/85e2494))



<a name="3.5.0"></a>
# [3.5.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.6...v3.5.0) (2018-04-16)


### Bug Fixes

* external list import dialog box now has a cancel button in each step to close the dialog ([616898a](https://github.com/Supamiu/ffxiv-teamcraft/commit/616898a))
* fixed a bug with list regeneration sometimes settings the wrong amount done ([bfc857c](https://github.com/Supamiu/ffxiv-teamcraft/commit/bfc857c)), closes [#318](https://github.com/Supamiu/ffxiv-teamcraft/issues/318)


### Features

* added a link to profile page on missing book warning icon ([1921fa6](https://github.com/Supamiu/ffxiv-teamcraft/commit/1921fa6)), closes [#312](https://github.com/Supamiu/ffxiv-teamcraft/issues/312)
* alarms are now stored in your account so they are now cross-platform ([a5efca7](https://github.com/Supamiu/ffxiv-teamcraft/commit/a5efca7)), closes [#275](https://github.com/Supamiu/ffxiv-teamcraft/issues/275)
* better seo configuration ([d288a84](https://github.com/Supamiu/ffxiv-teamcraft/commit/d288a84)), closes [#198](https://github.com/Supamiu/ffxiv-teamcraft/issues/198)
* **permissions:** FC-only workshops are now a thing ([0f1da89](https://github.com/Supamiu/ffxiv-teamcraft/commit/0f1da89)), closes [#251](https://github.com/Supamiu/ffxiv-teamcraft/issues/251) [#277](https://github.com/Supamiu/ffxiv-teamcraft/issues/277)
* craft icons now have a link to simulator ([4eb4b3c](https://github.com/Supamiu/ffxiv-teamcraft/commit/4eb4b3c))
* display filters (hide when used/completed) are now saved to your account ([f617655](https://github.com/Supamiu/ffxiv-teamcraft/commit/f617655)), closes [#289](https://github.com/Supamiu/ffxiv-teamcraft/issues/289)
* it's now possible to enable tracking on crystals ([1de6208](https://github.com/Supamiu/ffxiv-teamcraft/commit/1de6208)), closes [#254](https://github.com/Supamiu/ffxiv-teamcraft/issues/254)
* you can now create alarms from the gathering location finder ([b8dccc9](https://github.com/Supamiu/ffxiv-teamcraft/commit/b8dccc9)), closes [#286](https://github.com/Supamiu/ffxiv-teamcraft/issues/286)
* you can now manage permissions on lists ([f6f24bd](https://github.com/Supamiu/ffxiv-teamcraft/commit/f6f24bd)), closes [#277](https://github.com/Supamiu/ffxiv-teamcraft/issues/277) [#316](https://github.com/Supamiu/ffxiv-teamcraft/issues/316)
* you can now order "Items" panel based on level or localized name in your layout ([530fe94](https://github.com/Supamiu/ffxiv-teamcraft/commit/530fe94)), closes [#296](https://github.com/Supamiu/ffxiv-teamcraft/issues/296)


### Reverts

* add proper tag settings in some main pages ([03cf2e4](https://github.com/Supamiu/ffxiv-teamcraft/commit/03cf2e4))
* better seo configuration ([ff3ddca](https://github.com/Supamiu/ffxiv-teamcraft/commit/ff3ddca))



<a name="3.4.6"></a>
## [3.4.6](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.5...v3.4.6) (2018-04-11)


### Features

* monster details now include level ([b5aa600](https://github.com/Supamiu/ffxiv-teamcraft/commit/b5aa600))
* outdated lists are now automatically regenerated when opened by the author ([bc915d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/bc915d8))
* you can now import lists from external websites ([36f34e7](https://github.com/Supamiu/ffxiv-teamcraft/commit/36f34e7)), closes [#311](https://github.com/Supamiu/ffxiv-teamcraft/issues/311)



<a name="3.4.5"></a>
## [3.4.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.4...v3.4.5) (2018-04-10)


### Bug Fixes

* "Timers" icon on list details not under scroll bar anymore ([be39c00](https://github.com/Supamiu/ffxiv-teamcraft/commit/be39c00)), closes [#310](https://github.com/Supamiu/ffxiv-teamcraft/issues/310)
* editing masterbooks on profile sometimes creates a new quick list ([3831674](https://github.com/Supamiu/ffxiv-teamcraft/commit/3831674))
* help dialog is no longer opened at first page visit ([1cb8f6a](https://github.com/Supamiu/ffxiv-teamcraft/commit/1cb8f6a))
* isearch value quotes ([9e5001a](https://github.com/Supamiu/ffxiv-teamcraft/commit/9e5001a))
* no more <Indent/> in french item names ([1b11ed9](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b11ed9))
* You can now edit patreon email in your profile page ([2e71b70](https://github.com/Supamiu/ffxiv-teamcraft/commit/2e71b70)), closes [#291](https://github.com/Supamiu/ffxiv-teamcraft/issues/291)


### Features

* a dialog box will now show if you leave/reload the page while changes are saving ([3b918f5](https://github.com/Supamiu/ffxiv-teamcraft/commit/3b918f5)), closes [#309](https://github.com/Supamiu/ffxiv-teamcraft/issues/309)
* amount of items to get is now displayed in navigation map steps ([33aa31e](https://github.com/Supamiu/ffxiv-teamcraft/commit/33aa31e)), closes [#314](https://github.com/Supamiu/ffxiv-teamcraft/issues/314)
* you can now see monsters location in drop details popup ([b19be3d](https://github.com/Supamiu/ffxiv-teamcraft/commit/b19be3d)), closes [#246](https://github.com/Supamiu/ffxiv-teamcraft/issues/246)



<a name="3.4.4"></a>
## [3.4.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.3...v3.4.4) (2018-04-03)


### Bug Fixes

* "working on it" avatar no longer wrong after some manipulations ([e91ba36](https://github.com/Supamiu/ffxiv-teamcraft/commit/e91ba36))
* macro translation is now working properly with non-skill lines ([f456443](https://github.com/Supamiu/ffxiv-teamcraft/commit/f456443))
* tags now copy over lists ([85fba38](https://github.com/Supamiu/ffxiv-teamcraft/commit/85fba38)), closes [#304](https://github.com/Supamiu/ffxiv-teamcraft/issues/304)


### Features

* new right-side drawer to show alarm timers no matter which page you're on ([ebaa7fe](https://github.com/Supamiu/ffxiv-teamcraft/commit/ebaa7fe))
* show indicator for items used for final crafts ([1e11c8c](https://github.com/Supamiu/ffxiv-teamcraft/commit/1e11c8c))
* you can now copy isearch macros for items using the new magnifying glass icon ([9b206cb](https://github.com/Supamiu/ffxiv-teamcraft/commit/9b206cb)), closes [#276](https://github.com/Supamiu/ffxiv-teamcraft/issues/276)



<a name="3.4.3"></a>
## [3.4.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.2...v3.4.3) (2018-03-27)


### Features

* compact view for sidebar menu ([52c59f1](https://github.com/Supamiu/ffxiv-teamcraft/commit/52c59f1)), closes [#294](https://github.com/Supamiu/ffxiv-teamcraft/issues/294)



<a name="3.4.2"></a>
## [3.4.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.1...v3.4.2) (2018-03-26)


### Bug Fixes

* list layout broken with listData is null ([2f14904](https://github.com/Supamiu/ffxiv-teamcraft/commit/2f14904))
* long list notes no longer pushing buttons off screen ([34bbdb9](https://github.com/Supamiu/ffxiv-teamcraft/commit/34bbdb9))
* various minor bugs reported by sentry ([7ed7f4b](https://github.com/Supamiu/ffxiv-teamcraft/commit/7ed7f4b))


### Features

* Made 'Reset progression' more user-friendly ([2b5b68a](https://github.com/Supamiu/ffxiv-teamcraft/commit/2b5b68a))
* new list template feature (link that produces a copy of a given list) ([bac004e](https://github.com/Supamiu/ffxiv-teamcraft/commit/bac004e)), closes [#301](https://github.com/Supamiu/ffxiv-teamcraft/issues/301)



<a name="3.4.1"></a>
## [3.4.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.0...v3.4.1) (2018-03-23)


### Bug Fixes

* alternating line colours do not work as expected when lines are hidden by a filter. ([b0e449a](https://github.com/Supamiu/ffxiv-teamcraft/commit/b0e449a)), closes [#288](https://github.com/Supamiu/ffxiv-teamcraft/issues/288) [#287](https://github.com/Supamiu/ffxiv-teamcraft/issues/287)
* cloning a list resets its progression ([f0a31c6](https://github.com/Supamiu/ffxiv-teamcraft/commit/f0a31c6))
* error when canceling login oauth dialog box ([2595228](https://github.com/Supamiu/ffxiv-teamcraft/commit/2595228))
* error when creating a new layout and cancelling the dialog box ([0e72803](https://github.com/Supamiu/ffxiv-teamcraft/commit/0e72803))
* error when logging out ([c405537](https://github.com/Supamiu/ffxiv-teamcraft/commit/c405537))
* errors in the console on a fresh new session ([87068dc](https://github.com/Supamiu/ffxiv-teamcraft/commit/87068dc))
* IS_GATHERED_BY_FSH doesn't do anything ([6c4bb9a](https://github.com/Supamiu/ffxiv-teamcraft/commit/6c4bb9a)), closes [#290](https://github.com/Supamiu/ffxiv-teamcraft/issues/290)
* list page slower with zone breakdown ([d97bc19](https://github.com/Supamiu/ffxiv-teamcraft/commit/d97bc19))



<a name="3.4.0"></a>
# [3.4.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.0-beta.5...v3.4.0) (2018-03-22)



<a name="3.4.0-beta.5"></a>
# [3.4.0-beta.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.0-beta.4...v3.4.0-beta.5) (2018-03-21)


### Bug Fixes

* comments amount not updated when commenting an item ([00d5939](https://github.com/Supamiu/ffxiv-teamcraft/commit/00d5939))
* comments not working in zone breakdown ([0d5b4a6](https://github.com/Supamiu/ffxiv-teamcraft/commit/0d5b4a6)), closes [#281](https://github.com/Supamiu/ffxiv-teamcraft/issues/281)
* instance returned by gathering search causing strange results ([b025547](https://github.com/Supamiu/ffxiv-teamcraft/commit/b025547))
* items filtered and shown on wrong panel ([c6480aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/c6480aa)), closes [#270](https://github.com/Supamiu/ffxiv-teamcraft/issues/270)


### Features

* multiple list layout system ([709138c](https://github.com/Supamiu/ffxiv-teamcraft/commit/709138c)), closes [#244](https://github.com/Supamiu/ffxiv-teamcraft/issues/244) [#230](https://github.com/Supamiu/ffxiv-teamcraft/issues/230)
* new announcement box ([f697d96](https://github.com/Supamiu/ffxiv-teamcraft/commit/f697d96)), closes [#256](https://github.com/Supamiu/ffxiv-teamcraft/issues/256)



<a name="3.4.0-beta.4"></a>
# [3.4.0-beta.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.0-beta.3...v3.4.0-beta.4) (2018-03-20)


### Features

* ability to search for a gathering to see its position on the map ([cd60ae1](https://github.com/Supamiu/ffxiv-teamcraft/commit/cd60ae1)), closes [#203](https://github.com/Supamiu/ffxiv-teamcraft/issues/203)



<a name="3.4.0-beta.3"></a>
# [3.4.0-beta.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.0-beta.2...v3.4.0-beta.3) (2018-03-20)


### Bug Fixes

* "NaN to reach total" sometimes shown on amount input fields ([1f05c42](https://github.com/Supamiu/ffxiv-teamcraft/commit/1f05c42))
* **beta:** patreon email linking is case-sensitive (not anymore) ([8fc3077](https://github.com/Supamiu/ffxiv-teamcraft/commit/8fc3077))
* **beta:** unable to link nickname to profile ([eea0aa3](https://github.com/Supamiu/ffxiv-teamcraft/commit/eea0aa3)), closes [#280](https://github.com/Supamiu/ffxiv-teamcraft/issues/280)
* list author avatar hidden in list panel ([ae0b5e6](https://github.com/Supamiu/ffxiv-teamcraft/commit/ae0b5e6))
* little issue with the recipe addition to a list not in workshop ([b13add1](https://github.com/Supamiu/ffxiv-teamcraft/commit/b13add1))


### Features

* optimized navigation map for zone breakdown ([fe1438b](https://github.com/Supamiu/ffxiv-teamcraft/commit/fe1438b)), closes [#185](https://github.com/Supamiu/ffxiv-teamcraft/issues/185)
* show closest aetheryte to TP in the same map for gatherable items ([5d35b8f](https://github.com/Supamiu/ffxiv-teamcraft/commit/5d35b8f)), closes [#185](https://github.com/Supamiu/ffxiv-teamcraft/issues/185)



<a name="3.4.0-beta.2"></a>
# [3.4.0-beta.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.0-beta.1...v3.4.0-beta.2) (2018-03-16)


### Bug Fixes

* add ceil to trade details total amount ([a78888d](https://github.com/Supamiu/ffxiv-teamcraft/commit/a78888d))
* error in select all button when user has no masterbooks ([90e7d5c](https://github.com/Supamiu/ffxiv-teamcraft/commit/90e7d5c))
* missing help dialog box for list details page ([16c7ecd](https://github.com/Supamiu/ffxiv-teamcraft/commit/16c7ecd))
* missing translation in list layout dialog box ([6a40cbe](https://github.com/Supamiu/ffxiv-teamcraft/commit/6a40cbe))
* progression kept in list clones ([0ad5729](https://github.com/Supamiu/ffxiv-teamcraft/commit/0ad5729))


### Features

* add filter for tradeable items ([f0bd572](https://github.com/Supamiu/ffxiv-teamcraft/commit/f0bd572)), closes [#267](https://github.com/Supamiu/ffxiv-teamcraft/issues/267)
* add ventures data extractor ([208562e](https://github.com/Supamiu/ffxiv-teamcraft/commit/208562e)), closes [#161](https://github.com/Supamiu/ffxiv-teamcraft/issues/161)
* custom list link (patreon supporters only) ([5f897cd](https://github.com/Supamiu/ffxiv-teamcraft/commit/5f897cd)), closes [#217](https://github.com/Supamiu/ffxiv-teamcraft/issues/217)
* hide when used ([dc74170](https://github.com/Supamiu/ffxiv-teamcraft/commit/dc74170)), closes [#247](https://github.com/Supamiu/ffxiv-teamcraft/issues/247)
* link patreon email to your profile for automatic patreon recognition ([e6e1cb2](https://github.com/Supamiu/ffxiv-teamcraft/commit/e6e1cb2))
* mark workshops as favourite ([0fa9d22](https://github.com/Supamiu/ffxiv-teamcraft/commit/0fa9d22)), closes [#255](https://github.com/Supamiu/ffxiv-teamcraft/issues/255)



<a name="3.4.0-beta.1"></a>
# [3.4.0-beta.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.4.0-beta.0...v3.4.0-beta.1) (2018-03-12)


### Bug Fixes

* wrong amount used in some crafts for canBeCrafted flag ([fc4524c](https://github.com/Supamiu/ffxiv-teamcraft/commit/fc4524c))
* wrong item amount in requirements dialog box ([cabe973](https://github.com/Supamiu/ffxiv-teamcraft/commit/cabe973))


### Features

* alarm notification sound switch ([3dccf0e](https://github.com/Supamiu/ffxiv-teamcraft/commit/3dccf0e)), closes [#274](https://github.com/Supamiu/ffxiv-teamcraft/issues/274)
* rename workshops ([d6e706b](https://github.com/Supamiu/ffxiv-teamcraft/commit/d6e706b)), closes [#268](https://github.com/Supamiu/ffxiv-teamcraft/issues/268)
* workshops in "add item to list" dialog ([bb6b6b2](https://github.com/Supamiu/ffxiv-teamcraft/commit/bb6b6b2)), closes [#272](https://github.com/Supamiu/ffxiv-teamcraft/issues/272)



<a name="3.4.0-beta.0"></a>
# [3.4.0-beta.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.3.1...v3.4.0-beta.0) (2018-03-09)


### Bug Fixes

* : weird alarm behavior with timers around 12AM ([a0add09](https://github.com/Supamiu/ffxiv-teamcraft/commit/a0add09)), closes [#194](https://github.com/Supamiu/ffxiv-teamcraft/issues/194)
* aethersands not filtered by IS_TIMED ([71b2806](https://github.com/Supamiu/ffxiv-teamcraft/commit/71b2806))
* alarms played 3 times on each spawn ([3a6a329](https://github.com/Supamiu/ffxiv-teamcraft/commit/3a6a329))
* auto translated macro invalid in macro translator ([b46435e](https://github.com/Supamiu/ffxiv-teamcraft/commit/b46435e)), closes [#252](https://github.com/Supamiu/ffxiv-teamcraft/issues/252)
* collectible switch not working properly ([c2eef95](https://github.com/Supamiu/ffxiv-teamcraft/commit/c2eef95))
* copy to clipboard not available in small viewports ([ee2f2dc](https://github.com/Supamiu/ffxiv-teamcraft/commit/ee2f2dc))
* filters not working anymore ([aa6d514](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa6d514))
* fish level sometimes wrong ([f3cc02f](https://github.com/Supamiu/ffxiv-teamcraft/commit/f3cc02f))
* push notifications queued for next call if not closed manually ([635095a](https://github.com/Supamiu/ffxiv-teamcraft/commit/635095a)), closes [#257](https://github.com/Supamiu/ffxiv-teamcraft/issues/257)
* sands timers missing ([da742a8](https://github.com/Supamiu/ffxiv-teamcraft/commit/da742a8))
* template broken on outdated lists with reductions ([e6d304d](https://github.com/Supamiu/ffxiv-teamcraft/commit/e6d304d)), closes [#258](https://github.com/Supamiu/ffxiv-teamcraft/issues/258)
* working on it not tagging immediately ([8167f7b](https://github.com/Supamiu/ffxiv-teamcraft/commit/8167f7b))
* workshop broken in some cases ([ac85600](https://github.com/Supamiu/ffxiv-teamcraft/commit/ac85600))


### Features

* class icon in alarms panel ([67eadad](https://github.com/Supamiu/ffxiv-teamcraft/commit/67eadad)), closes [#263](https://github.com/Supamiu/ffxiv-teamcraft/issues/263)
* compact view in alarm panel ([c710021](https://github.com/Supamiu/ffxiv-teamcraft/commit/c710021)), closes [#262](https://github.com/Supamiu/ffxiv-teamcraft/issues/262)
* new language button in settings ([ceb14ae](https://github.com/Supamiu/ffxiv-teamcraft/commit/ceb14ae))
* show warning if missing book on gatherings ([17eb72b](https://github.com/Supamiu/ffxiv-teamcraft/commit/17eb72b))
* tags on list should appear in list listing ([29c0b96](https://github.com/Supamiu/ffxiv-teamcraft/commit/29c0b96)), closes [#265](https://github.com/Supamiu/ffxiv-teamcraft/issues/265)



<a name="3.3.2"></a>
## [3.3.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.3.1...v3.3.2) (2018-03-03)


### Bug Fixes

* : weird alarm behavior with timers around 12AM ([a0add09](https://github.com/Supamiu/ffxiv-teamcraft/commit/a0add09)), closes [#194](https://github.com/Supamiu/ffxiv-teamcraft/issues/194)
* aethersands not filtered by IS_TIMED ([71b2806](https://github.com/Supamiu/ffxiv-teamcraft/commit/71b2806))
* alarms played 3 times on each spawn ([3a6a329](https://github.com/Supamiu/ffxiv-teamcraft/commit/3a6a329))
* filters not working anymore ([aa6d514](https://github.com/Supamiu/ffxiv-teamcraft/commit/aa6d514))
* fish level sometimes wrong ([f3cc02f](https://github.com/Supamiu/ffxiv-teamcraft/commit/f3cc02f))
* sands timers missing ([da742a8](https://github.com/Supamiu/ffxiv-teamcraft/commit/da742a8))
* working on it not tagging immediately ([8167f7b](https://github.com/Supamiu/ffxiv-teamcraft/commit/8167f7b))


### Features

* new language button in settings ([ceb14ae](https://github.com/Supamiu/ffxiv-teamcraft/commit/ceb14ae))



<a name="3.3.1"></a>
## [3.3.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.3.0...v3.3.1) (2018-03-01)


### Bug Fixes

* check all masterbooks not checking them all ([8053e65](https://github.com/Supamiu/ffxiv-teamcraft/commit/8053e65))
* drafts considered as mastercraft book not owned ([4e5d03b](https://github.com/Supamiu/ffxiv-teamcraft/commit/4e5d03b))
* profile not loading picture ([6765790](https://github.com/Supamiu/ffxiv-teamcraft/commit/6765790))
* public lists search resetting page ([b892272](https://github.com/Supamiu/ffxiv-teamcraft/commit/b892272))


### Features

* add collectible switch for item addition ([2c80ba5](https://github.com/Supamiu/ffxiv-teamcraft/commit/2c80ba5)), closes [#189](https://github.com/Supamiu/ffxiv-teamcraft/issues/189)
* new IS_REDUCTION filter ([1861b27](https://github.com/Supamiu/ffxiv-teamcraft/commit/1861b27))



<a name="3.3.0"></a>
# [3.3.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.2.3...v3.3.0) (2018-02-28)


### Bug Fixes

* black social fabs ([#221](https://github.com/Supamiu/ffxiv-teamcraft/issues/221)) ([deebdaf](https://github.com/Supamiu/ffxiv-teamcraft/commit/deebdaf))
* can't clone public lists ([8412c1c](https://github.com/Supamiu/ffxiv-teamcraft/commit/8412c1c))
* community list search not case-sensitive anymore ([d47d6b7](https://github.com/Supamiu/ffxiv-teamcraft/commit/d47d6b7))
* favorites feature broken (fav page always empty) ([aee31e9](https://github.com/Supamiu/ffxiv-teamcraft/commit/aee31e9)), closes [#223](https://github.com/Supamiu/ffxiv-teamcraft/issues/223)
* folklore filter doesn't work properly ([517ea8f](https://github.com/Supamiu/ffxiv-teamcraft/commit/517ea8f))
* gardening icon always present in some viewports ([063cf58](https://github.com/Supamiu/ffxiv-teamcraft/commit/063cf58)), closes [#224](https://github.com/Supamiu/ffxiv-teamcraft/issues/224)
* inventory breakdown broken ([aaebae4](https://github.com/Supamiu/ffxiv-teamcraft/commit/aaebae4)), closes [#225](https://github.com/Supamiu/ffxiv-teamcraft/issues/225)
* item marked as not craftable while every requirement is met ([332f246](https://github.com/Supamiu/ffxiv-teamcraft/commit/332f246))
* items with multiple recipes have wrong shards or none at all ([ea62f7b](https://github.com/Supamiu/ffxiv-teamcraft/commit/ea62f7b)), closes [#214](https://github.com/Supamiu/ffxiv-teamcraft/issues/214)
* items without zone data hidden in zone breakdown ([76be67d](https://github.com/Supamiu/ffxiv-teamcraft/commit/76be67d))
* list layout not reloaded after edition ([e693bcb](https://github.com/Supamiu/ffxiv-teamcraft/commit/e693bcb)), closes [#234](https://github.com/Supamiu/ffxiv-teamcraft/issues/234)
* lists can be created without names and can't be renamed afterwards ([b95840f](https://github.com/Supamiu/ffxiv-teamcraft/commit/b95840f)), closes [#216](https://github.com/Supamiu/ffxiv-teamcraft/issues/216)
* lists not deleting after account creation (lists migration) ([2ca5bc3](https://github.com/Supamiu/ffxiv-teamcraft/commit/2ca5bc3)), closes [#227](https://github.com/Supamiu/ffxiv-teamcraft/issues/227)
* lists not found are loading forever ([98fa4a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/98fa4a2)), closes [#232](https://github.com/Supamiu/ffxiv-teamcraft/issues/232)
* nodes despawning at midnight aren't shown as spawned ([77c12a4](https://github.com/Supamiu/ffxiv-teamcraft/commit/77c12a4))
* regenerate button not present ([43926df](https://github.com/Supamiu/ffxiv-teamcraft/commit/43926df))
* some tags aren't saved properly ([efaeac8](https://github.com/Supamiu/ffxiv-teamcraft/commit/efaeac8)), closes [#238](https://github.com/Supamiu/ffxiv-teamcraft/issues/238)
* timers in list details view are re-created at each ET tick ([f2a2c39](https://github.com/Supamiu/ffxiv-teamcraft/commit/f2a2c39)), closes [#237](https://github.com/Supamiu/ffxiv-teamcraft/issues/237)
* typo in front page ([48d54af](https://github.com/Supamiu/ffxiv-teamcraft/commit/48d54af))
* wrong DE translation ([9580d37](https://github.com/Supamiu/ffxiv-teamcraft/commit/9580d37))
* wrong order for lists page ([ba07ae9](https://github.com/Supamiu/ffxiv-teamcraft/commit/ba07ae9))


### Features

* ability to change email associated with an account (experimental) ([2b5235f](https://github.com/Supamiu/ffxiv-teamcraft/commit/2b5235f)), closes [#243](https://github.com/Supamiu/ffxiv-teamcraft/issues/243)
* add "hide if empty" option on layout panels ([e1d13bf](https://github.com/Supamiu/ffxiv-teamcraft/commit/e1d13bf)), closes [#209](https://github.com/Supamiu/ffxiv-teamcraft/issues/209)
* add an addition toggle (click to add a given amount) ([11f0ad1](https://github.com/Supamiu/ffxiv-teamcraft/commit/11f0ad1)), closes [#231](https://github.com/Supamiu/ffxiv-teamcraft/issues/231)
* add pagination on public lists page ([d3584f4](https://github.com/Supamiu/ffxiv-teamcraft/commit/d3584f4)), closes [#241](https://github.com/Supamiu/ffxiv-teamcraft/issues/241)
* add windows tray notifications for alarms ([b498794](https://github.com/Supamiu/ffxiv-teamcraft/commit/b498794)), closes [#220](https://github.com/Supamiu/ffxiv-teamcraft/issues/220)
* change xivdb import (add-item) for an ephemeral list generation ([f3d0f89](https://github.com/Supamiu/ffxiv-teamcraft/commit/f3d0f89)), closes [#245](https://github.com/Supamiu/ffxiv-teamcraft/issues/245)
* ffxivcrafting.com-like amount display (as a setting) ([5b5aa16](https://github.com/Supamiu/ffxiv-teamcraft/commit/5b5aa16)), closes [#200](https://github.com/Supamiu/ffxiv-teamcraft/issues/200)
* make node countdown tick every second ([46d7fc6](https://github.com/Supamiu/ffxiv-teamcraft/commit/46d7fc6)), closes [#236](https://github.com/Supamiu/ffxiv-teamcraft/issues/236)
* mark items as "working on it" ([41d12b5](https://github.com/Supamiu/ffxiv-teamcraft/commit/41d12b5)), closes [#205](https://github.com/Supamiu/ffxiv-teamcraft/issues/205)
* new layout filter: IS_MONSTER_DROP ([211fcc0](https://github.com/Supamiu/ffxiv-teamcraft/commit/211fcc0))
* position for reduction items ([c5e27b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/c5e27b9)), closes [#239](https://github.com/Supamiu/ffxiv-teamcraft/issues/239)
* public profile page ([e136095](https://github.com/Supamiu/ffxiv-teamcraft/commit/e136095)), closes [#218](https://github.com/Supamiu/ffxiv-teamcraft/issues/218)
* reset layout to default via a button ([f7ab942](https://github.com/Supamiu/ffxiv-teamcraft/commit/f7ab942)), closes [#229](https://github.com/Supamiu/ffxiv-teamcraft/issues/229)
* show warning message on public lists without tags ([feae02d](https://github.com/Supamiu/ffxiv-teamcraft/commit/feae02d)), closes [#240](https://github.com/Supamiu/ffxiv-teamcraft/issues/240)
* workshops (list folders that can be shared) ([7e703d4](https://github.com/Supamiu/ffxiv-teamcraft/commit/7e703d4)), closes [#228](https://github.com/Supamiu/ffxiv-teamcraft/issues/228)


### Performance Improvements

* better change detection to avoid freezes on large list interactions ([b54d42b](https://github.com/Supamiu/ffxiv-teamcraft/commit/b54d42b))



<a name="3.2.3"></a>
## [3.2.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.2.2...v3.2.3) (2018-02-13)


### Bug Fixes

* layout filter not updated in some cases ([a0737af](https://github.com/Supamiu/ffxiv-teamcraft/commit/a0737af))
* masterbook icons missing ([933f150](https://github.com/Supamiu/ffxiv-teamcraft/commit/933f150)), closes [#207](https://github.com/Supamiu/ffxiv-teamcraft/issues/207)
* no alert for Email already used ([7818cd0](https://github.com/Supamiu/ffxiv-teamcraft/commit/7818cd0)), closes [#204](https://github.com/Supamiu/ffxiv-teamcraft/issues/204)
* vendors filter matches non-vendor items ([c5fbbe4](https://github.com/Supamiu/ffxiv-teamcraft/commit/c5fbbe4))


### Features

* addition of 4.2 book/currencies ([9de8ff7](https://github.com/Supamiu/ffxiv-teamcraft/commit/9de8ff7))
* layout filter for GC seals ([6f588d5](https://github.com/Supamiu/ffxiv-teamcraft/commit/6f588d5))



<a name="3.2.2"></a>
## [3.2.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.2.0...v3.2.2) (2018-02-13)


### Bug Fixes

* accordion state reset at each list amount modification ([2bb970e](https://github.com/Supamiu/ffxiv-teamcraft/commit/2bb970e))
* broken list display ([c1b83ee](https://github.com/Supamiu/ffxiv-teamcraft/commit/c1b83ee))
* comments dialog box not working ([3c19a78](https://github.com/Supamiu/ffxiv-teamcraft/commit/3c19a78)), closes [#190](https://github.com/Supamiu/ffxiv-teamcraft/issues/190)
* disable ability to close sidenav with ESC ([fa5f6fb](https://github.com/Supamiu/ffxiv-teamcraft/commit/fa5f6fb))
* error when validating a craft on final recipes ([b44d3c4](https://github.com/Supamiu/ffxiv-teamcraft/commit/b44d3c4))
* item not found in alarms page ([057b613](https://github.com/Supamiu/ffxiv-teamcraft/commit/057b613)), closes [#193](https://github.com/Supamiu/ffxiv-teamcraft/issues/193)
* layout zone breakdown breaking display in some cases ([c53445e](https://github.com/Supamiu/ffxiv-teamcraft/commit/c53445e))
* preCraft amounts sometimes wrong ([1196358](https://github.com/Supamiu/ffxiv-teamcraft/commit/1196358))
* precraft ingredients sometimes has bad values upon checking "done" ([396f5ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/396f5ab))
* sands not filtered by IS_TIMED filter ([d827d64](https://github.com/Supamiu/ffxiv-teamcraft/commit/d827d64))


### Features

* add timers support for sands ([73542a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/73542a2))
* currency total for currency-traded items ([47e611d](https://github.com/Supamiu/ffxiv-teamcraft/commit/47e611d)), closes [#199](https://github.com/Supamiu/ffxiv-teamcraft/issues/199)
* display coords, place and slot in alarm search results ([0d0e295](https://github.com/Supamiu/ffxiv-teamcraft/commit/0d0e295))
* find items that reduce into a sand when looking for it in alarms ([892f3b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/892f3b9)), closes [#191](https://github.com/Supamiu/ffxiv-teamcraft/issues/191)
* order alarms based on remaining time before spawn ([7dda37f](https://github.com/Supamiu/ffxiv-teamcraft/commit/7dda37f))
* update stack size to 999 for 4.2 release ([9c7ab97](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c7ab97))


### Performance Improvements

* change update for set in lists modification event ([68491d3](https://github.com/Supamiu/ffxiv-teamcraft/commit/68491d3))
* improve performance for the "regenerate all lists" button in /lists view ([8b475b2](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b475b2))



<a name="3.2.1"></a>
## [3.2.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.2.0...v3.2.1) (2018-02-06)


### Bug Fixes

* accordion state reset at each list amount modification ([2bb970e](https://github.com/Supamiu/ffxiv-teamcraft/commit/2bb970e))
* broken list display ([c1b83ee](https://github.com/Supamiu/ffxiv-teamcraft/commit/c1b83ee))
* comments dialog box not working ([3c19a78](https://github.com/Supamiu/ffxiv-teamcraft/commit/3c19a78)), closes [#190](https://github.com/Supamiu/ffxiv-teamcraft/issues/190)
* disable ability to close sidenav with ESC ([fa5f6fb](https://github.com/Supamiu/ffxiv-teamcraft/commit/fa5f6fb))
* error when validating a craft on final recipes ([b44d3c4](https://github.com/Supamiu/ffxiv-teamcraft/commit/b44d3c4))
* item not found in alarms page ([057b613](https://github.com/Supamiu/ffxiv-teamcraft/commit/057b613)), closes [#193](https://github.com/Supamiu/ffxiv-teamcraft/issues/193)
* layout zone breakdown breaking display in some cases ([c53445e](https://github.com/Supamiu/ffxiv-teamcraft/commit/c53445e))
* preCraft amounts sometimes wrong ([1196358](https://github.com/Supamiu/ffxiv-teamcraft/commit/1196358))
* precraft ingredients sometimes has bad values upon checking "done" ([396f5ab](https://github.com/Supamiu/ffxiv-teamcraft/commit/396f5ab))


### Features

* add timers support for sands ([73542a2](https://github.com/Supamiu/ffxiv-teamcraft/commit/73542a2))
* find items that reduce into a sand when looking for it in alarms ([892f3b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/892f3b9)), closes [#191](https://github.com/Supamiu/ffxiv-teamcraft/issues/191)
* update stack size to 999 for 4.2 release ([9c7ab97](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c7ab97))


### Performance Improvements

* change update for set in lists modification event ([68491d3](https://github.com/Supamiu/ffxiv-teamcraft/commit/68491d3))
* improve performance for the "regenerate all lists" button in /lists view ([8b475b2](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b475b2))



<a name="3.2.0"></a>
# [3.2.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.1.1...v3.2.0) (2018-01-28)


### Bug Fixes

* display 00 instead of 24 for node despawn time ([f04314e](https://github.com/Supamiu/ffxiv-teamcraft/commit/f04314e))
* favorites panel always empty ([4d86b05](https://github.com/Supamiu/ffxiv-teamcraft/commit/4d86b05)), closes [#170](https://github.com/Supamiu/ffxiv-teamcraft/issues/170)
* Multi-stage fc crafts show as ready-to-build too early ([f0a7f98](https://github.com/Supamiu/ffxiv-teamcraft/commit/f0a7f98)), closes [#166](https://github.com/Supamiu/ffxiv-teamcraft/issues/166)
* regenerating the list caused the whole page to be reloaded after each modification ([c411166](https://github.com/Supamiu/ffxiv-teamcraft/commit/c411166))
* users can tag list without being the author of them ([d003732](https://github.com/Supamiu/ffxiv-teamcraft/commit/d003732))
* zone breakdown gathering panel empty after modification ([5b4256f](https://github.com/Supamiu/ffxiv-teamcraft/commit/5b4256f))


### Features

* add aetheryte location on map dialog boxes ([8203eed](https://github.com/Supamiu/ffxiv-teamcraft/commit/8203eed)), closes [#178](https://github.com/Supamiu/ffxiv-teamcraft/issues/178)
* add comment threads to public lists ([19d2d73](https://github.com/Supamiu/ffxiv-teamcraft/commit/19d2d73)), closes [#115](https://github.com/Supamiu/ffxiv-teamcraft/issues/115)
* add name to map in map dialog box ([cb6e1b5](https://github.com/Supamiu/ffxiv-teamcraft/commit/cb6e1b5))
* add profile page help dialog ([1666c35](https://github.com/Supamiu/ffxiv-teamcraft/commit/1666c35))
* custom layout for list details ([3fca33b](https://github.com/Supamiu/ffxiv-teamcraft/commit/3fca33b)), closes [#168](https://github.com/Supamiu/ffxiv-teamcraft/issues/168)
* implement /list/<id> help dialog ([07da241](https://github.com/Supamiu/ffxiv-teamcraft/commit/07da241)), closes [#151](https://github.com/Supamiu/ffxiv-teamcraft/issues/151) [#136](https://github.com/Supamiu/ffxiv-teamcraft/issues/136)
* implement a NOT logic gate for layout filters ([b0eab7c](https://github.com/Supamiu/ffxiv-teamcraft/commit/b0eab7c)), closes [#181](https://github.com/Supamiu/ffxiv-teamcraft/issues/181)
* macro translation page ([1466656](https://github.com/Supamiu/ffxiv-teamcraft/commit/1466656)), closes [#142](https://github.com/Supamiu/ffxiv-teamcraft/issues/142)
* new help dialog system for main pages ([5a00590](https://github.com/Supamiu/ffxiv-teamcraft/commit/5a00590))
* node position for non-timed nodes ([f629f88](https://github.com/Supamiu/ffxiv-teamcraft/commit/f629f88)), closes [#171](https://github.com/Supamiu/ffxiv-teamcraft/issues/171)
* regenerate all lists button ([36991a4](https://github.com/Supamiu/ffxiv-teamcraft/commit/36991a4)), closes [#174](https://github.com/Supamiu/ffxiv-teamcraft/issues/174)
* update About page ([7ad7816](https://github.com/Supamiu/ffxiv-teamcraft/commit/7ad7816))


### Performance Improvements

* display optimization ([39471ba](https://github.com/Supamiu/ffxiv-teamcraft/commit/39471ba))
* list details view performance optimizations ([b30a753](https://github.com/Supamiu/ffxiv-teamcraft/commit/b30a753))



<a name="3.1.1"></a>
## [3.1.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.1.0...v3.1.1) (2018-01-12)


### Features

* add possibility to create node alarms without any list ([b1d8cbb](https://github.com/Supamiu/ffxiv-teamcraft/commit/b1d8cbb)), closes [#132](https://github.com/Supamiu/ffxiv-teamcraft/issues/132)



<a name="3.1.0"></a>
# [3.1.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.0.4...v3.1.0) (2018-01-11)


### Bug Fixes

* **item:** use observable with AsyncPipe to react to ObservableMedia change ([f227143](https://github.com/Supamiu/ffxiv-teamcraft/commit/f227143)), closes [#153](https://github.com/Supamiu/ffxiv-teamcraft/issues/153)
* **tooltip:** replace custom tooltip implementation by angular/cdk overlay ([6d219a6](https://github.com/Supamiu/ffxiv-teamcraft/commit/6d219a6)), closes [#152](https://github.com/Supamiu/ffxiv-teamcraft/issues/152)
* e.gatheredBy.nodes.forEach is not a function in some cases ([c0cc015](https://github.com/Supamiu/ffxiv-teamcraft/commit/c0cc015))
* list not updated for other users on it in realtime ([fe4661e](https://github.com/Supamiu/ffxiv-teamcraft/commit/fe4661e)), closes [#148](https://github.com/Supamiu/ffxiv-teamcraft/issues/148)
* unable to import list using import links ([79210c3](https://github.com/Supamiu/ffxiv-teamcraft/commit/79210c3))


### Features

* **item:** add tooltip showing the amount of missing items ([cf28444](https://github.com/Supamiu/ffxiv-teamcraft/commit/cf28444)), closes [#145](https://github.com/Supamiu/ffxiv-teamcraft/issues/145)
* 10k lists giveway popup ([13f1e86](https://github.com/Supamiu/ffxiv-teamcraft/commit/13f1e86))
* add list merging ([eae87fb](https://github.com/Supamiu/ffxiv-teamcraft/commit/eae87fb)), closes [#116](https://github.com/Supamiu/ffxiv-teamcraft/issues/116)
* add possibility to change associated character on profile page ([cd5daaf](https://github.com/Supamiu/ffxiv-teamcraft/commit/cd5daaf)), closes [#118](https://github.com/Supamiu/ffxiv-teamcraft/issues/118)
* add QUEST tag for public lists ([1402957](https://github.com/Supamiu/ffxiv-teamcraft/commit/1402957)), closes [#157](https://github.com/Supamiu/ffxiv-teamcraft/issues/157)
* improve character association dialog ([1d29ce9](https://github.com/Supamiu/ffxiv-teamcraft/commit/1d29ce9)), closes [#140](https://github.com/Supamiu/ffxiv-teamcraft/issues/140) [#150](https://github.com/Supamiu/ffxiv-teamcraft/issues/150)
* track how many times a given list has been cloned ([9160a44](https://github.com/Supamiu/ffxiv-teamcraft/commit/9160a44)), closes [#114](https://github.com/Supamiu/ffxiv-teamcraft/issues/114)


### BREAKING CHANGES

* **tooltip:** deprecate the old TooltipComponent



<a name="3.0.4"></a>
## [3.0.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.0.3...v3.0.4) (2017-12-13)


### Bug Fixes

* bad mobile layout for home page on mobile ([532fe97](https://github.com/Supamiu/ffxiv-teamcraft/commit/532fe97))
* crafts requiring equipment as materials show equipment in the wrong tier. ([bdc4d4b](https://github.com/Supamiu/ffxiv-teamcraft/commit/bdc4d4b)), closes [#143](https://github.com/Supamiu/ffxiv-teamcraft/issues/143)
* item with undefined slot cause the app to crash ([5116238](https://github.com/Supamiu/ffxiv-teamcraft/commit/5116238)), closes [#96](https://github.com/Supamiu/ffxiv-teamcraft/issues/96)
* missing materials in some FC crafts ([5120337](https://github.com/Supamiu/ffxiv-teamcraft/commit/5120337)), closes [#147](https://github.com/Supamiu/ffxiv-teamcraft/issues/147)


### Features

* addition of currencies for non-craftable gear ([b1840af](https://github.com/Supamiu/ffxiv-teamcraft/commit/b1840af))



<a name="3.0.3"></a>
## [3.0.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.0.2...v3.0.3) (2017-12-09)


### Bug Fixes

* amounts interactions being replicated on the item below ([b491ec6](https://github.com/Supamiu/ffxiv-teamcraft/commit/b491ec6))
* empty lists shown in public lists ([3277350](https://github.com/Supamiu/ffxiv-teamcraft/commit/3277350))
* error when public list author is anonymous ([d051c93](https://github.com/Supamiu/ffxiv-teamcraft/commit/d051c93))
* fixed the currency icons not being displayed ([1cb1adf](https://github.com/Supamiu/ffxiv-teamcraft/commit/1cb1adf))
* items moving when quantity are updated ([f090813](https://github.com/Supamiu/ffxiv-teamcraft/commit/f090813))
* list elements moving when applying amount ([b019770](https://github.com/Supamiu/ffxiv-teamcraft/commit/b019770))
* list elements moving when applying amount ([0eb12ac](https://github.com/Supamiu/ffxiv-teamcraft/commit/0eb12ac))
* refresh issues in some cases ([4881fd8](https://github.com/Supamiu/ffxiv-teamcraft/commit/4881fd8))
* wrong amount for ingredients in some cases ([c9dab43](https://github.com/Supamiu/ffxiv-teamcraft/commit/c9dab43))



<a name="3.0.2"></a>
## [3.0.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.0.1...v3.0.2) (2017-12-06)


### Bug Fixes

* bad count for used items ([d145c8a](https://github.com/Supamiu/ffxiv-teamcraft/commit/d145c8a))
* broken image links on features page ([be5c32d](https://github.com/Supamiu/ffxiv-teamcraft/commit/be5c32d))
* can't copy a list in list-details view ([a3e387a](https://github.com/Supamiu/ffxiv-teamcraft/commit/a3e387a))
* job icon size in profile page ([dc20b48](https://github.com/Supamiu/ffxiv-teamcraft/commit/dc20b48))
* sidebar sometimes overlaps the content, again ([6bed623](https://github.com/Supamiu/ffxiv-teamcraft/commit/6bed623))
* wrong amount in some requirements informations ([8ae4781](https://github.com/Supamiu/ffxiv-teamcraft/commit/8ae4781))
* wrong tier for precrafts in some cases ([7a1e0ef](https://github.com/Supamiu/ffxiv-teamcraft/commit/7a1e0ef))


### Features

* new select all button for masterbooks ([c46d28f](https://github.com/Supamiu/ffxiv-teamcraft/commit/c46d28f))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.0.0...v3.0.1) (2017-12-05)


### Bug Fixes

* can't login using email and password ([3ab56b5](https://github.com/Supamiu/ffxiv-teamcraft/commit/3ab56b5))
* mobile design display issue, missing BOT icon in some cases ([010f7d8](https://github.com/Supamiu/ffxiv-teamcraft/commit/010f7d8)), closes [#124](https://github.com/Supamiu/ffxiv-teamcraft/issues/124)
* sidebar displayed over the list in some cases ([36f47b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/36f47b9)), closes [#125](https://github.com/Supamiu/ffxiv-teamcraft/issues/125)
* wrong slot for Chromite ore ([3b96e46](https://github.com/Supamiu/ffxiv-teamcraft/commit/3b96e46)), closes [#121](https://github.com/Supamiu/ffxiv-teamcraft/issues/121)


### Features

* addition and correction of de translations ([8e2a724](https://github.com/Supamiu/ffxiv-teamcraft/commit/8e2a724))
* addition and correction of en translations ([af62d58](https://github.com/Supamiu/ffxiv-teamcraft/commit/af62d58))
* addition and correction of fr translations ([7f09074](https://github.com/Supamiu/ffxiv-teamcraft/commit/7f09074))
* addition and correction of ja translations ([a33a7c4](https://github.com/Supamiu/ffxiv-teamcraft/commit/a33a7c4))
* addition and correction of translations ([5168f19](https://github.com/Supamiu/ffxiv-teamcraft/commit/5168f19))
* reordering ([6e70bc6](https://github.com/Supamiu/ffxiv-teamcraft/commit/6e70bc6))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.0.0-beta.6...v3.0.0) (2017-12-02)



<a name="3.0.0-beta.6"></a>
# [3.0.0-beta.6](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.0.0-beta.5...v3.0.0-beta.6) (2017-12-02)


### Bug Fixes

* issue with vendors with undefined price ([62c6195](https://github.com/Supamiu/ffxiv-teamcraft/commit/62c6195))


### Features

* new about page ([c3384b0](https://github.com/Supamiu/ffxiv-teamcraft/commit/c3384b0))
* quick list (deleted once completed) ([4393e80](https://github.com/Supamiu/ffxiv-teamcraft/commit/4393e80))


### Performance Improvements

* big list save optimization ([cc5fb61](https://github.com/Supamiu/ffxiv-teamcraft/commit/cc5fb61))
* change data pipes for pure ones ([f2d6853](https://github.com/Supamiu/ffxiv-teamcraft/commit/f2d6853))
* large lists display optimization ([66b3a52](https://github.com/Supamiu/ffxiv-teamcraft/commit/66b3a52)), closes [#110](https://github.com/Supamiu/ffxiv-teamcraft/issues/110)



<a name="3.0.0-beta.5"></a>
# [3.0.0-beta.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.0.0-beta.4...v3.0.0-beta.5) (2017-11-30)


### Bug Fixes

* list details panels closed upon large list modifications ([2a9aa92](https://github.com/Supamiu/ffxiv-teamcraft/commit/2a9aa92))
* rename popup opened each time you edit the list in certain conditions ([a070ea1](https://github.com/Supamiu/ffxiv-teamcraft/commit/a070ea1))


### Features

* ability to add an item to a list from external website ([7e3707d](https://github.com/Supamiu/ffxiv-teamcraft/commit/7e3707d)), closes [#107](https://github.com/Supamiu/ffxiv-teamcraft/issues/107)
* add avatar next to list description ([e4bcfda](https://github.com/Supamiu/ffxiv-teamcraft/commit/e4bcfda))
* add list tags (gear, leves, glamour, etc) ([fe9dace](https://github.com/Supamiu/ffxiv-teamcraft/commit/fe9dace))
* public list name search ([5029db4](https://github.com/Supamiu/ffxiv-teamcraft/commit/5029db4))
* public lists ([14f3e10](https://github.com/Supamiu/ffxiv-teamcraft/commit/14f3e10))
* tag filter for public lists ([a5a56a8](https://github.com/Supamiu/ffxiv-teamcraft/commit/a5a56a8))



<a name="3.0.0-beta.4"></a>
# [3.0.0-beta.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.0.0-beta.3...v3.0.0-beta.4) (2017-11-25)


### Bug Fixes

* bad uri for garlandtools api ([bc68c3c](https://github.com/Supamiu/ffxiv-teamcraft/commit/bc68c3c))
* count mixup beween same Pre crafts and final items ([8360918](https://github.com/Supamiu/ffxiv-teamcraft/commit/8360918))
* missing data in recipes ([20bd1ed](https://github.com/Supamiu/ffxiv-teamcraft/commit/20bd1ed)), closes [#105](https://github.com/Supamiu/ffxiv-teamcraft/issues/105)
* missing icon for trades on mobile ([65aea76](https://github.com/Supamiu/ffxiv-teamcraft/commit/65aea76))


### Features

* item name color set to blue when ready to craft ([317614b](https://github.com/Supamiu/ffxiv-teamcraft/commit/317614b)), closes [#92](https://github.com/Supamiu/ffxiv-teamcraft/issues/92)
* lists are now ordered by creation date (youngest first) ([e5acd4b](https://github.com/Supamiu/ffxiv-teamcraft/commit/e5acd4b)), closes [#100](https://github.com/Supamiu/ffxiv-teamcraft/issues/100)
* possibility to add a text note to a list ([ddb4dab](https://github.com/Supamiu/ffxiv-teamcraft/commit/ddb4dab)), closes [#99](https://github.com/Supamiu/ffxiv-teamcraft/issues/99)
* show how much of an item should be in inventory ([643c4b4](https://github.com/Supamiu/ffxiv-teamcraft/commit/643c4b4)), closes [#89](https://github.com/Supamiu/ffxiv-teamcraft/issues/89)


### Performance Improvements

* add trackBy for ngFor performance ([509f17d](https://github.com/Supamiu/ffxiv-teamcraft/commit/509f17d))
* changeDetection improvements ([1413dc3](https://github.com/Supamiu/ffxiv-teamcraft/commit/1413dc3))
* large lists are now collapsed by default, except for items panel ([33a62d5](https://github.com/Supamiu/ffxiv-teamcraft/commit/33a62d5))
* remove intermediate variable ([9fdb474](https://github.com/Supamiu/ffxiv-teamcraft/commit/9fdb474))
* unsubscribe once component is destroyed ([121fdfc](https://github.com/Supamiu/ffxiv-teamcraft/commit/121fdfc))



<a name="3.0.0-beta.3"></a>
# [3.0.0-beta.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.0.0-beta.2...v3.0.0-beta.3) (2017-11-18)


### Features

* profile page with masterbook alert if you can't craft an item ([09d4449](https://github.com/Supamiu/ffxiv-teamcraft/commit/09d4449))
* remove list alarms when deleting lists ([8e269a8](https://github.com/Supamiu/ffxiv-teamcraft/commit/8e269a8))



<a name="3.0.0-beta.2"></a>
# [3.0.0-beta.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.0.0-beta.1...v3.0.0-beta.2) (2017-11-17)


### Bug Fixes

* npc location popups broken ([b0ccb9c](https://github.com/Supamiu/ffxiv-teamcraft/commit/b0ccb9c))


### Features

* alarms-specific page ([7f48ab3](https://github.com/Supamiu/ffxiv-teamcraft/commit/7f48ab3))
* compact list toggle option ([edcec22](https://github.com/Supamiu/ffxiv-teamcraft/commit/edcec22))



<a name="3.0.0-beta.1"></a>
# [3.0.0-beta.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v3.0.0-beta.0...v3.0.0-beta.1) (2017-11-16)


### Bug Fixes

* login with non-registered account is possible ([94f2cd5](https://github.com/Supamiu/ffxiv-teamcraft/commit/94f2cd5))
* recipe addition menu too long ([c4ec343](https://github.com/Supamiu/ffxiv-teamcraft/commit/c4ec343))


### Features

* add beta disclaimer popup for beta version ([cf55fd7](https://github.com/Supamiu/ffxiv-teamcraft/commit/cf55fd7))
* add compact list option in settings page ([9a573f6](https://github.com/Supamiu/ffxiv-teamcraft/commit/9a573f6))
* new features page to make the home page lighter ([288a7a1](https://github.com/Supamiu/ffxiv-teamcraft/commit/288a7a1))



<a name="3.0.0-beta.0"></a>
# [3.0.0-beta.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.4.5...v3.0.0-beta.0) (2017-11-16)


### Bug Fixes

* alarm alerted state not triggered with hoursBefore = 1 ([fc80b8b](https://github.com/Supamiu/ffxiv-teamcraft/commit/fc80b8b))
* alarm not triggered with nodes that spawns at midnight ([1465195](https://github.com/Supamiu/ffxiv-teamcraft/commit/1465195))
* errors in mobile design with empty details array ([ed2209f](https://github.com/Supamiu/ffxiv-teamcraft/commit/ed2209f))
* precrafts and precrafts mats are accounted twice ([2d6e0e2](https://github.com/Supamiu/ffxiv-teamcraft/commit/2d6e0e2))
* timer options popup bad width ([9e602ad](https://github.com/Supamiu/ffxiv-teamcraft/commit/9e602ad))


### Features

* add icon next to price when obtained from npc price ([d30dff1](https://github.com/Supamiu/ffxiv-teamcraft/commit/d30dff1))
* add volume control to timer options ([2835cde](https://github.com/Supamiu/ffxiv-teamcraft/commit/2835cde))
* Persistent sidebar on larger devices ([046a612](https://github.com/Supamiu/ffxiv-teamcraft/commit/046a612))
* Persistent sidebar on larger devices ([9c9a3a8](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c9a3a8))
* Persistent sidebar on larger devices ([ed10e3e](https://github.com/Supamiu/ffxiv-teamcraft/commit/ed10e3e))


### Performance Improvements

* list creation optimization ([6622e22](https://github.com/Supamiu/ffxiv-teamcraft/commit/6622e22))
* lower lists page loading time ([1246843](https://github.com/Supamiu/ffxiv-teamcraft/commit/1246843))



<a name="2.4.5"></a>
## [2.4.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.4.4...v2.4.5) (2017-11-15)



<a name="2.4.4"></a>
## [2.4.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.4.3...v2.4.4) (2017-11-15)


### Bug Fixes

* crafting tiers toggle makes the app crash ([a85a29f](https://github.com/Supamiu/ffxiv-teamcraft/commit/a85a29f))



<a name="2.4.3"></a>
## [2.4.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.4.2...v2.4.3) (2017-11-14)


### Bug Fixes

* recipes yielding more than one item are hidden by filters when they shouldn't ([b01c160](https://github.com/Supamiu/ffxiv-teamcraft/commit/b01c160))



<a name="2.4.2"></a>
## [2.4.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.4.1...v2.4.2) (2017-11-11)


### Bug Fixes

* can't create a list on first visit ([ed0e223](https://github.com/Supamiu/ffxiv-teamcraft/commit/ed0e223))
* display copy button only upon item row hover ([660cab0](https://github.com/Supamiu/ffxiv-teamcraft/commit/660cab0))
* grade 3 wheels cannot be added to list ([7dd9254](https://github.com/Supamiu/ffxiv-teamcraft/commit/7dd9254)), closes [#96](https://github.com/Supamiu/ffxiv-teamcraft/issues/96)


### Features

* add a button to copy item name to clipboard ([2ba6481](https://github.com/Supamiu/ffxiv-teamcraft/commit/2ba6481))
* add precraft tier display toggle ([4ecd433](https://github.com/Supamiu/ffxiv-teamcraft/commit/4ecd433))
* added a button to reset filters ([41fa4d9](https://github.com/Supamiu/ffxiv-teamcraft/commit/41fa4d9))


### Performance Improvements

* lower home page hosting size by removing gifs ([0842afa](https://github.com/Supamiu/ffxiv-teamcraft/commit/0842afa))



<a name="2.4.1"></a>
## [2.4.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.4.0...v2.4.1) (2017-10-30)


### Bug Fixes

* broken app when viewing a list for the first time with anonymous account ([8a03882](https://github.com/Supamiu/ffxiv-teamcraft/commit/8a03882))
* can't add items with too big partial array ([62be1bb](https://github.com/Supamiu/ffxiv-teamcraft/commit/62be1bb)), closes [#91](https://github.com/Supamiu/ffxiv-teamcraft/issues/91)
* forgot https for new data calls ([b516557](https://github.com/Supamiu/ffxiv-teamcraft/commit/b516557))
* issues with partial data ([1857512](https://github.com/Supamiu/ffxiv-teamcraft/commit/1857512))
* item not green if done > amount ([b254d1a](https://github.com/Supamiu/ffxiv-teamcraft/commit/b254d1a))
* modifying list recipe amounts sometimes has bad results for row amounts ([9c680c8](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c680c8))



<a name="2.4.0"></a>
# [2.4.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.3.2...v2.4.0) (2017-10-29)


### Bug Fixes

* adding a recipe to a list breaks after garlandtools changes ([2777167](https://github.com/Supamiu/ffxiv-teamcraft/commit/2777167))
* first list view with cleared cache makes the app crash ([cfdf595](https://github.com/Supamiu/ffxiv-teamcraft/commit/cfdf595))
* null uid after registration ([5582114](https://github.com/Supamiu/ffxiv-teamcraft/commit/5582114))


### Features

* add amount of craft details next to the amount of items ([fbb3661](https://github.com/Supamiu/ffxiv-teamcraft/commit/fbb3661))
* add map markers for every location display ([b45229b](https://github.com/Supamiu/ffxiv-teamcraft/commit/b45229b))
* add more gifs for new features in home page ([615136f](https://github.com/Supamiu/ffxiv-teamcraft/commit/615136f))
* add more informations about fishs ([3fd3b81](https://github.com/Supamiu/ffxiv-teamcraft/commit/3fd3b81)), closes [#82](https://github.com/Supamiu/ffxiv-teamcraft/issues/82)
* add new counter for the amount of lists created using the tool ([eb8e7e3](https://github.com/Supamiu/ffxiv-teamcraft/commit/eb8e7e3))
* comments on list rows ([3f5af48](https://github.com/Supamiu/ffxiv-teamcraft/commit/3f5af48))
* configurable recipe links ([eeddffc](https://github.com/Supamiu/ffxiv-teamcraft/commit/eeddffc)), closes [#14](https://github.com/Supamiu/ffxiv-teamcraft/issues/14)
* IE 10 & 11, Safari 7 & 8 support ([b0f654b](https://github.com/Supamiu/ffxiv-teamcraft/commit/b0f654b))
* requirements popup now shows the amount of items required for the remaining crafts ([b805bda](https://github.com/Supamiu/ffxiv-teamcraft/commit/b805bda))



<a name="2.3.2"></a>
## [2.3.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.3.1...v2.3.2) (2017-10-23)


### Bug Fixes

* bad amounts for specific list ([4828442](https://github.com/Supamiu/ffxiv-teamcraft/commit/4828442)), closes [#85](https://github.com/Supamiu/ffxiv-teamcraft/issues/85)



<a name="2.3.1"></a>
## [2.3.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.3.0...v2.3.1) (2017-10-23)


### Bug Fixes

* bad tracking for list creation ([a576056](https://github.com/Supamiu/ffxiv-teamcraft/commit/a576056))
* broken item name for drafts ([8e5eb4a](https://github.com/Supamiu/ffxiv-teamcraft/commit/8e5eb4a))
* completed Others won't reappear after filter toggled to off ([e9d8ff1](https://github.com/Supamiu/ffxiv-teamcraft/commit/e9d8ff1))
* typo in FR strings ([bf7ab7e](https://github.com/Supamiu/ffxiv-teamcraft/commit/bf7ab7e))



<a name="2.3.0"></a>
# [2.3.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.2.4...v2.3.0) (2017-10-19)


### Bug Fixes

* alarm triggered even if not set to true ([6452cec](https://github.com/Supamiu/ffxiv-teamcraft/commit/6452cec))
* amount input too small ([23e5d62](https://github.com/Supamiu/ffxiv-teamcraft/commit/23e5d62))
* broken list details with too old list ([f826efb](https://github.com/Supamiu/ffxiv-teamcraft/commit/f826efb))
* list expansion panel collapsing after each change made to the list ([c0e577d](https://github.com/Supamiu/ffxiv-teamcraft/commit/c0e577d))
* node timer alarm triggered upon amount modification ([97fa88e](https://github.com/Supamiu/ffxiv-teamcraft/commit/97fa88e))
* remove unique contraint on lodestoneId ([c091e2d](https://github.com/Supamiu/ffxiv-teamcraft/commit/c091e2d))


### Features

* add details tooltip on item icon hover ([6e553d7](https://github.com/Supamiu/ffxiv-teamcraft/commit/6e553d7)), closes [#72](https://github.com/Supamiu/ffxiv-teamcraft/issues/72)
* add forgot password popup ([20551f3](https://github.com/Supamiu/ffxiv-teamcraft/commit/20551f3))
* add informations about which recipe needs a given ingredient ([9e2e647](https://github.com/Supamiu/ffxiv-teamcraft/commit/9e2e647)), closes [#70](https://github.com/Supamiu/ffxiv-teamcraft/issues/70)
* add localized mob names ([e9f0217](https://github.com/Supamiu/ffxiv-teamcraft/commit/e9f0217))
* add localized names to every npc, zone and area ([cdbfcfa](https://github.com/Supamiu/ffxiv-teamcraft/commit/cdbfcfa))
* add one time donation button ([9ba1be1](https://github.com/Supamiu/ffxiv-teamcraft/commit/9ba1be1))
* add pricing feature ([fdff970](https://github.com/Supamiu/ffxiv-teamcraft/commit/fdff970))
* add support for xivdb cart imports ([65d2105](https://github.com/Supamiu/ffxiv-teamcraft/commit/65d2105)), closes [#69](https://github.com/Supamiu/ffxiv-teamcraft/issues/69)
* enable list copy for your own list ([a86baf7](https://github.com/Supamiu/ffxiv-teamcraft/commit/a86baf7))
* hide completed rows on list details ([8988883](https://github.com/Supamiu/ffxiv-teamcraft/commit/8988883))
* new popup for patreon support, will be hidden once the goal is reached ([a530c0f](https://github.com/Supamiu/ffxiv-teamcraft/commit/a530c0f))
* rename list ([0087795](https://github.com/Supamiu/ffxiv-teamcraft/commit/0087795)), closes [#67](https://github.com/Supamiu/ffxiv-teamcraft/issues/67)
* see price for a given craft in pricing view ([11713ef](https://github.com/Supamiu/ffxiv-teamcraft/commit/11713ef)), closes [#68](https://github.com/Supamiu/ffxiv-teamcraft/issues/68)


### Performance Improvements

* change node informations to use only what's needed ([20a1cb6](https://github.com/Supamiu/ffxiv-teamcraft/commit/20a1cb6))
* remove useless addedAt property on some list rows ([8f5ef35](https://github.com/Supamiu/ffxiv-teamcraft/commit/8f5ef35))
* remove useless data in ingredients ([d776b3e](https://github.com/Supamiu/ffxiv-teamcraft/commit/d776b3e))
* use id instead of full path for icons ([89fc655](https://github.com/Supamiu/ffxiv-teamcraft/commit/89fc655))



<a name="2.2.4"></a>
## [2.2.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.2.3...v2.2.4) (2017-10-12)


### Bug Fixes

* error with undefined dungeon case ([5215bb5](https://github.com/Supamiu/ffxiv-teamcraft/commit/5215bb5))
* missing airship expedition informations ([9004eea](https://github.com/Supamiu/ffxiv-teamcraft/commit/9004eea)), closes [#63](https://github.com/Supamiu/ffxiv-teamcraft/issues/63)
* some nodes with undefined name were making recipe addition impossible ([9807eab](https://github.com/Supamiu/ffxiv-teamcraft/commit/9807eab))



<a name="2.2.3"></a>
## [2.2.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.2.2...v2.2.3) (2017-10-10)


### Bug Fixes

* add localized dungeon names ([ad37489](https://github.com/Supamiu/ffxiv-teamcraft/commit/ad37489))
* no place to type min and max values in filter input fields ([76ebbae](https://github.com/Supamiu/ffxiv-teamcraft/commit/76ebbae))



<a name="2.2.2"></a>
## [2.2.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.2.1...v2.2.2) (2017-10-10)


### Bug Fixes

* add translation for monster names ([c6fb9a6](https://github.com/Supamiu/ffxiv-teamcraft/commit/c6fb9a6))
* broken lists with fishing nodes ([4984eba](https://github.com/Supamiu/ffxiv-teamcraft/commit/4984eba))



<a name="2.2.1"></a>
## [2.2.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.2.0...v2.2.1) (2017-10-10)


### Bug Fixes

* add share button on lists ([8817632](https://github.com/Supamiu/ffxiv-teamcraft/commit/8817632))
* missing area name with timed nodes ([4320cfa](https://github.com/Supamiu/ffxiv-teamcraft/commit/4320cfa))
* missing default options for node timers ([f7d2dbc](https://github.com/Supamiu/ffxiv-teamcraft/commit/f7d2dbc))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.1.2...v2.2.0) (2017-10-09)


### Bug Fixes

* amount input field sometimes has the wrong width ([f157bf3](https://github.com/Supamiu/ffxiv-teamcraft/commit/f157bf3))
* bad maths with multiple yielding precrafts ([5dd0e5e](https://github.com/Supamiu/ffxiv-teamcraft/commit/5dd0e5e))
* bad mobile design detection ([4a942d6](https://github.com/Supamiu/ffxiv-teamcraft/commit/4a942d6))
* changing amount on opened list closes it ([b8488e1](https://github.com/Supamiu/ffxiv-teamcraft/commit/b8488e1))
* remove adsense since it's not available for the app ([f76a6d4](https://github.com/Supamiu/ffxiv-teamcraft/commit/f76a6d4))
* wrong progression restored for recipe upon list regeneration ([61f860d](https://github.com/Supamiu/ffxiv-teamcraft/commit/61f860d))


### Features

* add eorzean clock on top of list details ([ca46816](https://github.com/Supamiu/ffxiv-teamcraft/commit/ca46816))
* area breakdown added to lists, this allows you to see items ordered by area ([a6360bd](https://github.com/Supamiu/ffxiv-teamcraft/commit/a6360bd))
* timed nodes alarm ([ef5d4d2](https://github.com/Supamiu/ffxiv-teamcraft/commit/ef5d4d2))
* update home page tutorials ([046cd64](https://github.com/Supamiu/ffxiv-teamcraft/commit/046cd64))
* worn_by filter can now accept multiple values ([cc8e781](https://github.com/Supamiu/ffxiv-teamcraft/commit/cc8e781))



<a name="2.1.2"></a>
## [2.1.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.1.1...v2.1.2) (2017-10-06)



<a name="2.1.1"></a>
## [2.1.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.1.0...v2.1.1) (2017-10-05)


### Bug Fixes

* gathering section now ordered based on english name ([05481cf](https://github.com/Supamiu/ffxiv-teamcraft/commit/05481cf))
* precrafts not ordered properly ([4c722dd](https://github.com/Supamiu/ffxiv-teamcraft/commit/4c722dd))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.0.4...v2.1.0) (2017-10-04)


### Bug Fixes

* removing a list from favorites corrupts the entire list ([cc635fe](https://github.com/Supamiu/ffxiv-teamcraft/commit/cc635fe)), closes [#58](https://github.com/Supamiu/ffxiv-teamcraft/issues/58)


### Features

* proper not found page for lists ([f7b4cdc](https://github.com/Supamiu/ffxiv-teamcraft/commit/f7b4cdc))
* recipe details in list crafts ([0513f3b](https://github.com/Supamiu/ffxiv-teamcraft/commit/0513f3b))
* you can now copy a list to your account to have your own progression tracking ([ef66043](https://github.com/Supamiu/ffxiv-teamcraft/commit/ef66043)), closes [#53](https://github.com/Supamiu/ffxiv-teamcraft/issues/53)



<a name="2.0.4"></a>
## [2.0.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.0.3...v2.0.4) (2017-10-04)


### Bug Fixes

* amount field behavior sometimes was entering wrong amount ([afa6f7c](https://github.com/Supamiu/ffxiv-teamcraft/commit/afa6f7c))



<a name="2.0.3"></a>
## [2.0.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.0.2...v2.0.3) (2017-10-04)


### Bug Fixes

* can't remove recipe from list ([884d02a](https://github.com/Supamiu/ffxiv-teamcraft/commit/884d02a)), closes [#56](https://github.com/Supamiu/ffxiv-teamcraft/issues/56)



<a name="2.0.2"></a>
## [2.0.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.0.1...v2.0.2) (2017-10-03)


### Bug Fixes

* can't add FC craft to a list ([5ed6536](https://github.com/Supamiu/ffxiv-teamcraft/commit/5ed6536))
* fr typos ([d8f8df6](https://github.com/Supamiu/ffxiv-teamcraft/commit/d8f8df6))
* searching for ingot with "crafted by BSM" filter returns ARM ingots too ([858c58f](https://github.com/Supamiu/ffxiv-teamcraft/commit/858c58f)), closes [#51](https://github.com/Supamiu/ffxiv-teamcraft/issues/51)



<a name="2.0.1"></a>
## [2.0.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v2.0.0...v2.0.1) (2017-10-03)


### Bug Fixes

* character add popup is now working properly ([6e4b4dc](https://github.com/Supamiu/ffxiv-teamcraft/commit/6e4b4dc))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.2.4...v2.0.0) (2017-10-03)


### Bug Fixes

* add cache system for better animations on panels ([cec585d](https://github.com/Supamiu/ffxiv-teamcraft/commit/cec585d))
* bad amount for multiple item occurences in pre-requisite crafts, fixes FC crafts ([5bad9f6](https://github.com/Supamiu/ffxiv-teamcraft/commit/5bad9f6))
* broken search feature ([376afe5](https://github.com/Supamiu/ffxiv-teamcraft/commit/376afe5))
* collaborative contribution not working ([07941b8](https://github.com/Supamiu/ffxiv-teamcraft/commit/07941b8))
* empty list considered as outdated ([23d1dff](https://github.com/Supamiu/ffxiv-teamcraft/commit/23d1dff))
* hotfix for new recipe format on garlandtools ([ea5fd52](https://github.com/Supamiu/ffxiv-teamcraft/commit/ea5fd52))
* input field for recipes was used as string, resulting on a concatenated number set ([82c4a77](https://github.com/Supamiu/ffxiv-teamcraft/commit/82c4a77))
* list regeneration popup now stays until it's 100% done ([d5a70cb](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5a70cb))
* missing error message on character not found ([4f9b0df](https://github.com/Supamiu/ffxiv-teamcraft/commit/4f9b0df))
* regenerate button now removes unused items ([9c0c52b](https://github.com/Supamiu/ffxiv-teamcraft/commit/9c0c52b))


### Code Refactoring

* item numbers are now used as is, no more crafting numbers required. ([066b4a3](https://github.com/Supamiu/ffxiv-teamcraft/commit/066b4a3))


### Features

* add item name in trade details popup ([64a0a0a](https://github.com/Supamiu/ffxiv-teamcraft/commit/64a0a0a))
* add new input field to add multiple crafts ([9cfa73e](https://github.com/Supamiu/ffxiv-teamcraft/commit/9cfa73e))
* add proper icon depending on gathering type ([ba39b97](https://github.com/Supamiu/ffxiv-teamcraft/commit/ba39b97)), closes [#47](https://github.com/Supamiu/ffxiv-teamcraft/issues/47)
* advanced search filters for recipe search ([42651d9](https://github.com/Supamiu/ffxiv-teamcraft/commit/42651d9))
* advanced search filters for recipe search ([ebb0bce](https://github.com/Supamiu/ffxiv-teamcraft/commit/ebb0bce))
* amount field in list details now updates value on focusout and enter keypress ([e48be18](https://github.com/Supamiu/ffxiv-teamcraft/commit/e48be18))
* amount field in list details now updates value on focusout and enter keypress ([0d978d0](https://github.com/Supamiu/ffxiv-teamcraft/commit/0d978d0))
* bulk add search results ([a819f12](https://github.com/Supamiu/ffxiv-teamcraft/commit/a819f12))
* crystals now ordered (shards, crystals, clusters) ([8c1915d](https://github.com/Supamiu/ffxiv-teamcraft/commit/8c1915d))
* crystals now ordered (shards, crystals, clusters) ([839acd3](https://github.com/Supamiu/ffxiv-teamcraft/commit/839acd3))
* display trade icon based on the currency used ([22bde3c](https://github.com/Supamiu/ffxiv-teamcraft/commit/22bde3c)), closes [#45](https://github.com/Supamiu/ffxiv-teamcraft/issues/45)
* favorite lists ([98e3ef4](https://github.com/Supamiu/ffxiv-teamcraft/commit/98e3ef4))
* favorite lists ([446eb2e](https://github.com/Supamiu/ffxiv-teamcraft/commit/446eb2e))
* input fields now updated on focus loose or enter keyup ([204c44c](https://github.com/Supamiu/ffxiv-teamcraft/commit/204c44c))
* precrafts are now ordered based on dependencies (if a precraft depends on another precraft, it will be listed after its dependencies) ([e8095fd](https://github.com/Supamiu/ffxiv-teamcraft/commit/e8095fd))
* proper home page ([0d53e08](https://github.com/Supamiu/ffxiv-teamcraft/commit/0d53e08)), closes [#20](https://github.com/Supamiu/ffxiv-teamcraft/issues/20)


### BREAKING CHANGES

* We reverted the previous breaking change, if you want to craft 99 potions, add 99 potions and the system will handle it properly, you don't have to divide by the number of item yielded, this will now be like that, no more change to this feature.



<a name="1.2.4"></a>
## [1.2.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.2.3...v1.2.4) (2017-09-26)


### Bug Fixes

* crystal number sometimes not rounded properly ([32dc2eb](https://github.com/Supamiu/ffxiv-teamcraft/commit/32dc2eb))
* realtime translation issues with new i18n pipe ([a473a99](https://github.com/Supamiu/ffxiv-teamcraft/commit/a473a99))


### Features

* new button to recreate the list with latest changes ([636e6cb](https://github.com/Supamiu/ffxiv-teamcraft/commit/636e6cb)), closes [#44](https://github.com/Supamiu/ffxiv-teamcraft/issues/44)


### BREAKING CHANGES

* Lists are now using the amount of crafts you wantto do, not the amount of items you want to have. Meaning that crafts like potions will yield 3 potions per craft you want to do.



<a name="1.2.3"></a>
## [1.2.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.2.2...v1.2.3) (2017-09-25)


### Bug Fixes

* ghost materials in lists after deleting some items ([5ddedbe](https://github.com/Supamiu/ffxiv-teamcraft/commit/5ddedbe)), closes [#40](https://github.com/Supamiu/ffxiv-teamcraft/issues/40)
* page title sometimes undefined ([48dcc36](https://github.com/Supamiu/ffxiv-teamcraft/commit/48dcc36))
* recipe amount sometimes wrong with high amount of items ([89b73f5](https://github.com/Supamiu/ffxiv-teamcraft/commit/89b73f5)), closes [#40](https://github.com/Supamiu/ffxiv-teamcraft/issues/40)
* removing value from amount field removes the item from the list ([cbfe0b4](https://github.com/Supamiu/ffxiv-teamcraft/commit/cbfe0b4)), closes [#39](https://github.com/Supamiu/ffxiv-teamcraft/issues/39)
* searching for empty recipe makes loading spin forever ([165453c](https://github.com/Supamiu/ffxiv-teamcraft/commit/165453c))
* undefined title after list deletion ([b9c3b54](https://github.com/Supamiu/ffxiv-teamcraft/commit/b9c3b54))



<a name="1.2.2"></a>
## [1.2.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.2.1...v1.2.2) (2017-09-24)


### Bug Fixes

* not enough space for icons in item component ([ad564fd](https://github.com/Supamiu/ffxiv-teamcraft/commit/ad564fd))
* unexpected html entities in list recipe name ([99d7dd9](https://github.com/Supamiu/ffxiv-teamcraft/commit/99d7dd9))
* unexpected html entities in search results ([a8967ed](https://github.com/Supamiu/ffxiv-teamcraft/commit/a8967ed))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.2.0...v1.2.1) (2017-09-24)


### Bug Fixes

* add i18n changes made by garlandtools ([85f51b1](https://github.com/Supamiu/ffxiv-teamcraft/commit/85f51b1))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.1.3...v1.2.0) (2017-09-23)


### Bug Fixes

* bad amount for done with multiple items crafts ([96784c8](https://github.com/Supamiu/ffxiv-teamcraft/commit/96784c8))
* bad locale setting for non fr, en or de locales ([fffae17](https://github.com/Supamiu/ffxiv-teamcraft/commit/fffae17)), closes [#24](https://github.com/Supamiu/ffxiv-teamcraft/issues/24)
* broken links in EN list view ([41c6954](https://github.com/Supamiu/ffxiv-teamcraft/commit/41c6954)), closes [#15](https://github.com/Supamiu/ffxiv-teamcraft/issues/15)
* character search issue ([d5cf160](https://github.com/Supamiu/ffxiv-teamcraft/commit/d5cf160)), closes [#12](https://github.com/Supamiu/ffxiv-teamcraft/issues/12)
* character search issue, second pass ([49a3ce9](https://github.com/Supamiu/ffxiv-teamcraft/commit/49a3ce9)), closes [#12](https://github.com/Supamiu/ffxiv-teamcraft/issues/12)
* empty result after not empty one is shown properly ([d629b50](https://github.com/Supamiu/ffxiv-teamcraft/commit/d629b50)), closes [#25](https://github.com/Supamiu/ffxiv-teamcraft/issues/25)
* input field state after sumbmit is now correct ([7a0095a](https://github.com/Supamiu/ffxiv-teamcraft/commit/7a0095a)), closes [#28](https://github.com/Supamiu/ffxiv-teamcraft/issues/28)
* recipes yielding more than one items are handled properly ([8793226](https://github.com/Supamiu/ffxiv-teamcraft/commit/8793226)), closes [#27](https://github.com/Supamiu/ffxiv-teamcraft/issues/27)
* related renamed to ingredients ([283402b](https://github.com/Supamiu/ffxiv-teamcraft/commit/283402b))
* typos in fr translations ([23626fe](https://github.com/Supamiu/ffxiv-teamcraft/commit/23626fe))
* wrong color for theme in lists view ([1b1bbf4](https://github.com/Supamiu/ffxiv-teamcraft/commit/1b1bbf4))


### Features

* add multiple themes support with new light theme ([e5a3038](https://github.com/Supamiu/ffxiv-teamcraft/commit/e5a3038))
* add popup for reduction details ([a7ba553](https://github.com/Supamiu/ffxiv-teamcraft/commit/a7ba553))
* add realtime list counter ([69f08ef](https://github.com/Supamiu/ffxiv-teamcraft/commit/69f08ef))
* add social buttons and some ads-related stuff ([6b6e1af](https://github.com/Supamiu/ffxiv-teamcraft/commit/6b6e1af))
* add support for big result sets + loading spinner ([f206f01](https://github.com/Supamiu/ffxiv-teamcraft/commit/f206f01)), closes [#35](https://github.com/Supamiu/ffxiv-teamcraft/issues/35)
* add title change on list view ([eb8db20](https://github.com/Supamiu/ffxiv-teamcraft/commit/eb8db20))
* point recipe links directly to the item page ([ebc3516](https://github.com/Supamiu/ffxiv-teamcraft/commit/ebc3516)), closes [#15](https://github.com/Supamiu/ffxiv-teamcraft/issues/15)


### Reverts

* hand-made revert of last commit ([1606d93](https://github.com/Supamiu/ffxiv-teamcraft/commit/1606d93))



<a name="1.1.3"></a>
## [1.1.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.1.2...v1.1.3) (2017-09-06)



<a name="1.1.2"></a>
## [1.1.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.1.1...v1.1.2) (2017-09-06)


### Bug Fixes

* empty desynthedFrom array causing issues with list generation ([6d22741](https://github.com/Supamiu/ffxiv-teamcraft/commit/6d22741))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.1.0...v1.1.1) (2017-09-06)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.0.0-beta.7...v1.1.0) (2017-09-06)


### Bug Fixes

* adapt filters broken due to data changes ([5228aa0](https://github.com/Supamiu/ffxiv-teamcraft/commit/5228aa0)), closes [#11](https://github.com/Supamiu/ffxiv-teamcraft/issues/11)
* anonymous state at first connexion ([3967c97](https://github.com/Supamiu/ffxiv-teamcraft/commit/3967c97))
* authentication now kept after site reloading ([94a7357](https://github.com/Supamiu/ffxiv-teamcraft/commit/94a7357)), closes [#9](https://github.com/Supamiu/ffxiv-teamcraft/issues/9)
* removed beta chip ([295f305](https://github.com/Supamiu/ffxiv-teamcraft/commit/295f305))


### Features

* lodestone character can only be used once ([114f165](https://github.com/Supamiu/ffxiv-teamcraft/commit/114f165))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.0.0...v1.0.1) (2017-09-06)



<a name="1.0.0"></a>
# [1.0.0](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.0.0-beta.7...v1.0.0) (2017-09-06)


### Bug Fixes

* adapt filters broken due to data changes ([5228aa0](https://github.com/Supamiu/ffxiv-teamcraft/commit/5228aa0)), closes [#11](https://github.com/Supamiu/ffxiv-teamcraft/issues/11)
* anonymous state at first connexion ([3967c97](https://github.com/Supamiu/ffxiv-teamcraft/commit/3967c97))
* authentication now kept after site reloading ([94a7357](https://github.com/Supamiu/ffxiv-teamcraft/commit/94a7357)), closes [#9](https://github.com/Supamiu/ffxiv-teamcraft/issues/9)


### Features

* lodestone character can only be used once ([114f165](https://github.com/Supamiu/ffxiv-teamcraft/commit/114f165))



<a name="1.0.0-beta.7"></a>
# [1.0.0-beta.7](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2017-09-05)


### Bug Fixes

* add scrollable content to details popups ([0c6451e](https://github.com/Supamiu/ffxiv-teamcraft/commit/0c6451e))
* drops-related items not added to list ([b227d0c](https://github.com/Supamiu/ffxiv-teamcraft/commit/b227d0c)), closes [#8](https://github.com/Supamiu/ffxiv-teamcraft/issues/8)


### Features

* add character-related filter for list ([ba75367](https://github.com/Supamiu/ffxiv-teamcraft/commit/ba75367))
* add email verification and better profile fetching ([df6555c](https://github.com/Supamiu/ffxiv-teamcraft/commit/df6555c))
* add facebook oauth support ([e826aca](https://github.com/Supamiu/ffxiv-teamcraft/commit/e826aca))
* add first pass for auth ([40f5070](https://github.com/Supamiu/ffxiv-teamcraft/commit/40f5070))
* add level filter to list ([4402f91](https://github.com/Supamiu/ffxiv-teamcraft/commit/4402f91))
* add lodestone profile support on auth ([b67b1a3](https://github.com/Supamiu/ffxiv-teamcraft/commit/b67b1a3))
* add login ([2b765a3](https://github.com/Supamiu/ffxiv-teamcraft/commit/2b765a3))
* add specific jobs level filter, remove old one ([a273f50](https://github.com/Supamiu/ffxiv-teamcraft/commit/a273f50))
* add translations for new content ([476d1ae](https://github.com/Supamiu/ffxiv-teamcraft/commit/476d1ae))
* added job filters to list details ([9b70a9f](https://github.com/Supamiu/ffxiv-teamcraft/commit/9b70a9f))
* profile picture ([2a8dd61](https://github.com/Supamiu/ffxiv-teamcraft/commit/2a8dd61))



<a name="1.0.0-beta.6"></a>
# [1.0.0-beta.6](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2017-08-30)


### Bug Fixes

* masterbook size fix ([f787f7f](https://github.com/Supamiu/ffxiv-teamcraft/commit/f787f7f))


### Features

* added announcement system ([8b1c1ad](https://github.com/Supamiu/ffxiv-teamcraft/commit/8b1c1ad))



<a name="1.0.0-beta.5"></a>
# [1.0.0-beta.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2017-08-29)


### Bug Fixes

* search sometimes showing empty result set with no message ([e518376](https://github.com/Supamiu/ffxiv-teamcraft/commit/e518376)), closes [#5](https://github.com/Supamiu/ffxiv-teamcraft/issues/5)


### Features

* add FC crafts support ([ab0d9ca](https://github.com/Supamiu/ffxiv-teamcraft/commit/ab0d9ca))
* add gils support ([64f4a8e](https://github.com/Supamiu/ffxiv-teamcraft/commit/64f4a8e))



<a name="1.0.0-beta.4"></a>
# [1.0.0-beta.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2017-08-20)


### Bug Fixes

* bug with items that can be bought in old diadem ([4809e94](https://github.com/Supamiu/ffxiv-teamcraft/commit/4809e94))



<a name="1.0.0-beta.3"></a>
# [1.0.0-beta.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2017-08-19)


### Bug Fixes

* recipe not added ([f56ee39](https://github.com/Supamiu/ffxiv-teamcraft/commit/f56ee39))



<a name="1.0.0-beta.2"></a>
# [1.0.0-beta.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2017-08-19)



<a name="1.0.0-beta.1"></a>
# [1.0.0-beta.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v0.6.0-alpha.8...v1.0.0-beta.1) (2017-08-19)


### Bug Fixes

* double masterbook chip ([8a20a8a](https://github.com/Supamiu/ffxiv-teamcraft/commit/8a20a8a))
* item in both recipes and pre-crafts are checked together (#2) ([0342ed3](https://github.com/Supamiu/ffxiv-teamcraft/commit/0342ed3))


### Features

* add "report a bug" button ([d41ac82](https://github.com/Supamiu/ffxiv-teamcraft/commit/d41ac82))
* add drop support ([e78972c](https://github.com/Supamiu/ffxiv-teamcraft/commit/e78972c))
* add future i18n support for nodes ([87b48d7](https://github.com/Supamiu/ffxiv-teamcraft/commit/87b48d7))
* add gardening support ([4b92be9](https://github.com/Supamiu/ffxiv-teamcraft/commit/4b92be9))
* add gathered items details ([a3e448e](https://github.com/Supamiu/ffxiv-teamcraft/commit/a3e448e))
* add instance and reduction support ([e7344e7](https://github.com/Supamiu/ffxiv-teamcraft/commit/e7344e7))
* add multi-crafts support ([0577f0a](https://github.com/Supamiu/ffxiv-teamcraft/commit/0577f0a))
* add support for desynth items ([58ea86b](https://github.com/Supamiu/ffxiv-teamcraft/commit/58ea86b))
* add support for number-based progression ([795e3c8](https://github.com/Supamiu/ffxiv-teamcraft/commit/795e3c8))
* add trade support ([4540a09](https://github.com/Supamiu/ffxiv-teamcraft/commit/4540a09))



<a name="0.6.0-alpha.8"></a>
# [0.6.0-alpha.8](https://github.com/Supamiu/ffxiv-teamcraft/compare/v0.6.0-alpha.7...v0.6.0-alpha.8) (2017-08-16)


### Bug Fixes

* forgot a refactor element ([1a14d73](https://github.com/Supamiu/ffxiv-teamcraft/commit/1a14d73))



<a name="0.6.0-alpha.7"></a>
# [0.6.0-alpha.7](https://github.com/Supamiu/ffxiv-teamcraft/compare/v0.6.0-alpha.6...v0.6.0-alpha.7) (2017-08-16)



<a name="0.6.0-alpha.6"></a>
# [0.6.0-alpha.6](https://github.com/Supamiu/ffxiv-teamcraft/compare/v0.6.0-alpha.5...v0.6.0-alpha.6) (2017-08-16)


### Features

* add link on recipe search results ([3e8c7ae](https://github.com/Supamiu/ffxiv-teamcraft/commit/3e8c7ae))



<a name="0.6.0-alpha.5"></a>
# [0.6.0-alpha.5](https://github.com/Supamiu/ffxiv-teamcraft/compare/v0.6.0-alpha.4...v0.6.0-alpha.5) (2017-08-16)


### Features

* add DE translations ([e3a8163](https://github.com/Supamiu/ffxiv-teamcraft/commit/e3a8163))



<a name="0.6.0-alpha.4"></a>
# [0.6.0-alpha.4](https://github.com/Supamiu/ffxiv-teamcraft/compare/v0.6.0-alpha.3...v0.6.0-alpha.4) (2017-08-16)



<a name="0.6.0-alpha.3"></a>
# [0.6.0-alpha.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v0.6.0-alpha.2...v0.6.0-alpha.3) (2017-08-16)


### Bug Fixes

* add missing translation, fix bad ones ([1241bc2](https://github.com/Supamiu/ffxiv-teamcraft/commit/1241bc2))



<a name="0.6.0-alpha.2"></a>
# [0.6.0-alpha.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v0.6.0-alpha.1...v0.6.0-alpha.2) (2017-08-16)


### Features

* add ability to change language at anytime ([684fb51](https://github.com/Supamiu/ffxiv-teamcraft/commit/684fb51)), closes [#1](https://github.com/Supamiu/ffxiv-teamcraft/issues/1)
* add DE and JP to localized item names ([4108dc0](https://github.com/Supamiu/ffxiv-teamcraft/commit/4108dc0))



<a name="0.6.0-alpha.1"></a>
# [0.6.0-alpha.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v0.5.0-alpha.3...v0.6.0-alpha.1) (2017-08-16)


### Features

* add list item amount modification ([fbab5aa](https://github.com/Supamiu/ffxiv-teamcraft/commit/fbab5aa))



<a name="0.5.0-alpha.3"></a>
# [0.5.0-alpha.3](https://github.com/Supamiu/ffxiv-teamcraft/compare/v0.5.0-alpha.2...v0.5.0-alpha.3) (2017-08-16)



<a name="0.5.0-alpha.2"></a>
# [0.5.0-alpha.2](https://github.com/Supamiu/ffxiv-teamcraft/compare/v0.5.0-alpha.1...v0.5.0-alpha.2) (2017-08-16)


### Features

* add i18n dynamic loading under the same app ([5876635](https://github.com/Supamiu/ffxiv-teamcraft/commit/5876635))
* add i18n support for english and french list ([caa0fe8](https://github.com/Supamiu/ffxiv-teamcraft/commit/caa0fe8))



<a name="0.5.0-alpha.1"></a>
# [0.5.0-alpha.1](https://github.com/Supamiu/ffxiv-teamcraft/compare/v0.5.0-alpha.0...v0.5.0-alpha.1) (2017-08-15)


### Features

* add crafter icon for each craft in list ([3bbfe2f](https://github.com/Supamiu/ffxiv-teamcraft/commit/3bbfe2f))
* add i18n, first pass ([7e6a1b9](https://github.com/Supamiu/ffxiv-teamcraft/commit/7e6a1b9))
* add masterbook chip and compact crystals viewing ([0228573](https://github.com/Supamiu/ffxiv-teamcraft/commit/0228573))



<a name="0.5.0-alpha.0"></a>
# 0.5.0-alpha.0 (2017-08-15)


### Bug Fixes

* list recipe count set to 0 when no recipe in the list ([623fa0e](https://github.com/Supamiu/ffxiv-teamcraft/commit/623fa0e))
* no more refresh on completion update ([20603ff](https://github.com/Supamiu/ffxiv-teamcraft/commit/20603ff))


### Features

* add cache on database-side ([50dc0be](https://github.com/Supamiu/ffxiv-teamcraft/commit/50dc0be))
* add stars to recipes ([bfe9556](https://github.com/Supamiu/ffxiv-teamcraft/commit/bfe9556))
* alpha version of the app ([b97eaf9](https://github.com/Supamiu/ffxiv-teamcraft/commit/b97eaf9))
