# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
