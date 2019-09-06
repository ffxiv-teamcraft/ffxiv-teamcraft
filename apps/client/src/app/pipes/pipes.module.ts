import { NgModule } from '@angular/core';
import { NpcNamePipe } from './pipes/npc-name.pipe';
import { PlaceNamePipe } from './pipes/place-name.pipe';
import { ItemNamePipe } from './pipes/item-name.pipe';
import { CeilPipe } from './pipes/ceil.pipe';
import { IconPipe } from './pipes/icon.pipe';
import { MobNamePipe } from './pipes/mob-name.pipe';
import { VentureNamePipe } from './pipes/venture-name.pipe';
import { ActionIconPipe } from './pipes/action-icon.pipe';
import { JobAbbrIconPipe } from './pipes/job-abbr.pipe';
import { JobNameIconPipe } from './pipes/job-name.pipe';
import { AbsolutePipe } from './pipes/absolute.pipe';
import { InstanceIconPipe } from './pipes/instance-icon.pipe';
import { FreeCompanyActionNamePipe } from './pipes/free-company-action-name.pipe';
import { IfMobilePipe } from './pipes/if-mobile.pipe';
import { NodeTypeIconPipe } from './pipes/node-type-icon.pipe';
import { ClosestAetherytePipe } from './pipes/closest-aetheryte.pipe';
import { XivapiIconPipe } from './pipes/xivapi-icon.pipe';
import { CharacterNamePipe } from './pipes/character-name.pipe';
import { TeamcraftLinkPipe } from './pipes/teamcraft-link.pipe';
import { FfxivgardeningPipe } from './pipes/ffxivgardening.pipe';
import { NodeTypeNamePipe } from './pipes/node-type-name';
import { XivapiI18nPipe } from './pipes/xivapi-i18n.pipe';
import { WeatherNamePipe } from './pipes/weather-name.pipe';
import { WeatherIconPipe } from './pipes/weather-icon.pipe';
import { ActionNamePipe } from './pipes/action-name.pipe';
import { CustomItemNamePipe } from './pipes/custom-item-name.pipe';
import { IngameStarsPipe } from './pipes/ingame-stars.pipe';
import { LazyIconPipe } from './pipes/lazy-icon.pipe';
import { PermissionLevelPipe } from './pipes/permission-level.pipe';
import { ElementIconPipe } from './pipes/element-icon.pipe';
import { FishEyesDurationPipe } from './pipes/fish-eyes-duration.pipe';
import { KeysPipe } from './pipes/keys.pipe';
import { TripleTriadRuleNamePipe } from './pipes/triple-triad-rule-name.pipe';
import { QuestNamePipe } from './pipes/quest-name.pipe';
import { FatePipe } from './pipes/fate.pipe';
import { InstanceNamePipe } from './pipes/instance-name.pipe';
import { ShopNamePipe } from './pipes/shop-name.pipe';
import { LeveNamePipe } from './pipes/leve-name.pipe';
import { JobCategoryNamePipe } from './pipes/job-category-name.pipe';
import { QuestIconPipe } from './pipes/quest-icon.pipe';
import { TraitNamePipe } from './pipes/trait-name.pipe';
import { TraitIconPipe } from './pipes/trait-icon.pipe';
import { AetheryteNamePipe } from './pipes/aetheryte-name.pipe';
import { CharacterAvatarPipe } from './pipes/character-avatar.pipe';
import { DurationPipe } from './pipes/duration.pipe';
import { UserLevelPipe } from './pipes/user-level.pipe';
import { IsPatronPipe } from './pipes/is-patron.pipe';
import { IsVerifiedPipe } from './pipes/is-verified.pipe';
import { AchievementNamePipe } from './pipes/achievement-name.pipe';
import { AchievementIconPipe } from './pipes/achievement-icon.pipe';
import { FloorPipe } from './pipes/floor.pipe';
import { MapIdPipe } from './pipes/map-id.pipe';
import { StatusIconPipe } from './pipes/status-icon.pipe';
import { StatusNamePipe } from './pipes/status-name.pipe';
import { RotationPipe } from './pipes/rotation.pipe';

@NgModule({
  declarations: [
    ItemNamePipe,
    PlaceNamePipe,
    NpcNamePipe,
    CeilPipe,
    FloorPipe,
    IconPipe,
    MobNamePipe,
    VentureNamePipe,
    ActionIconPipe,
    ActionNamePipe,
    JobAbbrIconPipe,
    JobNameIconPipe,
    AbsolutePipe,
    InstanceIconPipe,
    FreeCompanyActionNamePipe,
    IfMobilePipe,
    NodeTypeIconPipe,
    NodeTypeNamePipe,
    ClosestAetherytePipe,
    XivapiIconPipe,
    CharacterNamePipe,
    TeamcraftLinkPipe,
    FfxivgardeningPipe,
    XivapiI18nPipe,
    WeatherNamePipe,
    WeatherIconPipe,
    CustomItemNamePipe,
    IngameStarsPipe,
    LazyIconPipe,
    CustomItemNamePipe,
    PermissionLevelPipe,
    ElementIconPipe,
    FishEyesDurationPipe,
    KeysPipe,
    TripleTriadRuleNamePipe,
    QuestNamePipe,
    FatePipe,
    InstanceNamePipe,
    ShopNamePipe,
    LeveNamePipe,
    JobCategoryNamePipe,
    QuestIconPipe,
    TraitNamePipe,
    TraitIconPipe,
    AetheryteNamePipe,
    CharacterAvatarPipe,
    DurationPipe,
    UserLevelPipe,
    IsPatronPipe,
    IsVerifiedPipe,
    AchievementNamePipe,
    AchievementIconPipe,
    MapIdPipe,
    StatusIconPipe,
    StatusNamePipe,
    RotationPipe
  ],
  exports: [
    ItemNamePipe,
    PlaceNamePipe,
    NpcNamePipe,
    CeilPipe,
    FloorPipe,
    IconPipe,
    MobNamePipe,
    VentureNamePipe,
    ActionIconPipe,
    ActionNamePipe,
    JobAbbrIconPipe,
    JobNameIconPipe,
    AbsolutePipe,
    InstanceIconPipe,
    FreeCompanyActionNamePipe,
    IfMobilePipe,
    NodeTypeIconPipe,
    NodeTypeNamePipe,
    ClosestAetherytePipe,
    XivapiIconPipe,
    CharacterNamePipe,
    TeamcraftLinkPipe,
    FfxivgardeningPipe,
    XivapiI18nPipe,
    WeatherNamePipe,
    WeatherIconPipe,
    CustomItemNamePipe,
    IngameStarsPipe,
    LazyIconPipe,
    CustomItemNamePipe,
    PermissionLevelPipe,
    ElementIconPipe,
    FishEyesDurationPipe,
    KeysPipe,
    TripleTriadRuleNamePipe,
    QuestNamePipe,
    FatePipe,
    InstanceNamePipe,
    ShopNamePipe,
    LeveNamePipe,
    JobCategoryNamePipe,
    QuestIconPipe,
    TraitNamePipe,
    TraitIconPipe,
    AetheryteNamePipe,
    CharacterAvatarPipe,
    DurationPipe,
    UserLevelPipe,
    IsPatronPipe,
    IsVerifiedPipe,
    AchievementNamePipe,
    AchievementIconPipe,
    MapIdPipe,
    StatusIconPipe,
    StatusNamePipe,
    RotationPipe
  ]
})
export class PipesModule {

}
