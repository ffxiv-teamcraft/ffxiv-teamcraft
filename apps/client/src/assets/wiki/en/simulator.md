# Simulator

This page is here to help you get the most out of the simulator feature,
 how to use it to create rotations on existing items, non-existing ones (for pre-patch recipe speculations).

## Presentation

The [simulator] page, inspired by [Crafting Optimizer service](http://ffxiv.lokyst.net/), aims to create a more flexible approach for 
crafting simulation, the code base, open source, is available on the main repository, in [simulator page folder](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/tree/master/src/app/pages/simulator). It's done in a more 
Object Oriented approach to have easier implementation for things like Whistle while you work, buffs and more strange things (looking at you, Name Of Element skills). 

It's fully responsive, available on both mobile and desktop version of the app, so everything can use it easily.

Rotations created using the tool can be persisted and shared so the other person will see the rotation running with **his own stats**, 
meaning that no more worries about "do I have enough CP/Control/Craftsmanship to run your rotation?"

## Access

The simulator can be accessed via multiple ways:

### Simulator with a given item

 * From a recipe result in [recipes] page.
 
 ![](https://i.imgur.com/rt88Gwn.gif)
 
 * From a list details page.
 
 ![](https://i.imgur.com/4O03RVA.gif)
 
### Simulator with custom 

 * From the [rotations] page, to create a new rotation with custom recipe attributes.
 
 ![](https://i.imgur.com/eHNlHtl.gif)
 
## Foods and medicines

Every foods and medicines are available in the simulator and persisted with your rotation, 
meaning that when you share the rotation, the user opening it wont have to set foods and medicines like you did, they'll automatically be applied.

## HQ ingredients

Instead of being able to set starting quality, you can directly set ingredients as HQ, like ingame. 
These will add base quality to the craft so you know which item you can add as HQ to have more HQ chances.

## Sharing a rotation

### Saving the rotation

Once you created the rotation, you can save it to the database using the save icon 
(which will appear in the top-left corner if you have at least one skill in your rotation).
This will redirect you to the newly persisted rotation and the save button will now be displayed if you have modified the rotation.

### Getting the share link

The share link can either be copied from your URL address bar in your browser when you're in a rotation details or you can copy it from the share icon 
located inside each rotation panel in [rotations] page. 

### Permissions

Rotations can only be saved by their creator, meaning that someone can use your rotation and modify it, 
but they won't be able to save it to your rotation, saving it will result in a new rotation being created with you as the author.

## Import from crafting optimizer

You can import rotations from Crafting Optimizer using a very simple process:

 1. Copy the export code from your Crafting Optimizer fork (example: `["muscleMemory","innerQuiet","steadyHand2","prudentTouch","prudentTouch","prudentTouch"]`).
 2. Click the Import icon (![](https://i.imgur.com/tTklnmI.png)).
 3. Paste the import code inside the text box displayed.
 4. Click Ok.
 5. Profit, your rotation is now imported.

## Import from ingame macro

You can import crafting rotations from ingame macros, simply follow the gif below:

![](https://i.imgur.com/Madc7mA.gif)

## Find minimum stats

You can find minimum stats required for your rotation (only if it completes, else you'll see actual stats) using the minimum stats popup, here is a demo:

![](https://i.imgur.com/UedLw7m.gif)

## Ingame macro creation

You can generate ingame macros for an easy simulator => game transition of your rotations.

This macro is generated in your current language and includes proper timeouts depending on the type of skill.

Simply click the macro generation icon (![](https://i.imgur.com/K3AAwVX.png)) to see the dialog box displaying the ingame macro,
 in blocks of 15 lines so you can easily paste ingame.

 
 
[simulator]:/simulator/custom
[recipes]:/recipes
[rotations]:/rotations
