export const patchNotes = `### Bug Fixes

* **alarms:** fixed ephemeral warning in compact mode breaking design.
* **alarms:** get spawn times from game data so it cannot be wrong anymore.
* **collectables:** fixed wrong collectability thresholds on ishgard recipes.
* **commission:** fixed an issue with rating sometimes not applied properly.
* **inventory-optimizer:** hidden optimizers are now properly shown when enabling "show hidden".
* **lists:** auto cleanup for lists that have no name.
* **macro-translator:** fixed bad translation for Scrutiny.
* **profile:** better rendering for narrower resolutions.
* better handling of character not loading properly to avoid xivapi errors.
* **rotation-overlay:** removed cp cost from actions to prevent possible crashes.
* **search:** fixed patch search not working properly.
* **shortcuts:** fixed keyboard shortcuts for search and open in app.
* **simulator:** fixed a bug with HQ ingredients and recipe switch.
* **simulator:** fixed an issue with specialist checkbox not working properly.
* **simulator:** fixed manipulation tip with final appraisal.


### Features

* **commissions:** new checkbox for commissions that require only materials.
* **commissions:** you can now see contractor contact after hiring them (not retroactive).
* **community-rotations:** added missing 80★★★★ filter entry.
* **desktop:** added winpcap checkbox inside settings page.
* **log-tracker:** you can now pick individual recipes to add to a list.
* **patreon:** new loading screen supporter: Sombra's Scavengers on Jenova.
* **simulator:** new checkbox in macro generation popup to add consumables notification.
* **simulator:** new tooltip to show min, max and median HQ% when hovering avg HQ%.


### Performance Improvements

* **rotations:** virtual scrolling to help with large amount of rotations.
* moved hosting back to a real CDN and desktop update too, to avoid the 5.4 bandwidth problem again.`;
