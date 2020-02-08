import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { DataModel } from '../../../core/database/storage/data-model';

@Component({
  selector: 'app-folder-page',
  templateUrl: './folder-page.component.html',
  styleUrls: ['./folder-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FolderPageComponent<T extends DataModel> {

  @Input()
  userId: string;

  @Input()
  display: FolderDisplay<T>;

  @Input()
  elementTemplate: TemplateRef<any>;

  constructor() {
  }

  trackByKey(index: number, data: DataModel): string {
    return data.$key;
  }

}
