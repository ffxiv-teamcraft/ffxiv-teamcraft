import {Component} from '@angular/core';
import {SettingsService} from '../settings.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

    linkBases = [
        {name: 'Xivdb', value: 'XIVDB'},
        {name: 'Garland Tools', value: 'GARLAND_TOOLS'},
        {name: 'Gamer Escape', value: 'GAMER_ESCAPE'},
        // {name: 'Lodestone', value: 'LODESTONE'}, TODO
    ];

    constructor(private settings: SettingsService) {
    }

    get baseLink(): string {
        return this.settings.baseLink;
    }

    set baseLink(base: string) {
        this.settings.baseLink = base;
    }

    get compactLists(): boolean {
        return this.settings.compactLists;
    }

    set compactLists(compact: boolean) {
        this.settings.compactLists = compact;
    }

}
