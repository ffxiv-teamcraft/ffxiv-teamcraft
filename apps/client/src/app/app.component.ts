import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Injector, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { environment } from '../environments/environment';
import { GarlandToolsService } from './core/api/garland-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { IpcService } from './core/electron/ipc.service';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent } from '@angular/router';
import { faDiscord, faGithub, faTwitter } from '@fortawesome/fontawesome-free-brands';
import { faBell, faCalculator, faGavel, faMap } from '@fortawesome/fontawesome-free-solid';
import fontawesome from '@fortawesome/fontawesome';
import { catchError, delay, distinctUntilChanged, filter, first, map, mapTo, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthFacade } from './+state/auth.facade';
import { Character } from '@xivapi/angular-client';
import { NzIconService } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
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
import { BehaviorSubject, combineLatest, fromEvent, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
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
import { UniversalisService } from './core/api/universalis.service';
import { TextQuestionPopupComponent } from './modules/text-question-popup/text-question-popup/text-question-popup.component';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { QuickSearchService } from './modules/quick-search/quick-search.service';
import { Region } from './modules/settings/region.enum';
import { MappyReporterService } from './core/electron/mappy/mappy-reporter';
import { TutorialService } from './core/tutorial/tutorial.service';
import { ChangelogPopupComponent } from './modules/changelog-popup/changelog-popup/changelog-popup.component';
import { version } from '../environments/version';
import { PlayerMetricsService } from './modules/player-metrics/player-metrics.service';
import { PatreonService } from './core/patreon/patreon.service';
import { UpdaterStatus } from './model/other/updater-status';
import { RemoveAdsPopupComponent } from './modules/ads/remove-ads-popup/remove-ads-popup.component';
import { FreeCompanyWorkshopFacade } from './modules/free-company-workshops/+state/free-company-workshop.facade';
import { Language } from './core/data/language';
import { InventoryService } from './modules/inventory/inventory.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  public availableLanguages = this.settings.availableLocales;

  locale: string;

  version = environment.version;

  public adsPlacementBreakpoints = {
    475: null,
    1350: '601845b9cf90756a43f6c4f8',
    default: '601845ad7730eb16d35ec25a'
  };

  public titleBreakpoints = {
    785: `TC\nv${this.version}`,
    default: `FFXIV&nbsp;Teamcraft&nbsp;v${this.version}`
  };

  public get overlay() {
    return window.location.href.indexOf('?overlay') > -1;
  }

  public overlayOpacity = 1;

  collapsedAlarmsBar = true;

  public notifications$ = this.notificationsFacade.notificationsDisplay$.pipe(
    isPlatformServer(this.platform) ? first() : tap()
  );

  public loggedIn$: Observable<boolean>;

  public character$: Observable<Character & { Datacenter: string }>;

  public otherCharacters$: Observable<Character[]>;

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

  public updateVersion$: Observable<string>;

  public pcapOutDated$: Observable<boolean>;

  public dataLoaded = false;

  public showGiveaway = false;

  private dirty = false;

  UpdaterStatus = UpdaterStatus;
  public checkingForUpdate$ = new BehaviorSubject<number>(UpdaterStatus.NO_UPDATE);

  public emptyInventory$: Observable<boolean>;

  public unknownContentId$: Observable<boolean>;

  public pinnedList$ = this.listsFacade.pinnedList$;

  public suggestedRegion: Region = null;

  public possibleMissingFirewallRule$ = this.ipc.possibleMissingFirewallRule$;

  public firewallRuleApplied = false;

  public showAd$ = this.authFacade.user$.pipe(
    map(user => {
      return !this.platformService.isDesktop() && !(user.admin || user.moderator || user.patron);
    })
  );

  public showPatreonButton$ = this.authFacade.user$.pipe(
    map(user => {
      return !user.patron;
    })
  );

  @ViewChild('vmAdRef')
  public vmAdRef: ElementRef;

  constructor(private gt: GarlandToolsService, public translate: TranslateService,
              public ipc: IpcService, private router: Router, private firebase: AngularFireDatabase,
              private authFacade: AuthFacade, private dialog: NzModalService, private eorzeanTime: EorzeanTimeService,
              public listsFacade: ListsFacade, private workshopsFacade: WorkshopsFacade, public settings: SettingsService,
              public teamsFacade: TeamsFacade, private notificationsFacade: NotificationsFacade,
              private iconService: NzIconService, private rotationsFacade: RotationsFacade, public platformService: PlatformService,
              private settingsPopupService: SettingsPopupService, private http: HttpClient, private sanitizer: DomSanitizer,
              private customLinksFacade: CustomLinksFacade, private renderer: Renderer2, private media: MediaObserver,
              private layoutsFacade: LayoutsFacade, private lazyData: LazyDataService, private customItemsFacade: CustomItemsFacade,
              private dirtyFacade: DirtyFacade, private seoService: SeoService, private injector: Injector,
              private message: NzMessageService, private universalis: UniversalisService,
              private inventoryService: InventoryService, @Inject(PLATFORM_ID) private platform: Object,
              private quickSearch: QuickSearchService, public mappy: MappyReporterService,
              apollo: Apollo, httpLink: HttpLink, private tutorialService: TutorialService,
              private playerMetricsService: PlayerMetricsService, private patreonService: PatreonService,
              private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade, private cd: ChangeDetectorRef) {

    fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
      this.handleKeypressShortcuts(event);
    });

    const link = httpLink.create({ uri: 'https://gubal.hasura.app/v1/graphql' });

    apollo.create({
      link: link,
      cache: new InMemoryCache({
        addTypename: false
      })
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
      this.unknownContentId$ = of(false);
    }

    if (isPlatformBrowser(this.platform)) {
      if (this.platformService.isDesktop()) {
        this.emptyInventory$ = this.inventoryService.inventory$.pipe(
          map(inventory => {
            return inventory.contentId && Object.keys(inventory.items[inventory.contentId]).length === 0;
          })
        );
        this.unknownContentId$ = this.inventoryService.inventory$.pipe(
          map(inventory => {
            return !inventory.contentId;
          })
        );
        this.universalis.initCapture();
      }
      this.freeCompanyWorkshopFacade.init();

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
        .subscribe(v => {
          if (semver.ltr(environment.version, v)) {
            this.router.navigate(['version-lock']);
          }
        });

      this.lazyData.loaded$
        .pipe(
          switchMap((loaded) => {
            this.dataLoaded = loaded;
            if (!loaded) {
              return of(false);
            }
            const lastChangesSeen = this.settings.lastChangesSeen;
            if (this.settings.autoShowPatchNotes && semver.gt(version, lastChangesSeen) && !this.overlay) {
              return this.showPatchNotes();
            } else {
              return of(null);
            }
          })
        )
        .subscribe((loaded) => {
          if (loaded) {
            this.tutorialService.applicationReady();
          }
        });

      this.updateVersion$ = this.firebase.object<string>('app_version').valueChanges();

      this.newVersionAvailable$ = this.updateVersion$
        .pipe(
          map((value: string) => {
            return semver.ltr(environment.version, value);
          }),
          tap(update => {
            if (update && this.settings.autoDownloadUpdate) {
              this.updateDesktopApp();
            } else {
              this.checkingForUpdate$.next(UpdaterStatus.UPDATE_AVAILABLE);
            }
          })
        );

      const language$ = this.translate.onLangChange.pipe(
        map(event => event.lang),
        startWith(this.translate.currentLang)
      );

      const region$ = this.settings.regionChange$.pipe(
        map(change => change.next),
        startWith(this.settings.region)
      );

      this.pcapOutDated$ = combineLatest([region$, this.firebase.object('game_versions').valueChanges()]).pipe(
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

      // Google Analytics & patreon popup stuff
      router.events
        .pipe(
          distinctUntilChanged((previous: any, current: any) => {
            if (current instanceof NavigationEnd) {
              return previous.url === current.url;
            }
            return true;
          })
        ).subscribe((event: any) => {
        this.tutorialService.reset();
        this.seoService.resetConfig();
        this.ipc.send('navigated', event.url);
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
      this.translate.onLangChange.subscribe(l => this.locale = l.lang as Language);

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
      if (!this.overlay) {
        this.lazyData.data$
          .pipe(
            filter(data => data !== undefined),
            first(),
            delay(5000)
          )
          .subscribe(() => {
            if (this.settings.xivapiKey && this.settings.enableMappy) {
              this.mappy.start();
            }
            this.playerMetricsService.start();
            setTimeout(() => {
              this.ipc.send('app-ready', true);
              this.cd.detectChanges();
            }, 500);
            // This is a super ugly fix for the app freezing on startup for some random electron reason
            // We're just forcing the change detector to update more often even if frozen, so it'll eventually unfreeze
            // After 10s of forcing, it should be enough to fix the issue.
            // really looking forward to a real solution tho...
            const interval = setInterval(() => {
              this.cd.detectChanges();
            }, 500);
            setTimeout(() => {
              clearInterval(interval);
            }, 10000);
          });
      }
    }

    fontawesome.library.add(faDiscord, faTwitter, faGithub, faCalculator, faBell, faMap, faGavel);
  }

  public openSupportPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('COMMON.Support_us_remove_ads'),
      nzContent: RemoveAdsPopupComponent,
      nzFooter: null
    });
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

  enablePacketCapture(): void {
    this.ipc.machinaToggle$.next(true);
    this.settings.enableUniversalisSourcing = true;
    this.ipc.send('toggle-machina', true);
  }

  applyFirewallRule(): void {
    this.ipc.once('machina:firewall:rule-set', () => {
      this.firewallRuleApplied = true;
      this.message.success(this.translate.instant('PACKET_CAPTURE.Firewall_rule_set'));
    });
    this.ipc.send('machina:firewall:set-rule');
  }

  showPatchNotes(): Observable<any> {
    const res$ = new Subject();
    this.dialog.create({
      nzTitle: this.translate.instant('Patch_notes', { version: environment.version }),
      nzContent: ChangelogPopupComponent,
      nzFooter: null,
      nzStyle: {
        'z-index': 10000
      }
    }).afterClose
      .pipe(
        tap(() => {
          this.settings.lastChangesSeen = version;
        })
      ).subscribe(() => res$.next());
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

  updateDesktopApp(): void {
    this.ipc.send('update:check');
    this.checkingForUpdate$.next(UpdaterStatus.DOWNLOADING);
    // After 5 minutes, maybe there's something wrong in the update download...
    setTimeout(() => {
      this.checkingForUpdate$.next(UpdaterStatus.POSSIBLE_ERROR);
    }, 300000);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform)) {
      this.authFacade.loadUser();
      // Loading is !loaded
      this.loading$ = this.authFacade.loaded$.pipe(map(loaded => !loaded));
      this.loggedIn$ = this.authFacade.loggedIn$;

      this.character$ = this.authFacade.mainCharacter$.pipe(
        map(character => {
          return {
            ...character,
            Datacenter: this.lazyData.getDataCenter(character.Server)
          };
        }),
        shareReplay(1)
      );

      this.otherCharacters$ = combineLatest([this.authFacade.characters$, this.authFacade.mainCharacter$]).pipe(
        map(([entries, mainChar]) => {
          return entries.map(entry => entry.Character).filter(e => e.ID !== mainChar.ID);
        })
      );

      this.notificationsFacade.loadAll();
      this.customLinksFacade.loadMyCustomLinks();

      let increasedPageViews = false;

      this.user$.subscribe(user => {
        if (!user.patron && !user.admin && this.settings.theme.name === 'CUSTOM') {
          this.settings.theme = Theme.DEFAULT;
        }
        if (!user.patron && !increasedPageViews) {
          const viewTriggersForPatreonPopup = [20, 200, 500];
          this.settings.pageViews++;
          increasedPageViews = true;
          if (viewTriggersForPatreonPopup.indexOf(this.settings.pageViews) > -1) {
            this.patreonService.showSupportUsPopup();
          }
        }
      });

      this.settings.themeChange$.subscribe((change => {
        this.applyTheme(change.next);
      }));
    } else {
      this.loading$ = of(false);
      this.loggedIn$ = of(false);
    }
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

  private applyTheme(theme: Theme): void {
    if (theme !== undefined) {
      document.documentElement.style.setProperty('--background-color', theme.background);
      document.documentElement.style.setProperty('--primary-color', theme.primary);
      document.documentElement.style.setProperty('--primary-color-50', this.hexToRgbA(theme.primary, 0.50));
      document.documentElement.style.setProperty('--primary-color-25', this.hexToRgbA(theme.primary, 0.25));
      document.documentElement.style.setProperty('--highlight-color', theme.highlight);
      document.documentElement.style.setProperty('--highlight-color-50', this.hexToRgbA(theme.highlight, 0.50));
      document.documentElement.style.setProperty('--highlight-color-25', this.hexToRgbA(theme.highlight, 0.25));
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
    }).afterClose.subscribe((res) => {
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
    if (isPlatformBrowser(this.platform)) {
      this.http.get(`http://localhost:14500${window.location.pathname}`).pipe(
        mapTo(true),
        catchError(() => {
          return of(false);
        })
      ).subscribe(opened => {
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

  openInBrowser(url: string): void {
    this.ipc.send('open-link', url);
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
}
