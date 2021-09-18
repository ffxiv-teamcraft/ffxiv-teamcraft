import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of, Subject, Subscription } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { CustomItem } from '../../../modules/custom-items/model/custom-item';
import { CustomItemsFacade } from '../../../modules/custom-items/+state/custom-items.facade';
import { catchError, delay, expand, filter, first, map, mergeMap, skip, skipUntil, switchMap, tap } from 'rxjs/operators';
import * as Papa from 'papaparse';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { CustomItemFolder } from '../../../modules/custom-items/model/custom-item-folder';
import { DataService } from '../../../core/api/data.service';
import { Ingredient } from '../../../model/garland-tools/ingredient';
import { DataType } from '../../../modules/list/data/data-type';
import { getItemSource } from '../../../modules/list/model/list-row';
import { EnvironmentService } from '../../../core/environment.service';

@Component({
  selector: 'app-custom-items-import-popup',
  templateUrl: './custom-items-import-popup.component.html',
  styleUrls: ['./custom-items-import-popup.component.less']
})
export class CustomItemsImportPopupComponent {

  public format = 'TC';

  public folder: CustomItemFolder;

  public hideUpload = false;

  public error: string;

  public errorDetails: string;

  public folders$: Observable<CustomItemFolder[]> = this.customItemsFacade.allCustomItemFolders$;

  public availableCraftJobs: any[] = [];

  public state: 'PARSING' | 'SAVING' = 'PARSING';

  public totalSaving = 1;

  public savingDone = 0;

  private craftTypes: string[] = [
    'Woodworking',
    'Smithing',
    'Armorcraft',
    'Goldsmithing',
    'Leatherworking',
    'Clothcraft',
    'Cooking',
    'Alchemy'
  ];

  public handleFile = (event: any) => {
    delete this.error;
    delete this.errorDetails;
    const reader = new FileReader();
    let data = '';
    reader.onload = ((_) => {
      return (e) => {
        data += e.target.result;
      };
    })(event.file);
    reader.onloadend = () => {
      this.processFile(data);
    };
    // Read in the image file as a data URL.
    reader.readAsText(event.file);
    this.hideUpload = true;
    return new Subscription();
  };

  constructor(private modalRef: NzModalRef, private serializer: NgSerializerService, private customItemsFacade: CustomItemsFacade,
              private i18n: I18nToolsService, private lazyData: LazyDataService, private db: DataService,
              private env: EnvironmentService) {
  }

  public getAccept(): string {
    switch (this.format) {
      case 'TC':
        return '.tcitem';
      case 'CSV-EM':
        return '.csv';
      default:
        return '';
    }
  }

  private processFile(content: string): void {
    try {
      let operation$: Observable<any>;
      switch (this.format) {
        case 'TC':
          operation$ = this.processTCImport(content);
          break;
        case 'CSV-EM':
          operation$ = this.processCSVEMImport(content);
          break;
      }
      operation$.pipe(first()).subscribe(() => {
        this.modalRef.close();
      });
    } catch (err) {
      this.error = 'CUSTOM_ITEMS.IMPORT.Corrupted_file';
      this.errorDetails = err.message;
      this.hideUpload = false;
    }
  }

  private processTCImport(content: string): Observable<any> {
    const json = decodeURIComponent(escape(atob(content)));
    const data: any[] = JSON.parse(json);
    const items: CustomItem[] = this.serializer
      .deserialize<CustomItem>(data, [CustomItem])
      .map(item => {
        item.afterDeserialized();
        return item;
      });
    const sortedItems = this.topologicalSort(items);
    let index = -1;
    this.totalSaving = sortedItems.length;
    return this.customItemsFacade.allCustomItems$.pipe(
      first(),
      expand((allItems) => {
        if (sortedItems[index] === undefined) {
          return EMPTY;
        }
        const itemData = sortedItems[index];
        const item = new CustomItem();
        Object.assign(item, itemData);
        delete item.authorId;
        delete item.folderId;
        item.$key = this.customItemsFacade.createId();
        // If it has requirements, map them to the new items.
        if (item.requires !== undefined) {
          item.requires = item.requires.map(req => {
            if (!req.custom) {
              return req;
            }
            const previousReq = items.find(i => i.$key === req.id);
            const newReq = allItems.find(i => {
              return i.name === previousReq.name && i.$key !== undefined && i.createdAt.toMillis() === previousReq.createdAt.toMillis();
            });
            req.id = newReq ? newReq.$key : 'missing item';
            return req;
          });
        }
        this.customItemsFacade.addCustomItem(item);
        if (this.folder !== undefined) {
          this.folder.items.push(item.$key);
          this.customItemsFacade.updateCustomItemFolder(this.folder);
        }
        return this.customItemsFacade.allCustomItems$.pipe(
          filter(availableItems => {
            return availableItems.some(i => i.name === item.name && i.$key !== undefined && i.createdAt.toMillis() === item.createdAt.toMillis());
          }),
          first()
        );
      }),
      tap(() => {
        this.savingDone++;
        index++;
      }),
      skip(sortedItems.length - 1)
    );
  }

