import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { DataModel } from '../../../core/database/storage/data-model';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { FoldersFacade } from '../+state/folders.facade';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FolderComponent<T extends DataModel> {

  @Input()
  display: FolderDisplay<T>;

  @Input()
  elementTemplate: TemplateRef<any>;

  constructor(private foldersFacade: FoldersFacade) {
  }

  rename(): void {
    this.foldersFacade.renameFolder(this.display.folder);
  }
}
