import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CraftingRotationService} from '../../../../core/database/crafting-rotation.service';
import {CraftingRotation} from '../../../../model/other/crafting-rotation';
import {Observable} from 'rxjs';
import {UserService} from '../../../../core/database/user.service';
import {CraftingAction} from '../../model/actions/crafting-action';
import {CraftingActionsRegistry} from '../../model/crafting-actions-registry';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {ConfirmationPopupComponent} from '../../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {CustomLink} from '../../../../core/database/custom-links/custom-link';
import {CustomLinkPopupComponent} from '../../../custom-links/custom-link-popup/custom-link-popup.component';
import {filter, first, map, mergeMap, tap} from 'rxjs/operators';
import {LinkToolsService} from '../../../../core/tools/link-tools.service';
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
                private translator: TranslateService, private dialog: MatDialog, private linkTools: LinkToolsService) {
        this.rotations$ = this.userService.getUserData()
            .pipe(
                tap(user => this.linkButton = user.admin || user.patron),
                mergeMap(user => {
                    return this.rotationsService.getUserRotations(user.$key);
                }),
                map(rotations => {
                    // Order rotations per folder
                    return rotations.reduce((result, rotation) => {
                        if (rotation.folder === undefined) {
                            result.nofolder.push(rotation);
                        } else {
                            let folder = result.folders.find(f => f.name === rotation.folder);
                            if (folder === undefined) {
                                result.folders.push({name: rotation.folder, rotations: []});
                                folder = result.folders[result.folders.length];
                            }
                            folder.rotations.push(rotation);
                        }
                        return result;
                    }, {nofolder: [], folders: []});
                })
            );
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

    public getSteps(rotation: CraftingRotation): CraftingAction[] {
        return this.craftingActionsRegistry.deserializeRotation(rotation.rotation);
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

    public getLink(rotation: CraftingRotation): string {
        return this.linkTools.getLink(this.getLocalLink(rotation));
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

    nelder(): void {
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

    setFolder(rotation: CraftingRotation, folder: string): void {
        rotation.folder = folder;
        this.rotationsService.set(rotation.$key, rotation).subscribe();
    }

    public showCopiedNotification(): void {
        this.snack.open(
            this.translator.instant('SIMULATOR.Share_link_copied'),
            '', {
                duration: 10000,
                panelClass: ['snack']
            });
    }
}
