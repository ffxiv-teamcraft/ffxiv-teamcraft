import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommissionService } from '../../../modules/commission-board/commission.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { CommissionBoardDisplay } from './commission-board-display';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { CommissionTag } from '../../../modules/commission-board/model/commission-tag';
import { Commission } from '../../../modules/commission-board/model/commission';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-commission-board',
  templateUrl: './commission-board.component.html',
  styleUrls: ['./commission-board.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionBoardComponent {

  /**
   * Static data to compute only once.
   */

  public datacenters: string[] = Object.keys(this.lazyData.datacenters);

  public commissionTags = Object.keys(CommissionTag).map(key => {
    return {
      value: key,
      label: `COMMISSIONS.TAGS.${key}`
    };
  });

  /**
   * End static data
   */

  public loading = true;

  public tags$ = new BehaviorSubject<CommissionTag[]>(this.settings.commissionTags);

  public onlyCrafting$ = new BehaviorSubject<boolean>(this.settings.onlyCraftingCommissions);

  public minPrice$ = new BehaviorSubject<number>(this.settings.minCommissionPrice);

  public display$: Observable<CommissionBoardDisplay> = combineLatest([
    this.activatedRoute.paramMap,
    this.tags$.pipe(debounceTime(1000)),
    this.onlyCrafting$,
    this.minPrice$.pipe(debounceTime(500))
  ]).pipe(
    map(([params, tags, onlyCrafting, minPrice]) => {
      this.loading = true;
      const dc = params.get('dc');
      this.settings.commissionTags = tags;
      this.settings.onlyCraftingCommissions = onlyCrafting;
      this.settings.minCommissionPrice = minPrice;
      return {
        datacenter: dc,
        subscribed: localStorage.getItem(`c:fcm:${dc}`) === 'true',
        tags: tags,
        onlyCrafting,
        minPrice
      };
    }),
    switchMap(data => {
      return this.commissionsService.getByDatacenter(data.datacenter, data.tags, data.onlyCrafting, data.minPrice).pipe(
        map(commissions => {
          return {
            ...data,
            commissions: commissions.sort((a, b) => {
              return b.bump?.seconds - a.bump?.seconds;
            })
          };
        }),
        tap(() => {
          this.loading = false;
        })
      );
    })
  );

  constructor(private commissionsService: CommissionService, private notificationsService: NzNotificationService,
              private messageService: NzMessageService, private translate: TranslateService,
              private activatedRoute: ActivatedRoute, private router: Router,
              private lazyData: LazyDataService, private settings: SettingsService) {
  }

  changeDatacenter(dc: string): void {
    this.router.navigate(['..', dc], { relativeTo: this.activatedRoute });
  }

  trackByCommission(index: number, commission: Commission): string {
    return commission.$key;
  }
}
