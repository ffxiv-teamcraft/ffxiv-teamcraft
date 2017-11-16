import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {TranslateService} from '@ngx-translate/core';
import {NavigationEnd, Router} from '@angular/router';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {User} from 'firebase/app';
import {MatDialog, MatSnackBar, MatSnackBarRef, SimpleSnackBar} from '@angular/material';
import {RegisterPopupComponent} from './modules/common-components/register-popup/register-popup.component';
import {LoginPopupComponent} from './modules/common-components/login-popup/login-popup.component';
import {CharacterAddPopupComponent} from './modules/common-components/character-add-popup/character-add-popup.component';
import {UserService} from './core/database/user.service';
import {environment} from '../environments/environment';
import {PatreonPopupComponent} from './modules/patreon/patreon-popup/patreon-popup.component';
import {Subscription} from 'rxjs/Subscription';
import {MediaChange, ObservableMedia} from '@angular/flex-layout';
import {BetaDisclaimerPopupComponent} from './modules/beta-disclaimer/beta-disclaimer-popup/beta-disclaimer-popup.component';

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

    registrationSnackRef: MatSnackBarRef<SimpleSnackBar>;

    isRegistering = false;

    patreonPopupDisplayed = false;

    mobile = true;

    watcher: Subscription;
    activeMediaQuery = '';

    constructor(private auth: AngularFireAuth,
                private router: Router,
                private translate: TranslateService,
                data: AngularFireDatabase,
                private dialog: MatDialog,
                private firebase: AngularFireDatabase,
                private userService: UserService,
                private snack: MatSnackBar,
                media: ObservableMedia) {


        this.watcher = media.subscribe((change: MediaChange) => {
            this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : '';
            this.mobile = (change.mqAlias === 'xs') || (change.mqAlias === 'sm');

        });

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
            .valueChanges()
            .subscribe((announcement: string) => {
                if (announcement !== localStorage.getItem('announcement:last')) {
                    localStorage.setItem('announcement:last', announcement);
                    localStorage.setItem('announcement:hide', 'false');
                }
                this.announcement = announcement;
            });
    }

    closeSnack(): void {
        if (this.registrationSnackRef !== undefined) {
            this.registrationSnackRef.dismiss();
        }
    }

    ngOnInit(): void {
        // Check if it's beta/dev mode and the disclaimer has not been displayed yet.
        if (!environment.production && localStorage.getItem('beta-disclaimer') === null) {
            // Open beta disclaimer popup.
            this.dialog.open(BetaDisclaimerPopupComponent).afterClosed().subscribe(() => {
                // Once it's closed, set the storage value to say it has been displayed.
                localStorage.setItem('beta-disclaimer', 'true');
            });
        }

        this.lightTheme = localStorage.getItem('theme:light') === 'true';

        // Patreon popup.
        if (this.router.url.indexOf('home') === -1) {
            this.firebase
                .object('/patreon')
                .valueChanges()
                .subscribe((patreon: any) => {
                    this.userService.getUserData()
                    // We want to make sure that we get a boolean in there.
                        .map(user => user.patron || false)
                        // Display patreon popup is goal isn't reached and the user isn't a registered patron.
                        .subscribe(isPatron => {
                            if (!this.patreonPopupDisplayed && patreon.current < patreon.goal && !isPatron) {
                                this.dialog.open(PatreonPopupComponent, {data: patreon});
                                this.patreonPopupDisplayed = true;
                            }
                        });
                });
        }
        // Anonymous sign in with "please register" snack.
        this.auth.authState.debounceTime(1000).subscribe(state => {
            if (state ! == null && state.isAnonymous && !this.isRegistering) {
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
        });

        // Character addition popup.
        this.userService
            .getUserData()
            .subscribe(u => {
                if (u.lodestoneId === undefined && !u.anonymous) {
                    this.dialog.open(CharacterAddPopupComponent, {disableClose: true});
                }
            });

        // Character informations for side menu.
        this.userService
            .getCharacter()
            .subscribe(character => {
                this.username = character.name;
                this.userIcon = character.avatar;
            });
    }


    /**
     * Persists the actual theme in localstorage.
     */
    saveTheme(): void {
        localStorage.setItem('theme:light', this.lightTheme.toString());
    }

    /**
     * Returns a boolean which is linked to announcement display.
     * @returns {boolean}
     */
    showAnnouncement(): boolean {
        return this.announcement !== undefined && localStorage.getItem('announcement:hide') !== 'true';
    }

    /**
     * Persists the dismissed announcement into localstorage.
     */
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
