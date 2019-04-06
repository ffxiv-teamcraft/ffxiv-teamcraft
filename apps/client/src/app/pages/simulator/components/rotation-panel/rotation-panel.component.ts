import { Component, Input } from '@angular/core';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { CraftingAction } from '../../model/actions/crafting-action';
import { CraftingActionsRegistry } from '../../model/crafting-actions-registry';
import { Observable } from 'rxjs/Observable';
import { filter, map, shareReplay, tap } from 'rxjs/operators';
import { LinkToolsService } from '../../../../core/tools/link-tools.service';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { NameQuestionPopupComponent } from '../../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { combineLatest } from 'rxjs';
import { AuthFacade } from '../../../../+state/auth.facade';
import { PermissionLevel } from '../../../../core/database/permissions/permission-level.enum';
import { CustomLink } from '../../../../core/database/custom-links/custom-link';
import { TeamcraftUser } from '../../../../model/user/teamcraft-user';
import { CustomLinksFacade } from '../../../../modules/custom-links/+state/custom-links.facade';
import { Router } from '@angular/router';

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

  permissionLevel$: Observable<PermissionLevel> = combineLatest(this.rotation$, this.authFacade.userId$).pipe(
    map(([rotation, userId]) => rotation.getPermissionLevel(userId))
  );

  public user$ = this.authFacade.user$;

  public customLink$: Observable<CustomLink>;

  private syncLinkUrl: string;

  @Input()
  public publicDisplay = false;

  constructor(private registry: CraftingActionsRegistry, private linkTools: LinkToolsService,
              private rotationsFacade: RotationsFacade, private message: NzMessageService,
              private translate: TranslateService, private dialog: NzModalService,
              private authFacade: AuthFacade, private customLinksFacade: CustomLinksFacade,
              private router: Router) {
    this.actions$ = this.rotation$.pipe(
      map(rotation => this.registry.deserializeRotation(rotation.rotation))
    );

    this.customLink$ = combineLatest(this.customLinksFacade.myCustomLinks$, this.rotation$).pipe(
      map(([links, rotation]) => links.find(link => link.redirectTo === this.getRouterLink(rotation).substr(1))),
      tap(link => link !== undefined ? this.syncLinkUrl = link.getUrl() : null),
      shareReplay(1)
    );
  }

  openRotation(rotation: CraftingRotation): void {
    this.router.navigateByUrl(this.getRouterLink(rotation));
  }

  createCustomLink(rotation: CraftingRotation, user: TeamcraftUser): void {
    this.customLinksFacade.createCustomLink(rotation.getName(), this.getRouterLink(rotation).substr(1), user);
  }

  afterCustomLinkCopy(): void {
    this.message.success(this.translate.instant('CUSTOM_LINKS.Share_link_copied'));
  }

  getLink(rotation: CraftingRotation): string {
    return this.linkTools.getLink(this.getRouterLink(rotation));
  }

  getRouterLink(rotation: CraftingRotation): string {
    if (rotation.custom || rotation.defaultItemId === undefined || rotation.defaultRecipeId === undefined) {
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
