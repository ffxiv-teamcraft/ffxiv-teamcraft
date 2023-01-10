export const patchNotes = `### Bug Fixes

* **alarms:** fixed fishing alarms sometimes jumping back and forth.
* **db:** brought back gathering information on diadem items.
* **desktop:** fixed an issue with machina still trying to start with pcap disabled.
* **desktop:** fixed character link search infinite loading.
* **desktop:** Machina will now only try to start 3 times before stopping until app restart.
* **gearset:** better default ilvl filter values and perf fixes.
* **list:** fixed island buildings not parsed properly in lists.
* **log-tracker:** fixed text formatting.


### Features

* Update submarine max level to 105.
* **desktop:** step-by-step list overlay.
* **layout:** new filter: IS_GARDENING.
* **list-details:** new alternate display mode: Compact.
* **list-details:** new minimalist display mode.
* **lists:** new list aggregates system.
* **lists:** new step by step display mode.
* **metrics:** refactored persistence to use sqlite db instead of custom files.


### Performance Improvements

* **lists:** no more delay on marking something as done & better reliability.`;
