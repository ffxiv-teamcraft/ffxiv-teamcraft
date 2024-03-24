import { Component } from '@angular/core';
import { SettingsService } from '../settings.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../core/tools/platform.service';
import { AuthFacade } from '../../../+state/auth.facade';
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
import { uniq, uniqBy } from 'lodash';
import { MappyReporterService } from '../../../core/electron/mappy/mappy-reporter';
import { Observable, Subject } from 'rxjs';
import { NavigationSidebarService } from '../../navigation-sidebar/navigation-sidebar.service';
import { SidebarItem } from '../../navigation-sidebar/sidebar-entry';
import { saveAs } from 'file-saver';
import { SupportService } from '../../../core/patreon/support.service';
import { InventoryService } from '../../inventory/inventory.service';
import { NotificationSettings } from '../notification-settings';
import { SoundNotificationType } from '../../../core/sound-notification/sound-notification-type';
import { SoundNotificationService } from '../../../core/sound-notification/sound-notification.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { AetheryteNamePipe } from '../../../pipes/pipes/aetheryte-name.pipe';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ColorPickerModule } from 'ngx-color-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NgFor, NgIf, NgTemplateOutlet, AsyncPipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
    selector: 'app-settings-popup',
    templateUrl: './settings-popup.component.html',
    styleUrls: ['./settings-popup.component.less'],
    standalone: true,
    imports: [NzTabsModule, FlexModule, NzGridModule, NzFormModule, NzSelectModule, FormsModule, NgFor, NgIf, NzCheckboxModule, NzDividerModule, ColorPickerModule, NzButtonModule, NzWaveModule, NzSwitchModule, NzInputNumberModule, NzIconModule, NzUploadModule, NzPopconfirmModule, NzToolTipModule, NzInputModule, NzSliderModule, NgTemplateOutlet, NzCardModule, AsyncPipe, UpperCasePipe, TranslateModule, AetheryteNamePipe, I18nPipe, I18nRowPipe]
})
export class SettingsPopupComponent {

  selectedTab = 0;

  availableLanguages = this.settings.availableLocales;

  availableDateLocales = this.settings.availableDateLocales;

  availableRegions = this.settings.availableRegions;

  loggedIn$ = this.authFacade.loggedIn$;

  user$ = this.authFacade.user$;

  nicknameAvailable: boolean;

  availableThemes = Theme.ALL_THEMES;

  alwaysOnTop = false;

  disableInitialNavigation = false;

  pcapToggle = false;

  startMinimized = false;

  ha = true;

  alwaysQuit = true;

  enableMinimizeReduceButton = false;

  noShortcut = false;

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

  housingMaps$ = this.lazyData.getEntry('maps').pipe(
    map(maps => uniqBy(Object.values(maps).filter(v => v.housing), v => v.placename_id))
  );

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
    [SoundNotificationType.VOYAGE]: this.settings.getNotificationSettings(SoundNotificationType.VOYAGE),
    [SoundNotificationType.FISH_TRAIN]: this.settings.getNotificationSettings(SoundNotificationType.FISH_TRAIN)
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
              private auth: Auth, private message: NzMessageService,
              public ipc: IpcService, private userService: UserService, private customLinksFacade: CustomLinksFacade,
              private dialog: NzModalService, private inventoryFacade: InventoryService,
              private lazyData: LazyDataFacade, private mappy: MappyReporterService,
              private navigationSidebarService: NavigationSidebarService, private patreonService: SupportService,
              private soundNotificationService: SoundNotificationService) {
    this.ipc.once('always-on-top:value', (event, value) => {
      this.alwaysOnTop = value;
    });
    this.ipc.once('disable-initial-navigation', (event, value) => {
      this.disableInitialNavigation = value;
    });
    this.ipc.pcapToggle$.subscribe((value) => {
      this.pcapToggle = value;
    });
    this.ipc.once('start-minimized:value', (event, value) => {
      this.startMinimized = value;
    });
    this.ipc.once('hardware-acceleration:enable:value', (event, value) => {
      this.ha = value;
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
    this.ipc.send('start-minimized:get');
    this.ipc.send('hardware-acceleration:enable:get');
    this.ipc.send('always-quit:get');
    this.ipc.send('enable-minimize-reduction-button:get');
    this.ipc.send('proxy-rule:get');
    this.ipc.send('proxy-bypass:get');
    this.ipc.send('proxy-pac:get');
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
        return `<a href="https://www.electronjs.org/docs/api/session#sessetproxyconfig" target="_blank">https://www.electronjs.org/docs/api/session#sessetproxyconfig</a>`;
      default:
        return '127.0.0.1:8080';
    }
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

  haChange(value: boolean): void {
    this.ipc.send('hardware-acceleration:enable', value);
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

  pcapToggleChange(value: boolean): void {
    if (value) {
      this.settings.enableUniversalisSourcing = true;
    }
    this.ipc.send('toggle-pcap', value);
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

  tipeeeOauth(): void {
    this.patreonService.tipeeeOauth();
  }

  resetPassword(): void {
    sendPasswordResetEmail(this.auth, this.auth.currentUser.email).then(() => {
      this.message.success(this.translate.instant('SETTINGS.Password_reset_mail_sent'));
    });
  }

  updateEmail(): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzData: {
        type: 'email',
        baseName: this.auth.currentUser.email
      },
      nzFooter: null,
      nzTitle: this.translate.instant('SETTINGS.Change_email')
    }).afterClose
      .pipe(
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

  setDateLocale(dateLang: string): void {
    this.settings.dateFormat = dateLang;
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

  public disconnectTipeee(user: TeamcraftUser): void {
    delete user.tipeeeToken;
    delete user.tipeeeRefreshToken;
    delete user.lastTipeeeRefresh;
    delete user.supporterUntil;
    this.authFacade.updateUser(user);
  }

}
