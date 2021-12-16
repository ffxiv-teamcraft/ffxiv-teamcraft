import { Injectable } from '@angular/core';
import { SettingsService } from '../modules/settings/settings.service';
import { Region } from '../modules/settings/region.enum';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  constructor(private settings: SettingsService) {
  }

  public get gameVersion(): number {
    switch (this.settings.region) {
      case Region.China:
        return environment.chineseGameVersion;
      case Region.Korea:
        return environment.koreanGameVersion;
      case Region.Global:
        return environment.globalGameVersion;
    }
  }

  public get maxLevel(): number {
    if (this.gameVersion >= 6) {
      return 90;
    }
    return 80;
  }
}
