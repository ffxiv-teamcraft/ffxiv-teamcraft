import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Craft } from '../../../../model/garland-tools/craft';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { SeoPageComponent } from '../../../../core/seo/seo-page-component';
import { SeoService } from '../../../../core/seo/seo.service';
import { SeoMetaConfig } from '../../../../core/seo/seo-meta-config';

@Component({
  selector: 'app-custom-simulator-page',
  templateUrl: './custom-simulator-page.component.html',
  styleUrls: ['./custom-simulator-page.component.less']
})
export class CustomSimulatorPageComponent extends SeoPageComponent {

  public recipeForm: FormGroup;

  public recipe$: Observable<Partial<Craft>>;

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
      rlvl: [380, Validators.required],
      progress: [3728, Validators.required],
      quality: [29591, Validators.required],
      durability: [70, Validators.required]
    });
    this.recipe$ = this.recipeForm.valueChanges.pipe(
      startWith({
        rlvl: 380,
        progress: 3728,
        quality: 29591,
        durability: 70
      }),
      map(form => {
        return {
          rlvl: form.rlvl,
          durability: form.durability,
          quality: form.quality,
          progress: form.progress
        };
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return combineLatest(this.rotationsFacade.selectedRotation$, this.recipe$).pipe(
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
