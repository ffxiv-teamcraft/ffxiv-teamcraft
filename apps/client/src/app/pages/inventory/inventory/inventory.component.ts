import { Component } from '@angular/core';
import { UserInventoryService } from '../../../core/database/user-inventory.service';
import { Observable } from 'rxjs';
import { InventoryDisplay } from '../inventory-display';
import { map } from 'rxjs/operators';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.less']
})
export class InventoryComponent {

  public display$: Observable<InventoryDisplay[]> = this.inventoryService.getUserInventory().pipe(
    map(inventory => {
      return inventory
        .items
        .filter(item => {
          return [
            ContainerType.Bag0,
            ContainerType.Bag1,
            ContainerType.Bag2,
            ContainerType.Bag3,
            ContainerType.RetainerBag0,
            ContainerType.RetainerBag1,
            ContainerType.RetainerBag2,
            ContainerType.RetainerBag3,
            ContainerType.RetainerBag4,
            ContainerType.RetainerBag5,
            ContainerType.RetainerBag6,
            ContainerType.SaddleBag0,
            ContainerType.SaddleBag1
          ].indexOf(item.containerId) > -1;
        }).reduce((bags: InventoryDisplay[], item: InventoryItem) => {
          let containerName: string;
          switch (item.containerId) {
            case ContainerType.Bag0:
            case ContainerType.Bag1:
            case ContainerType.Bag2:
            case ContainerType.Bag3:
              containerName = 'Bag';
              break;
            case ContainerType.RetainerBag0:
            case ContainerType.RetainerBag1:
            case ContainerType.RetainerBag2:
            case ContainerType.RetainerBag3:
            case ContainerType.RetainerBag4:
            case ContainerType.RetainerBag5:
            case ContainerType.RetainerBag6:
              containerName = 'RetainerBag';
              break;
            case ContainerType.SaddleBag0:
            case ContainerType.SaddleBag1:
              containerName = 'SaddleBag';
              break;
          }
          let bag = bags.find(i => i.containerName === containerName);
          if (bag === undefined) {
            bags.push({
              containerName: containerName,
              containerId: item.containerId,
              items: []
            });
            bag = bags[bags.length - 1];
          }
          bag.items.push(item);
          return bags;
        }, []);
    }),
    map(inventories => {
      return inventories
        .sort((a, b) => {
          return a.containerId - b.containerId;
        })
        .map(inventory => {
          inventory.items = inventory.items.sort((a, b) => a.slot - b.slot);
          return inventory;
        });
    })
  );

  constructor(private inventoryService: UserInventoryService) {
  }

}
