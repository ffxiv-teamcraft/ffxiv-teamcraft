import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { environment } from '../../../../environments/environment';

export class UnwantedMaterials extends InventoryOptimizer {

  static RECIPE_ILVL_KEY = 'optimizer:unwanted-materials:recipe-ilvl';
  static UNWANTED_CACHE_KEY = 'optimizer:unwanted-materials:cache';

  constructor(private lazyData: LazyDataService) {
    super();

    const appVersion: string = environment.version;
    const cache: any = JSON.parse(localStorage.getItem(UnwantedMaterials.UNWANTED_CACHE_KEY));
    if (!cache || appVersion !== cache.version) {
      this.rebuildCache(appVersion);
    }
  }

  //This just caches a list of materials used in all recipes, including ilvl, and company workshop usage
  rebuildCache(version: string) {
    const recipes: any[] = this.lazyData.data.recipes;
    const cache: any = JSON.parse(localStorage.getItem(UnwantedMaterials.UNWANTED_CACHE_KEY)) || {};
    cache.version = version;
    cache.materials = cache.materials || {};

    recipes.forEach(recipe => {
      const firstIlvl: number = this.lazyData.data.ilvls[recipe.result];

      //We make a recursive function so we can get all the way to base materials to update their ilvls
      //The "ilvl" parameter here takes the highest ilvl we've found so far, and brings it down though the recipe trees
      const spanAllMaterials = (ingredientId: number, ilvl: number): void => {
        //Grab the material from the cache if it already exists
        const materialIlvl: number = cache.materials[ingredientId];
        if (materialIlvl) {
          //if this new recipe had a higher ilvl, we update the cache
          const newilvl: number = this.lazyData.data.ilvls[ingredientId];
          const highilvl: number = ilvl > newilvl ? ilvl : newilvl;
          cache.materials[ingredientId] = materialIlvl > highilvl ? materialIlvl : highilvl;
        }
        //Add material to cache if we don't have it yet
        else {
          cache.materials[ingredientId] = ilvl;
        }
        //Now we go through any recipes that make this ingredient, and update them, and so on...
        recipes.filter(r => r.result === ingredientId).forEach(subRecipe => {
          subRecipe.ingredients.forEach(subIngredient => {
            spanAllMaterials(subIngredient.id, ilvl);
          });
        });
      };

      //Cycle through every recipe's ingredients
      recipe.ingredients.forEach(ingredient => {
        spanAllMaterials(ingredient.id, firstIlvl);
      });
    });

    localStorage.setItem(UnwantedMaterials.UNWANTED_CACHE_KEY, JSON.stringify(cache));
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } {
    const wantedIlvl: number = parseInt(localStorage.getItem(UnwantedMaterials.RECIPE_ILVL_KEY), 10);
    const cache: any = JSON.parse(localStorage.getItem(UnwantedMaterials.UNWANTED_CACHE_KEY));

    const materialIlvl: number = cache.materials[item.itemId];
    if (materialIlvl && materialIlvl < wantedIlvl) {
      return { ilvl: materialIlvl };
    }
    return null;
  }

  getId(): string {
    return 'UNWANTED_MATERIALS';
  }
}
