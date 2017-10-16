import {NgModule} from '@angular/core';
import {NpcNamePipe} from './npc-name.pipe';
import {PlaceNamePipe} from './place-name.pipe';
import {ItemNamePipe} from './item-name.pipe';
import {CeilPipe} from './ceil.pipe';

@NgModule({
    declarations: [
        ItemNamePipe,
        PlaceNamePipe,
        NpcNamePipe,
        CeilPipe,
    ],
    exports: [
        ItemNamePipe,
        PlaceNamePipe,
        NpcNamePipe,
        CeilPipe,
    ]
})
export class PipesModule {

}
