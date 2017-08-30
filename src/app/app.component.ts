import {Component} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {TranslateService} from '@ngx-translate/core';
import {NavigationEnd, Router} from '@angular/router';
import {AngularFireDatabase} from 'angularfire2/database';

declare const ga: Function;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    locale: string;

    announcement: string;

    constructor(auth: AngularFireAuth,
                router: Router,
                private translate: TranslateService,
                data: AngularFireDatabase) {
        // Google Analytics
        router.events.distinctUntilChanged((previous: any, current: any) => {
            if (current instanceof NavigationEnd) {
                return previous.url === current.url;
            }
            return true;
        }).subscribe((x: any) => {
            ga('set', 'page', x.url);
            ga('send', 'pageview');
        });

        // Firebase Auth
        auth.auth.signInAnonymously();

        // Translation
        translate.setDefaultLang('en');
        const lang = localStorage.getItem('locale');
        if (lang !== null) {
            this.use(lang);
        } else {
            this.use(translate.getBrowserLang());
        }

        // Annoucement
        data.object('/announcement')
            .map(res => res.$value)
            .do(announcement => {
                if (announcement !== localStorage.getItem('announcement:last')) {
                    localStorage.setItem('announcement:last', announcement);
                    localStorage.setItem('announcement:hide', 'false');
                }
            })
            .subscribe(announcement => {
                this.announcement = announcement;
            });
    }

    showAnnouncement(): boolean {
        return this.announcement !== undefined && localStorage.getItem('announcement:hide') !== 'true';
    }

    dismissAnnouncement(): void {
        localStorage.setItem('announcement:hide', 'true');
    }

    use(lang: string): void {
        this.locale = lang;
        localStorage.setItem('locale', lang);
        this.translate.use(lang);
    }
}
