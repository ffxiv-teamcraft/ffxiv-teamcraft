import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CommissionsFacade } from '../../../modules/commission-board/+state/commissions.facade';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { combineLatest, Observable, Subject } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { TranslateService } from '@ngx-translate/core';
import { CommissionStatus } from '../../../modules/commission-board/model/commission-status';
import { Commission } from '../../../modules/commission-board/model/commission';
import { SettingsService } from '../../../modules/settings/settings.service';
import { NotificationsFacade } from '../../../modules/notifications/+state/notifications.facade';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';

@Component({
  selector: 'app-commission-details',
  templateUrl: './commission-details.component.html',
  styleUrls: ['./commission-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionDetailsComponent extends TeamcraftComponent implements OnInit {

  CommissionStatus = CommissionStatus;

  ratingDone: Record<string, boolean> = {};

  public commissionNotFound$ = this.commissionsFacade.selectedCommission$.pipe(
    map(commission => commission?.notFound)
  );

  public display$ = combineLatest([
    this.commissionsFacade.selectedCommission$.pipe(filter(c => !!c && !c.notFound)),
    this.authFacade.userId$,
    this.authFacade.loggedIn$
  ]).pipe(
    map(([commission, userId, loggedIn]) => {
      const userOffer = commission.candidates.find(c => c.uid === userId);
      return {
        commission,
        userId,
        loggedIn,
        userOffer,
        canApply: userOffer === undefined
      };
    })
  );

  constructor(private activatedRoute: ActivatedRoute, private commissionsFacade: CommissionsFacade,
              private authFacade: AuthFacade, public translate: TranslateService,
              public settings: SettingsService, private notificationsFacade: NotificationsFacade,
              private router: Router, private listsFacade: ListsFacade) {
    super();
  }

  deleteCommission(commission: Commission, withLists: boolean): void {
    this.commissionsFacade.delete(commission.$key, withLists);
    this.router.navigate(['commissions']);
  }

  editCommission(commission: Commission): void {
    this.commissionsFacade.edit(commission);
  }

  apply(commission: Commission): void {
    this.commissionsFacade.apply(commission);
  }

  removeOffer(commission: Commission, userId: string): void {
    commission.candidates = commission.candidates.filter(c => c.uid !== userId);
    this.commissionsFacade.update(commission);
  }

  hire(commission: Commission, candidate: { uid: string, offer: number, contact: string }): void {
    this.commissionsFacade.hire(commission, candidate);
  }

  fireContractor(commission: Commission): void {
    this.commissionsFacade.fireContractor(commission);
  }

  resignContractor(commission: Commission): void {
    this.commissionsFacade.resignContractor(commission);
  }

  markAsCompleted(commission: Commission, userId: string): void {
    this.commissionsFacade.markAsCompleted(commission);
    commission.status = CommissionStatus.ARCHIVED;
    this.rateCommission(commission, userId).subscribe(() => {
      this.commissionsFacade.update(commission);
    });
  }

  addItems(commission: Commission): void {
    this.listsFacade.loadMyLists();
    this.listsFacade.myLists$.pipe(
      map(lists => {
        return lists.find(l => l.$key === commission.$key);
      }),
      filter(l => !!l && !l.notFound),
      first(),
      switchMap(l => {
        return this.listsFacade.addItems(l);
      })
    ).subscribe();
  }

  rateCommission(commission: Commission, userId: string): Observable<void> {
    const done$ = new Subject<void>();
    this.commissionsFacade.rate(commission, userId).subscribe(res => {
      this.ratingDone[`${commission.$key}:${userId}`] = res;
      done$.next();
      done$.complete();
    });
    return done$.asObservable();
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap
      .pipe(
        takeUntil(this.onDestroy$)
      ).subscribe(paramMap => {
      const commissionId = paramMap.get('id');
      this.commissionsFacade.load(commissionId);
      this.commissionsFacade.select(commissionId);
      this.notificationsFacade.removeCommissionNotifications(n => n.commissionId === commissionId);
    });
  }

}
