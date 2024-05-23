import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { Craft, SimulationResult } from '@ffxiv-teamcraft/simulator';
import { AuthFacade } from '../../../../+state/auth.facade';
import { ConsumablesService } from '../../model/consumables.service';
import { Consumable } from '../../model/consumable';
import { FreeCompanyAction } from '../../model/free-company-action';
import { freeCompanyActions } from '../../../../core/data/sources/free-company-actions';
import { FreeCompanyActionsService } from '../../model/free-company-actions.service';
import { GearSet, SimulationService } from '../../../../core/simulation/simulation.service';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { BonusType } from '../../model/consumable-bonus';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../../core/rxjs/with-lazy-data';
import { EnvironmentService } from '../../../../core/environment.service';
import { FloorPipe } from '../../../../pipes/pipes/floor.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-rotation-result-tag',
    templateUrl: './rotation-result-tag.component.html',
    styleUrls: ['./rotation-result-tag.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzToolTipModule, NzTagModule, AsyncPipe, TranslateModule, FloorPipe]
})
export class RotationResultTagComponent implements OnInit {

  rotation$: BehaviorSubject<CraftingRotation> = new BehaviorSubject<CraftingRotation>(null);

  @Input()
  collectable = false;

  simulationSet$: BehaviorSubject<GearSet> = new BehaviorSubject<GearSet>(null);

  recipe$: BehaviorSubject<Craft> = new BehaviorSubject<Craft>(null);

  result$: Observable<SimulationResult>;

  foods$: Observable<Consumable[]> = this.lazyData.getEntry('foods').pipe(
    map(foods => this.consumablesService.fromLazyData(foods))
  );

  medicines$: Observable<Consumable[]> = this.lazyData.getEntry('medicines').pipe(
    map(medicines => this.consumablesService.fromLazyData(medicines))
  );

  freeCompanyActions: FreeCompanyAction[] = [];

  constructor(private authFacade: AuthFacade, private consumablesService: ConsumablesService,
              private lazyData: LazyDataFacade, private freeCompanyActionsService: FreeCompanyActionsService,
              private simulationService: SimulationService, private settings: SettingsService,
              private environment: EnvironmentService) {
  }

  public get rotation(): CraftingRotation {
    return this.rotation$.value;
  }

  @Input()
  public set rotation(rotation: CraftingRotation) {
    this.rotation$.next(rotation);
  }

  public get recipe(): Craft {
    return this.recipe$.value;
  }

  @Input()
  public set recipe(recipe: Craft) {
    this.recipe$.next(recipe);
  }

  @Input()
  public set simulationSet(set: GearSet) {
    this.simulationSet$.next(set);
  }

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  private get registry() {
    return this.simulator.CraftingActionsRegistry;
  }

  ngOnInit(): void {
    this.freeCompanyActions = this.freeCompanyActionsService.fromData(freeCompanyActions);

    this.result$ = combineLatest([this.rotation$, this.authFacade.gearSets$, this.recipe$, this.simulationSet$]).pipe(
      filter(([rotation]) => rotation !== null),
      withLazyData(this.lazyData, 'recipes'),
      switchMap(([[rotation, gearSets, _recipe, simulationSet], recipes]) => {
        return combineLatest([this.foods$, this.medicines$]).pipe(
          map(([foods, medicines]) => {
            let recipe = recipes.find(r => r.id === (_recipe || rotation.recipe).id) as unknown as Craft;
            if (!recipe) {
              recipe = rotation.recipe as unknown as Craft;
            }
            const stats = simulationSet || gearSets.find(g => g.jobId === recipe.job);
            const food = foods.find(f => this.rotation.food && f.itemId === this.rotation.food.id && f.hq === this.rotation.food.hq);
            const medicine = medicines.find(f => this.rotation.medicine && f.itemId === this.rotation.medicine.id && f.hq === this.rotation.medicine.hq);
            const fcActions = this.freeCompanyActions.filter(action => this.rotation.freeCompanyActions.indexOf(action.actionId) > -1);
            const crafterStats = new this.simulator.CrafterStats(
              stats.jobId,
              stats.craftsmanship + this.getBonusValue('Craftsmanship', stats.craftsmanship, food, medicine, fcActions),
              stats.control + this.getBonusValue('Control', stats.craftsmanship, food, medicine, fcActions),
              stats.cp + this.getBonusValue('CP', stats.craftsmanship, food, medicine, fcActions),
              stats.specialist,
              stats.splendorous,
              stats.level,
              gearSets.length > 0 ? gearSets.map(set => set.level) as [number, number, number, number, number, number, number, number] : [this.environment.maxLevel, this.environment.maxLevel, this.environment.maxLevel, this.environment.maxLevel, this.environment.maxLevel, this.environment.maxLevel, this.environment.maxLevel, this.environment.maxLevel]);
            return new this.simulator.Simulation(recipe, this.registry.deserializeRotation(rotation.rotation), crafterStats).run(true);
          })
        );
      })
    );
  }


  getBonusValue(bonusType: BonusType, baseValue: number, food: Consumable, medicine: Consumable, fcActions: FreeCompanyAction[]): number {
    let bonusFromFood = 0;
    let bonusFromMedicine = 0;
    let bonusFromFreeCompanyAction = 0;

    if (food !== undefined && food !== null) {
      const foodBonus = food.getBonus(bonusType);
      if (foodBonus !== undefined) {
        bonusFromFood = Math.floor(baseValue * foodBonus.value);
        if (bonusFromFood > foodBonus.max) {
          bonusFromFood = foodBonus.max;
        }
      }
    }
    if (medicine !== undefined && medicine !== null) {
      const medicineBonus = medicine.getBonus(bonusType);
      if (medicineBonus !== undefined) {
        bonusFromMedicine = Math.floor(baseValue * medicineBonus.value);
        if (bonusFromMedicine > medicineBonus.max) {
          bonusFromMedicine = medicineBonus.max;
        }
      }
    }

    if (fcActions !== undefined && fcActions !== null) {
      bonusFromFreeCompanyAction = this.getFreeCompanyActionValue(bonusType, fcActions);
    }

    return bonusFromFood + bonusFromMedicine + bonusFromFreeCompanyAction;
  }

  getFreeCompanyActionValue(bonusType: BonusType, actions: FreeCompanyAction[]): number {
    let value = 0;
    const action = actions.find(a => a.type === bonusType);

    if (action !== undefined) {
      value = action.value;
    }

    return value;
  }

}
