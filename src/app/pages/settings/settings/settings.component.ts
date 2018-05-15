import {Component} from '@angular/core';
import {SettingsService} from '../settings.service';
import {TranslateService} from '@ngx-translate/core';
import {AppComponent} from '../../../app.component';

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

    themes = ['dark-orange', 'light-orange', 'light-teal', 'dark-teal', 'light-brown',
        'light-amber', 'dark-amber', 'light-green', 'dark-lime', 'light-lime',
        'dark-cyan', 'light-cyan', 'dark-indigo', 'light-indigo', 'dark-blue', 'light-blue',
        'dark-deep-purple', 'light-deep-purple', 'dark-red', 'light-red', 'dark-pink', 'light-pink'];

    locale: string;

    public locales: string[] = AppComponent.LOCALES;

    constructor(public settings: SettingsService,
                private translate: TranslateService) {
        this.locale = this.translate.currentLang;
        translate.onLangChange.subscribe(change => {
            this.locale = change.lang;
        });
    }

    use(lang: string): void {
        if (AppComponent.LOCALES.indexOf(lang) === -1) {
            lang = 'en';
        }
        this.locale = lang;
        localStorage.setItem('locale', lang);
        this.translate.use(lang);
    }
}
