import { Component } from '@angular/core';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { AriyalaLinkParser } from '../../../pages/lists/list-import-popup/link-parser/ariyala-link-parser';
import { Observable } from 'rxjs';
import { GearsetsFacade } from '../+state/gearsets.facade';
import { GearsetsComparison } from '../../../model/gearset/gearsets-comparison';
import { filter, first, map } from 'rxjs/operators';
import { GearsetComparatorService } from '../gearset-comparator.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-gearset-comparator-popup',
  templateUrl: './gearset-comparator-popup.component.html',
  styleUrls: ['./gearset-comparator-popup.component.less']
})
export class GearsetComparatorPopupComponent {

  public static EXTERNAL_REGEXP = /https?:\/\/ffxivteamcraft\.com\/gearset\/([a-zA-Z0-9]+)/i;

  gearset: TeamcraftGearset;

  comparisonTypes = ['Ariyala', 'External_gearset', 'Personal_gearset'];

  comparisonType: string;

  importLinkSupported: boolean;

  ariyalaLink: string;

  externalGearsetLink: string;

  myGearsets$: Observable<TeamcraftGearset[]> = this.gearsetsFacade.myGearsets$;

  personalGearset: TeamcraftGearset;

  loading = false;

  error = false;

  result$: Observable<GearsetsComparison>;

  includeAllTools: boolean;

  constructor(private gearsetsFacade: GearsetsFacade, private comparator: GearsetComparatorService,
              public translate: TranslateService) {
    this.gearsetsFacade.loadAll();
  }

  public updateLinkSupport(): void {
    if (this.ariyalaLink === undefined) {
      return;
    }
    this.importLinkSupported = AriyalaLinkParser.REGEXP.test(this.ariyalaLink);
  }

  public updateGearsetLinkSupported(): void {
    if (this.externalGearsetLink === undefined) {
      return;
    }
    this.importLinkSupported = GearsetComparatorPopupComponent.EXTERNAL_REGEXP.test(this.externalGearsetLink);
  }

  public compare(): void {
    this.loading = true;
    try {
      switch (this.comparisonType) {
        case 'Ariyala':
          this.gearsetsFacade.fromAriyalaLink(this.ariyalaLink).pipe(
            first()
          ).subscribe(gearsetFromAriyala => {
            if (gearsetFromAriyala === null) {
              this.error = true;
            } else {
              try {
                this.result$ = this.comparator.compare(this.gearset, gearsetFromAriyala, this.includeAllTools);
              } catch (e) {
                this.error = true;
                this.loading = false;
              }
            }
            this.loading = false;
          });
          break;
        case 'Personal_gearset':
          this.result$ = this.comparator.compare(this.gearset, this.personalGearset, this.includeAllTools);
          this.loading = false;
          break;
        case 'External_gearset':
          const split = this.externalGearsetLink.split('/');
          const key = split[split.length - 1];
          this.gearsetsFacade.load(key);
          this.gearsetsFacade.allGearsets$.pipe(
            map(gearsets => {
              return gearsets.find(g => g.$key === key);
            }),
            filter(gearset => gearset !== undefined)
          ).subscribe(gearset => {
            if (gearset.notFound) {
              this.error = true;
            } else {
              this.result$ = this.comparator.compare(this.gearset, gearset, this.includeAllTools);
            }
            this.loading = false;
          });
          break;
      }
    } catch (e) {
      this.error = true;
      this.loading = false;
    }
  }

}
