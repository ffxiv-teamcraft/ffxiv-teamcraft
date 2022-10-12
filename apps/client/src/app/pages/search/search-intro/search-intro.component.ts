import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PlatformService } from '../../../core/tools/platform.service';
import { Database, objectVal, ref } from '@angular/fire/database';

interface FeatureEntry {
  link: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-search-intro',
  templateUrl: './search-intro.component.html',
  styleUrls: ['./search-intro.component.less']
})
export class SearchIntroComponent {

  counter$ = objectVal<string>(ref(this.firebase, 'lists_created'));

  features: FeatureEntry[] = [
    {
      link: '/lists',
      title: 'Lists',
      description: 'Lists'
    },
    {
      link: '/community-lists',
      title: 'Public_lists',
      description: 'Public_lists'
    },
    {
      link: '/alarms',
      title: 'ALARMS.Title',
      description: 'Alarms'
    },
    {
      link: '/gathering-location',
      title: 'GATHERING_LOCATIONS.Title',
      description: 'Gathering_location'
    },
    {
      link: '/rotations',
      title: 'SIMULATOR.Rotations',
      description: 'Rotations'
    },
    {
      link: '/levequests',
      title: 'LEVEQUESTS.Title',
      description: 'Levequests'
    },
    {
      link: '/macro-translator',
      title: 'MACRO_TRANSLATION.Title',
      description: 'Macro_translation'
    }
  ];

  constructor(private firebase: Database, public translate: TranslateService,
              public platform: PlatformService) {
  }

}
