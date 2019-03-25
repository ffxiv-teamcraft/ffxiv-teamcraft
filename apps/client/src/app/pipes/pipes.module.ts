import { NgModule } from '@angular/core';
import { NpcNamePipe } from './npc-name.pipe';
import { PlaceNamePipe } from './place-name.pipe';
import { ItemNamePipe } from './item-name.pipe';
import { CeilPipe } from './ceil.pipe';
import { IconPipe } from './icon.pipe';
import { MobNamePipe } from './mob-name.pipe';
import { VentureNamePipe } from './venture-name.pipe';
import { ActionIconPipe } from './action-icon.pipe';
import { JobAbbrIconPipe } from './job-abbr.pipe';
import { JobNameIconPipe } from './job-name.pipe';
import { AbsolutePipe } from './absolute.pipe';
import { InstanceIconPipe } from './instance-icon.pipe';
import { FreeCompanyActionNamePipe } from './free-company-action-name.pipe';
import { IfMobilePipe } from './if-mobile.pipe';
import { NodeTypeIconPipe } from './node-type-icon.pipe';
import { ClosestAetherytePipe } from './closest-aetheryte.pipe';
import { XivapiIconPipe } from './xivapi-icon.pipe';
import { CharacterNamePipe } from './character-name.pipe';
import { TeamcraftLinkPipe } from './teamcraft-link.pipe';
import { FfxivgardeningPipe } from './ffxivgardening.pipe';
import { NodeTypeNamePipe } from './node-type-name';
import { XivapiI18nPipe } from './xivapi-i18n.pipe';
import { WeatherNamePipe } from './weather-name.pipe';
import { WeatherIconPipe } from './weather-icon.pipe';
import { ActionNamePipe } from './action-name.pipe';
import { CustomItemNamePipe } from './custom-item-name.pipe';
import { PermissionLevelPipe } from './permission-level.pipe';
import { ElementIconPipe } from './element-icon.pipe';

@NgModule({
  declarations: [
    ItemNamePipe,
    PlaceNamePipe,
    NpcNamePipe,
    CeilPipe,
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
    PermissionLevelPipe,
    ElementIconPipe
  ],
  exports: [
    ItemNamePipe,
    PlaceNamePipe,
    NpcNamePipe,
    CeilPipe,
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
    PermissionLevelPipe,
    ElementIconPipe
  ]
})
export class PipesModule {

}
