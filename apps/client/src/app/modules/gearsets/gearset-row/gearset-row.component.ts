import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { filter } from 'rxjs/operators';
import { GearsetsFacade } from '../+state/gearsets.facade';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { FavoriteButtonComponent } from '../../favorites/favorite-button/favorite-button.component';
import { RouterLink } from '@angular/router';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf, NgFor } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-gearset-row',
    templateUrl: './gearset-row.component.html',
    styleUrls: ['./gearset-row.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgIf, NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, NzTagModule, NgFor, ClipboardDirective, RouterLink, FavoriteButtonComponent, NzPopconfirmModule, JobUnicodePipe, TranslateModule]
})
export class GearsetRowComponent {

  @Input()
  gearset: TeamcraftGearset;

  @Input()
  userId: string;

  constructor(private gearsetsFacade: GearsetsFacade, private translate: TranslateService,
              private dialog: NzModalService, private linkTools: LinkToolsService) {
  }

  getLink = () => {
    return this.linkTools.getLink(`/gearset/${this.gearset.$key}`);
  };

  deleteGearset(key: string): void {
    this.gearsetsFacade.delete(key);
  }

  cloneGearset(gearset: TeamcraftGearset): void {
    this.gearsetsFacade.clone(gearset);
  }

  rename(gearset: TeamcraftGearset): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: gearset.name },
      nzFooter: null,
      nzTitle: this.translate.instant('GEARSETS.Rename_gearset')
    }).afterClose.pipe(
      filter(name => name !== undefined)
    ).subscribe(name => {
      gearset.name = name;
      this.gearsetsFacade.pureUpdate(gearset.$key, {
        name: gearset.name
      });
    });
  }
}
