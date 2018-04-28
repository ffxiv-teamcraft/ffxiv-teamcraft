import {NgModule} from '@angular/core';
import {NpcNamePipe} from './npc-name.pipe';
import {PlaceNamePipe} from './place-name.pipe';
import {ItemNamePipe} from './item-name.pipe';
import {CeilPipe} from './ceil.pipe';
import { IconPipe } from './icon.pipe';
import { MobNamePipe } from './mob-name.pipe';
import {VentureNamePipe} from './venture-name.pipe';
import {ActionIconPipe} from './action-icon.pipe';

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
    ]
})
export class PipesModule {

}
