# List Details

This page aims to provide some help on how to use a list to get the maximum informations from it, it will cover all of the features available on a list details page, 
explaining why they are here and how to use them properly

## Gathering

When filtering (see [Layouts]) for gatherings, you can see items with different icons in the right side of the item row, these icons are:

 * ![](./assets/icons/MIN.png) For rocky outcroping.
 * ![](./assets/icons/Mineral_Deposit.png) For mineral deposit. 
 * ![](./assets/icons/BTN.png) For lush vegetation patch.
 * ![](./assets/icons/Mature_Tree.png) Foor mature tree.
 
### Gathering details

When you click on the gathering icon, you can see more details about the item and how to obtain it, let's use this image as example:

![](https://i.imgur.com/fvYd3NS.png)

 1. This section gives you informations about where to find the item, in which map with coords available. Clicking on the ![]() button will open you a map with a marker on it and aetherytes shown so you can find the item easily.
    The last line contains an aetheryte icon and the name of the closest aetheryte so you can easily TP without having to open the map just to see where you should TP.
 2. This section is only here if the node is not a "standard" one, meaning that it's a timed one.
 3. This section shows details for timed nodes, giving the slot if it's known and spawn times.


### Register alarm for timed nodes

If a gatherable item is timed, you'll see a button appear on its row:

![](https://i.imgur.com/Qo2XPqd.png)

This button changes color depending on the state of the timer:

  * Primary color (orange in default theme) if the node is spawned, the time inside of the button will then become the remaining time before despawn.
  * Secondary color (blue in default theme) if the node is about to spawn according to your alarms settings.
  * Default color (as it is on screenshot) if the node isn't spawned, the timer shown is the time before spawn.


### Navigation Map

When you're using zone breakdown (See [Layouts] fore more details), some zone will contain a small map icon (![](https://i.imgur.com/JrpT5MK.png)).
This icons means that a navigation map is available for this area, the conditions for this map to appear are:

 * At least 3 items should be in this zone.
 * All of the 3 (or more) items have to have location informations available.
 
This navigation map shows an optimized path for your gatherings, with a detailed step-by-step guide below the map:

 ![](https://i.imgur.com/hoU2WK2.png)
 ![](https://i.imgur.com/ReDBbS0.png)
 
The legend for the map is:
 
 * Red arrows mean that you have to go using a mount.
 * Blue arrows mean that you should TP because it's faster.


## Trading

Item details sometimes have informations about trading, from gils to beast tokens, everything is detailed in a simple way to help you buy items instead of farming if you want to.

### Buying from NPC

Items sometimes have a gil icon in the right part of the row, meaning that they can be bough to a NPC using gils.

As for a lot of details icons, you can click on it to see details about it, this dialog box will then appear:

![](https://i.imgur.com/OJLxvkT.png)

This shows the name of the NPC, the map where he can be found and a map marker in case you want to see the exact position.

Some NPCs like Housing NPCs sometimes don't have location informations, the coordinates and the map marker will then be removed from the dialog box.

The amount at which you can buy the item is shown in the dialog box to help you see how much it'll cost.

### Trading with other currencies

Some items cannot be bought using gils, instead you can trade them using spoils, scripts, etc.

For these items, the most interesting currency to buy the item is shown (the order being determined in the code with priorities, more details [here](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/blob/master/src/app/modules/item/item/item.component.ts#L58-L216). 

As always, clicking on the icon will show you location details and the amount of currencies to use to buy the desired item, with the total needed to buy all you need to reach total needed.


## Hunting

Some items can be obtained by slaying monsters, you can filter them in [Layouts] using `IS_MONSTER_DROP` filter. They can be recognized by the ![](https://www.garlandtools.org/db/images/Mob.png) icon.

### Monsters with location informations

When clicking the details icon, you'll see a details dialog box: 

![](https://i.imgur.com/AFZ2IWr.png)

This dialog box sometimes contains location informations, provided by [xivdb](https://xivdb.com), clicking on the location icon will show you a map with a marker on it tho show you where to find this monster easily.

## Crafting

When you're in the Precrafts or Items category, items have icons for each job able to craft . Hovering these icons will show you the level required, and the amount of stars if there's some.

### See recipe details

Each item in the list details has a little icon for recipe details (![](https://i.imgur.com/s38RbSI.png)), it can also show you where this item is used in your list.

Example:

![](https://i.imgur.com/OyL68oN.png)

### Item name color

Item names can be colored in different colors, here is the legend for these colors:

 * Blue if the item is a recipe and it's ready to be crafted, meaning that you have all ingredients for it.
 * Green if the item is finished (you gathered/crafted everything).
 * Default one (black or white depending on the theme) if none of the above matches.

### Simulator link

Clicking on the recipe icon will open a new tab on a crafting simulator (You can choose which simulator in [Settings](/settings) page).

## Other

### Copy item name for recipe search

If you click on an item name inside a list, the name will be copied in your clipboard, this is useful to easily find an item in your recipe book ingame.

### Get isearch macro for an item

Next to each item, a magnifying glass icon is available as an icon button, clicking on it will copy `/isearch ` and the item name in your clipboard, useful to quickly search for items in your inventory.

### Tag an item as working on it

Each item has an icon to show that you're working on it (![](https://i.imgur.com/pwwwCEf.png)), 
clicking on it will add your profil picture to the row to say to everybody that you're the one working on it.

Once you clicked, you can remove your picture by clicking the remove button next to it to update the list by removing you as the person in charge of this item.


[Layouts]:/wiki/layouts

---
`Written by: Miu Asakura`
