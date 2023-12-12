import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractItemRowComponent } from '../abstract-item-row.component';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { exhaustMap, filter, first, map, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { ItemRowMenuElement } from '../../../../model/display/item-row-menu-element';
import { CommentTargetType } from '../../../comments/comment-target-type';
import { ListRow } from '../../model/list-row';
import { CommentsPopupComponent } from '../../../comments/comments-popup/comments-popup.component';
import { ListItemCommentNotification } from '../../../../model/notification/list-item-comment-notification';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { freeCompanyActions } from '../../../../core/data/sources/free-company-actions';
import { MacroPopupComponent } from '../../../../pages/simulator/components/macro-popup/macro-popup.component';
import { NumberQuestionPopupComponent } from '../../../number-question-popup/number-question-popup/number-question-popup.component';
import { List } from '../../model/list';
import { ListController } from '../../list-controller';
import { Team } from '../../../../model/team/team';
import { Craft } from '@ffxiv-teamcraft/simulator';
import { LazyIconPipe } from '../../../../pipes/pipes/lazy-icon.pipe';
import { XivapiIconPipe } from '../../../../pipes/pipes/xivapi-icon.pipe';
import { CeilPipe } from '../../../../pipes/pipes/ceil.pipe';
import { ItemNamePipe } from '../../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { ItemSourcesDisplayComponent } from '../item-sources-display/item-sources-display.component';
import { CompactAmountInputComponent } from '../compact-amount-input/compact-amount-input.component';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NgForTrackByIdDirective } from '../../../../core/track-by/ng-for-track-by-id.directive';
import { MapPositionComponent } from '../../../map/map-position/map-position.component';
import { AlarmButtonComponent } from '../../../alarm-button/alarm-button/alarm-button.component';
import { TutorialStepDirective } from '../../../../core/tutorial/tutorial-step.directive';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { InventoryPositionComponent } from '../../../inventory/inventory-position/inventory-position.component';
import { ItemRowButtonsComponent } from '../item-row-buttons/item-row-buttons.component';
import { UserAvatarComponent } from '../../../user-avatar/user-avatar/user-avatar.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { I18nNameComponent } from '../../../../core/i18n/i18n-name/i18n-name.component';
import { ItemNameClipboardDirective } from '../../../../core/item-name-clipboard.directive';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ItemIconComponent } from '../../../item-icon/item-icon/item-icon.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-item-row',
    templateUrl: './item-row.component.html',
    styleUrls: ['./item-row.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, FlexModule, NzGridModule, ItemIconComponent, NzButtonModule, NzIconModule, NzToolTipModule, ItemNameClipboardDirective, I18nNameComponent, NzTagModule, NgFor, UserAvatarComponent, ItemRowButtonsComponent, InventoryPositionComponent, NzDropDownModule, NzMenuModule, NzInputModule, FormsModule, NzAutocompleteModule, TutorialStepDirective, AlarmButtonComponent, MapPositionComponent, NgForTrackByIdDirective, NzWaveModule, NzPopoverModule, NzInputNumberModule, CompactAmountInputComponent, ItemSourcesDisplayComponent, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, CeilPipe, XivapiIconPipe, LazyIconPipe]
})
export class ItemRowComponent extends AbstractItemRowComponent implements OnInit {

  commentBadge$: Observable<boolean>;

  commentBadgeReloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  ngOnInit() {
    super.ngOnInit();

    this.commentBadge$ = this.list$.pipe(
      switchMap(list => {
        if(list.offline){
          return of(false);
        }
        return this.commentBadgeReloader$.pipe(
          exhaustMap(() => combineLatest([this.list$, this.item$.pipe(map(i => i.id))])),
          switchMap(([list, itemId]) => {
            if (this.buttonsCache[ItemRowMenuElement.COMMENTS]) {
              return of([]);
            }
            return this.commentsService.getComments(
              CommentTargetType.LIST,
              list.$key,
              `${this.finalItem ? 'finalItems' : 'items'}:${itemId}`
            );
          }),
          map(comments => comments.length > 0),
          startWith(false)
        );
      })
    )
  }

  openCommentsPopup(isAuthor: boolean, item: ListRow): void {
    this.listsFacade.selectedList$.pipe(
      first(),
      switchMap(list => {
        return this.i18n.getNameObservable('items', item.id).pipe(
          switchMap(itemName => {
            return this.modal.create({
              nzTitle: `${itemName} - ${this.translate.instant('COMMENTS.Title')}`,
              nzFooter: null,
              nzContent: CommentsPopupComponent,
              nzComponentParams: {
                targetType: CommentTargetType.LIST,
                targetId: list.$key,
                targetDetails: `${this.finalItem ? 'finalItems' : 'items'}:${item.id}`,
                isAuthor: isAuthor,
                notificationFactory: (comment) => {
                  return new ListItemCommentNotification(list.$key, item.id, comment.content, list.name, list.authorId);
                }
              }
            }).afterClose;
          })
        );
      })
    ).subscribe(() => {
      this.commentBadgeReloader$.next(null);
    });
  }

