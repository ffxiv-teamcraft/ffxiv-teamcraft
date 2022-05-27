import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ListAggregate } from '../model/list-aggregate';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { combineLatest, of } from 'rxjs';
import { PermissionsController } from '../../../core/database/permissions-controller';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamsFacade } from '../../../modules/teams/+state/teams.facade';

@Component({
  selector: 'app-list-aggregate',
  templateUrl: './list-aggregate.component.html',
  styleUrls: ['./list-aggregate.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListAggregateComponent {

  public selectedPanelTitle$ = this.route.paramMap.pipe(
    map(params => params.get('panelTitle'))
  );

  public listIds$ = this.route.paramMap.pipe(
    map(params => params.get('listIds').split(':'))
  );

  public layout$ = this.route.paramMap.pipe(
    map(params => params.get('layoutId')),
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

  public lists$ = this.listIds$.pipe(
    switchMap(keys => {
      keys.forEach(key => {
        this.listsFacade.load(key);
      });
      return this.listsFacade.allListDetails$.pipe(
        map(lists => {
          return lists.filter(l => {
            return keys.includes(l.$key);
          });
        })
      );
    })
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
      return new ListAggregate(lists);
    })
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
              private teamsFacade: TeamsFacade) {
    this.layoutsFacade.loadAll();
  }

}
