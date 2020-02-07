import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { DataModel } from '../../../core/database/storage/data-model';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { FoldersFacade } from '../+state/folders.facade';
import { CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { first } from 'rxjs/operators';
import { Folder } from '../../../model/folder/folder';

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

  @Output()
  connectDnD = new EventEmitter<string>();

  constructor(private foldersFacade: FoldersFacade) {
  }

  rename(): void {
    this.foldersFacade.renameFolder(this.display.folder);
  }

  exited(event: any): void {
    const item: CdkDrag<T> = event.item;
    item.dropped.pipe(first()).subscribe(dropped => {
      if (dropped.container.id !== dropped.previousContainer.id
        && dropped.container.id !== this.id) {
        this.display.folder.content = this.display.folder.content.filter(key => !key.endsWith(item.data.$key));
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
          item.data.isRoot = false;
          this.display.folder.content.splice(dropped.currentIndex, 0, `folders/${item.data.$key}`);
        } else {
          this.display.folder.content.splice(dropped.currentIndex, 0, `${this.foldersFacade.getPrefix(this.display.folder.contentType)}${item.data.$key}`);
        }
        this.save();
      }
    });
  }

  drop(event: any): void {
    moveItemInArray(this.display.folder.content, event.previousIndex, event.currentIndex);
    this.save();
  }


  private save(): void {
    this.foldersFacade.updateFolder(this.display.folder);
  }

  trackByKey(index: number, data: DataModel): string {
    return data.$key;
  }

  ngOnInit(): void {
    this.connectDnD.emit(this.id);
  }
}
