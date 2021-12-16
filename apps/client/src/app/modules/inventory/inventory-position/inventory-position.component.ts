import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ItemSearchResult } from '../../../model/user/inventory/item-search-result';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { ReplaySubject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-inventory-position',
  templateUrl: './inventory-position.component.html',
  styleUrls: ['./inventory-position.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryPositionComponent {

  private item$ = new ReplaySubject<ItemSearchResult>();

  public display$ = this.item$.pipe(
    filter(item => !!item),
    switchMap(item => {
      return this.inventoryFacade.getPosition(item).pipe(
        map(position => {
          return { position, item };
        })
      );
    }),
    map(({ position, item }) => {
      const container = this.getEmptyInventory(item);
      if (position === -1) {
        return [];
      }
      const tabSize = container.size[1] * container.size[2];
      const tabIndex = Math.floor(position / tabSize);
      const remaining = position % tabSize;
      const rowIndex = Math.floor(remaining / container.size[2]);
      const columnIndex = remaining % container.size[2];
      container.array[tabIndex][rowIndex][columnIndex] = true;
      return container.array;
    })
  );

  constructor(private inventoryFacade: InventoryService) {
  }

  @Input()
  set item(item: ItemSearchResult) {
    this.item$.next(item);
  }

  private getEmptyInventory(item: ItemSearchResult): { size: [number, number, number], array: boolean[][][] } {
    switch (item.containerId) {
      case ContainerType.Bag0:
      case ContainerType.Bag1:
      case ContainerType.Bag2:
      case ContainerType.Bag3:
        return this.generateArrays(4, 7, 5);
      case ContainerType.ArmoryMain:
      case ContainerType.ArmoryHead:
      case ContainerType.ArmoryBody:
      case ContainerType.ArmoryHand:
      case ContainerType.ArmoryWaist:
      case ContainerType.ArmoryLegs:
      case ContainerType.ArmoryFeet:
      case ContainerType.ArmoryOff:
      case ContainerType.ArmoryEar:
      case ContainerType.ArmoryNeck:
      case ContainerType.ArmoryWrist:
      case ContainerType.ArmoryRing:
      case ContainerType.ArmorySoulCrystal:
        return this.generateArrays(1, 7, 5);
      case ContainerType.SaddleBag0:
      case ContainerType.SaddleBag1:
      case ContainerType.PremiumSaddleBag0:
      case ContainerType.PremiumSaddleBag1:
        return this.generateArrays(2, 7, 5);
      case ContainerType.RetainerBag0:
      case ContainerType.RetainerBag1:
      case ContainerType.RetainerBag4:
      case ContainerType.RetainerBag5:
      case ContainerType.RetainerBag6:
        return this.generateArrays(5, 7, 5);
      default:
        return {
          size: [0, 0, 0],
          array: []
        };
    }
  }

  private generateArrays(tabs: number, rows: number, columns: number): { size: [number, number, number], array: boolean[][][] } {
    return {
      size: [tabs, rows, columns],
      array: new Array(tabs).fill(null).map(() => {
        return new Array(rows).fill(null).map(() => {
          return new Array(columns).fill(false);
        });
      })
    };
  }

}
