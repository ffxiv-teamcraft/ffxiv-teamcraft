import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { combineLatest, merge, of } from 'rxjs';
import { PermissionsController } from '../../../core/database/permissions-controller';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamsFacade } from '../../../modules/teams/+state/teams.facade';
import { ListAggregatesFacade } from '../../../modules/list-aggregate/+state/list-aggregates.facade';
import { ProcessedListAggregate } from '../../../modules/list-aggregate/model/processed-list-aggregate';
import { ListAggregate } from '../../../modules/list-aggregate/model/list-aggregate';
import { arrayRemove } from '@angular/fire/firestore';
import { ListDisplayMode } from '../../list-details/list-details/list-display-mode';
import { LocalStorageBehaviorSubject } from '../../../core/rxjs/local-storage-behavior-subject';
import { EncodeUriComponentPipe } from '../../../pipes/pipes/encode-uri-component.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { ListDetailsPanelComponent } from '../../../modules/list/list-details-panel/list-details-panel.component';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AsyncPipe } from '@angular/common';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';

@Component({
  selector: 'app-list-aggregate',
  templateUrl: './list-aggregate.component.html',
  styleUrls: ['./list-aggregate.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NzPageHeaderModule, NzButtonModule, NzIconModule, NzRadioModule, FormsModule, NzInputModule, NzSelectModule, NzWaveModule, NzDropDownModule, NzMenuModule, RouterLink, NzAlertModule, ListDetailsPanelComponent, AsyncPipe, TranslateModule, EncodeUriComponentPipe]
})
export class ListAggregateComponent {

  public ListDisplayMode = ListDisplayMode;

  public displayMode$ = new LocalStorageBehaviorSubject<ListDisplayMode>('list-aggregate:display-mode', ListDisplayMode.FULL);

  public selectedPanelTitle$ = this.route.paramMap.pipe(
    map(params => {
      const title = params.get('panelTitle');
      if (title) {
        return decodeURIComponent(title);
      }
    }),
    filter(Boolean)
  );

  public listIdsFromRoute$ = this.route.paramMap.pipe(
    map(params => params.get('listIds')?.split(':')),
    filter(Boolean)
  );

  public layoutIdFromRoute$ = this.route.paramMap.pipe(
    map(params => params.get('layoutId')),
    filter(Boolean)
  );

  public aggregateFromRoute$ = this.route.paramMap.pipe(
    map(params => params.get('aggregateId')),
    filter(Boolean),
    tap(id => {
      this.aggregatesFacade.loadAndSelect(id);
    }),
    switchMap(() => this.aggregatesFacade.selectedListAggregate$),
    filter(Boolean),
    shareReplay(1)
  );

  private listIds$ = merge(this.listIdsFromRoute$, this.aggregateFromRoute$.pipe(map(aggregate => aggregate.lists)));

  public layoutId$ = merge(this.layoutIdFromRoute$, this.aggregateFromRoute$.pipe(map(aggregate => aggregate.layout)));

  public layout$ = this.layoutId$.pipe(
    tap(layoutId => {
      if (!layoutId.startsWith('default') && !layoutId.startsWith('venili')) {
        this.layoutsFacade.load(layoutId);
      }
    }),
    switchMap(layoutId => {
      return this.layoutsFacade.allLayouts$.pipe(
        map(layouts => {
          return layouts.find(l => l.$key === layoutId);
        })
      );
    }),
    filter(Boolean)
  );

  public layouts$ = this.layoutsFacade.allLayouts$;

  public lists$ = this.listIds$.pipe(
    switchMap(keys => {
      keys.forEach(key => {
        this.listsFacade.load(key);
      });
      return this.listsFacade.allListDetails$.pipe(
        map(lists => {
          return lists.filter(l => {
            return keys.includes(l.$key);
          }).sort((a, b) => {
            if (a.index === b.index) {
              return a.name.localeCompare(b.name);
            }
            return a.index - b.index;
          });
        })
      );
    }),
    distinctUntilChanged((a, b) => a.map(l => l.$key + l.etag).join('.') === b.map(l => l.$key + l.etag).join('.')),
    shareReplay(1)
  );

  public missingLists$ = combineLatest([
    this.lists$.pipe(filter(lists => lists.length > 0)),
    this.listIds$
  ]).pipe(
    map(([lists, ids]) => {
      return ids.filter(id => !lists.some(list => list.$key === id));
    }),
    debounceTime(2000),
    filter(missing => missing.length > 0)
  );

  public subtitle$ = this.lists$.pipe(
    map(lists => lists.map(list => list.name).join(', '))
  );

  public aggregate$ = this.lists$.pipe(
    map(lists => {
      return new ProcessedListAggregate(lists);
    }),
    shareReplay(1)
  );

  public permissionLevel$ = this.authFacade.loggedIn$.pipe(
    switchMap(loggedIn => {
      return combineLatest([
        this.aggregate$,
        loggedIn ? this.authFacade.user$ : of(null),
        this.authFacade.userId$,
        this.teamsFacade.selectedTeam$,
        loggedIn ? this.authFacade.fcId$ : of(null)
      ]);
    }),
    filter(([list]) => list !== undefined),
    map(([list, user, userId, team, fcId]) => {
      if (user !== null) {
        const idEntry = user.lodestoneIds.find(l => l.id === user.defaultLodestoneId);
        const verified = idEntry && idEntry.verified;
        if (!verified) {
          fcId = null;
        }
      }
      let teamPermissionLevel = 0;
      if (team !== undefined && list.teamId === team.$key) {
        teamPermissionLevel = Math.max(PermissionsController.getPermissionLevel(list, `team:${list.teamId}`), 20);
      }
      return Math.max(PermissionsController.getPermissionLevel(list, userId), PermissionsController.getPermissionLevel(list, fcId), teamPermissionLevel);
    }),
    distinctUntilChanged(),
    shareReplay(1)
  );

  public withLayoutApplied$ = this.aggregate$.pipe(
    switchMap((aggregate) => {
      return combineLatest([
        this.layoutsFacade.getDisplay(aggregate.aggregatedList, false, false, this.layout$),
        this.layoutsFacade.getFinalItemsDisplay(aggregate.aggregatedList, false, false, this.layout$)
      ]).pipe(
        map(([items, finalItems]) => ({ items, finalItems }))
      );
    })
  );

  public panelDisplay$ = combineLatest([
    this.selectedPanelTitle$,
    this.withLayoutApplied$
  ]).pipe(
    map(([selectedPanelTitle, withLayoutApplied]) => {
      if (selectedPanelTitle === withLayoutApplied.finalItems.title) {
        return {
          finalItems: true,
          panel: withLayoutApplied.finalItems
        };
      }
      return {
        finalItems: false,
        panel: withLayoutApplied.items.rows.find(panel => panel.title.toLowerCase() === selectedPanelTitle?.toLowerCase())
      };
    })
  );

  constructor(private listsFacade: ListsFacade, private route: ActivatedRoute,
              private layoutsFacade: LayoutsFacade, private authFacade: AuthFacade,
              private teamsFacade: TeamsFacade, private aggregatesFacade: ListAggregatesFacade,
              private router: Router) {
    this.layoutsFacade.loadAll();
  }

  onBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  saveAggregate(processed: ProcessedListAggregate, layout: string): void {
    const aggregate = ListAggregate.fromProcessed(processed);
    aggregate.layout = layout;
    this.aggregatesFacade.create(aggregate);
  }

  removeMissingLists(key: string, missingLists: string[]): void {
    this.aggregatesFacade.pureUpdate(key, {
      lists: arrayRemove(...missingLists)
    });
  }

  selectLayout(layoutId: string, aggregate: ListAggregate, selectedPanel: string): void {
    if (aggregate) {
      aggregate.layout = layoutId;
      this.aggregatesFacade.pureUpdate(aggregate.$key, {
        layout: layoutId
      });
      if (selectedPanel) {
        this.router.navigate(['..'], { relativeTo: this.route });
      }
    } else {
      this.router.navigate([...(selectedPanel ? ['../..'] : ['..']), layoutId], { relativeTo: this.route });
    }
  }
}