  assignTeamMember(team: Team, memberId: string, item: ListRow): void {
    this.setWorkingOnIt(memberId, item);
  }

  setIgnoreRequirements(ignore: boolean, itemId: number, list: List, finalItem: boolean): void {
    ListController.setIgnoreRequirements(list, finalItem ? 'finalItems' : 'items', itemId, ignore);
    this.listManager.upgradeList(list).subscribe(l => {
      this.listsFacade.updateList(l);
    });
  }

  setWorkingOnIt(uid: string, item: ListRow): void {
    item.workingOnIt = item.workingOnIt || [];
    item.workingOnIt.push(uid);
    this.saveItem(item);
    this.listsFacade.selectedList$.pipe(
      first(),
      filter(list => list && list.teamId !== undefined),
      withLatestFrom(this.team$)
    ).subscribe(([list, team]) => {
      this.discordWebhookService.notifyUserAssignment(team, uid, item.id, list);
    });
  }

  changeAmount(item: ListRow): void {
    this.modal.create({
      nzTitle: this.translate.instant('Edit_amount'),
      nzFooter: null,
      nzContent: NumberQuestionPopupComponent,
      nzComponentParams: {
        value: item.amount
      }
    }).afterClose
      .pipe(
        filter(res => res !== undefined),
        switchMap((amount) => {
          return this.listsFacade.selectedList$.pipe(
            first(),
            switchMap(list => {
              return this.listManager.addToList({
                itemId: item.id,
                list: list,
                recipeId: item.recipeId,
                amount: amount - item.amount

              });
            })
          );
        })
      )
      .subscribe((list) => {
        this.listsFacade.updateList(list, true);
      });
  }

  removeItem(item: ListRow): void {
    this.listsFacade.selectedList$.pipe(
      first(),
      switchMap(list => {
        return this.listManager.addToList({ itemId: item.id, list: list, recipeId: item.recipeId, amount: -item.amount });
      })
    ).subscribe((list) => {
      this.listsFacade.updateList(list, true);
    });
  }

  removeWorkingOnIt(userId: string, item: ListRow): void {
    item.workingOnIt = (item.workingOnIt || []).filter(u => u !== userId);
    this.saveItem(item);
  }

  addTag(item: ListRow): void {
    this.authFacade.user$.pipe(
      first()
    ).subscribe(user => {
      if (this.newTag && !user.itemTags.some(entry => entry.id === item.id && entry.tag === this.newTag)) {
        user.itemTags.push({ id: item.id, tag: this.newTag });
      }
      this.authFacade.updateUser(user);
      this.newTag = '';
      this.tagInputVisible = false;
      this.tagInput$.next('');
    });
  }

  removeTag(tag: string, item: ListRow): void {
    this.authFacade.user$.pipe(
      first()
    ).subscribe(user => {
      user.itemTags = user.itemTags.filter(entry => entry.id !== item.id || entry.tag !== tag);
      this.authFacade.updateUser(user);
    });
  }

  checkMasterbooks(books: number[]): void {
    this.authFacade.saveMasterbooks(books.map(book => ({ id: book, checked: true })));
    setTimeout(() => {
      this.masterbooksReloader$.next(null);
    }, 500);
  }

  attachRotation(item: ListRow): void {
    const entry = (<any>item).craftedBy[0];
    const craft: Partial<Craft> = {
      id: entry.recipeId,
      job: entry.jobId,
      lvl: entry.level,
      stars: entry.stars_tooltip.length,
      rlvl: entry.rlvl,
      durability: entry.durability,
      progress: entry.progression,
      quality: entry.quality
    };
    this.rotationPicker.pickRotation(item.id, craft.id, craft)
      .pipe(
        filter(rotation => rotation !== null)
      )
      .subscribe(rotation => {
        item.attachedRotation = rotation.$key;
        this.saveItem(item);
      });
  }

  detachRotation(item: ListRow): void {
    delete item.attachedRotation;
    this.saveItem(item);
  }

  openRotationMacroPopup(rotation: CraftingRotation, item: ListRow): void {
    combineLatest([
      this.lazyData.getEntry('foods'),
      this.lazyData.getEntry('medicines')
    ]).subscribe(([foods, medicines]) => {
      const foodsData = this.consumablesService.fromLazyData(foods);
      const medicinesData = this.consumablesService.fromLazyData(medicines);
      const freeCompanyActionsData = this.freeCompanyActionsService.fromData(freeCompanyActions);
      this.modal.create({
        nzContent: MacroPopupComponent,
        nzComponentParams: {
          rotation: this.registry.deserializeRotation(rotation.rotation),
          job: (<any>item).craftedBy[0].jobId,
          food: foodsData.find(f => rotation.food && f.itemId === rotation.food.id && f.hq === rotation.food.hq),
          medicine: medicinesData.find(m => rotation.medicine && m.itemId === rotation.medicine.id && m.hq === rotation.medicine.hq),
          freeCompanyActions: freeCompanyActionsData.filter(action => rotation.freeCompanyActions.indexOf(action.actionId) > -1)
        },
        nzTitle: this.translate.instant('SIMULATOR.Generate_ingame_macro'),
        nzFooter: null
      });
    });
  }
}
