import { ChangeDetectionStrategy, Component, Input, Type } from '@angular/core';
import { ItemSource } from '../../model/item-source';
import { DataType } from '../../data/data-type';
import { Craft } from '../../../../model/garland-tools/craft';
import { getItemSource, ListRow } from '../../model/list-row';
import { GatheredByComponent } from '../../../item-details/gathered-by/gathered-by.component';
import { HuntingComponent } from '../../../item-details/hunting/hunting.component';
import { InstancesComponent } from '../../../item-details/instances/instances.component';
import { ReducedFromComponent } from '../../../item-details/reduced-from/reduced-from.component';
import { DesynthsComponent } from '../../../item-details/desynth/desynths.component';
import { VendorsComponent } from '../../../item-details/vendors/vendors.component';
import { VenturesComponent } from '../../../item-details/ventures/ventures.component';
import { TreasuresComponent } from '../../../item-details/treasures/treasures.component';
import { FatesComponent } from '../../../item-details/fates/fates.component';
import { VoyagesComponent } from '../../../item-details/voyages/voyages.component';
import { TradesComponent } from '../../../item-details/trades/trades.component';
import { CraftedBy } from '../../model/crafted-by';
import { ItemDetailsPopup } from '../../../item-details/item-details-popup';
import { CustomItem } from '../../../custom-items/model/custom-item';
import { NzModalService } from 'ng-zorro-antd/modal';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { RotationPickerService } from '../../../rotations/rotation-picker.service';
import { GardeningComponent } from '../../../item-details/gardening/gardening.component';
import { MogstationComponent } from '../../../item-details/mogstation/mogstation.component';
import { QuestsComponent } from '../../../item-details/quests/quests.component';
import { AchievementsComponent } from '../../../item-details/achievements/achievements.component';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-item-sources-display',
  templateUrl: './item-sources-display.component.html',
  styleUrls: ['./item-sources-display.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemSourcesDisplayComponent {
  @Input()
  sources: ItemSource[];

  @Input()
  item: ListRow;

  @Input()
  overlay = false;

  @Input()
  layoutAlign = 'flex-start flex-start';

  @Input()
  flex = '0 1 auto';

  dataTypes = DataType;

  constructor(private modal: NzModalService, private i18n: I18nToolsService,
              private rotationPicker: RotationPickerService) {
  }

  public openGatheredByPopup(item: ListRow): void {
    this.openDetailsPopup(GatheredByComponent, item, DataType.GATHERED_BY);
  }

  public openGardeningPopup(item: ListRow): void {
    this.openDetailsPopup(GardeningComponent, item, DataType.GARDENING);
  }

  public openHuntingPopup(item: ListRow): void {
    this.openDetailsPopup(HuntingComponent, item, DataType.DROPS);
  }

  public openInstancesPopup(item: ListRow): void {
    this.openDetailsPopup(InstancesComponent, item, DataType.INSTANCES);
  }

  public openMogstationPopup(item: ListRow): void {
    this.openDetailsPopup(MogstationComponent, item, DataType.MOGSTATION);
  }

  public openQuestPopup(item: ListRow): void {
    this.openDetailsPopup(QuestsComponent, item, DataType.QUESTS);
  }

  public openAchievementsPopup(item: ListRow): void {
    this.openDetailsPopup(AchievementsComponent, item, DataType.ACHIEVEMENTS);
  }

  public openReducedFromPopup(item: ListRow): void {
    this.openDetailsPopup(ReducedFromComponent, item, DataType.REDUCED_FROM);
  }

  public openDesynthsPopup(item: ListRow): void {
    this.openDetailsPopup(DesynthsComponent, item, DataType.DESYNTHS);
  }

  public openVendorsPopup(item: ListRow): void {
    this.openDetailsPopup(VendorsComponent, item, DataType.VENDORS);
  }

  public openVenturesPopup(item: ListRow): void {
    this.openDetailsPopup(VenturesComponent, item, DataType.VENTURES);
  }

  public openTreasuresPopup(item: ListRow): void {
    this.openDetailsPopup(TreasuresComponent, item, DataType.TREASURES);
  }

  public openFatesPopup(item: ListRow): void {
    this.openDetailsPopup(FatesComponent, item, DataType.FATES);
  }

  public openVoyagesPopup(item: ListRow): void {
    this.openDetailsPopup(VoyagesComponent, item, DataType.VOYAGES);
  }

  public openTradesPopup(item: ListRow): void {
    this.openDetailsPopup(TradesComponent, item, DataType.TRADE_SOURCES);
  }

  public openSimulator(recipeId: string, item: ListRow, entry: CraftedBy): void {
    this.rotationPicker.openInSimulator(item.id, recipeId);
  }

  private openDetailsPopup(component: Type<ItemDetailsPopup>, item: ListRow, dataType: DataType): void {
    this.i18n.getNameObservable('items', item.id).pipe(
      first()
    ).subscribe(itemName => {
      this.modal.create({
        nzTitle: itemName || (item as CustomItem).name,
        nzContent: component,
        nzCloseOnNavigation: true,
        nzComponentParams: {
          item: item,
          details: getItemSource(item, dataType)
        },
        nzFooter: null
      });
    });
  }

  public trackByItemSource(index: number, source: ItemSource): DataType {
    return source.type;
  }

  public trackByCraft(index: number, craft: Craft): string {
    return craft.id;
  }
}
