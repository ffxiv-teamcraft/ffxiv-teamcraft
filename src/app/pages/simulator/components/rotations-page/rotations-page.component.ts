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
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import {LinkToolsService} from '../../../../core/tools/link-tools.service';
import {RotationNamePopupComponent} from '../rotation-name-popup/rotation-name-popup.component';

@Component({
    selector: 'app-rotations-page',
    templateUrl: './rotations-page.component.html',
    styleUrls: ['./rotations-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RotationsPageComponent {

    rotations$: Observable<CraftingRotation[]>;

    linkButton = false;

    constructor(private rotationsService: CraftingRotationService, private userService: UserService,
                private craftingActionsRegistry: CraftingActionsRegistry, private snack: MatSnackBar,
                private translator: TranslateService, private dialog: MatDialog, private linkTools: LinkToolsService) {
        this.rotations$ = this.userService.getUserData()
            .pipe(
                tap(user => this.linkButton = user.admin || user.patron),
                mergeMap(user => {
                    return this.rotationsService.getUserRotations(user.$key);
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

    public showCopiedNotification(): void {
        this.snack.open(
            this.translator.instant('SIMULATOR.Share_link_copied'),
            '', {
                duration: 10000,
                panelClass: ['snack']
            });
    }
}
