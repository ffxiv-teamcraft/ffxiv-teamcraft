import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { combineLatest, EMPTY, Observable, of, Subscription } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { CustomItem } from '../../../modules/custom-items/model/custom-item';
import { CustomItemsFacade } from '../../../modules/custom-items/+state/custom-items.facade';
import { catchError, expand, filter, first, map, tap } from 'rxjs/operators';
import * as Papa from 'papaparse';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { CustomItemFolder } from '../../../modules/custom-items/model/custom-item-folder';
import { DataService } from '../../../core/api/data.service';

@Component({
  selector: 'app-custom-items-import-popup',
  templateUrl: './custom-items-import-popup.component.html',
  styleUrls: ['./custom-items-import-popup.component.less']
})
export class CustomItemsImportPopupComponent {

  public format = 'TC';

  public folder = '';

  public hideUpload = false;

  public error: string;

  public errorDetails: string;

  public folders$: Observable<CustomItemFolder[]> = this.customItemsFacade.allCustomItemFolders$;

  public availableCraftJobs: any[] = [];

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
              private i18n: I18nToolsService, private lazyData: LazyDataService, private db: DataService) {
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
      operation$.subscribe(() => {
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
    const items: CustomItem[] = this.serializer.deserialize<CustomItem>(data, [CustomItem]);
    const sortedItems = this.topologicalSort(items);
    let index = -1;
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
        delete item.$key;
        if (this.folder !== '') {
          item.folderId = this.folder;
        }
        // If it has requirements, map them to the new items.
        if (item.requires !== undefined) {
          item.requires = item.requires.map(req => {
            if (!req.custom) {
              return req;
            }
            const previousReq = items.find(i => i.$key === req.id);
            const newReq = allItems.find(i => {
              return i.name === previousReq.name && i.$key !== undefined && i.createdAt === previousReq.createdAt;
            });
            req.id = newReq ? newReq.$key : 'missing item';
            return req;
          });
        }
        this.customItemsFacade.addCustomItem(item);
        return this.customItemsFacade.allCustomItems$.pipe(
          filter(availableItems => {
            return availableItems.some(i => i.name === item.name && i.$key !== undefined && i.createdAt === item.createdAt);
          }),
          first()
        );
      }),
      tap(() => {
        index++;
      })
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
    const parsedToItems = parsed.data.map(row => {
      const item = new CustomItem();
      item.$key = this.customItemsFacade.createId();
      item.name = row[4];
      item.yield = +row[5];
      item.craftedBy = [{
        recipeId: row[2],
        jobId: this.craftTypes.indexOf(row[3]) + 8,
        icon: '',
        itemId: item.$key,
        level: 70,
        stars_tooltip: ''
      }];
      item.craftedBy[0].icon = `https://garlandtools.org/db/images/${this.availableCraftJobs.find(j => j.id === item.craftedBy[0].jobId).abbreviation}.png`;
      const matches = Object.keys(allItems).filter(key => {
        return this.i18n.getName(allItems[key]).toLowerCase() === item.name.toLowerCase();
      });
      if (this.folder !== '') {
        item.folderId = this.folder;
      }
      if (matches) {
        item.realItemId = +matches;
        item.craftedBy[0].itemId = +matches;
      }
      return { item: item, meta: row };
    });
    // Then, for each parsed row, let's populate an ingredient array, for the same purpose (will contain only the ones that aren't listed as recipe already)
    const ingredients: CustomItem[] = [];
    parsedToItems.forEach(entry => {
      for (let ingredientIndex = 6; ingredientIndex < 25; ingredientIndex += 2) {
        const ingredient = new CustomItem();
        ingredient.name = entry.meta[ingredientIndex];
        const matches = Object.keys(allItems).filter(key => {
          return this.i18n.getName(allItems[key]).toLowerCase() === ingredient.name.toLowerCase();
        });
        if (!ingredients.some(i => i.name === entry.item.name)) {
          ingredients.push(ingredient);
        }
        if (matches) {
          ingredient.realItemId = +matches;
        }
      }
    });
    // Once ingredients are ready, let's see what needs to be custom or what is already an item
    combineLatest(
      ingredients.map(ingredient => {
        // If it has no real item id found, it's a custom one.
        if (ingredient.realItemId === undefined) {
          return of({ ingredient: ingredient, isCustom: true });
        }
        // Else try to get it on GT
        return this.db.getItem(ingredient.realItemId).pipe(
          map(() => {
            return { ingredient: ingredient, isCustom: false };
          }),
          // Error = 404 = custom item
          catchError(() => {
            return of({ ingredient: ingredient, isCustom: true });
          })
        );
      })
    ).pipe(
      map(ingredientEntries => {
        // TODO
      })
    );
    return of(null);
  }

}
