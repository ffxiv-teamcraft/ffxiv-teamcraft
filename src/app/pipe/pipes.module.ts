import {NgModule} from '@angular/core';
import {NpcNamePipe} from './npc-name.pipe';
import {PlaceNamePipe} from './place-name.pipe';
import {ItemNamePipe} from './item-name.pipe';
import {CeilPipe} from './ceil.pipe';
import { IconPipe } from './icon.pipe';
import { MobNamePipe } from './mob-name.pipe';

@NgModule({
    declarations: [
        ItemNamePipe,
        PlaceNamePipe,
        NpcNamePipe,
        CeilPipe,
        IconPipe,
        MobNamePipe,
    ],
    exports: [
        ItemNamePipe,
        PlaceNamePipe,
        NpcNamePipe,
        CeilPipe,
        IconPipe,
        MobNamePipe,
    ]
})
export class PipesModule {

}
