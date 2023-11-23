import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { filter, map, switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { CommissionsFacade } from '../../../modules/commission-board/+state/commissions.facade';
import { TranslateModule } from '@ngx-translate/core';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { CommissionPanelComponent } from '../../../modules/commission-board/commission-panel/commission-panel.component';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-commission-archives',
    templateUrl: './commission-archives.component.html',
    styleUrls: ['./commission-archives.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NzDividerModule, FlexModule, FullpageMessageComponent, NgFor, CommissionPanelComponent, PageLoaderComponent, AsyncPipe, TranslateModule]
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
