import { ChangeDetectionStrategy, Component, Input, Type } from '@angular/core';
import { DataType, getItemSource, ItemSource } from '@ffxiv-teamcraft/types';
import { ListRow } from '../../model/list-row';
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
import { combineLatest, first, map } from 'rxjs';
import { IslandAnimalComponent } from '../../../item-details/island-animal/island-animal.component';
import { IslandCropComponent } from '../../../item-details/island-crop/island-crop.component';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { observeInput } from '../../../../core/rxjs/observe-input';
import { shareReplay } from 'rxjs/operators';
import { Craft } from '@ffxiv-teamcraft/simulator';
import { LazyRowPipe } from '../../../../pipes/pipes/lazy-row.pipe';
import { JobUnicodePipe } from '../../../../pipes/pipes/job-unicode.pipe';
import { TradeIconPipe } from '../../../../pipes/pipes/trade-icon.pipe';
import { LazyIconPipe } from '../../../../pipes/pipes/lazy-icon.pipe';
import { XivapiIconPipe } from '../../../../pipes/pipes/xivapi-icon.pipe';
import { NodeTypeIconPipe } from '../../../../pipes/pipes/node-type-icon.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { CompanyWorkshopTreeButtonComponent } from '../../../company-workshop-tree/company-workshop-tree-button/company-workshop-tree-button.component';
import { ItemIconComponent } from '../../../item-icon/item-icon/item-icon.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgFor, NgSwitch, NgSwitchCase, NgIf, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-item-sources-display',
    templateUrl: './item-sources-display.component.html',
    styleUrls: ['./item-sources-display.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgFor, NgSwitch, NgSwitchCase, NzButtonModule, NzIconModule, NzToolTipModule, NzWaveModule, NgIf, ItemIconComponent, CompanyWorkshopTreeButtonComponent, AsyncPipe, I18nPipe, TranslateModule, NodeTypeIconPipe, XivapiIconPipe, LazyIconPipe, TradeIconPipe, JobUnicodePipe, LazyRowPipe]
})
export class ItemSourcesDisplayComponent extends TeamcraftComponent {
  @Input()
  dbDisplay = false;

  @Input()
  sources: ItemSource[];

  @Input()
  item: Pick<ListRow, 'id' | 'sources'>;

  @Input()
  overlay = false;

  @Input()
  layoutAlign = 'flex-start flex-start';

  @Input()
  flex = '0 1 auto';

  @Input()
  size: NzSizeLDSType = 'default';

  @Input()
  forceHorizontal = false;

  @Input()
  displayedSources: DataType[] | null = null;

  sourcesDisplay$ = combineLatest([
    observeInput(this, 'sources'),
    observeInput(this, 'displayedSources', true)
  ]).pipe(
    map(([sources, displayedSources]) => {
      if (!displayedSources) {
        return sources;
      }
      return sources.filter(s => displayedSources.includes(s.type));
    }),
    shareReplay(1)
  );

  dataTypes = DataType;

  constructor(private modal: NzModalService, private i18n: I18nToolsService,
              private rotationPicker: RotationPickerService) {
    super();
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

  public openIslandAnimalsPopup(item: ListRow): void {
    this.openDetailsPopup(IslandAnimalComponent, item, DataType.ISLAND_PASTURE);
  }

  public openIslandCropPopup(item: ListRow): void {
    this.openDetailsPopup(IslandCropComponent, item, DataType.ISLAND_CROP);
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

  public trackByItemSource(index: number, source: ItemSource): DataType {
    return source.type;
  }

  public trackByCraft(index: number, craft: Craft): string {
    return craft.id;
  }

  private openDetailsPopup(component: Type<ItemDetailsPopup>, item: ListRow, dataType: DataType): void {
    this.i18n.getNameObservable('items', item.id).pipe(
      first()
    ).subscribe(itemName => {
      this.modal.create({
        nzTitle: itemName || (item as CustomItem).name,
        nzContent: component,
        nzCloseOnNavigation: true,
        nzData: {
          item: item,
          details: getItemSource(item, dataType),
          dbDisplay: this.dbDisplay
        },
        nzFooter: null
      });
    });
  }
}
