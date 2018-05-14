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
import {CustomLink} from '../../../../core/database/custom-links/costum-link';
import {CustomLinkPopupComponent} from '../../../custom-links/custom-link-popup/custom-link-popup.component';
import {filter, tap} from 'rxjs/operators';
import {mergeMap} from 'rxjs/operators';

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
                private translator: TranslateService, private dialog: MatDialog) {
        this.rotations$ = this.userService.getUserData()
            .pipe(
                tap(user => this.linkButton = user.admin || user.patron),
                mergeMap(user => {
                    return this.rotationsService.getUserRotations(user.$key);
                })
            );
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
        link.redirectTo = `${rotation.defaultItemId ? 'simulator/' +
            rotation.defaultItemId + '/' + rotation.$key : 'simulator/custom/' + rotation.$key}`;
        this.dialog.open(CustomLinkPopupComponent, {data: link});
    }

    public getLink(rotation: CraftingRotation): string {
        return `${window.location.protocol}//${window.location.host}${rotation.defaultItemId ? '/simulator/' +
            rotation.defaultItemId + '/' + rotation.$key : '/simulator/custom/' + rotation.$key}`;
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
