import { Component, OnDestroy } from '@angular/core';
import { filter, map, switchMap } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import { AuthFacade } from '../../../../+state/auth.facade';
import { LodestoneService } from '../../../../core/api/lodestone.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { AsyncPipe } from '@angular/common';
import { DialogComponent } from '../../../../core/dialog.component';

@Component({
    selector: 'app-verification-popup',
    templateUrl: './verification-popup.component.html',
    styleUrls: ['./verification-popup.component.less'],
    standalone: true,
    imports: [NzAlertModule, NzButtonModule, NzWaveModule, AsyncPipe, TranslateModule]
})
export class VerificationPopupComponent extends DialogComponent implements OnDestroy {

  verificationCode: string;

  lodestoneId: number;

  verificationResult$: Observable<{ verified: boolean }>;

  startVerify$: Subject<string> = new Subject<string>();

  subscription: Subscription;

  constructor(private lodestone: LodestoneService, private authFacade: AuthFacade, private message: NzMessageService, private translate: TranslateService) {
    super();
    this.patchData();
    this.verificationResult$ = this.startVerify$.pipe(
      switchMap(code => {
        return this.lodestone.getCharacterFromLodestoneApi(this.lodestoneId, ['Character.Bio']).pipe(
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
    this.message.info(this.translate.instant('PROFILE.VERIFICATION.Submitted'), { nzDuration: 1500 });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
