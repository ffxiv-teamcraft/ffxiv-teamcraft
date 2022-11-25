import { combineLatest } from 'rxjs';
import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class RecipesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const hqFlags = this.requireLazyFile('hq-flags');
    // We're maintaining two formats, that's bad but migrating all the usages of the current recipe model isn't possible, sadly.
    const recipes = [];
    const rlookup = {
      searchIndex: {},
      recipes: {}
    };
    const recipesPerItem = {};
    const typeToClassJob = [
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15
    ];
    combineLatest([
      this.getSheet<any>(xiv, 'CompanyCraftSequence',
        ['ResultItem#', 'CompanyCraftDraft.Name', 'CompanyCraftPart.CompanyCraftProcess.SupplyItem.Item#', 'CompanyCraftPart.CompanyCraftProcess.SetQuantity', 'CompanyCraftPart.CompanyCraftProcess.SetsRequired'], false, 4),
      this.getSheet<any>(xiv, 'Recipe', ['RecipeLevelTable', 'QualityFactor', 'ItemIngredient.LevelItem#', 'AmountIngredient', 'LevelItem#', 'MaterialQualityFactor', 'CraftType#', 'AmountResult', 'ItemResult#', 'DurabilityFactor', 'DifficultyFactor',
        'CanQuickSynth', 'CanHq', 'RequiredControl', 'RequiredCraftsmanship', 'SecretRecipeBook.Item#', 'RequiredQuality', 'IsExpert'], false, 1),
      this.getSheet<any>(xiv, 'MJIRecipe', ['Material.ItemPouch.Item#', 'Amount', 'KeyItem.Item#', 'ItemPouch.Item#'], true, 2),
      this.getSheet<any>(xiv, 'MJICraftworksObject', ['Material.Item#', 'Amount', 'Item#'], true, 1),
      this.getSheet<any>(xiv, 'MJIBuilding', ['Material.Item#', 'Amount'], true, 1),
      this.getSheet<any>(xiv, 'MJILandmark', ['Material.Item#', 'Amount'], true, 1),
    ]).subscribe(([companyCrafts, xivRecipes, mjiRecipes, mjiCraftworksObjects, mjiBuildings, mjiLandmarks]) => {

      xivRecipes.forEach(recipe => {
        if (!recipe.RecipeLevelTable || recipe.RecipeLevelTable?.index === 0) {
          return;
        }
        const maxQuality = Math.floor(recipe.RecipeLevelTable.Quality * recipe.QualityFactor / 100);
        const ingredients = recipe.ItemIngredient
          .map((item, index) => {
            if (!item || item.index === 0) {
              return;
            }
            return {
              id: item.index,
              amount: recipe.AmountIngredient[index],
              ilvl: +item.LevelItem
            };
          }).filter(Boolean);
        const totalContrib = maxQuality * recipe.MaterialQualityFactor / 100;
        const totalIlvl = ingredients.filter(i => i.id > 19 && hqFlags[i.id] === 1).reduce((acc, cur) => acc + cur.ilvl * cur.amount, 0);
        const lazyRecipeRow = {
          id: recipe.index,
          job: typeToClassJob[recipe.CraftType],
          lvl: recipe.RecipeLevelTable.ClassJobLevel,
          yields: recipe.AmountResult,
          result: recipe.ItemResult,
          stars: recipe.RecipeLevelTable.Stars,
          qs: recipe.CanQuickSynth,
          hq: recipe.CanHq,
          durability: Math.floor(recipe.RecipeLevelTable.Durability * recipe.DurabilityFactor / 100),
          quality: maxQuality,
          progress: Math.floor(recipe.RecipeLevelTable.Difficulty * recipe.DifficultyFactor / 100),
          suggestedControl: recipe.RecipeLevelTable.SuggestedControl,
          suggestedCraftsmanship: recipe.RecipeLevelTable.SuggestedCraftsmanship,
          progressDivider: recipe.RecipeLevelTable.ProgressDivider,
          qualityDivider: recipe.RecipeLevelTable.QualityDivider,
          progressModifier: recipe.RecipeLevelTable.ProgressModifier,
          qualityModifier: recipe.RecipeLevelTable.QualityModifier,
          controlReq: recipe.RequiredControl,
          craftsmanshipReq: recipe.RequiredCraftsmanship,
          rlvl: recipe.RecipeLevelTable.index,
          masterbook: recipe.SecretRecipeBook?.Item || undefined,
          requiredQuality: recipe.RequiredQuality,
          ingredients: ingredients
            .map(ingredient => {
              return {
                id: ingredient.id,
                amount: ingredient.amount,
                quality: (ingredient.ilvl / totalIlvl * totalContrib * hqFlags[ingredient.id]) || 0
              };
            }),
          expert: recipe.IsExpert,
          conditionsFlag: recipe.RecipeLevelTable.ConditionsFlag
        };

        recipes.push(lazyRecipeRow);
        recipesPerItem[lazyRecipeRow.result] = [...(recipesPerItem[lazyRecipeRow.result] || []), lazyRecipeRow];
      });

      recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
          rlookup.searchIndex[ingredient.id] = rlookup.searchIndex[ingredient.id] || [];
          rlookup.searchIndex[ingredient.id].push(recipe.id);
          rlookup.recipes[recipe.id] = {
            itemId: recipe.result,
            recipeId: recipe.id,
            ingredients: recipe.ingredients,
            yields: recipe.yields,
            lvl: recipe.lvl,
            job: recipe.job,
            stars: recipe.stars
          };
        });
      });

      companyCrafts.forEach(companyCraftSequence => {
        const recipe: any = {
          id: `fc${companyCraftSequence.index}`,
          job: 0,
          lvl: 1,
          yields: 1,
          result: companyCraftSequence.ResultItem,
          stars: 0,
          qs: false,
          hq: false,
          ingredients: []
        };
        if (companyCraftSequence.CompanyCraftDraft?.index > 0) {
          recipe.masterbook = {
            id: `draft${companyCraftSequence.CompanyCraftDraft?.index}`,
            name: {
              en: companyCraftSequence.CompanyCraftDraft?.Name_en || '???',
              ja: companyCraftSequence.CompanyCraftDraft?.Name_ja || '???',
              de: companyCraftSequence.CompanyCraftDraft?.Name_de || '???',
              fr: companyCraftSequence.CompanyCraftDraft?.Name_fr || '???'
            }
          };
        }
        for (let partIndex = 0; partIndex < 8; partIndex++) {
          if (!companyCraftSequence.CompanyCraftPart[partIndex]) {
            continue;
          }
          for (let processIndex = 0; processIndex < 3; processIndex++) {
            if (!companyCraftSequence.CompanyCraftPart[partIndex].CompanyCraftProcess[processIndex]) {
              continue;
            }
            for (let i = 0; i < 12; i++) {
              if (!companyCraftSequence.CompanyCraftPart[partIndex].CompanyCraftProcess[processIndex]
                || companyCraftSequence.CompanyCraftPart[partIndex].CompanyCraftProcess[processIndex].SupplyItem[i].Item === 0) {
                continue;
              }
              recipe.ingredients.push({
                id: companyCraftSequence.CompanyCraftPart[partIndex].CompanyCraftProcess[processIndex].SupplyItem[i].Item,
                amount: companyCraftSequence.CompanyCraftPart[partIndex].CompanyCraftProcess[processIndex].SetQuantity[i] * companyCraftSequence.CompanyCraftPart[partIndex].CompanyCraftProcess[processIndex].SetsRequired[i],
                quality: 0,
                phase: processIndex + 1
              });
            }
          }
        }
        recipes.push(recipe);
      });

      mjiRecipes.forEach(mjiRecipe => {
        const ingredients = mjiRecipe.Material
          .map((material, index) => {
            if (!material || material?.index === 0) {
              return;
            }
            return {
              id: material.ItemPouch?.Item,
              amount: +mjiRecipe.Amount[index]
            };
          })
          .filter(i => !!i?.id);
        const lazyRecipeRow = {
          id: `mji-${mjiRecipe.index}`,
          job: -10,
          lvl: 1,
          yields: 1,
          result: mjiRecipe.KeyItem?.Item || mjiRecipe.ItemPouch?.Item,
          qs: false,
          hq: false,
          durability: 0,
          quality: 0,
          progress: 0,
          suggestedControl: 0,
          suggestedCraftsmanship: 0,
          progressDivider: 0,
          qualityDivider: 0,
          progressModifier: 0,
          qualityModifier: 0,
          controlReq: 0,
          craftsmanshipReq: 0,
          rlvl: 0,
          requiredQuality: 0,
          ingredients: ingredients
            .map(ingredient => {
              return {
                id: ingredient.id,
                amount: ingredient.amount,
                quality: 0
              };
            }),
          expert: false,
          conditionsFlag: 0,
          isIslandRecipe: true
        };

        if (lazyRecipeRow.result && lazyRecipeRow.ingredients.length > 0) {
          recipes.push(lazyRecipeRow);
          recipesPerItem[lazyRecipeRow.result] = [...(recipesPerItem[lazyRecipeRow.result] || []), lazyRecipeRow];
        }
      });

      mjiCraftworksObjects.forEach(mjiCraftworksObject => {
        const ingredients = mjiCraftworksObject.Material
          .map((material, index) => {
            if (!material || material?.index === 0) {
              return;
            }
            return {
              id: material.Item,
              amount: +mjiCraftworksObject.Amount[index]
            };
          })
          .filter(i => !!i?.id && i.amount > 0);
        const lazyRecipeRow = {
          id: `mji-craftworks-${mjiCraftworksObject.index}`,
          job: -10,
          lvl: 1,
          yields: 1,
          result: mjiCraftworksObject.Item,
          qs: false,
          hq: false,
          durability: 0,
          quality: 0,
          progress: 0,
          suggestedControl: 0,
          suggestedCraftsmanship: 0,
          progressDivider: 0,
          qualityDivider: 0,
          progressModifier: 0,
          qualityModifier: 0,
          controlReq: 0,
          craftsmanshipReq: 0,
          rlvl: 0,
          requiredQuality: 0,
          ingredients: ingredients
            .map(ingredient => {
              return {
                id: ingredient.id,
                amount: ingredient.amount,
                quality: 0
              };
            }),
          expert: false,
          conditionsFlag: 0,
          isIslandRecipe: true
        };

        if (lazyRecipeRow.result && lazyRecipeRow.ingredients.length > 0) {
          recipes.push(lazyRecipeRow);
          recipesPerItem[lazyRecipeRow.result] = [...(recipesPerItem[lazyRecipeRow.result] || []), lazyRecipeRow];
        }
      });

      mjiBuildings.forEach(building => {
        const ingredients = building.Material
          .map((material, index) => {
            if (!material || material?.index === 0) {
              return;
            }
            return {
              id: material.Item,
              amount: +building.Amount[index]
            };
          })
          .filter(i => !!i?.id && i.amount > 0);
        const ID = -10000 + -1 * (+building.index * 100);
        const lazyRecipeRow = {
          id: `mji-building-${building.index}`,
          job: -10,
          lvl: 1,
          yields: 1,
          result: ID,
          qs: false,
          hq: false,
          durability: 0,
          quality: 0,
          progress: 0,
          suggestedControl: 0,
          suggestedCraftsmanship: 0,
          progressDivider: 0,
          qualityDivider: 0,
          progressModifier: 0,
          qualityModifier: 0,
          controlReq: 0,
          craftsmanshipReq: 0,
          rlvl: 0,
          requiredQuality: 0,
          ingredients: ingredients
            .map(ingredient => {
              return {
                id: ingredient.id,
                amount: ingredient.amount,
                quality: 0
              };
            }),
          expert: false,
          conditionsFlag: 0,
          isIslandRecipe: true
        };

        if (lazyRecipeRow.result && lazyRecipeRow.ingredients.length > 0) {
          recipes.push(lazyRecipeRow);
          recipesPerItem[lazyRecipeRow.result] = [...(recipesPerItem[lazyRecipeRow.result] || []), lazyRecipeRow];
        }
      });

      mjiLandmarks.forEach(building => {
        const ingredients = building.Material
          .map((material, index) => {
            if (!material || material?.index === 0) {
              return;
            }
            return {
              id: material.Item,
              amount: +building.Amount[index]
            };
          })
          .filter(i => !!i?.id && i.amount > 0);
        const ID = -11000 + -1 * (+building.index * 10);
        const lazyRecipeRow = {
          id: `mji-landmark-${building.index}`,
          job: -10,
          lvl: 1,
          yields: 1,
          result: ID,
          qs: false,
          hq: false,
          durability: 0,
          quality: 0,
          progress: 0,
          suggestedControl: 0,
          suggestedCraftsmanship: 0,
          progressDivider: 0,
          qualityDivider: 0,
          progressModifier: 0,
          qualityModifier: 0,
          controlReq: 0,
          craftsmanshipReq: 0,
          rlvl: 0,
          requiredQuality: 0,
          ingredients: ingredients
            .map(ingredient => {
              return {
                id: ingredient.id,
                amount: ingredient.amount,
                quality: 0
              };
            }),
          expert: false,
          conditionsFlag: 0,
          isIslandRecipe: true
        };

        if (lazyRecipeRow.result && lazyRecipeRow.ingredients.length > 0) {
          recipes.push(lazyRecipeRow);
          recipesPerItem[lazyRecipeRow.result] = [...(recipesPerItem[lazyRecipeRow.result] || []), lazyRecipeRow];
        }
      });

      this.persistToJsonAsset('recipes', recipes);
      this.persistToJsonAsset('recipes-ingredient-lookup', rlookup);
      this.persistToJsonAsset('recipes-per-item', recipesPerItem);
      this.done();
    });
  }

  getName(): string {
    return 'recipes';
  }

}
