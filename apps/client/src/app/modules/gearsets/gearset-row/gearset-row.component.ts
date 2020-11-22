import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { filter } from 'rxjs/operators';
import { GearsetsFacade } from '../+state/gearsets.facade';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LinkToolsService } from '../../../core/tools/link-tools.service';

@Component({
  selector: 'app-gearset-row',
  templateUrl: './gearset-row.component.html',
  styleUrls: ['./gearset-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
