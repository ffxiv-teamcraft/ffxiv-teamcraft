import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { PermissionDisplayRow } from '../permission-display-row';
import { combineLatest, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { UserService } from '../../../core/database/user.service';
import { UserPickerService } from '../../user-picker/user-picker.service';
import { FreecompanyPickerService } from '../../freecompany-picker/freecompany-picker.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamsFacade } from '../../teams/+state/teams.facade';
import { Team } from '../../../model/team/team';
import { LodestoneService } from '../../../core/api/lodestone.service';
import { PermissionsController } from '../../../core/database/permissions-controller';

@Component({
  selector: 'app-permissions-box',
  templateUrl: './permissions-box.component.html',
  styleUrls: ['./permissions-box.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsBoxComponent implements OnInit {

  public data: DataWithPermissions;

  public changes$: ReplaySubject<DataWithPermissions> = new ReplaySubject<DataWithPermissions>();

  public enablePropagation = false;

  public propagateChanges$: Subject<DataWithPermissions> = new Subject<DataWithPermissions>();

  public ready$: Subject<void>;

  permissionLevels = Object.keys(PermissionLevel)
    .filter(k => typeof PermissionLevel[k] === 'number')
    .map(k => {
      return {
        label: k,
        value: PermissionLevel[k]
      };
    });

  // We don't want everyone to have write permission, as it would just be absurd.
  everyonePermissionLevels = this.permissionLevels.filter(level => {
    return level.value < PermissionLevel.WRITE;
  });

  permissionRows$: Observable<PermissionDisplayRow[]>;

  canAddFc$: Observable<boolean>;

  constructor(private userService: UserService, private userPickerService: UserPickerService,
              private freecompanyPickerService: FreecompanyPickerService, private authFacade: AuthFacade,
              private teamsFacade: TeamsFacade, private lodestoneService: LodestoneService) {
    this.canAddFc$ = this.authFacade.mainCharacter$.pipe(map(char => char.ID > 0));
  }

  ngOnInit(): void {
    if ((this.data as any).teamId !== undefined && this.data.registry[`team:${(this.data as any).teamId}`] === undefined) {
      // Cleanup possible previous teams
      Object.keys(this.data.registry).filter(key => key.startsWith('team:')).forEach(key => {
        delete this.data.registry[key];
      });
      this.data.registry[`team:${(this.data as any).teamId}`] = PermissionLevel.PARTICIPATE;
    }
    this.changes$.next(this.data);
    this.permissionRows$ = this.changes$.pipe(
      switchMap(data => {
        const registryKeys = Object.keys(data.registry);
        if (registryKeys.length === 0) {
          return of([]);
        }
        return combineLatest(
          registryKeys
            .map(id => {
              // Prepare an observable to handle both FC and Characters.
              let entityDetails$: Observable<{ name: string, avatar: string[] }>;
              // If the id has no character in it, it's a free company id, not a TC user id
              if (/^\d+$/im.test(id)) {
                entityDetails$ = this.lodestoneService.getFreeCompany(id).pipe(
                  map((res: any) => ({ name: res.FreeCompany.Name, avatar: res.FreeCompany.Crest }))
                );
              } else if (id.startsWith('team:')) {
                const teamKey = id.replace('team:', '');
                this.teamsFacade.loadTeam(teamKey);
                entityDetails$ = this.teamsFacade.allTeams$.pipe(
                  map(teams => teams.find(t => t.$key === teamKey)),
                  filter(t => t !== undefined),
                  map((team: Team) => ({ name: team.name, avatar: [] }))
                );
              } else {
                entityDetails$ = this.userService.get(id).pipe(
                  first(),
                  switchMap(user => {
                    return this.lodestoneService.getCharacter(user.defaultLodestoneId).pipe(
                      map(res => ({ name: res.Character.Name, avatar: [res.Character.Avatar] }))
                    );
                  })
                );
              }
              return entityDetails$.pipe(
                map(details => {
                  return {
                    ...details,
                    id: id,
                    permission: data.registry[id]
                  };
                })
              );
            })
        );
      })
    );
    this.ready$.next(null);
  }

  public addUser(): void {
    this.userPickerService.pickUserId()
      .pipe(
        filter(res => res !== undefined)
      )
      .subscribe((userId) => {
        PermissionsController.addPermissionRow(this.data, userId);
        this.changes$.next(this.data);
      });
  }

  public addFc(): void {
    this.freecompanyPickerService.pickFCId()
      .pipe(
        filter(res => res !== undefined)
      )
      .subscribe((fcId) => {
        PermissionsController.addPermissionRow(this.data, fcId);
        this.changes$.next(this.data);
      });
  }

  public updatePermission(id: string, newLevel: PermissionLevel): void {
    PermissionsController.setPermissionLevel(this.data, id, newLevel);
    this.changes$.next(this.data);
  }

  public removePermission(id: string): void {
    PermissionsController.removePermissionRow(this.data, id);
    this.changes$.next(this.data);
  }

  public updateEveryonePermission(newLevel: PermissionLevel): void {
    this.data.everyone = newLevel;
    this.changes$.next(this.data);
  }

}
