import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Craft} from '../../../../model/garland-tools/craft';
import {combineLatest, Observable, of} from 'rxjs';
import {DataService} from '../../../../core/api/data.service';
import {CraftingRotation} from '../../../../model/other/crafting-rotation';
import {CraftingAction} from '../../model/actions/crafting-action';
import {GearSet} from '../../model/gear-set';
import {CraftingActionsRegistry} from '../../model/crafting-actions-registry';
import {CraftingRotationService} from '../../../../core/database/crafting-rotation.service';
import {UserService} from '../../../../core/database/user.service';
import {Consumable} from '../../model/consumable';
import {catchError, distinctUntilChanged, filter, first, map, mergeMap} from 'rxjs/operators';

@Component({
    selector: 'app-simulator-page',
    templateUrl: './simulator-page.component.html',
    styleUrls: ['./simulator-page.component.scss']
})
export class SimulatorPageComponent {

    public recipe$: Observable<Craft>;

    public itemId: number;

    public itemIcon: number;

    public actions: CraftingAction[] = [];

    public userId$: Observable<string>;

    public stats: GearSet;

    public canSave = false;

    public selectedFood: Consumable;

    public selectedMedicine: Consumable;

    public notFound = false;

    public authorId: string;

    private recipeId: string;

    public rotation: CraftingRotation;

    constructor(private userService: UserService, private rotationsService: CraftingRotationService,
                private router: Router, activeRoute: ActivatedRoute, private registry: CraftingActionsRegistry,
                private data: DataService) {
        this.recipe$ = activeRoute.params
            .pipe(
                mergeMap(params => {
                    return data.getItem(params.itemId)
                        .pipe(
                            map(item => {
                                this.itemId = params.itemId;
                                this.itemIcon = item.item.icon;
                                // If rotationId is only numbers, it's a recipeId
                                if (params.rotationId !== undefined && /^\d+$/.test(params.rotationId)) {
                                    this.recipeId = params.rotationId;
                                    return item.item.craft.find(craft => +craft.id === +this.recipeId);
                                } else if (params.recipeId !== undefined) {
                                    this.recipeId = params.recipeId;
                                    return item.item.craft.find(craft => +craft.id === +this.recipeId);
                                }
                                // Because only crystals change between recipes, we take the first one.
                                return item.item.craft[0];
                            })
                        );
                }),
                catchError(() => {
                    this.notFound = true;
                    return of(null);
                })
            );

        this.userId$ = this.userService.getUserData()
            .pipe(
                map(user => user.$key)
            );

        combineLatest(this.userId$,
            activeRoute.params
                .pipe(
                    map(params => {
                        // If rotationId is a number only, it means that it's a recipeId.
                        if (/^\d+$/.test(params.rotationId)) {
                            return undefined;
                        }
                        return params.rotationId;
                    }),
                    filter(rotation => rotation !== undefined),
                    mergeMap(id => this.rotationsService.get(id).pipe(distinctUntilChanged())),
                    map(res => res))
            ,
            (userId, rotation) => ({userId: userId, rotation: rotation})
        ).subscribe((res) => {
            this.notFound = false;
            this.actions = this.registry.deserializeRotation(res.rotation.rotation);
            this.canSave = res.userId === res.rotation.authorId;
            this.authorId = res.rotation.authorId;
            this.selectedFood = res.rotation.consumables.food;
            this.selectedMedicine = res.rotation.consumables.medicine;
            this.rotation = res.rotation;
        }, () => this.notFound = true);
    }

    save(rotation: Partial<CraftingRotation>): void {
        this.userId$
            .pipe(
                first(),
                map(userId => {
                    const result = new CraftingRotation();
                    result.$key = rotation.$key;
                    result.rotation = rotation.rotation;
                    result.defaultItemId = this.itemId;
                    result.authorId = rotation.authorId;
                    result.recipe = rotation.recipe;
                    result.description = '';
                    result.name = rotation.name;
                    result.consumables = rotation.consumables;
                    result.defaultRecipeId = +this.recipeId;
                    return {rotation: result, userId: userId};
                }),
                mergeMap(data => {
                    const preparedRotation = data.rotation;
                    if (preparedRotation.$key === undefined || !this.canSave) {
                        // Set new authorId for the newly created rotation
                        preparedRotation.authorId = data.userId;
                        // If the rotation has no key, it means that it's a new one, so let's create a rotation entry in the database.
                        return this.rotationsService.add(preparedRotation);
                    } else {
                        return this.rotationsService.set(preparedRotation.$key, preparedRotation)
                            .pipe(map(() => preparedRotation.$key))
                    }
                })
            ).subscribe((rotationKey) => {
            if (this.recipeId !== undefined) {
                this.router.navigate(['simulator', this.itemId, this.recipeId, rotationKey]);
            } else {
                this.router.navigate(['simulator', this.itemId, rotationKey]);
            }
        });
    }

}
