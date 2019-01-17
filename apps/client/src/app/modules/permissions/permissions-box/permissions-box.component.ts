import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { PermissionDisplayRow } from '../permission-display-row';
import { Observable } from 'rxjs/Observable';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { XivapiService } from '@xivapi/angular-client';
import { combineLatest, of, ReplaySubject, Subject } from 'rxjs';
import { UserService } from '../../../core/database/user.service';
import { UserPickerService } from '../../user-picker/user-picker.service';
import { FreecompanyPickerService } from '../../freecompany-picker/freecompany-picker.service';
import { AuthFacade } from '../../../+state/auth.facade';

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

  constructor(private xivapi: XivapiService, private userService: UserService, private userPickerService: UserPickerService,
              private freecompanyPickerService: FreecompanyPickerService, private authFacade: AuthFacade) {
    this.canAddFc$ = this.authFacade.mainCharacter$.pipe(map(char => char.ID > 0));
  }

  ngOnInit(): void {
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
                entityDetails$ = this.xivapi.getFreeCompany(id, { columns: ['FreeCompany.Name', 'FreeCompany.Crest'] }).pipe(
                  map((res: any) => ({ name: res.FreeCompany.Name, avatar: res.FreeCompany.Crest }))
                );
              } else {
                entityDetails$ = this.userService.get(id).pipe(
                  first(),
                  switchMap(user => {
                    return this.xivapi.getCharacter(user.defaultLodestoneId, { columns: ['Character.Name', 'Character.Avatar'] }).pipe(
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
        this.data.addPermissionRow(userId);
        this.changes$.next(this.data);
      });
  }

  public addFc(): void {
    this.freecompanyPickerService.pickFCId()
      .pipe(
        filter(res => res !== undefined)
      )
      .subscribe((fcId) => {
        this.data.addPermissionRow(fcId);
        this.changes$.next(this.data);
      });
  }

  public updatePermission(id: string, newLevel: PermissionLevel): void {
    this.data.setPermissionLevel(id, newLevel);
    this.changes$.next(this.data);
  }

  public updateEveryonePermission(newLevel: PermissionLevel): void {
    this.data.everyone = newLevel;
    this.changes$.next(this.data);
  }

}
