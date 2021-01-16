import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { ApplyContentId, InventoryActionTypes, InventoryLoaded, ResetInventory, SetContentId, UpdateInventory } from './inventory.actions';
import { distinctUntilKeyChanged, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { AuthFacade } from '../../../+state/auth.facade';
import { SettingsService } from '../../settings/settings.service';
import { of, Subject } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ContentIdLinkingPopupComponent } from '../content-id-linking-popup/content-id-linking-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { InventoryFacade } from './inventory.facade';

@Injectable()
export class InventoryEffects {

  @Effect()
  loadInventory$ = this.actions$.pipe(
    ofType(InventoryActionTypes.LoadInventory),
    switchMap(() => {
      const result$ = new Subject<UserInventory>();
      this.ipc.once('inventory:value', (e, inventory) => {
        result$.next(this.serializer.deserialize<UserInventory>(inventory, UserInventory));
      });
      setTimeout(() => {
        this.ipc.send('inventory:get');
      }, 200);
      return result$;
    }),
    map(inventory => new InventoryLoaded(inventory))
  );

  @Effect()
  showContentIdPopup$ = this.actions$.pipe(
    ofType<SetContentId>(InventoryActionTypes.SetContentId),
    distinctUntilKeyChanged('contentId'),
    withLatestFrom(this.authFacade.user$),
    switchMap(([{ contentId }, user]) => {
      if (this.settings.ignoredContentIds.includes(contentId)) {
        return of('ignored');
      }
      const isCustom = user.lodestoneIds.length === 0 && user.customCharacters.length > 0;
      if (isCustom) {
        const matchingCustomCharacter = user.customCharacters.find(entry => entry.contentId === contentId);
        if (matchingCustomCharacter) {
          return of(contentId);
        }
      } else {
        const matchingLodestoneEntry = user.lodestoneIds.find(entry => entry.contentId === contentId);
        if (matchingLodestoneEntry) {
          return of(contentId);
        }
      }
      console.log('New Content ID', contentId);
      // If we're here, there's no matching entries anywhere
      return this.modal.create({
        nzContent: ContentIdLinkingPopupComponent,
        nzComponentParams: {
          contentId: contentId
        },
        nzClosable: false,
        nzMaskClosable: false,
        nzFooter: null,
        nzTitle: this.translate.instant('INVENTORY.New_character_detected')
      }).afterClose.pipe(
        map((res) => {
          if (!res) {
            return 'ignored';
          }
          return contentId;
        })
      );
    }),
    map((contentId) => {
      return new ApplyContentId(contentId);
    })
  );

  @Effect({ dispatch: false })
  updateInventory$ = this.actions$.pipe(
    ofType<UpdateInventory>(InventoryActionTypes.UpdateInventory),
    map(action => {
      const savePayload = JSON.parse(JSON.stringify(action.payload));
      delete savePayload.searchCache;
      delete savePayload._contentId;
      this.ipc.send('inventory:set', savePayload);
    })
  );

  @Effect()
  resetInventory$ = this.actions$.pipe(
    ofType<ResetInventory>(InventoryActionTypes.ResetInventory),
    withLatestFrom(this.inventoryFacade.inventory$),
    map(([, inventory]) => {
      const reset = new UserInventory();
      reset.contentId = inventory.contentId;
      this.ipc.send('inventory:set', reset);
      return new InventoryLoaded(reset);
    })
  );

  constructor(
    private actions$: Actions,
    private inventoryFacade: InventoryFacade,
    private authFacade: AuthFacade,
    private settings: SettingsService,
    private ipc: IpcService,
    private serializer: NgSerializerService,
    private modal: NzModalService,
    private translate: TranslateService
  ) {
  }
}
