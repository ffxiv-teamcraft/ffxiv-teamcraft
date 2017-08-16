import {Component} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    locale: string;

    constructor(auth: AngularFireAuth, private translate: TranslateService) {
        auth.auth.signInAnonymously();
        translate.setDefaultLang('en');
        const lang = localStorage.getItem('locale');
        if (lang !== null) {
            this.use(lang);
        } else {
            this.use(translate.getBrowserLang());
        }
    }

    use(lang: string): void {
        this.locale = lang;
        localStorage.setItem('locale', lang);
        this.translate.use(lang);
    }
}
