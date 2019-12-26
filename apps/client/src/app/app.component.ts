import { Component, HostListener, Inject, Injector, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { environment } from '../environments/environment';
import { GarlandToolsService } from './core/api/garland-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { IpcService } from './core/electron/ipc.service';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent } from '@angular/router';
import { faDiscord, faGithub, faTwitter } from '@fortawesome/fontawesome-free-brands';
import { faBell, faCalculator, faGavel, faMap } from '@fortawesome/fontawesome-free-solid';
import fontawesome from '@fortawesome/fontawesome';
import { buffer, catchError, debounceTime, delay, distinctUntilChanged, filter, first, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { AuthFacade } from './+state/auth.facade';
import { Character } from '@xivapi/angular-client';
import { NzIconService, NzMessageService, NzModalService } from 'ng-zorro-antd';
import { RegisterPopupComponent } from './core/auth/register-popup/register-popup.component';
import { LoginPopupComponent } from './core/auth/login-popup/login-popup.component';
import { EorzeanTimeService } from './core/eorzea/eorzean-time.service';
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
import { BehaviorSubject, fromEvent, interval, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CustomLinksFacade } from './modules/custom-links/+state/custom-links.facade';
import { MediaObserver } from '@angular/flex-layout';
import { LayoutsFacade } from './core/layout/+state/layouts.facade';
import { LazyDataService } from './core/data/lazy-data.service';
import { CustomItemsFacade } from './modules/custom-items/+state/custom-items.facade';
import { DirtyFacade } from './core/dirty/+state/dirty.facade';
import { SeoService } from './core/seo/seo.service';
import { Theme } from './modules/settings/theme';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import * as semver from 'semver';
import { MachinaService } from './core/electron/machina.service';
import { UniversalisService } from './core/api/universalis.service';
import { GubalService } from './core/api/gubal.service';
import { InventoryFacade } from './modules/inventory/+state/inventory.facade';
import { TextQuestionPopupComponent } from './modules/text-question-popup/text-question-popup/text-question-popup.component';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { QuickSearchService } from './modules/quick-search/quick-search.service';

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

  collapsedSidebar = this.media.isActive('lt-md') ? true : this.settings.compactSidebar;

  collapsedAlarmsBar = true;

  sidebarState = this.settings.sidebarState;

  public notifications$ = this.notificationsFacade.notificationsDisplay$.pipe(
    isPlatformServer(this.platform) ? first() : tap()
  );

  public loggedIn$: Observable<boolean>;

  public character$: Observable<Character>;

  public userId$ = this.authFacade.userId$.pipe(
    isPlatformServer(this.platform) ? first() : tap()
  );

  public user$ = this.authFacade.user$.pipe(
    isPlatformServer(this.platform) ? first() : tap()
  );

  public loading$: Observable<boolean>;

  public time$: Observable<string>;

  private reloadTime$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  public desktop = false;

  public hasDesktop$: Observable<boolean>;

  private hasDesktopReloader$ = new BehaviorSubject<void>(null);

  public navigating = true;

  public newVersionAvailable$: Observable<boolean>;

  public dataLoaded = false;

  public showGiveaway = false;

  private dirty = false;

  public downloading: any;

  public checkingForUpdate = false;

  public emptyInventory$: Observable<boolean>;

  public pinnedList$ = this.listsFacade.pinnedList$;

  public randomTip$: Observable<string> = interval(600000).pipe(
    startWith(-1),
    map(() => {
      const tips = [
        'Community_rotations',
        'GC_Deliveries',
        'Desynth',
        'DB',
        '3D_model',
        'Levequests',
        'Log_tracker',
        'Desktop_app_overlay',
        'Start_desktop_before_game'
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }),
    isPlatformServer(this.platform) ? first() : tap()
  );

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
              private customLinksFacade: CustomLinksFacade, private renderer: Renderer2, private media: MediaObserver,
              private layoutsFacade: LayoutsFacade, private lazyData: LazyDataService, private customItemsFacade: CustomItemsFacade,
              private dirtyFacade: DirtyFacade, private seoService: SeoService, private injector: Injector,
              private machina: MachinaService, private message: NzMessageService, private universalis: UniversalisService,
              private inventoryService: InventoryFacade, private gubal: GubalService, @Inject(PLATFORM_ID) private platform: Object,
              private quickSearch: QuickSearchService, apollo: Apollo, httpLink: HttpLink) {


    fromEvent(document, 'keypress').pipe(
      filter((event: KeyboardEvent) => {
        return event.ctrlKey && event.shiftKey && event.code === 'KeyF';
      })
    ).subscribe(() => {
      this.quickSearch.openQuickSearch();
    });

    const link = httpLink.create({ uri: 'https://us-central1-ffxivteamcraft.cloudfunctions.net/gubal-proxy' });

    apollo.create({
      link: link,
      cache: new InMemoryCache()
    });

    this.showGiveaway = false;

    this.applyTheme(this.settings.theme);

    this.desktop = this.platformService.isDesktop();

    this.iconService.fetchFromIconfont({ scriptUrl: 'https://at.alicdn.com/t/font_931253_8rqcxqh08v6.js' });

    this.time$ = this.reloadTime$.pipe(
      switchMap(() => {
        return this.eorzeanTime.getEorzeanTime().pipe(
          map(date => {
            const minutes = date.getUTCMinutes();
            const minutesStr = minutes < 10 ? '0' + minutes : minutes;
            if (this.settings.timeFormat === '24H') {
              return `${date.getUTCHours()}:${minutesStr}`;
            }
            const rawHours = date.getUTCHours();
            const suffix = rawHours >= 12 ? 'PM' : 'AM';
            return `${rawHours % 12}:${minutesStr} ${suffix}`;
          })
        );
      }),
      isPlatformServer(this.platform) ? first() : tap()
    );

    if (isPlatformServer(this.platform)) {
      this.dataLoaded = true;
      this.emptyInventory$ = of(false);
    }

    if (isPlatformBrowser(this.platform)) {
      if (this.platformService.isDesktop()) {
        this.machina.init();
        this.gubal.init();
        this.emptyInventory$ = this.inventoryService.inventory$.pipe(
          map(inventory => {
            return Object.keys(inventory.items).length === 0;
          })
        );
        this.universalis.initCapture();
      }
      this.inventoryService.load();

      this.firebase.object<boolean>('maintenance')
        .valueChanges()
        .pipe(
          isPlatformServer(this.platform) ? first() : tap()
        )
        .subscribe(maintenance => {
          if (maintenance && environment.production) {
            this.router.navigate(['maintenance']);
          }
        });

      this.firebase.object<string>('version_lock')
        .valueChanges()
        .pipe(
          isPlatformServer(this.platform) ? first() : tap()
        )
        .subscribe(version => {
          if (semver.ltr(environment.version, version)) {
            this.router.navigate(['version-lock']);
          }
        });

      this.lazyData.loaded$.subscribe(loaded => this.dataLoaded = loaded);

      this.newVersionAvailable$ = this.firebase.object('app_version').valueChanges().pipe(
        map((value: string) => {
          return semver.ltr(environment.version, value);
        })
      );

      this.dirtyFacade.hasEntries$.subscribe(dirty => this.dirty = dirty);

      // Navigation handle for a proper loader display
      router.events.subscribe((event: RouterEvent) => {
        if (event instanceof NavigationStart) {
          this.navigating = true;
        }
        if (event instanceof NavigationEnd) {
          this.navigating = false;
        }
        if (event instanceof NavigationCancel) {
          this.navigating = false;
        }
        if (event instanceof NavigationError) {
          this.navigating = false;
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
        this.seoService.resetConfig();
        this.overlay = event.url.indexOf('?overlay') > -1;
        this.ipc.send('navigated', event.url);
        this.ipc.on('window-decorator', (e, value) => {
          this.windowDecorator = value;
        });
        if (this.overlay) {
          this.ipc.on(`overlay:${this.ipc.overlayUri}:opacity`, (e, value) => {
            this.overlayOpacity = value;
          });
          this.ipc.send('overlay:get-opacity', { uri: this.ipc.overlayUri });
        }
        const languageIndex = event.url.indexOf('?lang=');
        if (languageIndex > -1) {
          this.use(event.url.substr(languageIndex + 6, 2), false, true);
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
          if (this.platformService.isDesktop() || isPlatformServer(this.platform)) {
            return of(false);
          }
          if (url && url.endsWith('/')) {
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
      this.translate.onLangChange.subscribe(l => this.locale = l);

      this.translate.onLangChange.subscribe(change => {
        this.locale = change.lang;
      });
    } else {
      this.hasDesktop$ = of(false);
      this.newVersionAvailable$ = of(false);
    }

    // Translation
    this.translate.setDefaultLang('en');
    this.use(this.getLang());

    if (this.platformService.isDesktop()) {
      this.ipc.on('apply-language', (e, newLang) => {
        this.use(newLang, true);
      });
      this.ipc.on('download-progress', (event, progress: any) => {
        this.checkingForUpdate = false;
        this.downloading = progress;
      });
    }

    fontawesome.library.add(faDiscord, faTwitter, faGithub, faCalculator, faBell, faMap, faGavel);
  }

  enablePacketCapture(): void {
    this.ipc.machinaToggle = true;
    this.settings.enableUniversalisSourcing = true;
    this.ipc.send('toggle-machina', true);
  }

  getPathname(): string {
    return this.router.url;
  }

  afterPathNameCopy(): void {
    this.message.success(this.translate.instant('Path_copied_to_clipboard'));
  }

  getLang(): string {
    if (isPlatformBrowser(this.platform)) {
      const lang = localStorage.getItem('locale');
      if (lang !== null) {
        return lang;
      } else if (this.translate.getBrowserCultureLang() === 'pt-BR') {
        // Specific implementation for BR.
        return 'br';
      } else {
        return this.translate.getBrowserLang();
      }
    } else {
      const request: any = this.injector.get(REQUEST) || {};
      return request.lang || 'en';
    }
  }

  updateDesktopApp(): void {
    this.ipc.send('update:check');
    this.checkingForUpdate = true;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform)) {
      this.authFacade.loadUser();
      // Loading is !loaded
      this.loading$ = this.authFacade.loaded$.pipe(map(loaded => !loaded));
      this.loggedIn$ = this.authFacade.loggedIn$;
      this.character$ = this.authFacade.mainCharacter$.pipe(shareReplay(1));
      this.notificationsFacade.loadAll();
      this.listsFacade.loadMyLists();
      this.workshopsFacade.loadMyWorkshops();
      this.listsFacade.loadListsWithWriteAccess();
      this.workshopsFacade.loadWorkshopsWithWriteAccess();
      this.teamsFacade.loadMyTeams();
      this.rotationsFacade.loadMyRotations();
      this.customLinksFacade.loadMyCustomLinks();
      this.layoutsFacade.loadAll();
      this.customItemsFacade.loadAll();

      this.user$.subscribe(user => {
        if (!user.patron && !user.admin && this.settings.theme.name === 'CUSTOM') {
          this.settings.theme = Theme.DEFAULT;
        }
      });

      if (this.media.isActive('lt-md')) {
        this.collapsedSidebar = true;
      }

      this.settings.themeChange$.subscribe((change => {
        this.applyTheme(change.next);
      }));
    } else {
      this.loading$ = of(false);
      this.loggedIn$ = of(false);
    }
  }

  private applyTheme(theme: Theme): void {
    if (theme !== undefined) {
      document.documentElement.style.setProperty('--background-color', theme.background);
      document.documentElement.style.setProperty('--primary-color', theme.primary);
      document.documentElement.style.setProperty('--highlight-color', theme.highlight);
      document.documentElement.style.setProperty('--text-color', theme.text);
      document.documentElement.style.setProperty('--topbar-color', theme.topbar);
      document.documentElement.style.setProperty('--sider-trigger-color', theme.trigger);
      document.documentElement.style.setProperty('--sider-trigger-hover-color', theme.triggerHover);
      document.documentElement.style.setProperty('--zero-width-sider-trigger-color', theme.trigger);
    }
  }

  public toggleTimeFormat(): void {
    if (this.settings.timeFormat === '24H') {
      this.settings.timeFormat = '12H';
    } else {
      this.settings.timeFormat = '24H';
    }
    this.reloadTime$.next(null);
  }

  public onNavLinkClick(): void {
    if (this.media.isActive('lt-md')) {
      this.collapsedSidebar = true;
    }
  }

  deleteNotification(notification: AbstractNotification): void {
    this.notificationsFacade.removeNotification(notification.$key);
  }

  openRegisterPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Registration'),
      nzContent: RegisterPopupComponent,
      nzFooter: null
    }).afterClose
      .pipe(delay(1000))
      .subscribe(() => {
        window.location.reload();
      });
  }

  openLoginPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Login'),
      nzContent: LoginPopupComponent,
      nzFooter: null
    }).afterClose.subscribe(() => {
      // HOTFIX
      window.location.reload();
    });
  }

  logOut(): void {
    this.authFacade.logout();
  }

  openedApp(): void {
    if (isPlatformBrowser(this.platform)) {
      setTimeout(() => {
        this.hasDesktopReloader$.next(null);
      }, 30000);
    }
  }

  openLink(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('COMMON.Open_link'),
      nzContent: TextQuestionPopupComponent,
      nzFooter: null
    }).afterClose
      .pipe(
        filter(res => res !== undefined && res.startsWith('https://ffxivteamcraft.com/'))
      )
      .subscribe((data: string) => {
        this.router.navigate(data.replace('https://ffxivteamcraft.com/', '').split('/'));
      });
  }

  use(lang: string, fromIpc = false, skipStorage = false): void {
    if (this.settings.availableLocales.indexOf(lang) === -1) {
      lang = 'en';
    }
    this.locale = lang;
    if (!skipStorage) {
      localStorage.setItem('locale', lang);
    }
    this.translate.use(lang);
    if (!fromIpc) {
      this.ipc.send('language', lang);
    }
  }

  public back(): void {
    window.history.back();
  }

  public forward(): void {
    window.history.forward();
  }

  openSettings(): void {
    this.settingsPopupService.openSettings();
  }

  public openAlarmsOverlay(): void {
    this.ipc.openOverlay('/alarms-overlay', '/alarms-overlay');
  }

  public openFishingOverlay(): void {
    this.ipc.openOverlay('/fishing-reporter-overlay', '/fishing-reporter-overlay');
  }

  public openListPanelOverlay(): void {
    this.ipc.openOverlay('/list-panel-overlay', '/list-panel-overlay');
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload($event: Event): void {
    if (this.dirty && !this.platformService.isDesktop()) {
      $event.returnValue = true;
    }
  }
}
