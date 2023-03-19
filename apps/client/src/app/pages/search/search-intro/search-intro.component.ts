import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {PlatformService} from '../../../core/tools/platform.service';
import {Database, objectVal, ref} from '@angular/fire/database';
import {GuidesService} from "../../../core/database/guides.service";
import {where} from "@angular/fire/firestore";
import {Observable} from "rxjs";
import {TeamcraftGuide} from "../../../core/database/guides/teamcraft-guide";
import {SidebarIconType} from "../../../modules/navigation-sidebar/sidebar-icon-type";
import {SidebarEntry} from "../../../modules/navigation-sidebar/sidebar-entry";
import {DomSanitizer} from "@angular/platform-browser";

interface FeatureEntry {
  link: string;
  title: string;
  description: string;
  icon: SidebarEntry['icon']
}

@Component({
  selector: 'app-search-intro',
  templateUrl: './search-intro.component.html',
  styleUrls: ['./search-intro.component.less']
})
export class SearchIntroComponent {

  SidebarIconType = SidebarIconType;

  features: FeatureEntry[] = [
    {
      link: '/lists',
      title: 'Lists',
      description: 'Lists',
      icon: {
        type: SidebarIconType.ANTD,
        content: 'profile'
      },
    },
    {
      link: '/gathering-location',
      title: 'GATHERING_LOCATIONS.Title',
      description: 'Gathering_location',
      icon: {
        type: SidebarIconType.ANTD,
        content: 'environment-o'
      }
    },
    {
      link: '/simulator',
      title: 'SIMULATOR.Title',
      description: 'Rotations',
      icon: {
        type: SidebarIconType.COMPANION_SVG,
        content: this.sanitizer.bypassSecurityTrustHtml('&#xF239;')
      }
    },
    {
      link: '/island-workshop',
      title: 'SIDEBAR.Island_Sanctuary',
      description: 'Island_sanctuary',
      icon: {
        type: SidebarIconType.ANTD_ICONFONT,
        content: 'icon-tree'
      }
    }
  ];

  counter$ = objectVal<string>(ref(this.firebase, 'lists_created'));

  guides$: Observable<TeamcraftGuide[]> = this.guidesService.query(where('featured', "==", true));

  constructor(private firebase: Database, public translate: TranslateService,
              public platform: PlatformService, private guidesService: GuidesService,
              private sanitizer: DomSanitizer) {
  }

}
