import {Component} from '@angular/core';
import {SettingsService} from '../settings.service';
import {TranslateService} from '@ngx-translate/core';

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

    locale: string;

    constructor(public settings: SettingsService,
                private translate: TranslateService) {
        this.locale = this.translate.currentLang;
        translate.onLangChange.subscribe(change => {
            this.locale = change.lang;
        });
    }

    use(lang: string): void {
        if (['en', 'de', 'fr', 'ja'].indexOf(lang) === -1) {
            lang = 'en';
        }
        this.locale = lang;
        localStorage.setItem('locale', lang);
        this.translate.use(lang);
    }
}
