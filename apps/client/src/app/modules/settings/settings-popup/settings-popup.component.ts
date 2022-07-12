import { Component } from '@angular/core';
import { SettingsService } from '../settings.service';
import { TranslateService } from '@ngx-translate/core';
import { PlatformService } from '../../../core/tools/platform.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, first, map, shareReplay, switchMap } from 'rxjs/operators';
import { IpcService } from '../../../core/electron/ipc.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../core/database/user.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { CustomLinksFacade } from '../../custom-links/+state/custom-links.facade';
import { CustomLink } from '../../../core/database/custom-links/custom-link';
import { Theme } from '../theme';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { uniq } from 'lodash';
import { MappyReporterService } from '../../../core/electron/mappy/mappy-reporter';
import { from, Observable, Subject } from 'rxjs';
import { NavigationSidebarService } from '../../navigation-sidebar/navigation-sidebar.service';
import { SidebarItem } from '../../navigation-sidebar/sidebar-entry';
import { saveAs } from 'file-saver';
import { PatreonService } from '../../../core/patreon/patreon.service';
import { InventoryService } from '../../inventory/inventory.service';
import { NotificationSettings } from '../notification-settings';
import { SoundNotificationType } from '../../../core/sound-notification/sound-notification-type';
import { SoundNotificationService } from '../../../core/sound-notification/sound-notification.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-settings-popup',
  templateUrl: './settings-popup.component.html',
  styleUrls: ['./settings-popup.component.less']
})
export class SettingsPopupComponent {

  selectedTab = 0;

  availableLanguages = this.settings.availableLocales;

  availableRegions = this.settings.availableRegions;

  loggedIn$ = this.authFacade.loggedIn$;

  user$ = this.authFacade.user$;

  nicknameAvailable: boolean;

  availableThemes = Theme.ALL_THEMES;

  alwaysOnTop = false;

  disableInitialNavigation = false;

  machinaToggle = false;

  startMinimized = false;

  alwaysQuit = true;

  enableMinimizeReduceButton = false;

  noShortcut = false;

  metricsPath = '';

  watchFilesPath = '';

  proxyType: '' | 'http' | 'https' | 'socks4' | 'socks5' | 'pac' | 'custom' = '';

  proxyValue = '';

  proxyBypass = '';

  customTheme: Theme;

  sounds = ['Confirm', 'Feature_unlocked', 'Full_Party', 'LB_charged', 'Notification', 'Wondrous_tales'];

  rawsock = false;

  startingPlaces = [
    {
      id: 12,
      placenameId: 500
    },
    {
      id: 13,
      placenameId: 504
    },
    {
      id: 2,
      placenameId: 506
    },
    {
      id: 111,
      placenameId: 513
    },
    {
      id: 133,
      placenameId: 516
    },
    {
      id: 134,
      placenameId: 517
    },
    {
      id: 218,
      placenameId: 512
    },
    {
      id: 182,
      placenameId: 3706
    },
    {
      id: 183,
      placenameId: 3707
    }
  ];

  public sidebarItems$: Observable<SidebarItem[]> = this.navigationSidebarService.allLinks$.pipe(first());

