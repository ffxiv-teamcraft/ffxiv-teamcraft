import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Craft } from '../../../../model/garland-tools/craft';
import { combineLatest, merge, Observable } from 'rxjs';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { SeoService } from '../../../../core/seo/seo.service';
import { SeoMetaConfig } from '../../../../core/seo/seo-meta-config';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { AbstractSimulationPage } from '../../abstract-simulation-page';
import { EnvironmentService } from '../../../../core/environment.service';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';

@Component({
  selector: 'app-custom-simulator-page',
  templateUrl: './custom-simulator-page.component.html',
  styleUrls: ['./custom-simulator-page.component.less']
})
export class CustomSimulatorPageComponent extends AbstractSimulationPage {

  curMaxLevel = this.env.maxLevel;

  public recipeForm: FormGroup;

  public recipe$: Observable<Craft>;

  constructor(private fb: FormBuilder, protected route: ActivatedRoute,
              private rotationsFacade: RotationsFacade, protected seo: SeoService,
              private env: EnvironmentService, private xivapi: XivapiService) {
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
        return this.xivapi.get(XivapiEndpoint.RecipeLevelTable, recipe.rlvl).pipe(
          map(rlt => {
            return <Craft>{
              ...recipe,
              progressDivider: rlt.ProgressDivider,
              progressModifier: rlt.ProgressModifier,
              qualityDivider: rlt.QualityDivider,
              qualityModifier: rlt.QualityModifier,
            }
          })
        )
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
