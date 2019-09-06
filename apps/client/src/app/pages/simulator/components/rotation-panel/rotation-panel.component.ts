import { Component, Input, OnInit } from '@angular/core';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import {
  CrafterStats,
  CraftingAction,
  CraftingActionsRegistry,
  GearSet,
  Simulation,
  SimulationResult
} from '@ffxiv-teamcraft/simulator';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { filter, map, shareReplay, tap } from 'rxjs/operators';
import { LinkToolsService } from '../../../../core/tools/link-tools.service';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { NameQuestionPopupComponent } from '../../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { AuthFacade } from '../../../../+state/auth.facade';
import { PermissionLevel } from '../../../../core/database/permissions/permission-level.enum';
import { CustomLink } from '../../../../core/database/custom-links/custom-link';
import { TeamcraftUser } from '../../../../model/user/teamcraft-user';
import { CustomLinksFacade } from '../../../../modules/custom-links/+state/custom-links.facade';
import { Router } from '@angular/router';
import { MacroPopupComponent } from '../macro-popup/macro-popup.component';
import { foods } from '../../../../core/data/sources/foods';
import { medicines } from '../../../../core/data/sources/medicines';
import { freeCompanyActions } from '../../../../core/data/sources/free-company-actions';
import { ConsumablesService } from '../../model/consumables.service';
import { FreeCompanyActionsService } from '../../model/free-company-actions.service';
import { Consumable } from '../../model/consumable';
import { FreeCompanyAction } from '../../model/free-company-action';
import { BonusType } from '../../model/consumable-bonus';
import { Craft } from '../../../../model/garland-tools/craft';
import { IpcService } from '../../../../core/electron/ipc.service';
import { PlatformService } from '../../../../core/tools/platform.service';

@Component({
  selector: 'app-rotation-panel',
  templateUrl: './rotation-panel.component.html',
  styleUrls: ['./rotation-panel.component.less']
})
export class RotationPanelComponent implements OnInit {

  @Input()
  public set rotation(rotation: CraftingRotation) {
    this.rotation$.next(rotation);
  }

  public get rotation(): CraftingRotation {
    return this.rotation$.value;
  }

  rotation$: BehaviorSubject<CraftingRotation> = new BehaviorSubject<CraftingRotation>(null);

  @Input()
  public set simulationSet(set: GearSet) {
    this.simulationSet$.next(set);
  }

  simulationSet$: ReplaySubject<GearSet> = new ReplaySubject<GearSet>();

  actions$: Observable<CraftingAction[]>;

  permissionLevel$: Observable<PermissionLevel> = combineLatest(this.rotation$, this.authFacade.userId$).pipe(
    map(([rotation, userId]) => rotation.getPermissionLevel(userId))
  );

  public user$ = this.authFacade.user$;

  public customLink$: Observable<CustomLink>;

  private syncLinkUrl: string;

  @Input()
  public publicDisplay = false;

  public foods: Consumable[] = [];
  public medicines: Consumable[] = [];
  public freeCompanyActions: FreeCompanyAction[] = [];

  public simulation$: Observable<SimulationResult>;

  constructor(private linkTools: LinkToolsService,
              private rotationsFacade: RotationsFacade, private message: NzMessageService,
              private translate: TranslateService, private dialog: NzModalService,
              public authFacade: AuthFacade, private customLinksFacade: CustomLinksFacade,
              private router: Router, public consumablesService: ConsumablesService,
              public freeCompanyActionsService: FreeCompanyActionsService, private ipc: IpcService,
              public platformService: PlatformService) {
    this.actions$ = this.rotation$.pipe(
      filter(rotation => rotation !== null),
      map(rotation => CraftingActionsRegistry.deserializeRotation(rotation.rotation))
    );

    this.customLink$ = combineLatest(this.customLinksFacade.myCustomLinks$, this.rotation$).pipe(
      filter(([, rotation]) => rotation !== null),
      map(([links, rotation]) => links.find(link => link.redirectTo === this.getRouterLink(rotation).substr(1))),
      tap(link => link !== undefined ? this.syncLinkUrl = link.getUrl() : null),
      shareReplay(1)
    );

    this.foods = consumablesService.fromData(foods);
    this.medicines = consumablesService.fromData(medicines);
    this.freeCompanyActions = freeCompanyActionsService.fromData(freeCompanyActions);

  }

