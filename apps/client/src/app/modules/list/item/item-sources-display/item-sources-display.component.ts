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
import { NzModalService } from 'ng-zorro-antd';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../../core/data/localized-data.service';
import { RotationPickerService } from '../../../rotations/rotation-picker.service';

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

  dataTypes = DataType;

  constructor(private modal: NzModalService, private i18n: I18nToolsService,
              private l12n: LocalizedDataService, private rotationPicker: RotationPickerService) {
  }

  public openGatheredByPopup(item: ListRow): void {
    this.openDetailsPopup(GatheredByComponent, item, DataType.GATHERED_BY);
  }

  public openHuntingPopup(item: ListRow): void {
    this.openDetailsPopup(HuntingComponent, item, DataType.DROPS);
  }

  public openInstancesPopup(item: ListRow): void {
    this.openDetailsPopup(InstancesComponent, item, DataType.INSTANCES);
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
    const craft: Partial<Craft> = {
      id: recipeId,
      job: entry.jobId,
      lvl: entry.level,
      stars: entry.stars_tooltip.length,
      rlvl: entry.rlvl,
      durability: entry.durability,
      progress: entry.progression,
      quality: entry.quality
    };
    this.rotationPicker.openInSimulator(item.id, recipeId, craft);
  }

  private openDetailsPopup(component: Type<ItemDetailsPopup>, item: ListRow, dataType: DataType): void {
    this.modal.create({
      nzTitle: this.i18n.getName(this.l12n.getItem(item.id), item as CustomItem),
      nzContent: component,
      nzComponentParams: {
        item: item,
        details: getItemSource(item, dataType)
      },
      nzFooter: null
    });
  }

  public trackByItemSource(index: number, source: ItemSource): DataType {
    return source.type;
  }

  public trackByCraft(index: number, craft: Craft): string {
    return craft.id;
  }
}
