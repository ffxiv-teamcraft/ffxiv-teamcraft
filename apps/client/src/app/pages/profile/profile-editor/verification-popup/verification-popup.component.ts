import { Component, OnDestroy } from '@angular/core';
import { XivapiService } from '@xivapi/angular-client';
import { filter, map, switchMap } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import { AuthFacade } from '../../../../+state/auth.facade';

@Component({
  selector: 'app-verification-popup',
  templateUrl: './verification-popup.component.html',
  styleUrls: ['./verification-popup.component.less']
})
export class VerificationPopupComponent implements OnDestroy {

  verificationCode: string;

  lodestoneId: number;

  verificationResult$: Observable<{ verified: boolean }>;

  startVerify$: Subject<string> = new Subject<string>();

  subscription: Subscription;

  constructor(private xivapi: XivapiService, private authFacade: AuthFacade) {
    this.verificationResult$ = this.startVerify$.pipe(
      switchMap(code => {
        return this.xivapi.getCharacter(this.lodestoneId, { columns: ['Character.Bio'] }).pipe(
          map(res => {
            return { verified: res.Character.Bio.indexOf(code) > -1 };
          })
        );
      })
    );
    this.subscription = this.verificationResult$.pipe(filter(res => res.verified)).subscribe(() => {
      this.authFacade.verifyCharacter(this.lodestoneId);
    });
  }

  validate(): void {
    this.startVerify$.next(this.verificationCode);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
