import { Injectable } from '@angular/core';
import { PlatformService } from './platform.service';

@Injectable()
export class LinkToolsService {

  constructor(private platformService: PlatformService) {
  }

  public getLink(target: string): string {
    // If we're inside Electron, create a direct Teamcraft link.
    if (this.platformService.isDesktop()) {
      return `https://ffxivteamcraft.com/${target}`;
    } else {
      return `${window.location.protocol}//${window.location.host}/${target}`;
    }
  }

}
