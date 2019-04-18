import { Component } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-alarms-overlay',
  templateUrl: './alarms-overlay.component.html',
  styleUrls: ['./alarms-overlay.component.less']
})
export class AlarmsOverlayComponent {

  public overlayOpacity = 100;

  constructor(private ipc: IpcService, public settings: SettingsService, public title: Title) {
    this.ipc.overlayUri = '/alarms-overlay';
    this.ipc.on(`overlay:/alarms-overlay:opacity`, (event, value) => {
      this.overlayOpacity = value * 100;
    });
    this.ipc.send('overlay:get-opacity', { uri: '/alarms-overlay' });
    this.title.setTitle('FFXIV Teamcraft - Alarms overlay');
  }

  close(): void {
    window.close();
  }

  setOverlayOpacity(opacity: number): void {
    this.ipc.send('overlay:set-opacity', { uri: '/alarms-overlay', opacity: opacity / 100 });
  }
}
