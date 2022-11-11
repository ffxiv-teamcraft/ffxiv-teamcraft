import { Component, Input, OnInit } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { SettingsService } from '../../settings/settings.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-overlay-container',
  templateUrl: './overlay-container.component.html',
  styleUrls: ['./overlay-container.component.less']
})
export class OverlayContainerComponent implements OnInit {

  @Input()
  uri: string;

  @Input()
  title = 'Alarms overlay';

  public overlayOpacity = 100;

  public alwaysOnTop = true;

  constructor(private ipc: IpcService, public settings: SettingsService, public titleService: Title) {
  }

  close(): void {
    this.ipc.send(`overlay:close`, this.uri);
  }

  setOverlayOpacity(opacity: number): void {
    this.ipc.send('overlay:set-opacity', { uri: this.uri, opacity: opacity / 100 });
  }

  setAlwaysOnTop(onTop: boolean): void {
    this.ipc.send('overlay:set-on-top', { uri: this.uri, onTop: onTop });
  }

  ngOnInit(): void {
    this.ipc.overlayUri = this.uri;
    this.ipc.on(`overlay:${this.uri}:opacity`, (event, value) => {
      this.overlayOpacity = value * 100;
    });
    this.ipc.on(`overlay:${this.uri}:on-top`, (event, value) => {
      this.alwaysOnTop = value;
    });
    this.ipc.send('overlay:get-opacity', { uri: this.uri });
    this.ipc.send('overlay:get-on-top', { uri: this.uri });
    this.titleService.setTitle(`FFXIV Teamcraft - ${this.title}`);
  }
}