  private topologicalSort(data: CustomItem[]): CustomItem[] {
    const res: CustomItem[] = [];
    const doneList: boolean[] = [];
    while (data.length > res.length) {
      let resolved = false;

      for (const item of data) {
        if (res.indexOf(item) > -1) {
          // item already in resultset
          continue;
        }
        resolved = true;

        if (item.requires !== undefined) {
          for (const dep of item.requires) {
            // We have to check if it's not a precraft, as some dependencies aren't resolvable inside the current array.
            const depIsInArray = data.find(row => row.id === dep.id) !== undefined;
            if (!doneList[dep.id] && depIsInArray) {
              // there is a dependency that is not met:
              resolved = false;
              break;
            }
          }
        }
        if (resolved) {
          // All dependencies are met:
          doneList[item.id] = true;
          res.push(item);
        }
      }
    }
    return res;
  }

  private processCSVEMImport(content: string): Observable<any> {
    const allItems = this.lazyData.allItems;
    const parsed = Papa.parse(content);
    // First of all, let's parse all rows and create items from them, as we know they'll need to be created.
    const parsedToItems = parsed.data
      .filter(row => row.length > 1)
      .map(row => {
        const item = new CustomItem();
        item.$key = this.customItemsFacade.createId();
        item.name = row[4];
        item.yield = +row[5];
        item.realItemId = +row[45];
        item.sources.push({
          type: DataType.CRAFTED_BY,
          data: [{
            recipeId: row[1],
            jobId: +this.craftTypes.indexOf(row[2]) + 8,
            icon: `https://garlandtools.org/db/images/${this.availableCraftJobs.find(j => j.id === getItemSource(item, DataType.CRAFTED_BY)[0].job).abbreviation}.png`,
            itemId: +row[45],
            level: this.env.maxLevel,
            stars_tooltip: ''
          }]
        });
        return { item: item, meta: row };
      });
    // Then, for each parsed row, let's populate an ingredient array, for the same purpose (will contain only the ones that aren't listed as recipe already)
    const ingredients: CustomItem[] = [];
    parsedToItems.forEach(entry => {
      for (let ingredientIndex = 6; ingredientIndex < 25; ingredientIndex += 2) {
        if (entry.meta[ingredientIndex] === '') {
          continue;
        }
        const ingredient = new CustomItem();
        ingredient.name = entry.meta[ingredientIndex];
        const matches = Object.keys(allItems).filter(key => {
          return this.i18n.getName(allItems[key]).toLowerCase() === ingredient.name.toLowerCase();
        });
        if (!ingredients.some(i => i.name === ingredient.name)) {
          ingredients.push(ingredient);
        }
        if (matches) {
          ingredient.realItemId = +matches;
        }
      }
    });
    // Once ingredients are ready, let's see what needs to be custom or what is already an item
    return combineLatest(
      ingredients.map(ingredient => {
        const meta = parsed.data.find(row => row[4] === ingredient.name);
        // If it has no real item id found, it's a custom one.
        if (ingredient.realItemId === undefined || ingredient.realItemId === 0) {
          return of({ item: ingredient, meta: meta, isCustom: true });
        }
        // Else try to get it on GT
        return this.db.getItem(ingredient.realItemId).pipe(
          map(() => {
            return { item: ingredient, meta: meta, isCustom: false };
          }),
          // Error = 404 = custom item
          catchError(() => {
            return of({ item: ingredient, meta: meta, isCustom: true });
          })
        );
      })
    ).pipe(
      map(ingredientEntries => {
        const allCustomItems = [];
        parsedToItems.concat(ingredientEntries.filter((entry) => entry.isCustom)).forEach(entry => {
          if (entry.isCustom) {
            entry.item.$key = this.customItemsFacade.createId();
          }
          if (!allCustomItems.some(i => i.item.name === entry.item.name)) {
            allCustomItems.push(entry);
          }
        });
        return this.topologicalSort(allCustomItems.map(({ item, meta }) => {
          for (let ingredientIndex = 6; ingredientIndex < 25; ingredientIndex += 2) {
            if (meta === undefined || meta[ingredientIndex] === '') {
              continue;
            }
            const ingredientName = meta[ingredientIndex];
            item.requires = item.requires || [];
            const ingredientEntry = allCustomItems.find(i => i.item.name === ingredientName);
            const realIngredientId = Object.keys(allItems).filter(key => {
              return this.i18n.getName(allItems[key]).toLowerCase() === ingredientName.toLowerCase();
            });
            const ingredientId = ingredientEntry ? ingredientEntry.item.$key || ingredientEntry.item.realItemId : realIngredientId;
            const req: Ingredient = {
              id: ingredientId,
              amount: meta[ingredientIndex + 1]
            };
            if (ingredientEntry) {
              req.custom = true;
            }
            item.requires.push(req);
          }
          return item;
        }));
      }),
      tap(sortedItems => {
        this.totalSaving = sortedItems.length;
        sortedItems.forEach(item => {
          if (this.folder !== undefined && this.folder !== null) {
            this.folder.items.push(item.$key);
          }
        });
      }),
      switchMap((sortedItems) => {
        this.state = 'SAVING';
        const doing$ = new BehaviorSubject(0);
        const complete$ = new Subject();
        return doing$.pipe(
          delay(250),
          mergeMap(index => {
            const item = sortedItems[index];
            this.customItemsFacade.addCustomItem(item);
            return this.customItemsFacade.allCustomItems$.pipe(
              first(),
              tap(() => {
                this.savingDone++;
                if (sortedItems[index + 1] !== undefined) {
                  doing$.next(index + 1);
                } else {
                  complete$.next();
                }
              })
            );
          }),
          skipUntil(complete$)
        );
      }),
      tap(() => {
        if (this.folder !== undefined) {
          this.customItemsFacade.updateCustomItemFolder(this.folder);
        }
      })
    );
  }

}
