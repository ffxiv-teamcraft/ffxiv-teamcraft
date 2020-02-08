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
import { NzModalService } from 'ng-zorro-antd';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { TranslateService } from '@ngx-translate/core';

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

  selectedFoldersCache: { [index: number]: Observable<Folder<any>> } = {};

  constructor(private store: Store<FoldersPartialState>, private dialog: NzModalService,
              private translate: TranslateService) {
  }

  getDisplay<T extends DataModel>(type: FolderContentType, loadedContent$: Observable<T[]>, loadMissing: (key: string) => void): Observable<TreeFolderDisplay<T>> {
    return combineLatest([this.getFolders<T>(type), loadedContent$]).pipe(
      map(([folders, entities]) => {
        let root = entities.map(e => e.$key);
        const displays = folders
          .filter(folder => folder.isRoot)
          .map((folder: Folder<T>) => {
            const syncDisplay = this.getSyncFolderDisplay<T>(folders, entities, folder);
            syncDisplay.missingEntities.forEach(loadMissing);
            syncDisplay.missingFolders.forEach($key => this.getFolder($key));
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

  getSelectedFolder<T extends DataModel>(type: FolderContentType): Observable<Folder<T>> {
    if (this.selectedFoldersCache[type] === undefined) {
      this.selectedFoldersCache[type] = this.store.pipe(select(foldersQuery.getSelectedFolders(type)));
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

  pureUpdateFolder(folder: Folder<any>): void {
    this.store.dispatch(new PureUpdateFolder(folder.$key, folder));
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

  private getFolder($key: string) {
    this.store.dispatch(new LoadFolder($key));
  }
}
