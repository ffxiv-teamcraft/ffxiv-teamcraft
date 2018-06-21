import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CraftingRotationService} from '../../../../core/database/crafting-rotation.service';
import {CraftingRotation} from '../../../../model/other/crafting-rotation';
import {combineLatest, Observable} from 'rxjs';
import {UserService} from '../../../../core/database/user.service';
import {CraftingActionsRegistry} from '../../model/crafting-actions-registry';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {ConfirmationPopupComponent} from '../../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {CustomLink} from '../../../../core/database/custom-links/custom-link';
import {CustomLinkPopupComponent} from '../../../custom-links/custom-link-popup/custom-link-popup.component';
import {filter, first, map, mergeMap, tap} from 'rxjs/operators';
import {RotationNamePopupComponent} from '../rotation-name-popup/rotation-name-popup.component';
import {NewFolderPopupComponent} from '../new-folder-popup/new-folder-popup.component';
import {CraftingRotationFolder} from './crafting-rotation-folder';

@Component({
    selector: 'app-rotations-page',
    templateUrl: './rotations-page.component.html',
    styleUrls: ['./rotations-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RotationsPageComponent {

    rotations$: Observable<{ nofolder: CraftingRotation[], folders: CraftingRotationFolder[] }>;

    linkButton = false;

    constructor(private rotationsService: CraftingRotationService, private userService: UserService,
                private craftingActionsRegistry: CraftingActionsRegistry, private snack: MatSnackBar,
                private translator: TranslateService, private dialog: MatDialog) {
        this.rotations$ = this.userService.getUserData()
            .pipe(
                tap(user => this.linkButton = user.admin || user.patron),
                mergeMap(user => {
                    return this.rotationsService.getUserRotations(user.$key)
                        .pipe(
                            map(rotations => ({rotations: rotations, user: user}))
                        );
                }),
                map(data => {
                    const result = {nofolder: [], folders: []};
                    let rotations = data.rotations;
                    // Order rotations per folder
                    data.user.rotationFolders.forEach((folder) => {
                        const matchingRotations = [];
                        const otherRotations = [];
                        rotations.forEach(rotation => {
                            if (rotation.folder === folder) {
                                matchingRotations.push(rotation);
                            } else {
                                otherRotations.push(rotation);
                            }
                        });
                        let match = result.folders.find(f => f.name === folder);
                        if (match === undefined) {
                            result.folders.push({name: folder, rotations: []});
                            match = result.folders[result.folders.length - 1];
                        }
                        match.rotations.push(...matchingRotations);
                        rotations = otherRotations;
                    });
                    // Once we moved everybody to its folder, populate the nofolder array with the remaining ones.
                    result.nofolder.push(...rotations);
                    return result;
                })
            );
    }

    deleteFolder(folderName: string, rotations: CraftingRotation[]): void {
        this.dialog.open(ConfirmationPopupComponent)
            .afterClosed()
            .pipe(
                filter(res => res),
                mergeMap(() => {
                    return this.userService.getUserData()
                        .pipe(
                            first(),
                            mergeMap(user => {
                                user.rotationFolders = user.rotationFolders.filter(folder => folder !== folderName);
                                return this.userService.set(user.$key, user);
                            }),
                            mergeMap(() => {
                                rotations.forEach(r => delete r.folder);
                                return combineLatest(rotations.map(rotation => this.rotationsService.set(rotation.$key, rotation)));
                            })
                        )
                }),
            ).subscribe();
    }

    trackByFolder(index: number, folder: { name: string, rotations: CraftingRotation[] }): string {
        return folder.name;
    }

    onFolderDrop(folderName: string, rotation: CraftingRotation): void {
        rotation.folder = folderName;
        this.rotationsService.set(rotation.$key, rotation).subscribe();
    }

    removeFolder(rotation: CraftingRotation): void {
        delete rotation.folder;
        this.rotationsService.set(rotation.$key, rotation).subscribe();
    }

    renameFolder(folderName: string, rotations: CraftingRotation[]): void {
        this.dialog.open(NewFolderPopupComponent, {data: folderName})
            .afterClosed()
            .pipe(
                filter(name => name !== '' && name !== undefined && name !== null),
                mergeMap(newName => {
                    return this.userService.getUserData()
                        .pipe(
                            first(),
                            map(user => {
                                user.rotationFolders = user.rotationFolders.filter(folder => folder !== folderName);
                                user.rotationFolders.push(newName);
                                return user;
                            }),
                            mergeMap(user => {
                                return this.userService.set(user.$key, user);
                            }),
                            mergeMap(() => {
                                return combineLatest(rotations.map(rotation => {
                                    rotation.folder = newName;
                                    return this.rotationsService.set(rotation.$key, rotation);
                                }));
                            })
                        )
                })
            ).subscribe();
    }

    setFolderIndex(folderName: string, index: number): void {
        this.userService.getUserData()
            .pipe(
                first(),
                map(user => {
                    user.rotationFolders = user.rotationFolders.filter(folder => folder !== folderName);
                    user.rotationFolders.splice(index, 0, folderName);
                    return user;
                }),
                mergeMap(user => {
                    return this.userService.set(user.$key, user);
                })
            ).subscribe()
    }

    editRotationName(rotation: CraftingRotation): void {
        this.dialog.open(RotationNamePopupComponent, {data: rotation})
            .afterClosed()
            .pipe(
                filter(res => res !== undefined && res.length > 0),
                map(name => {
                    rotation.name = name;
                    return rotation;
                }),
                mergeMap(renamedRotation => this.rotationsService.set(renamedRotation.$key, renamedRotation))
            ).subscribe();
    }

    trackByRotation(index: number, rotation: CraftingRotation): string {
        return rotation.$key;
    }

    public deleteRotation(rotationId: string): void {
        this.dialog.open(ConfirmationPopupComponent, {data: 'SIMULATOR.Confirm_delete'})
            .afterClosed()
            .pipe(
                filter(res => res),
                mergeMap(() => this.rotationsService.remove(rotationId))
            ).subscribe();
    }

    public openLinkPopup(rotation: CraftingRotation): void {
        const link = new CustomLink();
        link.redirectTo = this.getLocalLink(rotation);
        this.dialog.open(CustomLinkPopupComponent, {data: link});
    }

    newFolder(): void {
        this.dialog.open(NewFolderPopupComponent)
            .afterClosed()
            .pipe(
                filter(name => name !== '' && name !== undefined && name !== null),
                mergeMap(folderName => {
                    return this.userService.getUserData()
                        .pipe(
                            first(),
                            map(user => {
                                if (user.rotationFolders.find(folder => folder === folderName) === undefined) {
                                    user.rotationFolders.push(folderName);
                                }
                                return user;
                            }),
                            mergeMap(user => {
                                return this.userService.set(user.$key, user);
                            })
                        )
                })
            ).subscribe();
    }

    private getLocalLink(rotation: CraftingRotation): string {
        let link = '/simulator';
        if (rotation.defaultItemId) {
            link += `/${rotation.defaultItemId}`;
            if (rotation.defaultRecipeId) {
                link += `/${rotation.defaultRecipeId}`;
            }
        } else {
            link += `/custom`;
        }
        return `${link}/${rotation.$key}`;
    }

    setFolder(rotation: CraftingRotation, folder: string): void {
        rotation.folder = folder;
        this.rotationsService.set(rotation.$key, rotation).subscribe();
    }
}
