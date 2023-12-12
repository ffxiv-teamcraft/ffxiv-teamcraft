import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ItemRowButtonsComponent } from '../item-row-buttons/item-row-buttons.component';
import { ItemRowMenuElement } from '../../../../model/display/item-row-menu-element';
import { NzDropdownMenuComponent, NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { Subject } from 'rxjs';
import { CharacterNamePipe } from '../../../../pipes/pipes/character-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { ItemNameClipboardDirective } from '../../../../core/item-name-clipboard.directive';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
    selector: 'app-item-row-menu',
    templateUrl: './item-row-menu.component.html',
    styleUrls: ['./item-row-menu.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzDropDownModule, NzMenuModule, NgIf, NzButtonModule, ItemNameClipboardDirective, NzBadgeModule, NgFor, AsyncPipe, TranslateModule, CharacterNamePipe]
})
export class ItemRowMenuComponent {

  buttonsComponentRef: ItemRowButtonsComponent;

  menu$ = new Subject<NzDropdownMenuComponent>();

  @ViewChild('menu', { read: NzDropdownMenuComponent })
  set menu(menu: NzDropdownMenuComponent) {
    this.menu$.next(menu);
    this.menu$.complete();
  }

  public isButton(element: ItemRowMenuElement): boolean {
    return this.buttonsComponentRef.buttonsCache[element];
  }

}
