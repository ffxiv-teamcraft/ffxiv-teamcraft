import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Craft } from '../../../../model/garland-tools/craft';
import { combineLatest, merge, Observable } from 'rxjs';
import { filter, map, startWith, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { SeoPageComponent } from '../../../../core/seo/seo-page-component';
import { SeoService } from '../../../../core/seo/seo.service';
import { SeoMetaConfig } from '../../../../core/seo/seo-meta-config';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';

@Component({
  selector: 'app-custom-simulator-page',
  templateUrl: './custom-simulator-page.component.html',
  styleUrls: ['./custom-simulator-page.component.less']
})
export class CustomSimulatorPageComponent extends SeoPageComponent {

  public recipeForm: FormGroup;

  public recipe$: Observable<Partial<Craft>>;

  stats$: Observable<{ craftsmanship: number, control: number, cp: number, spec: boolean, level: number }>;

  constructor(private fb: FormBuilder, private route: ActivatedRoute,
              private rotationsFacade: RotationsFacade, protected seo: SeoService) {
    super(seo);
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
      rlvl: [450, Validators.required],
      level: [80, Validators.required],
      progress: [5654, Validators.required],
      quality: [37440, Validators.required],
      durability: [70, Validators.required],
      suggCraft: [2140, Validators.required],
      suggCtrl: [1990, Validators.required]
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
        rlvl: 450,
        level: 80,
        progress: 5654,
        quality: 37440,
        durability: 70,
        suggCraft: 2140,
        suggCtrl: 1990
      }),
      map(form => {
        return {
          rlvl: form.rlvl,
          lvl: form.level,
          durability: form.durability,
          quality: form.quality,
          progress: form.progress,
          suggestedCraftsmanship: form.suggCraft,
          suggestedControl: form.suggCtrl
        };
      })
    );

    this.recipe$ = merge(recipeFromForm$, recipeFromRotation$).pipe(
      tap(recipe => {
        this.recipeForm.patchValue({
          rlvl: recipe.rlvl,
          level: recipe.lvl,
          progress: recipe.progress,
          quality: recipe.quality,
          durability: recipe.durability,
          suggCraft: recipe.suggestedCraftsmanship,
          suggCtrl: recipe.suggestedControl
        }, { emitEvent: false });
      })
    );

    this.stats$ = this.route.queryParamMap.pipe(
      map(query => {
        return query.get('stats');
      }),
      filter(stats => stats !== null),
      map(statsStr => {
        const split = statsStr.split('/');
        return {
          craftsmanship: +split[0],
          control: +split[1],
          cp: +split[2],
          level: +split[3],
          spec: +split[3] === 1
        };
      })
    );
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
