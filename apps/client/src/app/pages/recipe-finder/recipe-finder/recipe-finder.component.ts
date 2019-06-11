import { Component, OnDestroy } from '@angular/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { I18nName } from '../../../model/common/i18n-name';
import { debounceTime, map } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import * as _ from 'lodash';
import { LazyRecipe } from '../../../core/data/lazy-recipe';

@Component({
  selector: 'app-recipe-finder',
  templateUrl: './recipe-finder.component.html',
  styleUrls: ['./recipe-finder.component.less']
})
export class RecipeFinderComponent implements OnDestroy {

  public query: string;

  public input$: Subject<string> = new Subject<string>();

  public completion$: Observable<{ id: number, name: I18nName }[]> = this.input$.pipe(
    debounceTime(500),
    map(value => {
      if (value.length < 2) {
        return [];
      } else {
        return this.items.filter(i => this.i18n.getName(i.name).toLowerCase().indexOf(value.toLowerCase()) > -1);
      }
    })
  );

  private items: { id: number, name: I18nName }[] = [];

  public pool: { id: number, amount: number }[] = [];

  public search$: Subject<void> = new Subject<void>();

  public results$: Observable<any[]>;

  public highlight$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);

  constructor(private lazyData: LazyDataService, private translate: TranslateService,
              private i18n: I18nToolsService, private dataService: DataService) {
    const allItems = this.lazyData.allItems;
    this.items = Object.keys(this.lazyData.items)
      .filter(key => +key > 19)
      .map(key => {
        return {
          id: +key,
          name: allItems[key]
        };
      });
    this.pool = JSON.parse(localStorage.getItem('recipe-finder:pool') || '[]');
    this.results$ = this.search$.pipe(
      map(() => {
        const possibleRecipes = [];
        for (const item of this.pool) {
          possibleRecipes.push(...this.lazyData.recipes.filter(r => {
            if (r.ingredients.some(i => i.id === item.id && i.amount <= item.amount)) {
              possibleRecipes.push({ ...r });
            }
          }));
        }
        const uniquified = _.uniqBy(possibleRecipes, 'id');
        // Now that we have all possible recipes, let's filter and rate them
        const finalRecipes = uniquified.map(recipe => {
          recipe.missing = recipe.ingredients.filter(i => {
            const poolItem = this.pool.find(item => item.id === i.id);
            return !poolItem || poolItem.amount < i.amount;
          });
          recipe.possibleAmount = recipe.yields;
          while (this.canCraft(recipe, recipe.possibleAmount)) {
            recipe.possibleAmount += recipe.yields;
          }
          return recipe;
        });
        return finalRecipes.sort((a, b) => {
          return a.missing.length - b.missing.length;
        });
      })
    );
  }

  public canCraft(recipe: LazyRecipe, amount: number): boolean {
    const allAvailableIngredients = recipe.ingredients.filter(i => this.pool.some(item => i.id === item.id));
    const neededIngredients = allAvailableIngredients.map(i => {
      return {
        ...i,
        amount: i.amount * amount / recipe.yields
      };
    });
    return !neededIngredients.some(i => {
      const poolItem = this.pool.find(item => item.id === i.id);
      return poolItem.amount < i.amount;
    });
  }

  public isButtonDisabled(name: string, amount: number): boolean {
    return amount <= 0 || !this.items.some(i => this.i18n.getName(i.name).toLowerCase() === name.toLowerCase());
  }

  onInput(value: string): void {
    this.input$.next(value);
  }

  addToPool(name: string, amount: number): void {
    const item = this.items.find(i => this.i18n.getName(i.name).toLowerCase() === name.toLowerCase());
    if (!item || this.pool.some(i => i.id === item.id)) {
      return;
    }
    this.pool.unshift({ id: item.id, amount: amount });
    this.savePool();
  }

  public highlight(recipe: LazyRecipe): void {
    if (recipe) {
      this.highlight$.next(recipe.ingredients.map(i => i.id));
    } else {
      this.highlight$.next([]);
    }
  }

  private savePool(): void {
    localStorage.setItem('recipe-finder:pool', JSON.stringify(this.pool));
  }

  ngOnDestroy(): void {
    this.savePool();
  }

}
