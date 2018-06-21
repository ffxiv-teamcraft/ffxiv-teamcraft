import {ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {TranslateService} from '@ngx-translate/core';
import {NavigationEnd, Router} from '@angular/router';
import {AngularFireDatabase} from 'angularfire2/database';
import {User} from 'firebase/app';
import {MatDialog, MatSnackBar, MatSnackBarRef, SimpleSnackBar} from '@angular/material';
import {RegisterPopupComponent} from './modules/common-components/register-popup/register-popup.component';
import {LoginPopupComponent} from './modules/common-components/login-popup/login-popup.component';
import {CharacterAddPopupComponent} from './modules/common-components/character-add-popup/character-add-popup.component';
import {UserService} from './core/database/user.service';
import {environment} from '../environments/environment';
import {PatreonPopupComponent} from './modules/patreon/patreon-popup/patreon-popup.component';
import {MediaChange, ObservableMedia} from '@angular/flex-layout';
import {BetaDisclaimerPopupComponent} from './modules/beta-disclaimer/beta-disclaimer-popup/beta-disclaimer-popup.component';
import {SettingsService} from './pages/settings/settings.service';
import {HelpService} from './core/component/help.service';
import {GivewayPopupComponent} from './modules/giveway-popup/giveway-popup/giveway-popup.component';
import fontawesome from '@fortawesome/fontawesome';
import {faDiscord, faFacebookF, faGithub} from '@fortawesome/fontawesome-free-brands';
import {faBell, faCalculator, faGavel, faMap} from '@fortawesome/fontawesome-free-solid';
import {PushNotificationsService} from 'ng-push';
import {OverlayContainer} from '@angular/cdk/overlay';
import {AnnouncementPopupComponent} from './modules/common-components/announcement-popup/announcement-popup.component';
import {Announcement} from './modules/common-components/announcement-popup/announcement';
import {PendingChangesService} from './core/database/pending-changes/pending-changes.service';
import {Observable, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, first, map} from 'rxjs/operators';
import {PlatformService} from './core/tools/platform.service';
import {IpcService} from './core/electron/ipc.service';
import {GarlandToolsService} from './core/api/garland-tools.service';

declare const ga: Function;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    public static LOCALES: string[] = ['en', 'de', 'fr', 'ja', 'pt', 'es'];

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

    givewayRunning = false;

    watcher: Subscription;

    activeMediaQuery = '';

    customLinksEnabled = false;

    public locales = AppComponent.LOCALES;

    private characterAddPopupOpened = false;

    public overlay = false;

    public url: string;

    public openingUrl = false;

    public overlayOpacity = 1;

    @ViewChild('urlBox')
    urlBox: ElementRef;

    constructor(private auth: AngularFireAuth,
                private router: Router,
                private translate: TranslateService,
                data: AngularFireDatabase,
                private dialog: MatDialog,
                private firebase: AngularFireDatabase,
                private userService: UserService,
                private snack: MatSnackBar,
                media: ObservableMedia,
                public settings: SettingsService,
                public helpService: HelpService,
                private push: PushNotificationsService,
                overlayContainer: OverlayContainer,
                public cd: ChangeDetectorRef,
                private pendingChangesService: PendingChangesService,
                public platformService: PlatformService,
                private ipc: IpcService,
                private gt: GarlandToolsService) {

        this.gt.preload();

        settings.themeChange$.subscribe(change => {
            overlayContainer.getContainerElement().classList.remove(`${change.previous}-theme`);
            overlayContainer.getContainerElement().classList.add(`${change.next}-theme`);
        });
        overlayContainer.getContainerElement().classList.add(`${settings.theme}-theme`);

        fontawesome.library.add(faDiscord, faFacebookF, faGithub, faCalculator, faBell, faMap, faGavel);

        this.watcher = media.subscribe((change: MediaChange) => {
            this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : '';
            this.mobile = (change.mqAlias === 'xs') || (change.mqAlias === 'sm');
        });

        this.firebase.object('maintenance').valueChanges().subscribe(maintenance => {
            if (maintenance && environment.production) {
                this.router.navigate(['maintenance']);
            }
        });

        // Google Analytics
        router.events
            .pipe(
                distinctUntilChanged((previous: any, current: any) => {
                    if (current instanceof NavigationEnd) {
                        return previous.url === current.url;
                    }
                    return true;
                })
            ).subscribe((event: any) => {
            this.overlay = event.url.indexOf('?overlay') > -1;
            if (this.overlay) {
                this.ipc.on(`overlay:${this.ipc.overlayUri}:opacity`, (value) => {
                    this.overlayOpacity = value;
                });
                this.ipc.send('overlay:get-opacity', {uri: this.ipc.overlayUri});
            }
            ga('set', 'page', event.url);
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
        translate.onLangChange.subscribe(change => {
            this.locale = change.lang;
        });

        // Annoucement
        data.object('/announcement')
            .valueChanges()
            .pipe(
                filter(() => !this.overlay)
            )
            .subscribe((announcement: Announcement) => {
                let lastLS = localStorage.getItem('announcement:last');
                if (lastLS !== null && !lastLS.startsWith('{')) {
                    lastLS = '{}';
                }
                const last = JSON.parse(lastLS || '{}');
                if (last.text !== announcement.text) {
                    this.dialog.open(AnnouncementPopupComponent, {data: announcement})
                        .afterClosed()
                        .pipe(first())
                        .subscribe(() => {
                            localStorage.setItem('announcement:last', JSON.stringify(announcement));
                        });
                }
            });
    }

    detectChanges(): void {
        this.cd.detectChanges();
    }

    closeSnack(): void {
        if (this.registrationSnackRef !== undefined) {
            this.registrationSnackRef.dismiss();
        }
    }

    openHelp(): void {
        this.dialog.open(this.helpService.currentHelp);
    }

    @HostListener('window:beforeunload', ['$event'])
    onBeforeUnload($event) {
        if (this.pendingChangesService.hasPendingChanges() && !this.platformService.isDesktop()) {
            $event.returnValue = true;
        }
    }

    openUrl(): void {
        const uri = this.url.replace('https://ffxivteamcraft.com/', '');
        this.router.navigate(uri.split('/'));
        this.openingUrl = false;
    }

    ngOnInit(): void {
        if (localStorage.getItem('push:authorization:asked') === null) {
            this.push.requestPermission();
            localStorage.setItem('push:authorization:asked', 'true');
        }
        // Do this later to avoid change detection conflict
        setTimeout(() => {
            this.firebase.object('/giveway').valueChanges().subscribe((givewayActivated: boolean) => {
                if (localStorage.getItem('giveway') === null && givewayActivated) {
                    this.showGiveway();
                }
                this.givewayRunning = givewayActivated;
            });

            // Check if it's beta/dev mode and the disclaimer has not been displayed yet.
            if (!environment.production && localStorage.getItem('beta-disclaimer') === null) {
                // Open beta disclaimer popup.
                this.dialog.open(BetaDisclaimerPopupComponent).afterClosed().subscribe(() => {
                    // Once it's closed, set the storage value to say it has been displayed.
                    localStorage.setItem('beta-disclaimer', 'true');
                });
            }

            // Patreon popup.
            if (this.router.url.indexOf('home') === -1) {
                this.firebase
                    .object('/patreon')
                    .valueChanges()
                    .subscribe((patreon: any) => {
                        this.userService.getUserData()
                            .pipe(
                                // We want to make sure that we get a boolean in there.
                                map(user => user.patron || false)
                            )
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
            this.auth.authState.pipe(debounceTime(1000)).subscribe(state => {
                if (state !== null && state.isAnonymous && !this.isRegistering && !this.overlay) {
                    this.registrationSnackRef = this.snack.open(
                        this.translate.instant('Anonymous_Warning'),
                        this.translate.instant('Registration'),
                        {
                            duration: 5000,
                            panelClass: ['snack-warn']
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
                    this.customLinksEnabled = u.patron || u.admin;
                    if (u.lodestoneId === undefined && !u.anonymous && !this.characterAddPopupOpened) {
                        this.characterAddPopupOpened = true;
                        this.dialog.open(CharacterAddPopupComponent, {disableClose: true, data: true})
                            .afterClosed()
                            .subscribe(() => this.characterAddPopupOpened = false);
                    }
                });

            // Character informations for side menu.
            this.userService
                .getCharacter()
                .subscribe(character => {
                    this.username = character.name;
                    this.userIcon = character.avatar;
                });
        }, 15);

    }

    showGiveway(): void {
        this.dialog.open(GivewayPopupComponent).afterClosed().subscribe(() => {
            // Once it's closed, set the storage value to say it has been displayed.
            localStorage.setItem('giveway', 'true');
        });
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
        this.userService.signOut();
        this.username = 'Anonymous';
    }

    use(lang: string): void {
        if (AppComponent.LOCALES.indexOf(lang) === -1) {
            lang = 'en';
        }
        this.locale = lang;
        localStorage.setItem('locale', lang);
        this.translate.use(lang);
    }

    /**
     * Desktop-specific methods
     */
    closeApp(): void {
        window.close();
    }

    toggleFullscreen(): void {
        this.ipc.send('fullscreen-toggle');
    }

    minimize(): void {
        this.ipc.send('minimize');
    }

    setOverlayOpacity(opacity: number): void {
        this.ipc.send('overlay:set-opacity', {uri: this.ipc.overlayUri, opacity: opacity});
    }

    previousPage(): void {
        window.history.back();
    }

    nextPage(): void {
        window.history.forward();
    }

}
