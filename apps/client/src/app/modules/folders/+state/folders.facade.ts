import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { FoldersPartialState } from './folders.reducer';
import { foldersQuery } from './folders.selectors';
import { CreateFolder, DeleteFolder, LoadFolder, LoadFolders, PureUpdateFolder, SelectFolder, UpdateFolder, UpdateFolderIndexes } from './folders.actions';
import { FolderContentType } from '../../../model/folder/folder-content-type';
import { combineLatest, Observable } from 'rxjs';
import { Folder } from '../../../model/folder/folder';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { DataModel } from '../../../core/database/storage/data-model';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { Favorites } from '../../../model/other/favorites';

export interface PreprocessedDisplay<T> {
  display: FolderDisplay<T>,
  missingEntities: string[],
  missingFolders: string[],
  pickedEntities: string[]
}

export interface TreeFolderDisplay<T> {
  folders: FolderDisplay<T>[],
  root: T[]
}

@Injectable()
export class FoldersFacade {
  allFolders$ = this.store.pipe(select(foldersQuery.getAllFolders));

  foldersPerTypeCache: { [index: number]: Observable<Folder<any>[]> } = {};

  userFoldersPerTypeCache: { [index: number]: Observable<Folder<any>[]> } = {};

  selectedFoldersCache: { [index: number]: Observable<FolderDisplay<any>> } = {};

  favoriteFoldersCache: { [index: number]: Observable<Folder<any>[]> } = {};

  constructor(private store: Store<FoldersPartialState>, private dialog: NzModalService,
              private translate: TranslateService, private authFacade: AuthFacade) {
  }

  getDisplay<T extends DataModel>(source: Observable<Folder<T>[]>, loadedContent$: Observable<T[]>, loadMissing: (key: string) => void, rootEntityPredicate: (entity: T) => boolean): Observable<TreeFolderDisplay<T>> {
    return combineLatest([source, loadedContent$]).pipe(
      map(([folders, entities]) => {
        let root = entities.filter(rootEntityPredicate).map(e => e.$key);
        const displays = folders
          .filter(folder => folder.isRoot)
          .map((folder: Folder<T>) => {
            const syncDisplay = this.getSyncFolderDisplay<T>(folders, entities, folder);
            syncDisplay.missingEntities.forEach(loadMissing);
            syncDisplay.missingFolders.forEach($key => this.load($key));
            root = root.filter(key => syncDisplay.pickedEntities.indexOf(key) === -1);
            return syncDisplay.display;
          });
        return {
          folders: displays.sort((a, b) => a.folder.index - b.folder.index),
          root: root
            .map(key => entities.find(e => e.$key === key))
            .sort((a: any, b: any) => {
              if (a.index === b.index) {
                return a.$key > b.$key ? 1 : -1;
              }
              return a.index - b.index;
            })
        };
      })
    );
  }

  getSelectedFolderDisplay<T extends DataModel>(type: FolderContentType, loadedContent$: Observable<T[]>, loadMissing: (key: string) => void): Observable<FolderDisplay<T>> {
    if (this.selectedFoldersCache[type] === undefined) {
      const selectedFolder$ = this.store.pipe(
        select(foldersQuery.getSelectedFolders),
        map(selectedFolders => {
          return selectedFolders[type];
        }),
        filter(folder => folder !== undefined)
      );
      this.selectedFoldersCache[type] = combineLatest([selectedFolder$, this.getFolders<T>(type), loadedContent$]).pipe(
        map(([folder, folders, entities]) => {
          const syncDisplay = this.getSyncFolderDisplay(folders, entities, folder);
          syncDisplay.missingEntities.forEach(loadMissing);
          syncDisplay.missingFolders.forEach($key => this.load($key));
          return syncDisplay;
        }),
        filter((display) => display.missingEntities.length === 0),
        map(display => display.display)
      );
    }
    return this.selectedFoldersCache[type];
  }

