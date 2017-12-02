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

    themes = ['dark-orange', 'light-orange', 'dark-teal', 'light-teal'];

    constructor(public settings: SettingsService) {
    }
}
