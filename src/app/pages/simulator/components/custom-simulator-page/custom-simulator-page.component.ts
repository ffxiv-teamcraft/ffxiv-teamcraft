import {Component} from '@angular/core';
import {Craft} from '../../../../model/garland-tools/craft';
import {CustomCraftingRotation} from '../../../../model/other/custom-crafting-rotation';
import {UserService} from '../../../../core/database/user.service';
import {CraftingRotationService} from '../../../../core/database/crafting-rotation.service';
import {combineLatest, Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {CraftingActionsRegistry} from '../../model/crafting-actions-registry';
import {CraftingAction} from '../../model/actions/crafting-action';
import {GearSet} from '../../model/gear-set';
import {filter, first, map, mergeMap} from 'rxjs/operators';
import {CraftingRotation} from '../../../../model/other/crafting-rotation';

@Component({
    selector: 'app-custom-simulator-page',
    templateUrl: './custom-simulator-page.component.html',
    styleUrls: ['./custom-simulator-page.component.scss']
})
export class CustomSimulatorPageComponent {

    public recipe: Partial<Craft> = {
        rlvl: 350,
        durability: 70,
        quality: 24000,
        progress: 6500,
        ingredients: []
    };

    public actions: CraftingAction[] = [];

    public userId$: Observable<string>;

    public stats: GearSet;

    public canSave = false;

    public notFound = false;

    public authorId;

    public rotation: CraftingRotation;

    constructor(private userService: UserService, private rotationsService: CraftingRotationService,
                private router: Router, activeRoute: ActivatedRoute, private registry: CraftingActionsRegistry) {

        this.userId$ = this.userService.getUserData()
            .pipe(map(user => user.$key));

        combineLatest(this.userId$,
            activeRoute.params
                .pipe(
                    map(params => params.rotationId),
                    filter(rotation => rotation !== undefined),
                    mergeMap(id => this.rotationsService.get(id)),
                    map(res => <CustomCraftingRotation>res)
                ), (userId, rotation) => ({userId: userId, rotation: rotation})
        ).subscribe((res) => {
            this.notFound = false;
            this.recipe = res.rotation.recipe;
            this.actions = this.registry.deserializeRotation(res.rotation.rotation);
            this.stats = res.rotation.stats;
            this.authorId = res.rotation.authorId;
            this.canSave = res.userId === res.rotation.authorId;
            this.rotation = res.rotation;
        }, () => this.notFound = true);
    }

    save(rotation: Partial<CustomCraftingRotation>): void {
        this.userId$
            .pipe(
                first(),
                mergeMap(userId => {
                    const result = new CustomCraftingRotation();
                    result.$key = rotation.$key;
                    result.rotation = rotation.rotation;
                    result.stats = rotation.stats;
                    result.recipe = rotation.recipe;
                    result.authorId = rotation.authorId;
                    result.description = '';
                    result.name = rotation.name;
                    if (result.$key === undefined || !this.canSave) {
                        result.authorId = userId;
                        // If the rotation has no key, it means that it's a new one, so let's create a rotation entry in the database.
                        return this.rotationsService.add(result);
                    } else {
                        return this.rotationsService.set(result.$key, result)
                            .pipe(
                                map(() => result.$key)
                            )
                    }
                })
            ).subscribe((rotationKey) => {
            this.router.navigate(['simulator', 'custom', rotationKey]);
        });
    }

}