  getFolders<T extends DataModel>(type: FolderContentType): Observable<Folder<T>[]> {
    if (this.foldersPerTypeCache[type] === undefined) {
      this.foldersPerTypeCache[type] = this.allFolders$.pipe(
        map(folders => {
          return folders.filter(f => f.contentType === type);
        }),
        distinctUntilChanged()
      );
    }
    return this.foldersPerTypeCache[type];
  }

  getUserFolders<T extends DataModel>(type: FolderContentType): Observable<Folder<T>[]> {
    if (this.userFoldersPerTypeCache[type] === undefined) {
      this.userFoldersPerTypeCache[type] = combineLatest([this.allFolders$, this.authFacade.userId$]).pipe(
        map(([folders, userId]) => {
          return folders.filter(f => f.contentType === type && f.authorId === userId);
        }),
        distinctUntilChanged()
      );
    }
    return this.userFoldersPerTypeCache[type];
  }

  getFavorites<T extends DataModel>(type: FolderContentType, favoriteKey: keyof Favorites): Observable<Folder<T>[]> {
    if (this.favoriteFoldersCache[type] === undefined) {
      const favoriteKeys$ = this.authFacade.favorites$.pipe(
        map(favorites => {
          return favorites[favoriteKey];
        })
      );
      this.favoriteFoldersCache[type] = combineLatest([this.allFolders$, favoriteKeys$]).pipe(
        map(([folders, favorites]) => {
          return folders.filter(f => f.contentType === type && (favorites || []).indexOf(f.$key) > -1);
        }),
        distinctUntilChanged()
      );
    }
    return this.favoriteFoldersCache[type];
  }

  loadFolders(type: FolderContentType) {
    this.store.dispatch(new LoadFolders(type));
  }

  createFolder(type: FolderContentType): void {
    this.store.dispatch(new CreateFolder(type));
  }

  updateFolder(folder: Folder<any>): void {
    this.store.dispatch(new UpdateFolder(folder.$key, folder));
  }

  renameFolder(folder: Folder<any>): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('FOLDERS.Rename_folder')
    }).afterClose.pipe(
      filter(name => name)
    ).subscribe(name => {
      this.store.dispatch(new PureUpdateFolder(folder.$key, { name: name }));
    });
  }

  deleteFolder(folder: Folder<any>): void {
    this.store.dispatch(new DeleteFolder(folder.$key));
  }

  saveIndexes(folders: Folder<any>[]): void {
    this.store.dispatch(new UpdateFolderIndexes(folders));
  }

  select(type: FolderContentType, key: string): void {
    this.store.dispatch(new SelectFolder(type, key));
  }

  load($key: string) {
    this.store.dispatch(new LoadFolder($key));
  }

  private getSyncFolderDisplay<T extends DataModel>(folders: Folder<T>[], entities: T[], folder: Folder<T>): PreprocessedDisplay<T> {
    const display = new FolderDisplay<T>(folder);
    const missingEntities: string[] = [];
    const missingFolders: string[] = [];
    const entitiesPicked: string[] = [];
    folder.content.forEach($key => {
      const matchingEntity = entities.find(e => e.$key === $key);
      if (matchingEntity) {
        entitiesPicked.push($key);
        if (!matchingEntity.notFound) {
          display.content.push(matchingEntity);
        }
      } else {
        missingEntities.push($key);
      }
    });
    folder.subFolders.forEach($key => {
      const matchingFolder = folders.find(f => f.$key === $key);
      if (!matchingFolder) {
        missingFolders.push($key);
        return;
      }
      const folderDisplay = this.getSyncFolderDisplay(folders, entities, matchingFolder);
      display.subFolders.push(folderDisplay.display);
      missingEntities.push(...folderDisplay.missingEntities);
      entitiesPicked.push(...folderDisplay.pickedEntities);
    });
    return {
      display: display,
      missingEntities: missingEntities,
      missingFolders: missingFolders,
      pickedEntities: entitiesPicked
    };
  }
}
