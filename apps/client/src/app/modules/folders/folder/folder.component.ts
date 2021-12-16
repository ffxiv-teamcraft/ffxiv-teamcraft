import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { DataModel } from '../../../core/database/storage/data-model';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { FoldersFacade } from '../+state/folders.facade';
import { CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { first } from 'rxjs/operators';
import { Folder } from '../../../model/folder/folder';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { SettingsService } from '../../settings/settings.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FolderComponent<T extends DataModel> implements OnInit {

  @Input()
  display: FolderDisplay<T>;

  @Input()
  elementTemplate: TemplateRef<any>;

  @Input()
  dndConnections: string[];

  @Input()
  id: string;

  @Input()
  userId: string;

  @Input()
  folderPath: string;

  @Input()
  disableDnd = false;

  @Output()
  connectDnD = new EventEmitter<string>();

  @Input()
  canDropElement: (drag: CdkDrag) => boolean;

  expanded = false;

  constructor(private foldersFacade: FoldersFacade, private translate: TranslateService,
              private message: NzMessageService, private linkTools: LinkToolsService,
              private settings: SettingsService) {
  }

  getLink = () => {
    return this.linkTools.getLink(`/${this.folderPath}/${this.display.folder.$key}`);
  };

  rename(): void {
    this.foldersFacade.renameFolder(this.display.folder);
  }

  exited(event: any): void {
    const item: CdkDrag<T> = event.item;
    item.dropped.pipe(first()).subscribe(dropped => {
      if (dropped.container.id !== dropped.previousContainer.id
        && dropped.container.id !== this.id) {
        if (item.data instanceof Folder) {
          this.display.folder.subFolders = this.display.folder.subFolders.filter(key => !key.endsWith(item.data.$key));
        } else {
          this.display.folder.content = this.display.folder.content.filter(key => !key.endsWith(item.data.$key));
        }
        this.save();
      }
    });
  }

  entered(event: any): void {
    const item: CdkDrag<T> = event.item;
    item.dropped.pipe(first()).subscribe(dropped => {
      if (dropped.container.id !== dropped.previousContainer.id
        && dropped.container.id === this.id) {
        if (item.data instanceof Folder) {
          this.display.folder.subFolders.splice(dropped.currentIndex, 0, item.data.$key);
        } else {
          this.display.folder.content.splice(dropped.currentIndex, 0, item.data.$key);
        }
        this.save();
      }
    });
  }

  getDropListData(displays: FolderDisplay<T>[]) {
    return displays.map(d => d.folder);
  }

  drop(event: any): void {
    moveItemInArray(this.display.folder.content, event.previousIndex, event.currentIndex);
    this.save();
  }

  dropFolder(event: any): void {
    moveItemInArray(this.display.folder.subFolders, event.previousIndex, event.currentIndex);
    this.save();
  }

  canDropFolder(drag: CdkDrag): boolean {
    return drag.data instanceof Folder;
  }

  public deleteFolder(folder: Folder<T>): void {
    this.foldersFacade.deleteFolder(folder);
  }

  trackByKey(index: number, data: DataModel): string {
    return data.$key;
  }

  expandedChange(expanded: boolean): void {
    this.expanded = expanded;
    if (expanded) {
      this.settings.foldersOpened = {
        ...this.settings.foldersOpened,
        [this.id]: 1
      };
    } else {
      const foldersOpened = this.settings.foldersOpened;
      delete foldersOpened[this.id];
      this.settings.foldersOpened = foldersOpened;
    }
  }

  ngOnInit(): void {
    this.expanded = this.settings.foldersOpened[this.id] === 1;
    setTimeout(() => {
      this.connectDnD.emit(this.id);
      this.connectDnD.emit(`${this.id}-subfolders`);
    });
  }

  private save(): void {
    this.foldersFacade.updateFolder(this.display.folder);
  }
}
