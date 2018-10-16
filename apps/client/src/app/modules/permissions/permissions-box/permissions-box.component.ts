import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { PermissionDisplayRow } from '../permission-display-row';
import { Observable } from 'rxjs/Observable';
import { first, map, switchMap } from 'rxjs/operators';
import { XivapiService } from '@xivapi/angular-client';
import { combineLatest, of } from 'rxjs';
import { UserService } from '../../../core/database/user.service';
import { ListsFacade } from '../../list/+state/lists.facade';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-permissions-box',
  templateUrl: './permissions-box.component.html',
  styleUrls: ['./permissions-box.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsBoxComponent implements OnInit {

  public dirty = false;

  @Input()
  public data: DataWithPermissions;

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

  constructor(private xivapi: XivapiService, private userService: UserService,
              private listsFacade: ListsFacade, private modalRef: NzModalRef) {
  }

  ngOnInit(): void {
    this.permissionRows$ = of(this.data).pipe(
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
                entityDetails$ = this.xivapi.getFreeCompany(+id, { columns: ['FreeCompany.Name', 'FreeCompany.Crest'] }).pipe(
                  map(res => ({ name: res.FreeCompany.Name, avatar: res.FreeCompany.Crest }))
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
  }

  public save(): void {
    this.modalRef.close(this.data);
  }

  public cancel(): void {
    this.modalRef.close();
  }

  public updatePermission(id: string, newLevel: PermissionLevel): void {
    this.data.setPermissionLevel(id, newLevel);
    this.dirty = true;
  }

  public updateEveryonePermission(newLevel: PermissionLevel): void {
    this.data.everyone = newLevel;
    this.dirty = true;
  }

}
