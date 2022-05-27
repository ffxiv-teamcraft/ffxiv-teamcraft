import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractItemRowComponent } from '../abstract-item-row.component';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { exhaustMap, filter, first, map, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { ItemRowMenuElement } from '../../../../model/display/item-row-menu-element';
import { CommentTargetType } from '../../../comments/comment-target-type';
import { ListRow } from '../../model/list-row';
import { CommentsPopupComponent } from '../../../comments/comments-popup/comments-popup.component';
import { ListItemCommentNotification } from '../../../../model/notification/list-item-comment-notification';
import { Craft } from '../../../../model/garland-tools/craft';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { freeCompanyActions } from '../../../../core/data/sources/free-company-actions';
import { MacroPopupComponent } from '../../../../pages/simulator/components/macro-popup/macro-popup.component';
import { NumberQuestionPopupComponent } from '../../../number-question-popup/number-question-popup/number-question-popup.component';
import { List } from '../../model/list';
import { ListController } from '../../list-controller';
import { Team } from '../../../../model/team/team';

@Component({
  selector: 'app-item-row',
  templateUrl: './item-row.component.html',
  styleUrls: ['./item-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemRowComponent extends AbstractItemRowComponent implements OnInit {

  commentBadge$: Observable<boolean>;

  commentBadgeReloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  ngOnInit() {
    super.ngOnInit();


    this.commentBadge$ = this.commentBadgeReloader$.pipe(
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
