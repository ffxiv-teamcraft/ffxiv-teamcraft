import { Component } from '@angular/core';
import { Craft, CrafterStats } from '@ffxiv-teamcraft/simulator';
import { NzModalRef } from 'ng-zorro-antd';
import { defaultConfiguration, Solver, SolverConfiguration } from '@ffxiv-teamcraft/crafting-solver';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-solver-popup',
  templateUrl: './solver-popup.component.html',
  styleUrls: ['./solver-popup.component.less']
})
export class SolverPopupComponent {

  public stats: CrafterStats;

  public recipe: Craft;

  public configForm: FormGroup;

  public loading = false;

  constructor(private ref: NzModalRef, fb: FormBuilder) {
    this.configForm = fb.group({
      populationSize: [defaultConfiguration.populationSize, Validators.required],
      iterations: [defaultConfiguration.iterations, Validators.required],
      hqWeight: [defaultConfiguration.weights.hq, Validators.required],
      progressWeight: [defaultConfiguration.weights.progress, Validators.required],
      lengthWeight: [defaultConfiguration.weights.length, Validators.required],
      safe: [defaultConfiguration.safe, Validators.required]
    });
  }

  public submit(): void {
    this.loading = true;
    const formRaw = this.configForm.getRawValue();
    const configuration: SolverConfiguration = {
      safe: formRaw.safe,
      populationSize: formRaw.populationSize,
      iterations: formRaw.iterations,
      progressAccuracy: defaultConfiguration.progressAccuracy,
      weights: {
        progress: formRaw.progressWeight,
        hq: formRaw.hqWeight,
        length: formRaw.lengthWeight,
        finished: defaultConfiguration.weights.finished
      }
    };
    const rotation = new Solver(this.recipe, this.stats, configuration).run();
    this.ref.close(rotation);
  }
}