  ngOnInit(): void {
    this.simulation$ = combineLatest(this.rotation$, this.authFacade.gearSets$, this.simulationSet$).pipe(
      filter(([rotation, , stats]) => rotation !== null && stats !== null),
      map(([rotation, gearSets, stats]) => {
        const food = this.foods.find(f => this.rotation.food && f.itemId === this.rotation.food.id && f.hq === this.rotation.food.hq);
        const medicine = this.medicines.find(f => this.rotation.medicine && f.itemId === this.rotation.medicine.id && f.hq === this.rotation.medicine.hq);
        const fcActions = this.freeCompanyActions.filter(action => this.rotation.freeCompanyActions.indexOf(action.actionId) > -1);
        const crafterStats = new CrafterStats(
          stats.jobId,
          stats.craftsmanship + this.getBonusValue('Craftsmanship', stats.craftsmanship, food, medicine, fcActions),
          stats.control + this.getBonusValue('Control', stats.craftsmanship, food, medicine, fcActions),
          stats.cp + this.getBonusValue('CP', stats.craftsmanship, food, medicine, fcActions),
          stats.specialist,
          stats.level,
          gearSets.length > 0 ? gearSets.map(set => set.level) as [number, number, number, number, number, number, number, number] : [70, 70, 70, 70, 70, 70, 70, 70]);
        return new Simulation(rotation.recipe as Craft, CraftingActionsRegistry.deserializeRotation(rotation.rotation), crafterStats).run(true);
      })
    );
  }

  public openOverlay(rotation: CraftingRotation): void {
    this.ipc.openOverlay(`/rotation-overlay/${rotation.$key}`, '/rotation-overlay', IpcService.ROTATION_DEFAULT_DIMENSIONS);
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

  openRotation(rotation: CraftingRotation): void {
    this.router.navigateByUrl(this.getRouterLink(rotation));
  }

  createCustomLink(rotation: CraftingRotation, user: TeamcraftUser): void {
    this.customLinksFacade.createCustomLink(rotation.getName(), this.getRouterLink(rotation).substr(1), user);
  }

  afterCustomLinkCopy(): void {
    this.message.success(this.translate.instant('CUSTOM_LINKS.Share_link_copied'));
  }

  getLink(rotation: CraftingRotation): string {
    return this.linkTools.getLink(this.getRouterLink(rotation));
  }

  getRouterLink(rotation: CraftingRotation): string {
    if (rotation.custom || rotation.defaultItemId === undefined || rotation.defaultRecipeId === undefined) {
      return `/simulator/custom/${rotation.$key}`;
    } else {
      return `/simulator/${rotation.defaultItemId}/${rotation.defaultRecipeId}/${rotation.$key}`;
    }
  }

  openMacroPopup(simulation: Simulation): void {
    this.dialog.create({
      nzContent: MacroPopupComponent,
      nzComponentParams: {
        rotation: CraftingActionsRegistry.deserializeRotation(this.rotation.rotation),
        job: this.rotation.recipe.job,
        simulation: simulation.clone(),
        food: this.foods.find(f => this.rotation.food && f.itemId === this.rotation.food.id && f.hq === this.rotation.food.hq),
        medicine: this.medicines.find(f => this.rotation.medicine && f.itemId === this.rotation.medicine.id && f.hq === this.rotation.medicine.hq),
        freeCompanyActions: this.freeCompanyActions.filter(action => this.rotation.freeCompanyActions.indexOf(action.actionId) > -1)
      },
      nzTitle: this.translate.instant('SIMULATOR.Generate_ingame_macro'),
      nzFooter: null
    });
  }

  renameRotation(rotation: CraftingRotation): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: rotation.getName() },
      nzFooter: null,
      nzTitle: this.translate.instant('Edit')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        rotation.name = name;
        return rotation;
      })
    ).subscribe(r => {
      this.rotationsFacade.updateRotation(r);
    });
  }

  afterLinkCopy(): void {
    this.message.success(this.translate.instant('SIMULATOR.Share_link_copied'));
  }

  delete(rotation: CraftingRotation): void {
    this.rotationsFacade.deleteRotation(rotation.$key);
  }

}
