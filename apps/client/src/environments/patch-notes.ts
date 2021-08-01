export const patchNotes = `### Bug Fixes

* **alarms:** fixed custom alarms in Zadnor not being created at all.
* **desktop:** kill the TC process when it's opened from custom protocol.
* **fishing-log:** export now includes all the gatherable items at once.
* **inventory:** sort by total price instead of unit price.
* **inventory-optimizer:** no more duplicated container names.
* **layout:** fixed OR/AND change not being edited properly alone.
* **layout:** fixed zone breakdown path optimizer sometimes skipping some items.
* **list:** fixed progression not saved when completing a list with participate permission.
* **log-tracker:** fixed checkboxes stats not being saved properly.
* **log-tracking:** fixed log page sometimes not updating when marking something as done.
* **metrics:** fixed gil detection from retainers.
* **retainers:** no more weird named retainers.
* **stats:** stats syncing is now disabled by default to avoid foods from being taken into account.


### Features

* **core:** collectable items now have collectable icon over their own icon.
* **db:** added new trades and rewards details to quests.
* **db:** support for korean v5.45 update.
* **desktop:** you can now close the "Your inventory hasn't been loaded" warning.
* **list:** collectable items now show collectability in linked rotation instead of HQ%.
* **list:** fates now have a lower priority in monster locations system.
* **list:** support for items obtained from collectable trades (like gobbiegoo).
* **retainers:** new button to reset retainers inside retainers page.
* **search:** new button in search intro and sidebar to open the guides website.
* **search:** new filter to search for collectables only items.
* **simulator:** support for kr 5.45.
* **universalis:** update the listing when the person uploading buys an item.


### Performance Improvements

* **core:** fixed possible memory leak.
* **search:** search with ANY type is now 8 times faster.`;
