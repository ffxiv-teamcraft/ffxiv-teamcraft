import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {TranslateService} from '@ngx-translate/core';
import {NavigationEnd, Router} from '@angular/router';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import {User} from 'firebase/app';
import {MdDialog, MdSnackBar, MdSnackBarRef, SimpleSnackBar} from '@angular/material';
import {RegisterPopupComponent} from './component/popup/register-popup/register-popup.component';
import {LoginPopupComponent} from './component/popup/login-popup/login-popup.component';
import {CharacterAddPopupComponent} from './component/popup/character-add-popup/character-add-popup.component';
import {UserService} from './core/user.service';
import {environment} from '../environments/environment';
import {PatreonPopupComponent} from './patreon/patreon-popup/patreon-popup.component';
import Persistence = firebase.auth.Auth.Persistence;

declare const ga: Function;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    lightTheme = false;

    locale: string;

    announcement: string;

    authState: Observable<User>;

    username: string;

    userIcon: string;

    version = environment.version;

    registrationSnackRef: MdSnackBarRef<SimpleSnackBar>;

    isRegistering = false;

    patreonPopupDisplayed = false;

    constructor(private auth: AngularFireAuth,
                private router: Router,
                private translate: TranslateService,
                data: AngularFireDatabase,
                private dialog: MdDialog,
                private firebase: AngularFireDatabase,
                private userService: UserService,
                private snack: MdSnackBar) {

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
        this.auth.auth.setPersistence(Persistence.LOCAL);
        this.authState = this.auth.authState;

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

    closeSnack(): void {
        if (this.registrationSnackRef !== undefined) {
            this.registrationSnackRef.dismiss();
        }
    }

    ngOnInit(): void {
        this.lightTheme = localStorage.getItem('theme:light') === 'true';

        this.authState.debounceTime(1000)
            .subscribe(state => {
                if (this.router.url.indexOf('home') === -1) {
                    this.firebase.object('/patreon').subscribe(patreon => {
                        this.firebase.database.ref(`/users/${state.uid}/patron`)
                            .once('value')
                            .then(snap => {
                                if (!this.patreonPopupDisplayed && patreon.current < patreon.goal && snap.val() !== true) {
                                    this.dialog.open(PatreonPopupComponent, {data: patreon});
                                    this.patreonPopupDisplayed = true;
                                }
                            });
                    });
                }
                if (state === null) {
                    this.auth.auth.signInAnonymously();
                    return;
                } else if (state.isAnonymous && !this.isRegistering) {
                    this.registrationSnackRef = this.snack.open(
                        this.translate.instant('Anonymous_Warning'),
                        this.translate.instant('Registration'),
                        {
                            duration: 5000,
                            extraClasses: ['snack-warn']
                        }
                    );
                    this.registrationSnackRef.onAction().subscribe(() => {
                        this.openRegistrationPopup();
                    });
                    return;
                } else {
                    this.closeSnack();
                }
                this.firebase.database.ref(`/users/${state.uid}/lodestoneId`)
                    .once('value')
                    .then(snap => {
                        if (snap.val() === null && !state.isAnonymous) {
                            this.dialog.open(CharacterAddPopupComponent, {disableClose: true});
                        }
                    });
            });

        this.userService
            .getUser()
            .subscribe(u => {
                this.username = u.name;
                this.userIcon = u.avatar;
            });
    }

    saveTheme(): void {
        localStorage.setItem('theme:light', (!this.lightTheme).toString());
    }

    showAnnouncement(): boolean {
        return this.announcement !== undefined && localStorage.getItem('announcement:hide') !== 'true';
    }

    dismissAnnouncement(): void {
        localStorage.setItem('announcement:hide', 'true');
    }

    openRegistrationPopup(): void {
        this.isRegistering = true;
        this.dialog.open(RegisterPopupComponent).afterClosed().subscribe(() => this.isRegistering = false);
    }

    openLoginPopup(): void {
        this.dialog.open(LoginPopupComponent);
    }

    disconnect(): void {
        this.router.navigate(['recipes']);
        this.auth.auth.signOut();
        this.auth.auth.signInAnonymously();
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
