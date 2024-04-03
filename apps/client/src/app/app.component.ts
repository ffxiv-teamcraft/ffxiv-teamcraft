import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  Injector,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { environment } from '../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { IpcService } from './core/electron/ipc.service';
import { ActivationEnd, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { faDiscord, faGithub, faTwitter } from '@fortawesome/fontawesome-free-brands';
import { faBell, faCalculator, faGavel, faMap } from '@fortawesome/fontawesome-free-solid';
import fontawesome from '@fortawesome/fontawesome';
import { catchError, delay, distinctUntilChanged, filter, first, map, shareReplay, skip, startWith, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, fromEvent, Observable, of, Subject } from 'rxjs';
import { AuthFacade } from './+state/auth.facade';
import { Character } from '@xivapi/angular-client';
import { NzIconService } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { RegisterPopupComponent } from './core/auth/register-popup/register-popup.component';
import { LoginPopupComponent } from './core/auth/login-popup/login-popup.component';
import { EorzeanTimeService } from './core/eorzea/eorzean-time.service';
import { ListsFacade } from './modules/list/+state/lists.facade';
import { SettingsService } from './modules/settings/settings.service';
import { TeamsFacade } from './modules/teams/+state/teams.facade';
import { NotificationsFacade } from './modules/notifications/+state/notifications.facade';
import { AbstractNotification } from './core/notification/abstract-notification';
import { PlatformService } from './core/tools/platform.service';
import { SettingsPopupService } from './modules/settings/settings-popup.service';
import { HttpClient } from '@angular/common/http';
import { DirtyFacade } from './core/dirty/+state/dirty.facade';
import { SeoService } from './core/seo/seo.service';
import { Theme } from './modules/settings/theme';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { REQUEST } from '../express.tokens';
import * as semver from 'semver';
import { UniversalisService } from './core/api/universalis.service';
import { TextQuestionPopupComponent } from './modules/text-question-popup/text-question-popup/text-question-popup.component';
import { QuickSearchService } from './modules/quick-search/quick-search.service';
import { Region } from '@ffxiv-teamcraft/types';
import { MappyReporterService } from './core/electron/mappy/mappy-reporter';
import { TutorialService } from './core/tutorial/tutorial.service';
import { ChangelogPopupComponent } from './modules/changelog-popup/changelog-popup/changelog-popup.component';
import { version } from '../environments/version';
import { PlayerMetricsService } from './modules/player-metrics/player-metrics.service';
import { SupportService } from './core/patreon/support.service';
import { UpdaterStatus } from './model/other/updater-status';
import { RemoveAdsPopupComponent } from './modules/ads/remove-ads-popup/remove-ads-popup.component';
import { FreeCompanyWorkshopFacade } from './modules/free-company-workshops/+state/free-company-workshop.facade';
import { Language } from './core/data/language';
import { InventoryService } from './modules/inventory/inventory.service';
import { DataService } from './core/api/data.service';
import { AllaganReportsService } from './pages/allagan-reports/allagan-reports.service';
import { LazyDataFacade } from './lazy-data/+state/lazy-data.facade';
import { IS_HEADLESS } from '../environments/is-headless';
import { LocalStorageBehaviorSubject } from './core/rxjs/local-storage-behavior-subject';
import { Database, objectVal, ref } from '@angular/fire/database';
import { gameEnv } from '../environments/game-env';
import { PacketCaptureStatus } from './core/electron/packet-capture-status';
import { NzBadgeStatusType } from 'ng-zorro-antd/badge/types';
import { InventoryCaptureStatus } from './modules/inventory/inventory-capture-status';
import { PushNotificationsService } from './core/push-notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  public overlay = window.location.href.indexOf('?overlay') > -1;

  public childWindow = this.ipc.isChildWindow;

  public newFeatureName = 'allagan-reports';

  public availableLanguages = this.settings.availableLocales;

  public availableDateLocales = this.settings.availableLocales;

  public pcapStatus$: Observable<NzBadgeStatusType> = this.ipc.pcapStatus$.pipe(
    map((status) => {
      return (<Record<PacketCaptureStatus, NzBadgeStatusType>>{
        [PacketCaptureStatus.STARTING]: 'processing',
        [PacketCaptureStatus.RUNNING]: 'success',
        [PacketCaptureStatus.STOPPED]: 'default',
        [PacketCaptureStatus.ERROR]: 'error',
        [PacketCaptureStatus.WARNING]: 'warning',
      })[status];
    })
  );

  public inventoryStatus$: Observable<NzBadgeStatusType> = this.inventoryService.status$.pipe(
    map((status) => {
      return (<Record<InventoryCaptureStatus, NzBadgeStatusType>>{
        [InventoryCaptureStatus.RUNNING]: 'success',
        [InventoryCaptureStatus.IGNORED_CHAR]: 'default',
        [InventoryCaptureStatus.ERROR]: 'error',
        [InventoryCaptureStatus.UNKNOWN_CHAR]: 'warning',
      })[status];
    })
  );

  public pcapFeaturesStatus$: Observable<NzBadgeStatusType> = combineLatest([this.pcapStatus$, this.inventoryStatus$]).pipe(
    map(([pcap, inventory]) => {
      if (pcap === 'success' && inventory === 'success') {
        return 'success';
      }
      if (inventory === 'warning' || pcap === 'warning') {
        return 'warning';
      }
      if (inventory === 'error' || pcap === 'error') {
        return 'error';
      }
      if (pcap === 'processing') {
        return 'processing';
      }
      return 'default';
    })
  );

  locale: string;

  version = environment.version;

  public titleBreakpoints = {
    785: `TC\nv${this.version}`,
    default: `v${this.version}`,
  };

  public githubStars$ = this.http
    .get<{ stargazers_count: number }>('https://api.github.com/repos/ffxiv-teamcraft/ffxiv-teamcraft')
    .pipe(map((repo) => repo.stargazers_count));

  public overlayOpacity = 1;

  collapsedAlarmsBar$ = new LocalStorageBehaviorSubject('alarms-sidebar:collapsed', true);

  public notifications$ = this.notificationsFacade.notificationsDisplay$.pipe(isPlatformServer(this.platform) || IS_HEADLESS ? first() : tap());

  public loadingLazyData$ = this.lazyDataFacade.isLoading$;

  public loggedIn$: Observable<boolean>;

  public character$: Observable<Character | { loading: boolean }>;

  public otherCharacters$: Observable<Partial<Character>[]>;

  public userId$ = this.authFacade.userId$.pipe(isPlatformServer(this.platform) || IS_HEADLESS ? first() : tap());

  public user$ = this.authFacade.user$.pipe(isPlatformServer(this.platform) || IS_HEADLESS ? first() : tap());

  public loading$: Observable<boolean>;

  public time$: Observable<string>;

  public desktop = false;

  public hasDesktop$: Observable<boolean>;

  public navigating = !IS_HEADLESS;

  public newVersionAvailable$: Observable<boolean>;

  public updateVersion$: Observable<string>;

  public pcapOutDated$: Observable<boolean>;

  public dataLoaded = false;

  public breakpointDebug = environment.breakpointDebug;

  public desktopLoading$ = new BehaviorSubject(this.platformService.isDesktop() && !this.overlay);

  public showChildWindowTip = localStorage.getItem('child-window-tip-closed') !== 'true';

  public showDesktopTip = localStorage.getItem('desktop-tip-closed') !== 'true';

  public showSupporterIssueBanner = localStorage.getItem('show-supporter-issue-closed') !== 'true';

  UpdaterStatus = UpdaterStatus;

  public checkingForUpdate$ = new BehaviorSubject<number>(UpdaterStatus.NO_UPDATE);

  public emptyInventory$: Observable<boolean>;

  public unknownContentId$: Observable<boolean>;

  public pinnedList$ = this.listsFacade.pinnedList$;

  public suggestedRegion: Region = null;

  public showAd$ = this.authFacade.user$.pipe(
    map((user) => {
      return !(user.admin || user.moderator || user.supporter);
    }),
    shareReplay(1)
  );

  public showPatreonButton$ = this.authFacade.user$.pipe(
    map((user) => {
      return !user.supporter;
    })
  );

  @ViewChild('vmAdRef')
  public vmAdRef: ElementRef;

  public allaganReportsQueueCount$: Observable<number> = of(0);

  public allaganReportsUnappliedCount$: Observable<number> = of(0);

  private reloadTime$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  private hasDesktopReloader$ = new BehaviorSubject<void>(null);

  private dirty = false;

  public currentLink = () => `https://ffxivteamcraft.com${window.location.hash.replace('#', '')}`;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public translate: TranslateService,
    public ipc: IpcService,
    private router: Router,
    private firebase: Database,
    private authFacade: AuthFacade,
    private dialog: NzModalService,
    private eorzeanTime: EorzeanTimeService,
    public listsFacade: ListsFacade,
    public settings: SettingsService,
    public teamsFacade: TeamsFacade,
    private notificationsFacade: NotificationsFacade,
    private iconService: NzIconService,
    public platformService: PlatformService,
    private settingsPopupService: SettingsPopupService,
    private http: HttpClient,
    private lazyDataFacade: LazyDataFacade,
    private dirtyFacade: DirtyFacade,
    private seoService: SeoService,
    private injector: Injector,
    private universalis: UniversalisService,
    private inventoryService: InventoryService,
    @Inject(PLATFORM_ID) private platform: any,
    private quickSearch: QuickSearchService,
    public mappy: MappyReporterService,
    private tutorialService: TutorialService,
    private playerMetricsService: PlayerMetricsService,
    private patreonService: SupportService,
    private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade,
    private cd: ChangeDetectorRef,
    private data: DataService,
    private allaganReportsService: AllaganReportsService,
    pushNotificationsService: PushNotificationsService
  ) {
    if (pushNotificationsService.isSupported() && pushNotificationsService.permission === 'default') {
      pushNotificationsService.requestPermission();
    }

    this.desktop = this.platformService.isDesktop();

    this.allaganReportsQueueCount$ = this.allaganReportsService.getReportsCount();
    this.allaganReportsUnappliedCount$ = this.allaganReportsService.getUnappliedCount();

    fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
      this.handleKeypressShortcuts(event);
    });

    this.applyTheme(this.settings.theme);

    this.iconService.fetchFromIconfont({ scriptUrl: 'https://at.alicdn.com/t/c/font_931253_yqf3nprxput.js' });

    this.time$ = this.reloadTime$.pipe(
      switchMap(() => {
        return this.eorzeanTime.getEorzeanTime().pipe(
          map((date) => {
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
      isPlatformServer(this.platform) || IS_HEADLESS ? first() : tap()
    );

    if (isPlatformServer(this.platform) || IS_HEADLESS) {
      this.dataLoaded = true;
      this.emptyInventory$ = of(false);
      this.unknownContentId$ = of(false);
    }
    this.translate.setDefaultLang('en');

    if (isPlatformBrowser(this.platform) && !IS_HEADLESS) {
      // Preload item names and icons !
      this.lazyDataFacade.preloadEntry('items');
      this.lazyDataFacade.preloadEntry('rarities');
      this.lazyDataFacade.preloadEntry('itemIcons');
      this.lazyDataFacade.preloadEntry('extracts');
      // Translation
      this.use(this.getLang());
      if (this.platformService.isDesktop()) {
        this.ipc.on('displayed', () => {
          setTimeout(() => {
            window.resizeBy(100, 100);
          }, 50);
          setTimeout(() => {
            window.resizeBy(-100, -100);
          }, 60);
        });
        this.emptyInventory$ = this.inventoryService.inventory$.pipe(
          map((inventory) => {
            return inventory.contentId && Object.keys(inventory.items[inventory.contentId]).length === 0;
          })
        );
        this.unknownContentId$ = this.inventoryService.inventory$.pipe(
          map((inventory) => {
            return !inventory.contentId;
          })
        );
        this.universalis.initCapture();
      }
      this.freeCompanyWorkshopFacade.init();

      objectVal<string>(ref(this.firebase, 'maintenance'))
        .pipe(isPlatformServer(this.platform) || IS_HEADLESS ? first() : tap())
        .subscribe((maintenance) => {
          if (maintenance && environment.production) {
            this.router.navigate(['maintenance']);
          }
        });

      objectVal<string>(ref(this.firebase, 'version_lock'))
        .pipe(isPlatformServer(this.platform) || IS_HEADLESS ? first() : tap())
        .subscribe((v) => {
          if (semver.ltr(environment.version, v)) {
            this.router.navigate(['version-lock']);
          }
        });

      this.updateVersion$ = objectVal<string>(ref(this.firebase, 'app_version'));

      this.newVersionAvailable$ = this.updateVersion$.pipe(
        map((value: string) => {
          return semver.ltr(environment.version, value);
        }),
        tap((update) => {
          if (update && this.settings.autoDownloadUpdate) {
            this.updateDesktopApp();
          } else {
            this.checkingForUpdate$.next(UpdaterStatus.UPDATE_AVAILABLE);
          }
        })
      );

      const language$ = this.translate.onLangChange.pipe(
        map((event) => event.lang),
        startWith(this.translate.currentLang)
      )

      const region$ = this.settings.regionChange$.pipe(
        map((change) => change.next),
        startWith(this.settings.region)
      );

      this.pcapOutDated$ = combineLatest([region$, objectVal<typeof gameEnv>(ref(this.firebase, 'game_versions'))]).pipe(
        map(([region, value]) => {
          let key: string;
          switch (region) {
            case Region.Korea:
              key = 'koreanGameVersion';
              break;
            case Region.China:
              key = 'chineseGameVersion';
              break;
            default:
              key = 'globalGameVersion';
              break;
          }
          return value[key] > environment[key];
        })
      );

      combineLatest([language$, region$]).subscribe(([lang, region]) => {
        let suggestedRegion;
        switch (lang) {
          case 'ko':
            suggestedRegion = Region.Korea;
            break;
          case 'zh':
            suggestedRegion = Region.China;
            break;
          default:
            suggestedRegion = Region.Global;
            break;
        }

        this.suggestedRegion = region === suggestedRegion ? null : suggestedRegion;
      });

      this.dirtyFacade.hasEntries$.subscribe((dirty) => (this.dirty = dirty));

      // Navigation handle for a proper loader display
      router.events.subscribe((event) => {
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

       // Subscribe to events again but only for title update
      router.events.pipe(
        filter(event => event instanceof ActivationEnd && event.snapshot.data.title),
        switchMap((event: ActivationEnd) => {
          return this.translate.onLangChange.pipe(
            startWith(this.translate.currentLang),
            switchMap(() => this.translate.get(event.snapshot.data.title))
          );
        })
      ).subscribe(title => {
        this.seoService.setConfig({
          title: `${title} - FFXIV Teamcraft`
        });
      });

      // Google Analytics & patreon popup stuff
      router.events
        .pipe(
          distinctUntilChanged((previous: any, current: any) => {
            if (current instanceof NavigationEnd) {
              return previous.url === current.url;
            }
            return true;
          })
        )
        .subscribe((event: any) => {
          this.tutorialService.reset();
          if (this.overlay) {
            this.ipc.on(`overlay:${this.ipc.overlayUri}:opacity`, (e, value) => {
              this.overlayOpacity = value;
            });
            this.ipc.send('overlay:get-opacity', { uri: this.ipc.overlayUri });
          } else if (event.url !== '/') {
            this.ipc.send('navigated', event.url);
          }
          const languageIndex = event.url.indexOf('?lang=');
          if (languageIndex > -1) {
            this.use(event.url.substr(languageIndex + 6, 2), false, true);
          }
        });

      // Custom protocol detection
      this.hasDesktop$ = this.hasDesktopReloader$.pipe(
        switchMap(() => router.events),
        filter((current) => current instanceof NavigationEnd),
        first(),
        switchMap((current: NavigationEnd) => {
          let url = current.url;
          if (!this.settings.autoOpenInDesktop || url.indexOf('noDesktop=') > -1) {
            return of(false);
          }
          if (this.platformService.isDesktop() || isPlatformServer(this.platform) || IS_HEADLESS) {
            return of(false);
          }
          if (url && url.endsWith('/')) {
            url = url.substring(0, url.length - 1);
          }
          return this.http.get('http://localhost:14500/', { responseType: 'text' }).pipe(
            map(() => true),
            tap((hasDesktop) => {
              if (hasDesktop) {
                window.location.assign(`teamcraft://${url}`);
              }
            }),
            catchError((e) => {
              console.log(e);
              return of(false);
            })
          );
        })
      );
      this.translate.onLangChange.subscribe((l) => (this.locale = l.lang as Language));

      this.translate.onLangChange.subscribe((change) => {
        this.locale = change.lang;
      });
    } else {
      this.hasDesktop$ = of(false);
      this.newVersionAvailable$ = of(false);
    }

    if (this.platformService.isDesktop()) {
      this.ipc.on('apply-language', (e, newLang) => {
        this.use(newLang, true);
      });
      if (!this.overlay) {
        if (this.settings.xivapiKey && this.settings.enableMappy) {
          this.mappy.start();
        }
        this.playerMetricsService.start();
        setTimeout(() => {
          this.ipc.send('app-ready', true);
          this.ipc.send('log', `VERSION: ${environment.version}`);
          this.dataLoaded = true;
          this.desktopLoading$.next(false);
          this.cd.detectChanges();
        }, 1500);
      }
    }

    fontawesome.library.add(faDiscord, faTwitter, faGithub, faCalculator, faBell, faMap, faGavel);
  }

  startPcap(): void {
    this.ipc.send('toggle-pcap', true);
    this.ipc.send('pcap:restart');
  }

  public openSupportPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('COMMON.Support_us_remove_ads'),
      nzContent: RemoveAdsPopupComponent,
      nzFooter: null,
    });
  }

  enablePacketCapture(): void {
    this.ipc.pcapToggle$.next(true);
    this.settings.enableUniversalisSourcing = true;
    this.ipc.send('toggle-pcap', true);
  }

  showPatchNotes(): Observable<any> {
    const res$ = new Subject<void>();
    this.translate
      .get('Patch_notes')
      .pipe(
        switchMap((title) => {
          return this.dialog
            .create({
              nzTitle: title,
              nzContent: ChangelogPopupComponent,
              nzFooter: null,
              nzStyle: {
                'z-index': 10000,
              },
            })
            .afterClose.pipe(
              tap(() => {
                this.settings.lastChangesSeen = version;
              })
            );
        })
      )
      .subscribe(() => res$.next());
    return res$;
  }

  changeToSuggestedRegion(): void {
    if (!this.suggestedRegion) return;

    this.settings.region = this.suggestedRegion;
  }

  getPathname(): string {
    return this.router.url;
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

  hideFeatureBanner(): void {
    localStorage.setItem(`new-feature:${this.newFeatureName}`, 'true');
  }

  updateDesktopApp(): void {
    this.ipc.send('update:check');
    this.checkingForUpdate$.next(UpdaterStatus.DOWNLOADING);
    this.checkingForUpdate$
      .pipe(
        filter((status) => status === UpdaterStatus.NO_UPDATE || status === UpdaterStatus.UPDATE_AVAILABLE),
        startWith(null),
        skip(1),
        first()
      )
      .subscribe((status) => {
        if (status === null) {
          this.checkingForUpdate$.next(UpdaterStatus.POSSIBLE_ERROR);
        }
      });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform) && !IS_HEADLESS) {
      setTimeout(() => {
        this.hideFeatureBanner();
      }, 2000);
      this.authFacade.loadUser();
      // Loading is !loaded
      this.loading$ = this.authFacade.loaded$.pipe(map((loaded) => !loaded));
      this.loggedIn$ = this.authFacade.loggedIn$;

      this.character$ = this.authFacade.mainCharacter$.pipe(shareReplay({ bufferSize: 1, refCount: true }), startWith({ loading: true }));

      this.otherCharacters$ = combineLatest([this.authFacade.characters$, this.authFacade.mainCharacter$]).pipe(
        map(([entries, mainChar]) => {
          return entries.map((entry) => entry.Character).filter((e) => e.ID !== mainChar.ID);
        })
      );

      this.notificationsFacade.loadAll();

      let increasedPageViews = false;

      this.user$.subscribe((user) => {
        if (!user.supporter && !user.admin && this.settings.theme.name === 'CUSTOM') {
          this.settings.theme = Theme.DEFAULT;
        }
        if (!user.supporter && !increasedPageViews && !this.overlay && !this.childWindow) {
          const viewTriggersForPatreonPopup = [20, 200, 500];
          this.settings.pageViews++;
          increasedPageViews = true;
          if (viewTriggersForPatreonPopup.indexOf(this.settings.pageViews) > -1) {
            this.patreonService.showSupportUsPopup();
          }
        }
      });

      this.settings.themeChange$.subscribe((change) => {
        this.applyTheme(change.next);
      });
    } else {
      this.loading$ = of(false);
      this.loggedIn$ = of(false);
    }

    const lastChangesSeen = this.settings.lastChangesSeen;
    if (this.settings.autoShowPatchNotes && semver.gt(version, lastChangesSeen) && !this.overlay && !IS_HEADLESS) {
      this.showPatchNotes();
    }
    this.dataLoaded = true;
  }

  switchCharacter(id: number): void {
    this.authFacade.setDefaultCharacter(id);
  }

  hexToRgbA(hex: string, opacity: number) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${opacity})`;
    }
    throw new Error('Bad Hex');
  }

  public toggleTimeFormat(): void {
    if (this.settings.timeFormat === '24H') {
      this.settings.timeFormat = '12H';
    } else {
      this.settings.timeFormat = '24H';
    }
    this.reloadTime$.next(null);
  }

  public disableAutoOpen(): void {
    this.settings.autoOpenInDesktop = false;
    window.location.reload();
  }

  deleteNotification(notification: AbstractNotification): void {
    this.notificationsFacade.removeNotification(notification.$key);
  }

  openRegisterPopup(): void {
    this.dialog
      .create({
        nzTitle: this.translate.instant('Registration'),
        nzContent: RegisterPopupComponent,
        nzFooter: null,
      })
      .afterClose.pipe(delay(1000))
      .subscribe(() => {
        window.location.reload();
      });
  }

  openLoginPopup(): void {
    this.dialog
      .create({
        nzTitle: this.translate.instant('Login'),
        nzContent: LoginPopupComponent,
        nzFooter: null,
      })
      .afterClose.subscribe((res) => {
        if (res) {
          // HOTFIX
          window.location.reload();
        }
      });
  }

  logOut(): void {
    this.authFacade.logout();
  }

  openInApp(): void {
    if (isPlatformBrowser(this.platform) && !IS_HEADLESS) {
      this.http
        .get(`http://localhost:14500${window.location.pathname}`)
        .pipe(
          map(() => true),
          catchError(() => {
            return of(false);
          })
        )
        .subscribe((opened) => {
          if (!opened) {
            window.open(`teamcraft://${window.location.pathname}`);
          }
        });
      setTimeout(() => {
        this.hasDesktopReloader$.next(null);
      }, 30000);
    }
  }

  openLink(): void {
    this.dialog
      .create({
        nzTitle: this.translate.instant('COMMON.Open_link'),
        nzContent: TextQuestionPopupComponent,
        nzFooter: null,
      })
      .afterClose.pipe(filter((res) => res !== undefined && res.startsWith('https://ffxivteamcraft.com/')))
      .subscribe((data: string) => {
        this.router.navigate(data.replace('https://ffxivteamcraft.com/', '').split('/'));
      });
  }

  openInBrowser(url: string): void {
    this.ipc.send('open-link', url);
  }

  use(lang: string, fromIpc = false, skipStorage = false): void {
    if (this.settings.availableLocales.indexOf(lang) === -1) {
      lang = 'en';
    }
    this.locale = lang;
    this.data.setSearchLang(lang as Language);
    this.settings.searchLanguage = lang as Language;
    if (!skipStorage) {
      localStorage.setItem('locale', lang);
    }
    this.translate.use(lang);
    if (!fromIpc) {
      this.ipc.send('language', lang);
    }
    this.document.documentElement.lang = lang;
  }

  startTutorial(): void {
    this.tutorialService.play(true);
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

  public openOverlay(uri: string): void {
    this.ipc.openOverlay(uri);
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload($event: Event): void {
    if (this.dirty && !this.platformService.isDesktop()) {
      $event.returnValue = true;
    }
  }

  private handleKeypressShortcuts(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && [187, 107].includes(event.keyCode)) {
      return this.ipc.send('zoom-in');
    }
    if ((event.ctrlKey || event.metaKey) && [54, 109].includes(event.keyCode)) {
      return this.ipc.send('zoom-out');
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'F') {
      this.quickSearch.openQuickSearch();
    } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
      this.router.navigateByUrl('/admin/users');
    } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'M') {
      this.router.navigateByUrl('/mappy');
    } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
      event.preventDefault();
      event.stopPropagation();
      if (this.platformService.isDesktop()) {
        this.openLink();
      } else {
        this.openInApp();
      }
    }
  }

  private applyTheme(theme: Theme): void {
    if (theme !== undefined) {
      document.documentElement.style.setProperty('--background-color', theme.background);
      document.documentElement.style.setProperty('--primary-color', theme.primary);
      document.documentElement.style.setProperty('--primary-color-50', this.hexToRgbA(theme.primary, 0.5));
      document.documentElement.style.setProperty('--primary-color-25', this.hexToRgbA(theme.primary, 0.25));
      document.documentElement.style.setProperty('--highlight-color', theme.highlight);
      document.documentElement.style.setProperty('--highlight-color-50', this.hexToRgbA(theme.highlight, 0.5));
      document.documentElement.style.setProperty('--highlight-color-25', this.hexToRgbA(theme.highlight, 0.25));
      document.documentElement.style.setProperty('--text-color', theme.text);
      document.documentElement.style.setProperty('--topbar-color', theme.topbar);
      document.documentElement.style.setProperty('--sider-trigger-color', theme.trigger);
      document.documentElement.style.setProperty('--sider-trigger-hover-color', theme.triggerHover);
      document.documentElement.style.setProperty('--zero-width-sider-trigger-color', theme.trigger);
    }
  }

  hideChildWindowTip(): void {
    this.showChildWindowTip = false;
    localStorage.setItem('child-window-tip-closed', 'true');
  }

  hideDesktopTip(): void {
    this.showChildWindowTip = false;
    localStorage.setItem('desktop-tip-closed', 'true');
  }

  newChildWindow(): void {
    this.ipc.send('child:new', this.router.url);
  }
}
