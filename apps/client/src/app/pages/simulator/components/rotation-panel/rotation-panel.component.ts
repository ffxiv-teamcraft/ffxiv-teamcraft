import { Component, Input } from '@angular/core';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { CraftingAction } from '../../model/actions/crafting-action';
import { CraftingActionsRegistry } from '../../model/crafting-actions-registry';
import { Observable } from 'rxjs/Observable';
import { filter, map } from 'rxjs/operators';
import { LinkToolsService } from '../../../../core/tools/link-tools.service';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { NameQuestionPopupComponent } from '../../../../modules/name-question-popup/name-question-popup/name-question-popup.component';

@Component({
  selector: 'app-rotation-panel',
  templateUrl: './rotation-panel.component.html',
  styleUrls: ['./rotation-panel.component.less']
})
export class RotationPanelComponent {

  @Input()
  public set rotation(rotation: CraftingRotation) {
    this.rotation$.next(rotation);
  }

  rotation$: ReplaySubject<CraftingRotation> = new ReplaySubject<CraftingRotation>();

  actions$: Observable<CraftingAction[]>;

  constructor(private registry: CraftingActionsRegistry, private linkTools: LinkToolsService,
              private rotationsFacade: RotationsFacade, private message: NzMessageService,
              private translate: TranslateService, private dialog: NzModalService) {
    this.actions$ = this.rotation$.pipe(
      map(rotation => this.registry.deserializeRotation(rotation.rotation))
    );
  }

  getLink(rotation: CraftingRotation): string {
    return this.linkTools.getLink(this.getRouterLink(rotation));
  }

  getRouterLink(rotation: CraftingRotation): string {
    if (rotation.custom) {
      return `/simulator/custom/${rotation.$key}`;
    } else {
      return `/simulator/${rotation.defaultItemId}/${rotation.defaultRecipeId}/${rotation.$key}`;
    }
  }

  renameRotation(rotation: CraftingRotation): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: rotation.getName() },
      nzFooter: null,
      nzTitle: this.translate.instant('Edit')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        rotation.name = name;
        return rotation;
      })
    ).subscribe(r => {
      this.rotationsFacade.updateRotation(r);

    });
  }

  afterLinkCopy(): void {
    this.message.success(this.translate.instant('SIMULATOR.Share_link_copied'));
  }

  delete(rotation: CraftingRotation): void {
    this.rotationsFacade.deleteRotation(rotation.$key);
  }

}
