import { Component } from '@angular/core';
import { Craft, CrafterStats, CraftingActionsRegistry } from '@ffxiv-teamcraft/simulator';
import { NzModalRef } from 'ng-zorro-antd';
import { defaultConfiguration, SolverConfiguration } from '@ffxiv-teamcraft/crafting-solver';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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

  constructor(private ref: NzModalRef, private http: HttpClient, fb: FormBuilder) {
    this.configForm = fb.group({
      hqTarget: [defaultConfiguration.hqTarget, Validators.required],
      safe: [false, Validators.required]
    });
  }

  public submit(): void {
    this.loading = true;
    const formRaw = this.configForm.getRawValue();
    const configuration: SolverConfiguration = {
      populationSize: defaultConfiguration.populationSize,
      progressAccuracy: defaultConfiguration.progressAccuracy,
      hqTarget: formRaw.hqTarget
    };
    // To debug using local function: http://localhost:5001/ffxivteamcraft/us-central1/solver
    // Prod: https://us-central1-ffxivteamcraft.cloudfunctions.net/solver
    this.http.post<string[]>(`https://us-central1-ffxivteamcraft.cloudfunctions.net/solver`, {
      configuration: configuration,
      recipe: this.recipe,
      stats: { ...this.stats }
    }).subscribe(res => {
      this.ref.close(CraftingActionsRegistry.deserializeRotation(res));
    });
  }
}
