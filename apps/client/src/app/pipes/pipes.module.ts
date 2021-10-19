import { NgModule } from '@angular/core';
import { ItemNamePipe } from './pipes/item-name.pipe';
import { CeilPipe } from './pipes/ceil.pipe';
import { IconPipe } from './pipes/icon.pipe';
import { ActionIconPipe } from './pipes/action-icon.pipe';
import { AbsolutePipe } from './pipes/absolute.pipe';
import { InstanceIconPipe } from './pipes/instance-icon.pipe';
import { IfMobilePipe } from './pipes/if-mobile.pipe';
import { NodeTypeIconPipe } from './pipes/node-type-icon.pipe';
import { ClosestAetherytePipe } from './pipes/closest-aetheryte.pipe';
import { XivapiIconPipe } from './pipes/xivapi-icon.pipe';
import { CharacterNamePipe } from './pipes/character-name.pipe';
import { TeamcraftLinkPipe } from './pipes/teamcraft-link.pipe';
import { FfxivgardeningPipe } from './pipes/ffxivgardening.pipe';
import { NodeTypeNamePipe } from './pipes/node-type-name';
import { XivapiI18nPipe } from './pipes/xivapi-i18n.pipe';
import { XivapiL12nPipe } from './pipes/xivapi-l12n.pipe';
import { WeatherIconPipe } from './pipes/weather-icon.pipe';
import { ActionNamePipe } from './pipes/action-name.pipe';
import { CustomItemNamePipe } from './pipes/custom-item-name.pipe';
import { IngameStarsPipe } from './pipes/ingame-stars.pipe';
import { LazyIconPipe } from './pipes/lazy-icon.pipe';
import { PermissionLevelPipe } from './pipes/permission-level.pipe';
import { ElementIconPipe } from './pipes/element-icon.pipe';
import { FishEyesDurationPipe } from './pipes/fish-eyes-duration.pipe';
import { KeysPipe } from './pipes/keys.pipe';
import { InstanceNamePipe } from './pipes/instance-name.pipe';
import { ShopNamePipe } from './pipes/shop-name.pipe';
import { AetheryteNamePipe } from './pipes/aetheryte-name.pipe';
import { CharacterAvatarPipe } from './pipes/character-avatar.pipe';
import { DurationPipe } from './pipes/duration.pipe';
import { UserLevelPipe } from './pipes/user-level.pipe';
import { IsPatronPipe } from './pipes/is-patron.pipe';
import { IsVerifiedPipe } from './pipes/is-verified.pipe';
import { FloorPipe } from './pipes/floor.pipe';
import { MapIdPipe } from './pipes/map-id.pipe';
import { RotationPipe } from './pipes/rotation.pipe';
import { MapNamePipe } from './pipes/map-name.pipe';
import { TradeIconPipe } from './pipes/trade-icon.pipe';
import { JobUnicodePipe } from './pipes/job-unicode.pipe';
import { IlvlPipe } from './pipes/ilvl.pipe';
import { FoodBonusesPipePipe } from './pipes/food-bonuses.pipe';
import { IfRegionsPipe } from './pipes/if-regions';
import { WorldNamePipe } from './pipes/world-name.pipe';
import { CraftingActionPipe } from './pipes/crafting-action.pipe';
import { MateriaBonusPipe } from './pipes/materia-bonus.pipe';
import { WidthBreakpointsPipe } from './pipes/width-breakpoints';
import { TugNamePipe } from './pipes/tug-name.pipe';
import { VoyageNamePipe } from './pipes/voyage-name.pipe';
import { HooksetActionIdPipe } from './pipes/hookset-action-id.pipe';
import { LazyRowPipe } from './pipes/lazy-row.pipe';

const pipes = [
  ItemNamePipe,
  CeilPipe,
  FloorPipe,
  IconPipe,
  ActionIconPipe,
  ActionNamePipe,
  AbsolutePipe,
  InstanceIconPipe,
  IfMobilePipe,
  NodeTypeIconPipe,
  NodeTypeNamePipe,
  ClosestAetherytePipe,
  XivapiIconPipe,
  CharacterNamePipe,
  TeamcraftLinkPipe,
  FfxivgardeningPipe,
  XivapiI18nPipe,
  XivapiL12nPipe,
  WeatherIconPipe,
  CustomItemNamePipe,
  IngameStarsPipe,
  LazyIconPipe,
  CustomItemNamePipe,
  PermissionLevelPipe,
  ElementIconPipe,
  FishEyesDurationPipe,
  KeysPipe,
  InstanceNamePipe,
  ShopNamePipe,
  AetheryteNamePipe,
  CharacterAvatarPipe,
  DurationPipe,
  UserLevelPipe,
  IsPatronPipe,
  IsVerifiedPipe,
  MapIdPipe,
  RotationPipe,
  MapNamePipe,
  TradeIconPipe,
  JobUnicodePipe,
  IlvlPipe,
  FoodBonusesPipePipe,
  IfRegionsPipe,
  WorldNamePipe,
  CraftingActionPipe,
  MateriaBonusPipe,
  WidthBreakpointsPipe,
  TugNamePipe,
  VoyageNamePipe,
  HooksetActionIdPipe,
  LazyRowPipe
];

@NgModule({
  declarations: pipes,
  exports: pipes
})
export class PipesModule {

}
