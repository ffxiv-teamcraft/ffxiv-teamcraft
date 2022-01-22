import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  CreateCustomLink,
  CustomLinkLoaded,
  CustomLinksActionTypes,
  DeleteCustomLink,
  LoadCustomLink,
  MyCustomLinksLoaded,
  UpdateCustomLink
} from './custom-links.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { exhaustMap, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { EMPTY } from 'rxjs';
import { CustomLinksFacade } from './custom-links.facade';
import { CustomLinksService } from '../../../core/database/custom-links/custom-links.service';
import { CustomLink } from '../../../core/database/custom-links/custom-link';

@Injectable()
export class CustomLinksEffects {


  loadMyCustomLinks$ = createEffect(() => this.actions$.pipe(
    ofType(CustomLinksActionTypes.LoadMyCustomLinks),
    switchMap(() => this.authFacade.user$),
    filter(user => {
      return user.patron || user.moderator || user.admin;
    }),
    map(user => user.$key),
    exhaustMap(userId => {
      return this.customLinksService.getByForeignKey(TeamcraftUser, userId).pipe(
        map(links => new MyCustomLinksLoaded(links, userId))
      );
    })
  ));


  loadCustomLink$ = createEffect(() => this.actions$.pipe(
    ofType<LoadCustomLink>(CustomLinksActionTypes.LoadCustomLink),
    mergeMap(action => {
      return this.customLinksService.getByUriAndNickname(action.linkName, action.nickname).pipe(
        map((link) => {
          if (link === undefined) {
            return {
              uri: action.linkName,
              authorNickname: action.nickname,
              type: action.template ? 'template' : 'link',
              notFound: true
            };
          }
          return link;
        })
      );
    }),
    map(link => new CustomLinkLoaded(<CustomLink>link))
  ));


  createCustomLink$ = createEffect(() => this.actions$.pipe(
    ofType<CreateCustomLink>(CustomLinksActionTypes.CreateCustomLink),
    withLatestFrom(this.authFacade.userId$),
    switchMap(([action, userId]) => {
      action.link.authorId = userId;
      return this.customLinksService.add(action.link);
    }),
    switchMap(() => EMPTY)
  ), { dispatch: false });


  updateCustomLink$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateCustomLink>(CustomLinksActionTypes.UpdateCustomLink),
    switchMap(action => this.customLinksService.update(action.link.$key, action.link)),
    switchMap(() => EMPTY)
  ), { dispatch: false });


  deleteCustomLink$ = createEffect(() => this.actions$.pipe(
    ofType<DeleteCustomLink>(CustomLinksActionTypes.DeleteCustomLink),
    switchMap(action => this.customLinksService.remove(action.key)),
    switchMap(() => EMPTY)
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private linksFacade: CustomLinksFacade,
    private customLinksService: CustomLinksService
  ) {
  }
}
