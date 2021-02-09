import { Component } from '@angular/core';
import { SettingsService } from '../settings.service';
import { TranslateService } from '@ngx-translate/core';
import { PlatformService } from '../../../core/tools/platform.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { AngularFireAuth } from '@angular/fire/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { IpcService } from '../../../core/electron/ipc.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../core/database/user.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { CustomLinksFacade } from '../../custom-links/+state/custom-links.facade';
import { CustomLink } from '../../../core/database/custom-links/custom-link';
import { Theme } from '../theme';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { InventoryFacade } from '../../inventory/+state/inventory.facade';
import { uniq } from 'lodash';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { MappyReporterService } from '../../../core/electron/mappy/mappy-reporter';
import { from, Subscription } from 'rxjs';
import { NavigationSidebarService } from '../../navigation-sidebar/navigation-sidebar.service';
import { Observable } from 'rxjs/Observable';
import { SidebarItem } from '../../navigation-sidebar/sidebar-entry';
import { saveAs } from 'file-saver';

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

  machinaToggle = false;

  startMinimized = false;

  alwaysQuit = true;

  noShortcut = false;

  metricsPath = '';

  watchFilesPath = '';

  proxyType: '' | 'http' | 'https' | 'socks4' | 'socks5' | 'pac' | 'custom' = '';

  proxyValue = '';

  proxyBypass = '';

  customTheme: Theme;

  sounds = ['Confirm', 'Full_Party', 'Feature_unlocked'];

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
    }
  ];

  public sidebarItems$: Observable<SidebarItem[]> = this.navigationSidebarService.allLinks$.pipe(first());

  public allAetherytes = this.lazyData.data.aetherytes.filter(a => a.nameid !== 0);

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

  constructor(public settings: SettingsService, public translate: TranslateService,
              public platform: PlatformService, private authFacade: AuthFacade,
              private af: AngularFireAuth, private message: NzMessageService,
              public ipc: IpcService, private router: Router, private http: HttpClient,
              private userService: UserService, private customLinksFacade: CustomLinksFacade,
              private dialog: NzModalService, private inventoryFacade: InventoryFacade,
              private lazyData: LazyDataService, private mappy: MappyReporterService,
              private navigationSidebarService: NavigationSidebarService) {

    this.ipc.once('always-on-top:value', (event, value) => {
      this.alwaysOnTop = value;
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
    this.ipc.send('no-shortcut:get');
    this.ipc.send('toggle-machina:get');
    this.ipc.send('start-minimized:get');
    this.ipc.send('always-quit:get');
    this.ipc.send('proxy-rule:get');
    this.ipc.send('proxy-bypass:get');
    this.ipc.send('proxy-pac:get');
    this.ipc.send('metrics:path:get');
    this.ipc.send('dat:path:get');
    this.ipc.send('rawsock:get');
    this.customTheme = this.settings.customTheme;
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

  alwaysOnTopChange(value: boolean): void {
    this.ipc.send('always-on-top', value);
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
      } catch (e) {
        console.error(e);
        this.message.error(this.translate.instant('SETTINGS.Import_error'));
      }
    };
    // Read in the image file as a data URL.
    reader.readAsText(event.file);
    return new Subscription();
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
    });
  }

  clearCache(): void {
    this.ipc.send('clear-cache');
  }

  clearSearchHistory(): void {
    localStorage.removeItem('search:history');
  }

  patreonOauth(): void {
    if (this.platform.isDesktop()) {
      this.ipc.once('oauth-reply', (event, code) => {
        this.http.get(`https://us-central1-ffxivteamcraft.cloudfunctions.net/patreon-oauth?code=${code}&redirect_uri=http://localhost`)
          .pipe(
            switchMap((response: any) => {
              return this.authFacade.user$.pipe(
                first(),
                map(user => {
                  user.patreonToken = response.access_token;
                  user.patreonRefreshToken = response.refresh_token;
                  user.lastPatreonRefresh = Date.now();
                  return user;
                }),
                tap(updatedUser => {
                  this.authFacade.updateUser(updatedUser);
                  this.message.success(this.translate.instant('Patreon_login_success'));
                  this.router.navigate(['/']);
                })
              );
            })
          ).subscribe();
      });
      this.ipc.send('oauth', 'patreon.com');
    } else {
      window.open(`https://www.patreon.com/oauth2/authorize?response_type=code&client_id=MMmud8pCDGgQkhd8H2g_SpRWgzvCYwyawjSqmvjl_pjOA7Yco6Cp-Ljv8InmGMUE&redirect_uri=${
        window.location.protocol}//${window.location.host}/patreon-redirect&scope=identity`);
    }
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

  public previewSound(): void {
    let audio: HTMLAudioElement;
    audio = new Audio(`./assets/audio/${this.settings.autofillCompletionSound}.mp3`);
    audio.loop = false;
    audio.volume = this.settings.autofillCompletionVolume;
    audio.play();
  }

  public setVolume(volume: number): void {
    this.settings.autofillCompletionVolume = volume;
    this.previewSound();
  }

  public setSound(sound: string): void {
    this.settings.autofillCompletionSound = sound;
    this.previewSound();
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
