import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Craft } from '../../../../model/garland-tools/craft';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';

@Component({
  selector: 'app-custom-simulator-page',
  templateUrl: './custom-simulator-page.component.html',
  styleUrls: ['./custom-simulator-page.component.less']
})
export class CustomSimulatorPageComponent {

  public recipeForm: FormGroup;

  public recipe$: Observable<Partial<Craft>>;

  constructor(private fb: FormBuilder, private route: ActivatedRoute,
              private rotationsFacade: RotationsFacade) {
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
}
