import { Injectable } from '@angular/core';
import { SettingsService } from '../modules/settings/settings.service';
import { Region } from '@ffxiv-teamcraft/types';
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
    return 100;
  }

  public get maxIlvl(): number {
    return 760;
  }

  public get maxSubmarineRank() : number {
    if (this.gameVersion < 7.2) {
      return 125
    }
    return 130;
  }
}
