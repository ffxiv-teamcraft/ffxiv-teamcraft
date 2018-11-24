import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Craft } from '../../../../model/garland-tools/craft';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-custom-simulator-page',
  templateUrl: './custom-simulator-page.component.html',
  styleUrls: ['./custom-simulator-page.component.less']
})
export class CustomSimulatorPageComponent {

  public recipeForm: FormGroup;

  public recipe$: Observable<Partial<Craft>>;

  constructor(private fb: FormBuilder) {
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
