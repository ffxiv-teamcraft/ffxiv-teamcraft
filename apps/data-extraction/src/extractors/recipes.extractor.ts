import { combineLatest } from 'rxjs';
import { AbstractExtractor } from '../abstract-extractor';

export class RecipesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const hqFlags = this.requireLazyFile('hq-flags');
    // We're maintaining two formats, that's bad but migrating all the usages of the current recipe model isn't possible, sadly.
    const recipes = [];
    const rlookup = {
      searchIndex: {},
      recipes: {}
    };
    const recipesPerItem = {};
    combineLatest([
      this.getAllEntries('https://xivapi.com/CompanyCraftSequence'),
      this.aggregateAllPages('https://xivapi.com/Recipe?columns=ID,ClassJob.ID,MaterialQualityFactor,RequiredQualityPercent,DurabilityFactor,QualityFactor,DifficultyFactor,RequiredControl,RequiredCraftsmanship,CanQuickSynth,RecipeLevelTable,AmountResult,ItemResultTargetID,ItemIngredient0,ItemIngredient1,ItemIngredient2,ItemIngredient3,ItemIngredient4,ItemIngredient5,ItemIngredient6,ItemIngredient7,ItemIngredient8,ItemIngredient9,AmountIngredient0,AmountIngredient1,AmountIngredient2,AmountIngredient3,AmountIngredient4,AmountIngredient5,AmountIngredient6,AmountIngredient7,AmountIngredient8,AmountIngredient9,IsExpert,SecretRecipeBook')
    ]).subscribe(([companyCrafts, xivapiRecipes]) => {
      xivapiRecipes.forEach(recipe => {
        if (recipe.RecipeLevelTable === null) {
          return;
        }
        const maxQuality = Math.floor(recipe.RecipeLevelTable.Quality * recipe.QualityFactor / 100);
        const ingredients = Object.keys(recipe)
          .filter(k => /ItemIngredient\d/.test(k))
          .sort((a, b) => a < b ? -1 : 1)
          .filter(key => recipe[key] && recipe[key].ID > 0)
          .map((key) => {
            const index = +/ItemIngredient(\d)/.exec(key)[1];
            return {
              id: recipe[key].ID,
              amount: +recipe[`AmountIngredient${index}`],
              ilvl: +recipe[key].LevelItem
            };
          });
        const totalContrib = maxQuality * recipe.MaterialQualityFactor / 100;
        const totalIlvl = ingredients.filter(i => i.id > 19 && hqFlags[i.id] === 1).reduce((acc, cur) => acc + cur.ilvl * cur.amount, 0);
        const lazyRecipeRow = {
          id: recipe.ID,
          job: recipe.ClassJob.ID,
          lvl: recipe.RecipeLevelTable.ClassJobLevel,
          yields: recipe.AmountResult,
          result: recipe.ItemResultTargetID,
          stars: recipe.RecipeLevelTable.Stars,
          qs: recipe.CanQuickSynth === 1,
          hq: recipe.CanHq === 1,
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
          rlvl: recipe.RecipeLevelTable.ID,
          masterbook: recipe.SecretRecipeBook?.ItemTargetID,
          requiredQualityPercent: recipe.RequiredQualityPercent,
          ingredients: ingredients
            .map(ingredient => {
              return {
                id: ingredient.id,
                amount: ingredient.amount,
                quality: ingredient.ilvl / totalIlvl * totalContrib * hqFlags[ingredient.id]
              };
            }),
          expert: recipe.IsExpert === 1,
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
          id: `fc${companyCraftSequence.ID}`,
          job: 0,
          lvl: 1,
          yields: 1,
          result: companyCraftSequence.ResultItemTargetID,
          stars: 0,
          qs: false,
          hq: false,
          ingredients: []
        };
        if (companyCraftSequence.CompanyCraftDraftTargetID > 0) {
          recipe.masterbook = {
            id: `draft${companyCraftSequence.CompanyCraftDraftTargetID}`,
            name: {
              en: companyCraftSequence.CompanyCraftDraft?.Name_en || '???',
              ja: companyCraftSequence.CompanyCraftDraft?.Name_ja || '???',
              de: companyCraftSequence.CompanyCraftDraft?.Name_de || '???',
              fr: companyCraftSequence.CompanyCraftDraft?.Name_fr || '???'
            }
          };
        }
        for (let partIndex = 0; partIndex < 8; partIndex++) {
          if (!companyCraftSequence[`CompanyCraftPart${partIndex}TargetID`]) {
            continue;
          }
          for (let processIndex = 0; processIndex < 3; processIndex++) {
            if (companyCraftSequence[`CompanyCraftPart${partIndex}`][`CompanyCraftProcess${processIndex}TargetID`] === 0) {
              continue;
            }
            for (let i = 0; i < 12; i++) {
              if (companyCraftSequence[`CompanyCraftPart${partIndex}`][`CompanyCraftProcess${processIndex}TargetID`] === 0
                || companyCraftSequence[`CompanyCraftPart${partIndex}`][`CompanyCraftProcess${processIndex}`][`SupplyItem${i}TargetID`] === 0) {
                continue;
              }
              recipe.ingredients.push({
                id: companyCraftSequence[`CompanyCraftPart${partIndex}`][`CompanyCraftProcess${processIndex}`][`SupplyItem${i}`].Item,
                amount: companyCraftSequence[`CompanyCraftPart${partIndex}`][`CompanyCraftProcess${processIndex}`][`SetQuantity${i}`] * companyCraftSequence[`CompanyCraftPart${partIndex}`][`CompanyCraftProcess${processIndex}`][`SetsRequired${i}`],
                quality: 0,
                phase: processIndex + 1
              });
            }
          }
        }
        recipes.push(recipe);
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
