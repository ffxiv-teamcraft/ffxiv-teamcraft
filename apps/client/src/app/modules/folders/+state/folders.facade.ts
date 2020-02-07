import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { FoldersPartialState } from './folders.reducer';
import { foldersQuery } from './folders.selectors';
import { CreateFolder, DeleteFolder, LoadFolders, PureUpdateFolder, SelectFolder, UpdateFolder } from './folders.actions';
import { FolderContentType } from '../../../model/folder/folder-content-type';
import { combineLatest, Observable } from 'rxjs';
import { Folder } from '../../../model/folder/folder';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { DataModel } from '../../../core/database/storage/data-model';
import { NzModalService } from 'ng-zorro-antd';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { TranslateService } from '@ngx-translate/core';

export interface PreprocessedDisplay<T> {
  display: FolderDisplay<T>,
  missing: string[],
  rootEntities: string[],
  entitiesPicked: string[]
}

@Injectable()
export class FoldersFacade {
  allFolders$ = this.store.pipe(select(foldersQuery.getAllFolders));

  foldersPerTypeCache: { [index: number]: Observable<Folder<any>[]> } = {};

  selectedFoldersCache: { [index: number]: Observable<Folder<any>> } = {};

  constructor(private store: Store<FoldersPartialState>, private dialog: NzModalService,
              private translate: TranslateService) {
  }

  getDisplay<T extends DataModel>(type: FolderContentType, loadedContent$: Observable<T[]>, loadMissing: (key: string) => void): Observable<FolderDisplay<T>[]> {
    return this.getFolders<T>(type).pipe(
      switchMap(folders => {
        return combineLatest(folders
          .filter(folder => folder.isRoot)
          .map((folder: Folder<T>) => {
            return loadedContent$.pipe(
              map(entities => {
                const syncDisplay = this.getSyncFolderDisplay<T>(folders, entities, folder);
                syncDisplay.missing.forEach(loadMissing);
                return syncDisplay.display;
              })
            );
          }));
      })
    );
  }

  private getSyncFolderDisplay<T extends DataModel>(folders: Folder<T>[], entities: T[], folder: Folder<T>): PreprocessedDisplay<T> {
    const display = new FolderDisplay<T>(folder);
    const missing: string[] = [];
    const entitiesPicked: string[] = [];
    folder.content.forEach(path => {
      const $key = path.split('/').pop();
      if (path.startsWith('folders/')) {
        const matchingFolder = folders.find(f => f.$key === $key);
        if (!matchingFolder) {
          return;
        }
        const folderDisplay = this.getSyncFolderDisplay(folders, entities, matchingFolder);
        display.content.push(folderDisplay.display);
        missing.push(...folderDisplay.missing);
        entitiesPicked.push(...folderDisplay.entitiesPicked);
      } else {
        const matchingEntity = entities.find(e => e.$key === $key);
        if (matchingEntity) {
          entitiesPicked.push($key);
          display.content.push(matchingEntity);
        } else {
          missing.push($key);
        }
      }
    });
    return {
      display: display,
      missing: missing,
      rootEntities: entities.map(e => e.$key).filter(key => entitiesPicked.indexOf(key) === -1),
      entitiesPicked: entitiesPicked
    };
  }

  getSelectedFolder<T>(type: FolderContentType): Observable<Folder<T>> {
    if (this.selectedFoldersCache[type] === undefined) {
      this.selectedFoldersCache[type] = this.store.pipe(select(foldersQuery.getSelectedFolders(type)));
    }
    return this.selectedFoldersCache[type];
  }

  getFolders<T>(type: FolderContentType): Observable<Folder<T>[]> {
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

  select(type: FolderContentType, key: string): void {
    this.store.dispatch(new SelectFolder(type, key));
  }
}
