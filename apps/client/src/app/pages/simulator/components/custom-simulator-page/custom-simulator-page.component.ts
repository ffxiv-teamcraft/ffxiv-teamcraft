import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, merge, Observable } from 'rxjs';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { SeoService } from '../../../../core/seo/seo.service';
import { SeoMetaConfig } from '../../../../core/seo/seo-meta-config';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { AbstractSimulationPage } from '../../abstract-simulation-page';
import { EnvironmentService } from '../../../../core/environment.service';
import { Craft } from '@ffxiv-teamcraft/simulator';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { TranslateModule } from '@ngx-translate/core';
import { SimulatorComponent } from '../simulator/simulator.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { MouseWheelDirective } from '../../../../core/event/mouse-wheel/mouse-wheel.directive';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-custom-simulator-page',
    templateUrl: './custom-simulator-page.component.html',
    styleUrls: ['./custom-simulator-page.component.less'],
    standalone: true,
    imports: [FlexModule, NzCollapseModule, FormsModule, NzFormModule, ReactiveFormsModule, NzGridModule, NzInputNumberModule, MouseWheelDirective, NzCheckboxModule, NgIf, SimulatorComponent, AsyncPipe, TranslateModule]
})
export class CustomSimulatorPageComponent extends AbstractSimulationPage {

  curMaxLevel = this.env.maxLevel;

  public recipeForm: UntypedFormGroup;

  public recipe$: Observable<Craft>;

  constructor(private fb: UntypedFormBuilder, protected route: ActivatedRoute,
              private rotationsFacade: RotationsFacade, protected seo: SeoService,
              private env: EnvironmentService, private lazyData: LazyDataFacade) {
    super(route, seo);
    this.route.paramMap.pipe(
      map(params => params.get('rotationId'))
    ).subscribe(id => {
      if (id === null) {
        this.rotationsFacade.createRotation();
        this.rotationsFacade.selectRotation(undefined);
      } else {
        this.rotationsFacade.getRotation(id);
        this.rotationsFacade.selectRotation(id);
      }
    });
    this.recipeForm = this.fb.group({
      rlvl: [560, [Validators.min(1), Validators.required]],
      level: [this.curMaxLevel, [Validators.min(1), Validators.max(this.curMaxLevel), Validators.required]],
      progress: [3500, [Validators.min(1), Validators.required]],
      quality: [7200, [Validators.min(1), Validators.required]],
      durability: [80, [Validators.min(1), Validators.required]],
      expert: [false]
    });
    const recipeFromRotation$ = this.rotationsFacade.selectedRotation$.pipe(
      filter(rotation => {
        return rotation.recipe !== undefined;
      }),
      map((rotation: CraftingRotation) => {
        return rotation.recipe;
      })
    );

    const recipeFromForm$ = this.recipeForm.valueChanges.pipe(
      startWith({
        rlvl: 560,
        level: this.env.maxLevel,
        progress: 3500,
        quality: 7200,
        durability: 80,
        expert: false
      }),
      map(form => {
        return {
          rlvl: form.rlvl,
          lvl: form.level,
          durability: form.durability,
          quality: form.quality,
          progress: form.progress,
          expert: form.expert
        };
      })
    );

    this.recipe$ = merge(recipeFromForm$, recipeFromRotation$).pipe(
      map(recipe => {
        (recipe as Craft).conditionsFlag = recipe.expert ? 511 : 15;
        return recipe;
      }),
      switchMap(recipe => {
        return this.lazyData.getRow('recipeLevelTable', recipe.rlvl).pipe(
          map(rlt => {
            return <Craft>{
              ...recipe,
              ...rlt
            };
          })
        );
      }),
      tap(recipe => {
        this.recipeForm.patchValue({
          rlvl: recipe.rlvl,
          level: recipe.lvl,
          progress: recipe.progress,
          quality: recipe.quality,
          durability: recipe.durability,
          expert: recipe.expert
        }, { emitEvent: false });
      })
    );
  }

  public adjust(prop: string, amount: number): void {
    const oldValue = this.recipeForm.value[prop];
    const newValue = this.recipeForm.value[prop] + amount;

    this.recipeForm.patchValue({ [prop]: newValue });

    if (this.recipeForm.controls[prop].invalid) {
      this.recipeForm.patchValue({ [prop]: oldValue });
    }
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return combineLatest([this.rotationsFacade.selectedRotation$, this.recipe$]).pipe(
      map(([rotation, recipe]) => {
        return {
          title: rotation.getName(),
          description: `rlvl ${recipe.rlvl}, ${recipe.durability} durability, ${rotation.rotation.length} steps`,
          url: `https://ffxivteamcraft.com/simulator/custom/${rotation.$key}`
        };
      })
    );
  }
}
