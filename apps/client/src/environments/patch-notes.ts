export const patchNotes = `### Bug Fixes

* **desktop:** better slow mode for autofill.
* **list-details:** better reliability on transactional write.
* **list-details:** increased debounce on list update to prevent rollbacks.
* **log-tracker:** fixed gathering folklores using wrong labels.
* **log-tracker:** fixed progression not being saved properly.


### Features

* **alarms:** new setting in alarms popup to enable TTS notification.
* **desktop:** app now remembers zoom factor on close.
* **layout:** new filter: IS_FROM_HOUSING_VENDOR.
* **list-details:** added # of crafts in the title of panels containing crafts.
* **list-details:** fill with inventory now allows you to select the inventory to fill from.
* **log-tracker:** better layout using scroll container for pages.


### Performance Improvements

* **core:** update to Angular 13 and Antd 13.
* **list-details:** removed badge on comment button to improve loading performances.
* **lists:** fixed a possible OOM crash when deleting a list with a large history.`;
