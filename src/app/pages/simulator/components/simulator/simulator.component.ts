import {Component, Input, OnInit} from '@angular/core';
import {Craft} from '../../../../model/garland-tools/craft';
import {Simulation} from '../../simulation/simulation';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {CraftingAction} from '../../model/actions/crafting-action';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CrafterStats} from '../../model/crafter-stats';
import {SimulationReliabilityReport} from '../../simulation/simulation-reliability-report';
import {SimulationResult} from '../../simulation/simulation-result';
import {ActionType} from '../../model/actions/action-type';
import {CraftingActionsRegistry} from '../../model/crafting-actions-registry';
import {ObservableMedia} from '@angular/flex-layout';

@Component({
    selector: 'app-simulator',
    templateUrl: './simulator.component.html',
    styleUrls: ['./simulator.component.scss']
})
export class SimulatorComponent implements OnInit {

    private recipe$: ReplaySubject<Craft> = new ReplaySubject<Craft>(1);

    @Input()
    public set recipe(recipe: Craft) {
        this.recipe$.next(recipe);
    }

    private crafterStats$: ReplaySubject<CrafterStats> = new ReplaySubject<CrafterStats>(1);

    @Input()
    public set crafterStats(stats: CrafterStats) {
        this.crafterStats$.next(stats);
    }

    private actions$: BehaviorSubject<CraftingAction[]> = new BehaviorSubject<CraftingAction[]>([]);

    @Input()
    public set actions(actions: CraftingAction[]) {
        this.actions$.next(actions);
    }

    private hqIngredients$: BehaviorSubject<{ id: number, amount: number }[]> =
        new BehaviorSubject<{ id: number, amount: number }[]>([]);

    @Input()
    public set hqIngredients(ingredients: { id: number, amount: number }[]) {
        this.hqIngredients$.next(ingredients);
    }

    private simulation$: Observable<Simulation>;

    public result$: Observable<SimulationResult>;

    public report$: Observable<SimulationReliabilityReport>;

    constructor(private registry: CraftingActionsRegistry, private media: ObservableMedia) {
        this.simulation$ = Observable.combineLatest(
            this.recipe$,
            this.actions$,
            this.crafterStats$,
            this.hqIngredients$,
            (recipe, actions, stats, hqIngredients) => new Simulation(recipe, actions, stats, hqIngredients)
        );

        this.report$ = this.simulation$.map(simulation => simulation.getReliabilityReport());

        this.result$ = this.simulation$.map(simulation => simulation.run(true));
    }

    addAction(action: CraftingAction): void {
        this.actions$.next(this.actions$.getValue().concat(action));
    }

    removeAction(index: number): void {
        const rotation = this.actions$.getValue();
        rotation.splice(index, 1);
        this.actions$.next(rotation);
    }

    getProgressActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.PROGRESSION);
    }

    getQualityActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.QUALITY);
    }

    getCpRecoveryActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.CP_RECOVERY);
    }

    getBuffActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.BUFF);
    }

    getSpecialtyActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.SPECIALTY);
    }

    getRepairActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.REPAIR);
    }

    getOtherActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.OTHER);
    }

    isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }

    ngOnInit(): void {
        this.recipe = {
            'id': '3595',
            'job': 14,
            'rlvl': 288,
            'durability': 80,
            'quality': 12913,
            'progress': 2854,
            'lvl': 69,
            'yield': 3,
            'hq': 1,
            'quickSynth': 1,
            'ingredients': [
                {
                    'id': 19872,
                    'amount': 1,
                    'quality': 1244
                },
                {
                    'id': 19907,
                    'amount': 1,
                    'quality': 1313
                },
                {
                    'id': 19915,
                    'amount': 2,
                    'quality': 1313
                },
                {
                    'id': 20013,
                    'amount': 1,
                    'quality': 1272
                },
                {
                    'id': 19,
                    'amount': 2
                },
                {
                    'id': 18,
                    'amount': 1
                }
            ],
            'complexity': {
                'nq': 155,
                'hq': 160
            }
        };
        this.crafterStats = new CrafterStats(
            14,
            1467,
            1468,
            474,
            true,
            70);
        this.actions = [];
        this.hqIngredients = [];
    }
}
