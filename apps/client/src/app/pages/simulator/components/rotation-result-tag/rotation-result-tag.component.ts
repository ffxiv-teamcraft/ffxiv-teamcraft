import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Craft } from '../../../../model/garland-tools/craft';
import { SimulationResult } from '@ffxiv-teamcraft/simulator';
import { AuthFacade } from '../../../../+state/auth.facade';
import { ConsumablesService } from '../../model/consumables.service';
import { LazyDataService } from '../../../../core/data/lazy-data.service';
import { Consumable } from '../../model/consumable';
import { FreeCompanyAction } from '../../model/free-company-action';
import { medicines } from 'apps/client/src/app/core/data/sources/medicines';
import { freeCompanyActions } from 'apps/client/src/app/core/data/sources/free-company-actions';
import { FreeCompanyActionsService } from '../../model/free-company-actions.service';
import { GearSet, SimulationService } from '../../../../core/simulation/simulation.service';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { BonusType } from '../../model/consumable-bonus';
import { environment } from 'apps/client/src/environments/environment';
import { EnvironmentService } from '../../../../core/environment.service';

@Component({
  selector: 'app-rotation-result-tag',
  templateUrl: './rotation-result-tag.component.html',
  styleUrls: ['./rotation-result-tag.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RotationResultTagComponent implements OnInit {

  @Input()
  public set rotation(rotation: CraftingRotation) {
    this.rotation$.next(rotation);
  }

  public get rotation(): CraftingRotation {
    return this.rotation$.value;
  }

  rotation$: BehaviorSubject<CraftingRotation> = new BehaviorSubject<CraftingRotation>(null);

  @Input()
  public set recipe(recipe: Craft) {
    this.recipe$.next(recipe);
  }

  public get recipe(): Craft {
    return this.recipe$.value;
  }

  @Input()
  public set simulationSet(set: GearSet) {
    this.simulationSet$.next(set);
  }

  @Input()
  collectable = false;

  simulationSet$: BehaviorSubject<GearSet> = new BehaviorSubject<GearSet>(null);

  recipe$: BehaviorSubject<Craft> = new BehaviorSubject<Craft>(null);

  result$: Observable<SimulationResult>;

  foods: Consumable[] = [];
  medicines: Consumable[] = [];
  freeCompanyActions: FreeCompanyAction[] = [];

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  private get registry() {
    return this.simulator.CraftingActionsRegistry;
  }

  constructor(private authFacade: AuthFacade, private consumablesService: ConsumablesService,
              private lazyData: LazyDataService, private freeCompanyActionsService: FreeCompanyActionsService,
              private simulationService: SimulationService, private settings: SettingsService,
              private env: EnvironmentService) {
  }

  ngOnInit(): void {
    this.foods = this.consumablesService.fromLazyData(this.lazyData.data.foods);
    this.medicines = this.consumablesService.fromData(medicines);
    this.freeCompanyActions = this.freeCompanyActionsService.fromData(freeCompanyActions);

    this.result$ = combineLatest([this.rotation$, this.authFacade.gearSets$, this.recipe$, this.simulationSet$]).pipe(
      filter(([rotation]) => rotation !== null),
      map(([rotation, gearSets, _recipe, simulationSet]) => {
        const recipe = this.lazyData.data.recipes.find(r => r.id === (_recipe || rotation.recipe).id);
        const stats = simulationSet || gearSets.find(g => g.jobId === recipe.job);
        const food = this.foods.find(f => this.rotation.food && f.itemId === this.rotation.food.id && f.hq === this.rotation.food.hq);
        const medicine = this.medicines.find(f => this.rotation.medicine && f.itemId === this.rotation.medicine.id && f.hq === this.rotation.medicine.hq);
        const fcActions = this.freeCompanyActions.filter(action => this.rotation.freeCompanyActions.indexOf(action.actionId) > -1);
        const crafterStats = new this.simulator.CrafterStats(
          stats.jobId,
          stats.craftsmanship + this.getBonusValue('Craftsmanship', stats.craftsmanship, food, medicine, fcActions),
          stats.control + this.getBonusValue('Control', stats.craftsmanship, food, medicine, fcActions),
          stats.cp + this.getBonusValue('CP', stats.craftsmanship, food, medicine, fcActions),
          stats.specialist,
          stats.level,
          gearSets.length > 0 ? gearSets.map(set => set.level) as [number, number, number, number, number, number, number, number] : [this.env.maxLevel, this.env.maxLevel, this.env.maxLevel, this.env.maxLevel, this.env.maxLevel, this.env.maxLevel, this.env.maxLevel, this.env.maxLevel]);
        return new this.simulator.Simulation(recipe, this.registry.deserializeRotation(rotation.rotation), crafterStats).run(true);
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
