# Layouts Guide

![Layout Creation Gif](https://i.imgur.com/bgWAmCi.gif)
___
### What are Layouts?

Layouts allow you to customize how the recipe is displayed to you, i.e: Gathering, Other, Crafted. Using Layouts, you will be able to generate more filters to customize your experience to your liking.

Layouts work by panels that work through trickle-down, this means that the top panel applies the filter, passing the remaining items down to the next filter, this continues, until all filters have been run, any remaining items will fall into the **Other** filter, which is the catch-all.

___
## Layout Functions
* **Area Breakdown** - Shows area/s of gatherable items.
* **Display Crafting Tiers** - Breaks down crafting panel to show tiers of crafting, showing pre-crafts and final crafting steps.
* **Hide when Empty** - Will hide the panel when all items in this panel have been gathered/crafted.
* **Not** - Selecting this will apply a filter that causes current panel to ignore items that the filter is set to. 
  >*i.e*: **IS_GATHERED_BY_FSH** will cause all fish to not appear in this panel, even if **IS_GATHERING** is set. 
___

## Creating/Changing a Layout
1. Load up any list you have created.
2. Look for this icon ![](https://i.imgur.com/EnJtVIs.png) in the top left of the screen.
3. At the top of the new window, there are 2 input areas, these are **Layout** & **Layout Name**
   > **Layout** is your currently selected Layout and **Layout name** is the box that allows you to name the current layout.
4. Once you have named your layout, its time to start adding some panels.
___
## Adding a Panel
1. Use the **Add Panel** button to create a new filter.
2. Replace the *New Filter* with your own Filter name.
3. Under **Filter** select the filter you wish to apply. i.e:  **IS_GATHERING**
   > You may also use buttons below to add additional functions, such as **Area Breakdown**, **Display Crafting Tiers** and **Hide when Empty.**
4. Use the white arrow keys to move the new panel up until you have it set to the priority you require.
5. Continue to create and move panels to create your ideal layout.
6. Once all panels have been created and moved, simply press **Save**.
___
## Import / Export
* As well as being able to save layouts to your profile, you are able to share your profiles with others, this is where the import/export function comes in handy.

* **Export** - Pressing **Export** will generate a block of text, sharing this *code* will allow others to import your layouts to use.
* **Import** - Simply copy the *code* given to you into a box and press **Import**
___
## Switching between saved Layouts

1. Open up your layouts.
2. *Layout* at the top of the window is a drop-down, simply select the layout you wish, and press **Save**.

## Examples of Panels

* **Reduction** - Will show you timed nodes that allow you to use reduction for aethersands. - `IS_REDUCTION`
* **Dungeon/GC** - Why not put all those pesky dungeon drops together, even better it allows you to buy them with grand company seals. - `IS_MONSTER_DROP`
* **Vendors** - Why would you go out and farm all those materials when you can buy some for a handful of gil? `CAN_BE_BOUGHT`

---
`Written by: Tataru Taru`
