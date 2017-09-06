import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {TranslateService} from '@ngx-translate/core';
import {NavigationEnd, Router} from '@angular/router';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import {User} from 'firebase/app';
import {MdDialog, MdSnackBar} from '@angular/material';
import {RegisterPopupComponent} from './popup/register-popup/register-popup.component';
import {LoginPopupComponent} from './popup/login-popup/login-popup.component';
import {CharacterAddPopupComponent} from './popup/character-add-popup/character-add-popup.component';
import {UserService} from './core/user.service';
import Persistence = firebase.auth.Auth.Persistence;

declare const ga: Function;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    locale: string;

    announcement: string;

    authState: Observable<User>;

    username: string;

    userIcon: string;

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

    ngOnInit(): void {
        this.authState.debounceTime(2000).subscribe(state => {
            if (state === null) {
                this.auth.auth.signInAnonymously();
                return;
            } else if (state.isAnonymous) {
                this.snack.open(
                    this.translate.instant('Anonymous_Warning'),
                    this.translate.instant('Registration'),
                    {
                        duration: 10000,
                        extraClasses: ['snack-warn']
                    }
                ).onAction().subscribe(() => {
                    this.openRegistrationPopup();
                });
                return;
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

    showAnnouncement(): boolean {
        return this.announcement !== undefined && localStorage.getItem('announcement:hide') !== 'true';
    }

    dismissAnnouncement(): void {
        localStorage.setItem('announcement:hide', 'true');
    }

    openRegistrationPopup(): void {
        this.dialog.open(RegisterPopupComponent);
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
        this.locale = lang;
        localStorage.setItem('locale', lang);
        this.translate.use(lang);
    }
}
