import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CraftingRotationService} from '../../../../core/database/crafting-rotation.service';
import {CraftingRotation} from '../../../../model/other/crafting-rotation';
import {Observable} from 'rxjs/Observable';
import {UserService} from '../../../../core/database/user.service';
import {CraftingAction} from '../../model/actions/crafting-action';
import {CraftingActionsRegistry} from '../../model/crafting-actions-registry';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-rotations-page',
    templateUrl: './rotations-page.component.html',
    styleUrls: ['./rotations-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RotationsPageComponent {

    rotations$: Observable<CraftingRotation[]>;

    constructor(private rotationsService: CraftingRotationService, private userService: UserService,
                private craftingActionsRegistry: CraftingActionsRegistry, private snack: MatSnackBar,
                private translator: TranslateService) {
        this.rotations$ = this.userService.getUserData().mergeMap(user => {
            return this.rotationsService.getUserRotations(user.$key);
        });
    }

    public getSteps(rotation: CraftingRotation): CraftingAction[] {
        return this.craftingActionsRegistry.deserializeRotation(rotation.rotation);
    }

    public deleteRotation(rotationId: string): void {
        this.rotationsService.remove(rotationId).subscribe();
    }

    public getLink(rotation: CraftingRotation): string {
        return `${window.location.protocol}//${window.location.host}${rotation.defaultItemId ? '/simulator/' + rotation.defaultItemId + '/' + rotation.$key : '/simulator/custom/' + rotation.$key}`;
    }

    public showCopiedNotification(): void {
        this.snack.open(
            this.translator.instant('SIMULATOR.Share_link_copied'),
            '', {
                duration: 10000,
                extraClasses: ['snack']
            });
    }
}
