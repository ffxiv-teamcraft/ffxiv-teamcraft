import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow, getItemSource } from '../../../modules/list/model/list-row';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { environment } from '../../../../environments/environment';

export class UnwantedMaterials extends InventoryOptimizer {

  static RECIPE_ILVL_KEY = 'optimizer:unwanted-materials:recipe-ilvl';
  static UNWANTED_CACHE_KEY = 'optimizer:unwanted-materials:cache';

  constructor(private lazyData: LazyDataService) {
    super();

    const appVersion = environment.version;
    const cache = JSON.parse(localStorage.getItem(UnwantedMaterials.UNWANTED_CACHE_KEY));
    if (!cache || appVersion !== cache.version) {
      this.rebuildCache(appVersion);
      //console.log("Rebuilt Cache");
    } 
    else {
      //console.log("Cache version matches");
    }
  }

  //This just caches a list of materials used in all recipes, including ilvl, and company workshop usage
  rebuildCache(version: string) {
    const recipes = this.lazyData.data.recipes;
    const cache = JSON.parse(localStorage.getItem(UnwantedMaterials.UNWANTED_CACHE_KEY)) || {};
    cache["version"] = version;
    cache.materials = cache.materials || {};

    //console.log(recipes[0]);

    recipes.forEach(recipe => {
      const firstIlvl = this.lazyData.data.ilvls[recipe.result];

      //We make a recursive function so we can get all the way to base materials to update their ilvls
      const spanAllMaterials = (ingredientId: number, ilvl: number) => {        
        //Grab the material from the cache if it already exists

        const materialIlvl = cache.materials[ingredientId];
        if (materialIlvl) {
          //if this new recipe had a higher ilvl, we update the cache
          const newilvl = this.lazyData.data.ilvls[ingredientId];
          const highilvl = ilvl > newilvl ? ilvl : newilvl
          cache.materials[ingredientId] = materialIlvl > highilvl ? materialIlvl : highilvl;
        }
        //Add material to cache if we don't have it yet
        else {
          cache.materials[ingredientId] = ilvl
        }
        //Now we go through any recipes that make this ingredient, and update them, and so on...
        recipes.filter(r => r.result === ingredientId).forEach(subRecipe => {
          subRecipe.ingredients.forEach(subIngredient => {
            spanAllMaterials(subIngredient.id, ilvl);
          });
        });
      }    

      //Cycle through every recipe's ingredients
      recipe.ingredients.forEach(ingredient => {
        spanAllMaterials(ingredient.id, firstIlvl);
      });
    });

    localStorage.setItem(UnwantedMaterials.UNWANTED_CACHE_KEY, JSON.stringify(cache));    
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } {
    const wantedIlvl = localStorage.getItem(UnwantedMaterials.RECIPE_ILVL_KEY);
    const cache = JSON.parse(localStorage.getItem(UnwantedMaterials.UNWANTED_CACHE_KEY)); 

    const appVersion = environment.version;
    const ilvls = this.lazyData.data.ilvls;
    
    const materialIlvl = cache.materials[item.itemId];
    if (materialIlvl && materialIlvl < wantedIlvl) {
      return {ilvl: materialIlvl}
    }
    return null;
  }

  getId(): string {
    return 'UNWANTED_MATERIALS';
  }
}
