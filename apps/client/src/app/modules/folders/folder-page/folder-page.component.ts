import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { DataModel } from '../../../core/database/storage/data-model';
import { Favorites } from '../../../model/other/favorites';
import { CharacterNamePipe } from '../../../pipes/pipes/character-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { FolderComponent } from '../folder/folder.component';
import { FullpageMessageComponent } from '../../fullpage-message/fullpage-message/fullpage-message.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { UserAvatarComponent } from '../../user-avatar/user-avatar/user-avatar.component';
import { FavoriteButtonComponent } from '../../favorites/favorite-button/favorite-button.component';
import { NgIf, NgFor, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  selector: 'app-folder-page',
  templateUrl: './folder-page.component.html',
  styleUrls: ['./folder-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FlexModule, NgIf, FavoriteButtonComponent, UserAvatarComponent, NzDividerModule, FullpageMessageComponent, NgFor, NgTemplateOutlet, FolderComponent, AsyncPipe, TranslateModule, CharacterNamePipe]
})
export class FolderPageComponent<T extends DataModel> {

  @Input()
  userId: string;

  @Input()
  display: FolderDisplay<T>;

  @Input()
  elementTemplate: TemplateRef<any>;

  @Input()
  favoriteType: keyof Favorites;


  trackByKey(index: number, data: DataModel): string {
    return data.$key;
  }

}
