# Crafting Log

Crafting log pages can be found at https://xivapi.com/RecipeNotebookList

Data structure is:

 - Index starts at 0, not 1.
 - First page of standard book (the pages listed by level range) is starting at index `jobId - 8`.
 - Each page can contain up to 160 recipes, structure is: https://xivapi.com/RecipeNotebookList/schema.
 - There's 40 pages per job, most of them are still empty.
 - After page ID 319, the IDS jump to 1000
 - Pages with ID >= 1000 are masterbooks, deliveries and housing
 - There is a total of 19 of these pages per job, didn't find precise ordering for now, TBD
 - The key for page naming is to use first recipe of a page, property `RecipeLevelTableTargetID`, and same property on last item of the page.
