import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { GarlandToolsService } from './core/api/garland-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { IpcService } from './core/electron/ipc.service';
import { NavigationEnd, Router } from '@angular/router';
import { faDiscord, faGithub, faTwitter } from '@fortawesome/fontawesome-free-brands';
import { faBell, faCalculator, faGavel, faMap } from '@fortawesome/fontawesome-free-solid';
import fontawesome from '@fortawesome/fontawesome';
import { catchError, distinctUntilChanged, filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { AuthFacade } from './+state/auth.facade';
import { Character } from '@xivapi/angular-client';
import { NzIconService, NzModalService } from 'ng-zorro-antd';
import { RegisterPopupComponent } from './core/auth/register-popup/register-popup.component';
import { LoginPopupComponent } from './core/auth/login-popup/login-popup.component';
import { EorzeanTimeService } from './core/time/eorzean-time.service';
import { ListsFacade } from './modules/list/+state/lists.facade';
import { AngularFireDatabase } from '@angular/fire/database';
import { WorkshopsFacade } from './modules/workshop/+state/workshops.facade';
import { SettingsService } from './modules/settings/settings.service';
import { TeamsFacade } from './modules/teams/+state/teams.facade';
import { NotificationsFacade } from './modules/notifications/+state/notifications.facade';
import { AbstractNotification } from './core/notification/abstract-notification';
import { RotationsFacade } from './modules/rotations/+state/rotations.facade';
import { PlatformService } from './core/tools/platform.service';
import { SettingsPopupService } from './modules/settings/settings-popup.service';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CustomLinksFacade } from './modules/custom-links/+state/custom-links.facade';

declare const gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  public availableLanguages = this.settings.availableLocales;

  locale: string;

  version = environment.version;

  public overlay = false;

  public windowDecorator = false;

  public overlayOpacity = 1;

  collapsedSidebar = this.settings.compactSidebar;

  collapsedAlarmsBar = true;

  public notifications$ = this.notificationsFacade.notificationsDisplay$;

  public loggedIn$: Observable<boolean>;

  public character$: Observable<Character>;

  public userId$ = this.authFacade.userId$;

  public user$ = this.authFacade.user$;

  public loading$: Observable<boolean>;

  public time$: Observable<string>;

  public desktop = false;

  public hasDesktop$: Observable<boolean>;

  private hasDesktopReloader$ = new BehaviorSubject<void>(null);

  get desktopUrl(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(`teamcraft://${window.location.pathname}`);
  }

  constructor(private gt: GarlandToolsService, public translate: TranslateService,
              private ipc: IpcService, private router: Router, private firebase: AngularFireDatabase,
              private authFacade: AuthFacade, private dialog: NzModalService, private eorzeanTime: EorzeanTimeService,
              private listsFacade: ListsFacade, private workshopsFacade: WorkshopsFacade, public settings: SettingsService,
              public teamsFacade: TeamsFacade, private notificationsFacade: NotificationsFacade,
              private iconService: NzIconService, private rotationsFacade: RotationsFacade, public platformService: PlatformService,
              private settingsPopupService: SettingsPopupService, private http: HttpClient, private sanitizer: DomSanitizer,
              private customLinksFacade: CustomLinksFacade) {

    this.desktop = this.platformService.isDesktop();

    this.iconService.fetchFromIconfont({ scriptUrl: 'https://at.alicdn.com/t/font_931253_pxv80d5yyj8.js' });

    this.time$ = this.eorzeanTime.getEorzeanTime().pipe(
      map(date => {
        const minutes = date.getUTCMinutes();
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${date.getUTCHours()}:${minutesStr}`;
      })
    );

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
      this.ipc.send('navigated', event.url);
      this.ipc.on('window-decorator', (e, value) => {
        this.windowDecorator = value;
      });
      if (this.overlay) {
        this.ipc.on(`overlay:${this.ipc.overlayUri}:opacity`, (value) => {
          this.overlayOpacity = value;
        });
        this.ipc.send('overlay:get-opacity', { uri: this.ipc.overlayUri });
      }
      gtag('set', 'page', event.url);
      gtag('send', 'pageview');
    });

    // Custom protocol detection
    this.hasDesktop$ = this.hasDesktopReloader$.pipe(
      switchMap(() => router.events),
      first(),
      filter(current => current instanceof NavigationEnd),
      switchMap((current: NavigationEnd) => {
        let url = current.url;
        if (this.platformService.isDesktop()) {
          return of(false);
        }
        if (url.endsWith('/')) {
          url = url.substring(0, url.length - 1);
        }
        return this.http.get('http://localhost:7331/', { responseType: 'text' }).pipe(
          map(() => true),
          tap(hasDesktop => {
            if (hasDesktop && this.settings.autoOpenInDesktop) {
              window.location.assign(`teamcraft://${url}`);
            }
          }),
          catchError(() => {
            return of(false);
          })
        );
      })
    );

    // Translation
    this.translate.setDefaultLang('en');
    const lang = localStorage.getItem('locale');
    this.translate.onLangChange.subscribe(l => this.locale = l);
    if (lang !== null) {
      this.use(lang);
    } else if (this.translate.getBrowserCultureLang() === 'pt-BR') {
      // Specific implementation for BR.
      this.use('br');
    } else {
      this.use(this.translate.getBrowserLang());
    }
    this.translate.onLangChange.subscribe(change => {
      this.locale = change.lang;
    });

    fontawesome.library.add(faDiscord, faTwitter, faGithub, faCalculator, faBell, faMap, faGavel);

    this.firebase.object('maintenance').valueChanges().subscribe(maintenance => {
      if (maintenance && environment.production) {
        this.router.navigate(['maintenance']);
      }
    });
  }

  ngOnInit(): void {
    // Loading is !loaded
    this.loading$ = this.authFacade.loaded$.pipe(map(loaded => !loaded));
    this.loggedIn$ = this.authFacade.loggedIn$;
    this.character$ = this.authFacade.mainCharacter$.pipe(shareReplay(1));

    this.authFacade.loadUser();
    this.notificationsFacade.loadAll();
    this.listsFacade.loadMyLists();
    this.workshopsFacade.loadMyWorkshops();
    this.listsFacade.loadListsWithWriteAccess();
    this.workshopsFacade.loadWorkshopsWithWriteAccess();
    this.teamsFacade.loadMyTeams();
    this.rotationsFacade.loadMyRotations();
    this.customLinksFacade.loadMyCustomLinks();
  }

  deleteNotification(notification: AbstractNotification): void {
    this.notificationsFacade.removeNotification(notification.$key);
  }

  openRegisterPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Registration'),
      nzContent: RegisterPopupComponent,
      nzFooter: null
    });
  }

  openLoginPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Login'),
      nzContent: LoginPopupComponent,
      nzFooter: null
    });
  }

  logOut(): void {
    this.authFacade.logout();
  }

  openedApp(): void {
    setTimeout(() => {
      this.hasDesktopReloader$.next(null);
    }, 30000);
  }

  use(lang: string): void {
    if (this.settings.availableLocales.indexOf(lang) === -1) {
      lang = 'en';
    }
    this.locale = lang;
    localStorage.setItem('locale', lang);
    this.translate.use(lang);
  }

  openSettings(): void {
    this.settingsPopupService.openSettings();
  }
}
