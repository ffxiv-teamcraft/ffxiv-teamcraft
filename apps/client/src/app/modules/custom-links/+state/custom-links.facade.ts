import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { CustomLinksPartialState } from './custom-links.reducer';
import {
  CreateCustomLink,
  DeleteCustomLink,
  LoadCustomLink,
  LoadMyCustomLinks,
  UpdateCustomLink
} from './custom-links.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { combineLatest } from 'rxjs';
import { filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { customLinksQuery } from './custom-links.selectors';
import { CustomLink } from '../../../core/database/custom-links/custom-link';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Injectable()
export class CustomLinksFacade {
  loaded$ = this.store.pipe(select(customLinksQuery.getLoaded));

  allCustomLinks$ = this.store.pipe(
    select(customLinksQuery.getAllCustomLinks)
  );

  selectedCustomLink$ = this.store.pipe(
    select(customLinksQuery.getSelectedCustomLink),
    filter(rotation => rotation !== undefined)
  );

  myCustomLinks$ = combineLatest([this.allCustomLinks$, this.authFacade.userId$]).pipe(
    map(([folders, userId]) => folders.filter(folder => folder.authorId === userId)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private store: Store<CustomLinksPartialState>,
              private authFacade: AuthFacade,
              private translate: TranslateService,
              private dialog: NzModalService,
              private message: NzMessageService) {
  }

  createCustomLink(baseName: string, uri: string, user: TeamcraftUser): void {
    if (!user.nickname) {
      return;
    }
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: baseName },
      nzFooter: null,
      nzTitle: this.translate.instant('CUSTOM_LINKS.Add_link')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        const link = new CustomLink();
        link.redirectTo = uri;
        link.authorId = user.$key;
        link.authorNickname = user.nickname;
        link.uri = name.split('/').join('');
        return link;
      }),
      tap(link => this.addCustomLink(link)),
      switchMap(link => {
        return this.myCustomLinks$.pipe(
          map(links => links.find(l => l.uri === link.uri && l.$key !== undefined)),
          filter(l => l !== undefined),
          first()
        );
      })
    ).subscribe(() => {
      this.message.success(this.translate.instant('CUSTOM_LINKS.Link_created'));
    });
  }

  public addCustomLink(link: CustomLink): void {
    this.store.dispatch(new CreateCustomLink(link));
  }

  updateCustomLink(link: CustomLink): void {
    this.store.dispatch(new UpdateCustomLink(link));
  }

  deleteCustomLink(key: string): void {
    this.store.dispatch(new DeleteCustomLink(key));
  }

  load(nickname: string, linkName: string, template = false): void {
    this.store.dispatch(new LoadCustomLink(nickname, linkName, template));
  }

  loadMyCustomLinks() {
    this.store.dispatch(new LoadMyCustomLinks());
  }
}
