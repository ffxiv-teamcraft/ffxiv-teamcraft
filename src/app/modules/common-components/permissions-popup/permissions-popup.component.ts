import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {DataWithPermissions} from '../../../core/database/permissions/data-with-permissions';
import {AddNewRowPopupComponent} from './add-new-row-popup/add-new-row-popup.component';
import {Observable} from 'rxjs/Observable';
import {Permissions} from '../../../core/database/permissions/permissions';
import {PermissionsRegistry} from '../../../core/database/permissions/permissions-registry';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UserService} from '../../../core/database/user.service';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {List} from '../../../model/list/list';
import {Workshop} from '../../../model/other/workshop';
import {DataService} from '../../../core/api/data.service';

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
                private dataService: DataService) {
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
            .mergeMap(registry => {
                const observables: Observable<{ userId: string, character: any, permissions: Permissions }>[] = [];
                observables.push(
                    this.userService.getCharacter(data.authorId)
                        .map(character => {
                            return {
                                userId: data.authorId, character: character, permissions:
                                    this.getPermissions(data, this.registry, data.authorId)
                            };
                        })
                );
                registry.forEach((userId, permissions) => {
                    observables.push(
                        this.userService.getCharacter(userId)
                            .map(character => {
                                return {
                                    userId: userId, character: character, permissions:
                                        this.getPermissions(data, this.registry, userId)
                                };
                            })
                            .catch(() => Observable.of(null))
                    );
                });
                return Observable.combineLatest(observables)
                    .map(results => results.filter(res => res !== null));
            });
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
            .mergeMap(user => this.userService.getCharacter(user.$key))
            .first()
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
            .filter(u => u !== '')
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
            Observable.combineLatest(
                ...usersSharedDeletions.map(deletion => {
                    return this.userService.get(deletion).first().map(user => {
                        if (this.data instanceof List) {
                            user.sharedLists = user.sharedLists.filter(listId => listId !== this.data.$key);
                        } else if (this.data instanceof Workshop) {
                            user.sharedWorkshops = user.sharedLists.filter(listId => listId !== this.data.$key);
                        }
                        return user;
                    }).mergeMap(user => this.userService.set(deletion, user));
                }),
                ...usersSharedAdditions.map(addition => {
                    return this.userService.get(addition).first().map(user => {
                        if (this.data instanceof List) {
                            user.sharedLists.push(this.data.$key);
                        } else if (this.data instanceof Workshop) {
                            user.sharedWorkshops.push(this.data.$key);
                        }
                        return user;
                    }).mergeMap(user => this.userService.set(addition, user));
                })).first().subscribe(() => {
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
