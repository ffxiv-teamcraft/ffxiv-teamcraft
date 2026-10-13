import { Component, Input, OnInit } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { SettingsService } from '../../settings/settings.service';
import { Title } from '@angular/platform-browser';
import { PlatformService } from '../../../core/tools/platform.service';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

import { FormsModule } from '@angular/forms';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-overlay-container',
    templateUrl: './overlay-container.component.html',
    styleUrls: ['./overlay-container.component.less'],
    standalone: true,
    imports: [FlexModule, NzButtonModule, NzIconModule, NzSliderModule, FormsModule, NzSwitchModule]
})
export class OverlayContainerComponent implements OnInit {

  @Input()
  uri: string;

  @Input()
  title = 'Alarms overlay';

  public overlayOpacity = 100;

  public alwaysOnTop = true;

  constructor(private ipc: IpcService, public settings: SettingsService, public titleService: Title,
              private platform: PlatformService) {
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

  private applyCssOpacity(opacity: number): void {
    // The ng-zorro theme sets body { background: #292929 } which would block
    // the transparent OS window from showing the game through. Inline styles
    // have higher specificity than any stylesheet rule, so this reliably
    // overrides the compiled theme background.
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    document.body.style.opacity = String(opacity);
  }

  ngOnInit(): void {
    this.ipc.overlayUri = this.uri;
    this.ipc.on(`overlay:${this.uri}:opacity`, (event, value) => {
      this.overlayOpacity = value * 100;
      // On Linux, window-level opacity is unsupported; apply as CSS instead.
      if (this.platform.isLinux) {
        this.applyCssOpacity(value);
      }
    });
    // Main process sends this channel on Linux whenever opacity changes so that
    // the renderer can apply the value as a CSS opacity.
    this.ipc.on('overlay:css-opacity', (event, value) => {
      this.overlayOpacity = value * 100;
      this.applyCssOpacity(value);
    });
    this.ipc.on(`overlay:${this.uri}:on-top`, (event, value) => {
      this.alwaysOnTop = value;
    });
    this.ipc.send('overlay:get-opacity', { uri: this.uri });
    this.ipc.send('overlay:get-on-top', { uri: this.uri });
    this.titleService.setTitle(`FFXIV Teamcraft - ${this.title}`);
  }
}
