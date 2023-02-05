import { Pipe, PipeTransform } from '@angular/core';
import { Region } from '@ffxiv-teamcraft/types';
import { SettingsService } from '../../modules/settings/settings.service';

@Pipe({
  name: 'ifRegions',
  pure: false
})
export class IfRegionsPipe implements PipeTransform {

  constructor(private settings: SettingsService) {
  }

  transform(input: any, regions: Region[], ifregions: any): any {
    return regions.indexOf(this.settings.region) > -1 ? ifregions : input;
  }

}