  public allAetherytes$ = this.lazyData.getEntry('aetherytes').pipe(
    map(aetherytes => aetherytes.filter(a => a.nameid !== 0)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public sidebarFavorites = [...this.settings.sidebarFavorites];

  public favoriteAetherytes = [...this.settings.favoriteAetherytes];

  public ignoredInventories = [...this.settings.ignoredInventories];

  public inventories$ = this.inventoryFacade.inventory$.pipe(
    map(inventory => {
      return uniq(inventory
        .toArray()
        .map(item => this.inventoryFacade.getContainerTranslateKey(item)));
    })
  );

  public notificationSettings: Record<string, NotificationSettings> = {
    [SoundNotificationType.ALARM]: this.settings.getNotificationSettings(SoundNotificationType.ALARM),
    [SoundNotificationType.RESET_TIMER]: this.settings.getNotificationSettings(SoundNotificationType.RESET_TIMER),
    [SoundNotificationType.AUTOFILL]: this.settings.getNotificationSettings(SoundNotificationType.AUTOFILL),
    [SoundNotificationType.RETAINER]: this.settings.getNotificationSettings(SoundNotificationType.RETAINER),
    [SoundNotificationType.VOYAGE]: this.settings.getNotificationSettings(SoundNotificationType.VOYAGE)
  };

  public enableCustomSound: Record<string, boolean> = Object.entries<NotificationSettings>(this.notificationSettings)
    .reduce((acc, [key, entry]) => {
      return {
        ...acc,
        [key]: entry.sound.includes(':')
      };
    }, {});

  constructor(public settings: SettingsService, public translate: TranslateService,
              public platform: PlatformService, private authFacade: AuthFacade,
              private af: AngularFireAuth, private message: NzMessageService,
              public ipc: IpcService, private router: Router, private http: HttpClient,
              private userService: UserService, private customLinksFacade: CustomLinksFacade,
              private dialog: NzModalService, private inventoryFacade: InventoryService,
              private lazyData: LazyDataFacade, private mappy: MappyReporterService,
              private navigationSidebarService: NavigationSidebarService, private patreonService: PatreonService,
              private soundNotificationService: SoundNotificationService) {
    this.ipc.once('always-on-top:value', (event, value) => {
      this.alwaysOnTop = value;
    });
    this.ipc.once('disable-initial-navigation', (event, value) => {
      this.disableInitialNavigation = value;
    });
    this.ipc.on('toggle-machina:value', (event, value) => {
      this.machinaToggle = value;
    });
    this.ipc.once('start-minimized:value', (event, value) => {
      this.startMinimized = value;
    });
    this.ipc.once('always-quit:value', (event, value) => {
      this.alwaysQuit = value;
    });
    this.ipc.once('enable-minimize-reduction-button:value', (event, value) => {
      this.enableMinimizeReduceButton = value;
    });
    this.ipc.once('no-shortcut:value', (event, value) => {
      this.noShortcut = value;
    });
    this.ipc.on('metrics:path:value', (event, value) => {
      this.metricsPath = value;
    });
    this.ipc.on('dat:path:value', (event, value) => {
      this.watchFilesPath = value;
    });
    this.ipc.once('proxy-rule:value', (event, value: string) => {
      if (!value) {
        if (this.proxyType !== 'pac') {
          this.proxyType = '';
          this.proxyValue = '';
        }

        return;
      }

      // https://www.electronjs.org/docs/api/session#sessetproxyconfig
      if ([';', '=', ','].some(chr => value.includes(chr))) {
        this.proxyType = 'custom';
        this.proxyValue = value;
        return;
      }

      let [scheme, host] = value.split('://');
      if (!host) {
        host = scheme;
        scheme = 'http';
      } else if (!['http', 'https', 'socks4', 'socks5'].includes(scheme)) {
        this.proxyType = 'custom';
        this.proxyValue = value;
        return;
      }

      this.proxyType = scheme as any;
      this.proxyValue = host;
    });
    this.ipc.on('rawsock:value', (event, value) => {
      this.rawsock = value;
    });
    this.ipc.once('proxy-bypass:value', (event, value) => {
      this.proxyBypass = value;
    });
    this.ipc.once('proxy-pac:value', (event, value) => {
      if (value) {
        this.proxyType = 'pac';
        this.proxyValue = value;
      }
    });
    this.ipc.send('always-on-top:get');
    this.ipc.send('disable-initial-navigation:get');
    this.ipc.send('no-shortcut:get');
    this.ipc.send('toggle-machina:get');
    this.ipc.send('start-minimized:get');
    this.ipc.send('always-quit:get');
    this.ipc.send('enable-minimize-reduction-button:get');
    this.ipc.send('proxy-rule:get');
    this.ipc.send('proxy-bypass:get');
    this.ipc.send('proxy-pac:get');
    this.ipc.send('metrics:path:get');
    this.ipc.send('dat:path:get');
    this.ipc.send('rawsock:get');
    this.customTheme = this.settings.customTheme;
  }

  public get trackItemsOnSale(): boolean {
    return localStorage.getItem('trackItemsOnSale') === 'true';
  }

  public set trackItemsOnSale(trackItemsOnSale: boolean) {
    localStorage.setItem('trackItemsOnSale', trackItemsOnSale.toString());
  }

  public get proxyExample(): string {
    switch (this.proxyType) {
      case '':
        return '';
      case 'pac':
        return 'http://127.0.0.1:1080/pac';
      case 'custom':
        const help = 'https://www.electronjs.org/docs/api/session#sessetproxyconfig';
        return `<a href="${help}" target="_blank">${help}</a>`;
      default:
        return '127.0.0.1:8080';
    }
  }

  changeMetricsPath(): void {
    this.ipc.send('metrics:path:set');
  }

  changeWatchFilesPath(): void {
    this.ipc.send('dat:path:set');
  }

  setProxy({ rule = '', pac = '' } = {}): void {
    this.ipc.send('proxy-rule', rule || '');
    this.ipc.send('proxy-pac', pac || '');
  }

  commitProxy(): void {
    if (this.proxyType === '') {
      this.setProxy();
      return;
    }

    if (!this.proxyValue) {
      // Wait for value changes
      return;
    }

    switch (this.proxyType) {
      case 'custom':
        this.setProxy({ rule: this.proxyValue });
        break;
      case 'pac':
        this.setProxy({ pac: this.proxyValue });
        break;
      default:
        this.setProxy({ rule: `${this.proxyType}://${this.proxyValue}` });
        break;
    }
  }

  reloadGubalToken(): void {
    this.authFacade.reloadGubalToken().subscribe(() => {
      this.message.success('Gubal token reloaded successfully');
    });
  }

  alwaysOnTopChange(value: boolean): void {
    this.ipc.send('always-on-top', value);
  }

  disableInitialNavigationChange(value: boolean): void {
    this.ipc.send('disable-initial-navigation', value);
  }

  noShortcutChange(value: boolean): void {
    this.ipc.send('no-shortcut', value);
  }

  startMinimizedChange(value: boolean): void {
    this.ipc.send('start-minimized', value);
  }

  alwaysQuitChange(value: boolean): void {
    this.ipc.send('always-quit', value);
  }

  enableMinimizeReduceButtonChange(value: boolean): void {
    this.ipc.send('enable-minimize-reduction-button', value);
  }

  startMappy(): void {
    if (!this.mappy.available) {
      this.mappy.start();
    }
  }

  machinaToggleChange(value: boolean): void {
    if (value) {
      this.settings.enableUniversalisSourcing = true;
    }
    this.ipc.send('toggle-machina', value);
  }

  rawsockChange(value: boolean): void {
    this.ipc.send('rawsock', value);
  }

  openDesktopConsole(): void {
    this.ipc.send('show-devtools');
  }

  downloadSettings(): void {
    const blob = new Blob([JSON.stringify(this.settings.cache)], { type: 'text/plain;charset:utf-8' });
    saveAs(blob, `settings.json`);
  }

  public handleFile = (event: any) => {
    const res$ = new Subject<void>();
    const reader = new FileReader();
    let data = '';
    reader.onload = ((_) => {
      return (e) => {
        data += e.target.result;
      };
    })(event.file);
    reader.onloadend = () => {
      try {
        this.settings.cache = JSON.parse(data);
        if (this.ipc) {
          this.ipc.send('apply-settings', { ...this.settings.cache });
        }
        this.settings.settingsChange$.next('');
        this.message.success(this.translate.instant('SETTINGS.Import_successful'));
        res$.next();
        res$.complete();
      } catch (e) {
        console.error(e);
        this.message.error(this.translate.instant('SETTINGS.Import_error'));
        res$.error(e);
      }
    };
    // Read in the image file as a data URL.
    reader.readAsText(event.file);
    return res$.subscribe();
  };

  resetLinkedChars(): void {
    this.authFacade.user$.pipe(
      first(),
      map(user => {
        user.lodestoneIds = user.lodestoneIds.map(entry => {
          delete entry.contentId;
          return entry;
        });
        return user;
      })
    ).subscribe(user => {
      this.authFacade.updateUser(user);
      this.message.success(this.translate.instant('SETTINGS.Reset_linked_characters_ok'));
    });
  }

  resetIgnoredChars(): void {
    this.settings.ignoredContentIds = [];
    this.message.success(this.translate.instant('SETTINGS.Reset_ignored_characters_ok'));
  }

  clearCache(): void {
    this.ipc.send('clear-cache');
  }

  clearSearchHistory(): void {
    localStorage.removeItem('search:history');
  }

  patreonOauth(): void {
    this.patreonService.patreonOauth();
  }

  resetPassword(): void {
    this.af.user.pipe(
      switchMap(user => {
        return from(this.af.sendPasswordResetEmail(user.email));
      })).subscribe(() => {
      this.message.success(this.translate.instant('SETTINGS.Password_reset_mail_sent'));
    });
  }

  updateEmail(): void {
    this.af.user.pipe(
      switchMap(user => {
        return this.dialog.create({
          nzContent: NameQuestionPopupComponent,
          nzComponentParams: {
            type: 'email',
            baseName: user.email
          },
          nzFooter: null,
          nzTitle: this.translate.instant('SETTINGS.Change_email')
        }).afterClose;
      }),
      filter(email => email !== undefined),
      switchMap(email => this.authFacade.changeEmail(email))
    ).subscribe(() => {
      this.message.success(this.translate.instant('SETTINGS.Change_email_success'));
    });
  }

  checkNicknameAvailability(nickname: string): void {
    this.userService.checkNicknameAvailability(nickname).pipe(first()).subscribe(res => this.nicknameAvailable = res);
  }

  setNickname(user: TeamcraftUser, nickname: string): void {
    this.customLinksFacade.myCustomLinks$.pipe(
      first(),
      map((links: CustomLink[]) => links.map(link => {
        link.authorNickname = nickname;
        return link;
      }))
    ).subscribe(links => {
      links.forEach(link => this.customLinksFacade.updateCustomLink(link));
      user.nickname = nickname;
      this.authFacade.updateUser(user);
    });
  }

  setLanguage(lang: string): void {
    localStorage.setItem('locale', lang);
    this.translate.use(lang);
    this.ipc.send('language', lang);
  }

  saveCustomTheme(): void {
    this.settings.customTheme = this.customTheme;
  }

  setTheme(themeName: string): void {
    this.settings.theme = Theme.byName(themeName) || this.settings.customTheme;
    if (themeName === 'CUSTOM') {
      this.saveCustomTheme();
    }
  }

  public previewSound(type: SoundNotificationType): void {
    this.soundNotificationService.play(type);
  }

  public setNotificationVolume(type: SoundNotificationType, volume: number): void {
    this.notificationSettings[type].volume = volume;
    this.settings.setNotificationSettings(type, this.notificationSettings[type]);
    this.previewSound(type);
  }

  public setNotificationSound(type: SoundNotificationType, sound: string): void {
    if (['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.mp4', '.wma', '.aac'].some(ext => sound.endsWith(ext)) || this.sounds.includes(sound)) {
      this.notificationSettings[type].sound = sound;
      this.settings.setNotificationSettings(type, this.notificationSettings[type]);
      this.previewSound(type);
    }
  }

  public onMappyEnableChange(enabled: boolean): void {
    if (enabled) {
      this.mappy.start();
    } else {
      this.mappy.stop();
    }
  }

  public disconnectPatreon(user: TeamcraftUser): void {
    delete user.patreonToken;
    delete user.patreonRefreshToken;
    delete user.lastPatreonRefresh;
    this.authFacade.updateUser(user);
  }

}
