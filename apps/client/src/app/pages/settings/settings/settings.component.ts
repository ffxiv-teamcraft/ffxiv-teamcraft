import { Component } from '@angular/core';
import { SettingsService } from '../settings.service';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from '../../../app.component';
import { IpcService } from '../../../core/electron/ipc.service';
import { PlatformService } from '../../../core/tools/platform.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  linkBases = [
    { name: 'Xivdb', value: 'XIVDB' },
    { name: 'Garland Tools', value: 'GARLAND_TOOLS' },
    { name: 'Gamer Escape', value: 'GAMER_ESCAPE' }
    // {name: 'Lodestone', value: 'LODESTONE'}, TODO
  ];

  themes = ['dark-orange', 'light-orange', 'light-teal', 'dark-teal', 'light-brown',
    'light-amber', 'dark-amber', 'light-green', 'dark-lime', 'light-lime',
    'dark-cyan', 'light-cyan', 'dark-indigo', 'light-indigo', 'dark-blue', 'light-blue',
    'dark-deep-purple', 'light-deep-purple', 'dark-red', 'light-red', 'dark-pink', 'light-pink'];

  locale: string;

  public locales: string[] = AppComponent.LOCALES;

  alwaysOnTop = false;

  checkingForUpdate = false;

  updateAvailable: boolean;

  downloadProgress: any = {
    bytesPerSecond: 0,
    percent: 0,
    total: 0,
    transferred: 0
  };

  constructor(public settings: SettingsService,
              private translate: TranslateService,
              private ipc: IpcService,
              public platform: PlatformService) {
    this.locale = this.translate.currentLang;
    translate.onLangChange.subscribe(change => {
      this.locale = change.lang;
    });
    this.ipc.on('always-on-top:value', (event, value) => {
      this.alwaysOnTop = value;
    });
    this.ipc.send('always-on-top:get');

    this.ipc.on('checking-for-update', () => {
      this.checkingForUpdate = true;
    });

    this.ipc.on('update-available', (event, available: boolean) => {
      this.checkingForUpdate = false;
      this.updateAvailable = available;
    });

    this.ipc.on('download-progress', (event, progress: any) => {
      this.downloadProgress = progress;
    });
  }

  alwaysOnTopChange(): void {
    this.ipc.send('always-on-top', this.alwaysOnTop);
  }

  checkForUpdate(): void {
    this.ipc.send('update:check');
  }

  use(lang: string): void {
    if (AppComponent.LOCALES.indexOf(lang) === -1) {
      lang = 'en';
    }
    this.locale = lang;
    localStorage.setItem('locale', lang);
    this.translate.use(lang);
  }
}
