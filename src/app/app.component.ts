import {Component} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {TranslateService} from '@ngx-translate/core';
import {NavigationEnd, Router} from '@angular/router';

declare const ga: Function;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    locale: string;

    constructor(auth: AngularFireAuth, private translate: TranslateService, router: Router) {
        // Using Rx's built in `distinctUntilChanged ` feature to handle url change c/o @dloomb's answer
        router.events.distinctUntilChanged((previous: any, current: any) => {
            // Subscribe to any `NavigationEnd` events where the url has changed
            if (current instanceof NavigationEnd) {
                return previous.url === current.url;
            }
            return true;
        }).subscribe((x: any) => {
            ga('set', 'page', x.url);
            ga('send', 'pageview');
        });
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
