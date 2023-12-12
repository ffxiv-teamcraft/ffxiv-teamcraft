import { Component } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../core/tools/platform.service';
import { Database, objectVal, ref } from '@angular/fire/database';
import { GuidesService } from '../../../core/database/guides.service';
import { where } from '@angular/fire/firestore';
import { Observable, timer } from 'rxjs';
import { TeamcraftGuide } from '../../../core/database/guides/teamcraft-guide';
import { SidebarIconType } from '../../../modules/navigation-sidebar/sidebar-icon-type';
import { SidebarEntry } from '../../../modules/navigation-sidebar/sidebar-entry';
import { DomSanitizer } from '@angular/platform-browser';
import { RemoveAdsPopupComponent } from '../../../modules/ads/remove-ads-popup/remove-ads-popup.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { first, map, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { cachedFirebaseValue } from '../../../core/rxjs/cached-firebase-value';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { RouterLink } from '@angular/router';
import { PirschEventDirective } from '../../../core/analytics/pirsch-event.directive';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NgIf, NgSwitch, NgSwitchCase, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';

interface FeatureEntry {
  link: string;
  title: string;
  description: string;
  icon: SidebarEntry['icon'];
}

@Component({
    selector: 'app-search-intro',
    templateUrl: './search-intro.component.html',
    styleUrls: ['./search-intro.component.less'],
    standalone: true,
    imports: [NgIf, NzDividerModule, NzGridModule, NzButtonModule, NzIconModule, NzWaveModule, NzCardModule, NzListModule, NgSwitch, NgSwitchCase, PirschEventDirective, RouterLink, NgFor, NzTypographyModule, AsyncPipe, DecimalPipe, TranslateModule]
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
      }
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

  counter$ = cachedFirebaseValue<number>(this.firebase, 'lists_created', 60000);

  guides$: Observable<TeamcraftGuide[]> = this.guidesService.query(where('featured', '==', true));

  public showPatreonButton$ = this.authFacade.user$.pipe(
    map(user => {
      return !user.supporter;
    })
  );

  constructor(private firebase: Database, public translate: TranslateService,
              public platform: PlatformService, private guidesService: GuidesService,
              private sanitizer: DomSanitizer, private dialog: NzModalService,
              private authFacade: AuthFacade) {
  }

  openSupportPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('COMMON.Support_us_remove_ads'),
      nzContent: RemoveAdsPopupComponent,
      nzFooter: null
    });
  }

}
