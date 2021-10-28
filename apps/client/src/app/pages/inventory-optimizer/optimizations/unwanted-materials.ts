import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { environment } from '../../../../environments/environment';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LazyDataKey } from '../../../lazy-data/lazy-data-types';

export class UnwantedMaterials extends InventoryOptimizer {

  static RECIPE_ILVL_KEY = 'optimizer:unwanted-materials:recipe-ilvl';
  static UNWANTED_CACHE_KEY = 'optimizer:unwanted-materials:cache';

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  //This just caches a list of materials used in all recipes, including ilvl, and company workshop usage
  getCache(): Observable<any> {
    const LScache = localStorage.getItem(UnwantedMaterials.UNWANTED_CACHE_KEY);
    if (!LScache || environment.version !== JSON.parse(LScache).version) {
      return combineLatest([
        this.lazyData.getEntry('recipes'),
        this.lazyData.getEntry('ilvls')
      ]).pipe(
        map(([recipes, ilvls]) => {
          const cache: any = JSON.parse(localStorage.getItem(UnwantedMaterials.UNWANTED_CACHE_KEY)) || {};
          cache.version = environment.version;
          cache.materials = cache.materials || {};

          recipes.forEach(recipe => {
            const firstIlvl: number = ilvls[recipe.result];

            //We make a recursive function so we can get all the way to base materials to update their ilvls
            //The "ilvl" parameter here takes the highest ilvl we've found so far, and brings it down though the recipe trees
            const spanAllMaterials = (ingredientId: number, ilvl: number): void => {
              //Grab the material from the cache if it already exists
              const materialIlvl: number = cache.materials[ingredientId];
              if (materialIlvl) {
                //if this new recipe had a higher ilvl, we update the cache
                const newilvl: number = ilvls[ingredientId];
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
          return cache;
        })
      ).pipe(
        tap(cache => localStorage.setItem(UnwantedMaterials.UNWANTED_CACHE_KEY, JSON.stringify(cache)))
      );
    }
    return of(JSON.parse(LScache));
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): Observable<{ [p: string]: number | string }> {
    const wantedIlvl: number = parseInt(localStorage.getItem(UnwantedMaterials.RECIPE_ILVL_KEY), 10);
    return this.getCache().pipe(
      map(cache => {
        const materialIlvl: number = cache.materials[item.itemId];
        if (materialIlvl && materialIlvl < wantedIlvl) {
          return { ilvl: materialIlvl };
        }
        return null;
      })
    );
  }

  getId(): string {
    return 'UNWANTED_MATERIALS';
  }

  lazyDataEntriesNeeded(): LazyDataKey[] {
    return ['recipes', 'ilvls'];
  }
}
