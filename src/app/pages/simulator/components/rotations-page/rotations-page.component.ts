import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CraftingRotationService} from '../../../../core/database/crafting-rotation.service';
import {CraftingRotation} from '../../../../model/other/crafting-rotation';
import {Observable} from 'rxjs/Observable';
import {UserService} from '../../../../core/database/user.service';
import {CraftingAction} from '../../model/actions/crafting-action';
import {CraftingActionsRegistry} from '../../model/crafting-actions-registry';

@Component({
    selector: 'app-rotations-page',
    templateUrl: './rotations-page.component.html',
    styleUrls: ['./rotations-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RotationsPageComponent {

    rotations$: Observable<CraftingRotation[]>;

    constructor(private rotationsService: CraftingRotationService, private userService: UserService,
                private craftingActionsRegistry: CraftingActionsRegistry) {
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
}
