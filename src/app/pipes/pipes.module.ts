import {NgModule} from '@angular/core';
import {NpcNamePipe} from './npc-name.pipe';
import {PlaceNamePipe} from './place-name.pipe';
import {ItemNamePipe} from './item-name.pipe';
import {CeilPipe} from './ceil.pipe';
import {IconPipe} from './icon.pipe';
import {MobNamePipe} from './mob-name.pipe';
import {VentureNamePipe} from './venture-name.pipe';
import {ActionIconPipe} from './action-icon.pipe';
import {JobAbbrIconPipe} from './job-abbr.pipe';
import {JobNameIconPipe} from './job-name.pipe';
import {AbsolutePipe} from './absolute.pipe';
import {InstanceIconPipe} from './instance-icon.pipe';

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
        JobAbbrIconPipe,
        JobNameIconPipe,
        AbsolutePipe,
        InstanceIconPipe,
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
        JobAbbrIconPipe,
        JobNameIconPipe,
        AbsolutePipe,
        InstanceIconPipe,
    ]
})
export class PipesModule {

}
