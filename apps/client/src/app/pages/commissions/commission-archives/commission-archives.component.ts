import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { filter, map, switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { CommissionsFacade } from '../../../modules/commission-board/+state/commissions.facade';

@Component({
  selector: 'app-commission-archives',
  templateUrl: './commission-archives.component.html',
  styleUrls: ['./commission-archives.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionArchivesComponent implements OnInit {

  public display$ = this.commissionsFacade.loaded$.pipe(
    filter(loaded => loaded),
    switchMap(() => {
      return combineLatest([
        this.commissionsFacade.userArchivedCommissionsAsClient$,
        this.commissionsFacade.userArchivedCommissionsAsCrafter$
      ]).pipe(
        map(([commissionsAsClient, commissionsAsCrafter]) => {
          return {
            commissionsAsClient,
            commissionsAsCrafter
          };
        })
      );
    })
  );

  constructor(private commissionsFacade: CommissionsFacade) {
  }

  ngOnInit(): void {
    this.commissionsFacade.loadArchived();
  }

}
