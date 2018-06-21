import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {DataWithPermissions} from '../../../core/database/permissions/data-with-permissions';
import {AddNewRowPopupComponent} from './add-new-row-popup/add-new-row-popup.component';
import {BehaviorSubject, combineLatest, concat, Observable, of} from 'rxjs';
import {Permissions} from '../../../core/database/permissions/permissions';
import {PermissionsRegistry} from '../../../core/database/permissions/permissions-registry';
import {UserService} from '../../../core/database/user.service';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {List} from '../../../model/list/list';
import {Workshop} from '../../../model/other/workshop';
import {DataService} from '../../../core/api/data.service';
import {catchError, filter, first, map, mergeMap} from 'rxjs/operators';
import {AppUser} from '../../../model/list/app-user';
import {ListService} from '../../../core/database/list.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-permissions-popup',
    templateUrl: './permissions-popup.component.html',
    styleUrls: ['./permissions-popup.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsPopupComponent {

    public rows: Observable<{ userId: string, character: any, permissions: Permissions }[]>;

    private registrySubject: BehaviorSubject<PermissionsRegistry>;

    registry: PermissionsRegistry;

    saving = false;

    freeCompany: Observable<any>;

    constructor(@Inject(MAT_DIALOG_DATA) public data: DataWithPermissions, private dialog: MatDialog, private userService: UserService,
                private dialogRef: MatDialogRef<PermissionsPopupComponent>, serializer: NgSerializerService,
                private dataService: DataService, private listService: ListService, private snack: MatSnackBar,
                private translator: TranslateService) {
        // If this permissions registry is bugged, rebuild it.
        if (data.permissionsRegistry.everyone.write === true) {
            this.registry = new PermissionsRegistry();
        }
        // Create a copy to work on.
        this.registry = serializer.deserialize(JSON.parse(JSON.stringify(data.permissionsRegistry)), PermissionsRegistry);

        if (this.registry.freeCompanyId !== undefined) {
            this.freeCompany = this.dataService.getFreeCompany(this.registry.freeCompanyId);
        }

        this.registrySubject = new BehaviorSubject<PermissionsRegistry>(this.registry);
        this.rows = this.registrySubject
            .pipe(
                mergeMap(registry => {
                    const observables: Observable<{ userId: string, character: any, permissions: Permissions }>[] = [];
                    observables.push(
                        this.userService.getCharacter(data.authorId)
                            .pipe(
                                map(character => {
                                    return {
                                        userId: data.authorId, character: character, permissions:
                                            this.getPermissions(data, this.registry, data.authorId)
                                    };
                                })
                            ));
                    registry.forEach((userId) => {
                        observables.push(
                            this.userService.getCharacter(userId)
                                .pipe(
                                    map(character => {
                                        return {
                                            userId: userId, character: character, permissions:
                                                this.getPermissions(data, this.registry, userId)
                                        };
                                    }),
                                    catchError(() => of(null)))
                        );
                    });
                    return combineLatest(observables)
                        .pipe(map(results => results.filter(res => res !== null)));
                }));
    }

    handlePermissionsChange(after: Permissions, userId?: string): void {
        if (userId !== undefined) {
            this.registry.registry[userId] = after;
        } else {
            this.registry.everyone = after;
        }
    }

    handleFcPermissionsChange(after: Permissions): void {
        this.registry.freeCompany = after;
    }

    isWorkshop(): boolean {
        return this.data instanceof Workshop;
    }

    bindFreeCompany(): void {
        this.userService.getUserData()
            .pipe(
                mergeMap((user: AppUser) => this.userService.getCharacter(user.$key)),
                first()
            )
            .subscribe(character => {
                this.registry.freeCompanyId = character.free_company;
                this.freeCompany = this.dataService.getFreeCompany(this.registry.freeCompanyId);
            });
    }

    unbindFreeCompany(): void {
        delete this.registry.freeCompanyId;
        this.freeCompany = undefined;
    }

    addNewRow(): void {
        this.dialog.open(AddNewRowPopupComponent).afterClosed()
            .pipe(filter(u => u !== ''))
            .subscribe(user => {
                if (this.registry.registry[user.$key] === undefined && this.data.authorId !== user.$key) {
                    // By default, a new row has the same permissions as everyone.
                    this.registry.registry[user.$key] = JSON.parse(JSON.stringify(this.registry.everyone));
                    this.registrySubject.next(this.registry);
                }
            });
    }

    public getPermissions(data: DataWithPermissions, permissionsRegistry: PermissionsRegistry, userId: string,
                          freeCompanyId?: string): Permissions {
        if (userId === data.authorId) {
            return {read: true, participate: true, write: true};
        }
        if (freeCompanyId !== undefined && permissionsRegistry.freeCompanyId === freeCompanyId) {
            return permissionsRegistry.freeCompany;
        }
        return permissionsRegistry.registry[userId] || permissionsRegistry.everyone;
    }

    deleteRow(userId: string): void {
        delete this.registry.registry[userId];
        this.registrySubject.next(this.registry);
    }

    propagate(): void {
        const workshop = <Workshop>this.data;
        this.listService.fetchWorkshop(workshop)
            .pipe(
                first(),
                map(lists => {
                    return lists.map(list => {
                        // Copy workshop permissions
                        list.permissionsRegistry = workshop.permissionsRegistry;
                        // Delete free company-related permissions for list,as  they won't be used.
                        delete list.permissionsRegistry.freeCompanyId;
                        delete list.permissionsRegistry.freeCompany;
                        return list;
                    });
                }),
                mergeMap(lists => {
                    return concat(lists.map(list => this.listService.set(list.$key, list)));
                })
            ).subscribe(() => {
            this.snack.open(this.translator.instant('PERMISSIONS.Propagate_changes_done'), null, {
                duration: 10000,
                panelClass: ['snack']
            });
        });
    }

    save(): void {
        this.saving = true;
        const usersSharedDeletions: string[] = [];
        const usersSharedAdditions: string[] = [];
        this.data.permissionsRegistry.forEach((userId, permissions) => {
            // If user has been deleted from permissions and had write permissions, remove the list from shared lists, same if write
            // permission has been removed
            if (permissions.write && (this.registry.registry[userId] === undefined || this.registry.registry[userId].write === false)) {
                usersSharedDeletions.push(userId)
            } else if (!permissions.write && this.registry.registry[userId] !== undefined && this.registry.registry[userId].write) {
                // If write permission has been granted
                usersSharedAdditions.push(userId);
            }
        });
        // Now the newly added ones
        this.registry.forEach((userId, permissions) => {
            if (this.data.permissionsRegistry.registry[userId] === undefined && permissions.write) {
                usersSharedAdditions.push(userId);
            }
        });
        if (usersSharedDeletions.length > 0 || usersSharedAdditions.length > 0) {
            combineLatest(
                ...usersSharedDeletions.map(deletion => {
                    return this.userService.get(deletion).pipe(
                        first(),
                        map(user => {
                            if (this.data instanceof List) {
                                user.sharedLists = user.sharedLists.filter(listId => listId !== this.data.$key);
                            } else if (this.data instanceof Workshop) {
                                user.sharedWorkshops = user.sharedLists.filter(listId => listId !== this.data.$key);
                            }
                            return user;
                        }),
                        mergeMap(user => this.userService.set(deletion, user))
                    );
                }),
                ...usersSharedAdditions.map(addition => {
                    return this.userService.get(addition).pipe(
                        first(),
                        map(user => {
                            if (this.data instanceof List) {
                                user.sharedLists.push(this.data.$key);
                            } else if (this.data instanceof Workshop) {
                                user.sharedWorkshops.push(this.data.$key);
                            }
                            return user;
                        }),
                        mergeMap(user => this.userService.set(addition, user))
                    );
                }),
            ).pipe(first()).subscribe(() => {
                this.registry.everyone.write = false; // Always force write to false for everyone.
                this.data.permissionsRegistry = this.registry;
                this.dialogRef.close(this.data);
            });
        } else {
            this.registry.everyone.write = false; // Always force write to false for everyone.
            this.data.permissionsRegistry = this.registry;
            this.dialogRef.close(this.data);
        }
    }
}
