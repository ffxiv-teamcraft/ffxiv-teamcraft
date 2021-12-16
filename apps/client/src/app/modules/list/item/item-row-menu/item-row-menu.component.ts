import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ItemRowButtonsComponent } from '../item-row-buttons/item-row-buttons.component';
import { ItemRowMenuElement } from '../../../../model/display/item-row-menu-element';
import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-item-row-menu',
  templateUrl: './item-row-menu.component.html',
  styleUrls: ['./item-row-menu.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
