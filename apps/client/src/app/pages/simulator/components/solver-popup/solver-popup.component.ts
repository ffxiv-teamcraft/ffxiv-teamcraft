import { Component, OnInit } from '@angular/core';
import { Craft, CrafterStats, CraftingAction, CraftingActionsRegistry } from '@ffxiv-teamcraft/simulator';
import { NzModalRef } from 'ng-zorro-antd';
import { defaultConfiguration, SolverConfiguration } from '@ffxiv-teamcraft/crafting-solver';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-solver-popup',
  templateUrl: './solver-popup.component.html',
  styleUrls: ['./solver-popup.component.less']
})
export class SolverPopupComponent implements OnInit {

  public stats: CrafterStats;

  public recipe: Craft;

  public configForm: FormGroup;

  public seed: CraftingAction[];

  public loading = false;

  constructor(private ref: NzModalRef, private http: HttpClient, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.configForm = this.fb.group({
      hqTarget: [defaultConfiguration.hqTarget, Validators.required],
      seeded: [this.seed && this.seed.length > 0, Validators.required]
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
    const gcfParams: any = {
      configuration: configuration,
      recipe: this.recipe,
      stats: { ...this.stats }
    };
    if (formRaw.seeded && this.seed.length > 0) {
      gcfParams.seed = CraftingActionsRegistry.serializeRotation(this.seed);
    }
    // To debug using local function: http://localhost:5001/ffxivteamcraft/us-central1/solver
    // Prod: https://us-central1-ffxivteamcraft.cloudfunctions.net/solver
    this.http.post<string[]>(`https://us-central1-ffxivteamcraft.cloudfunctions.net/solver  `, gcfParams).subscribe(res => {
      this.ref.close(CraftingActionsRegistry.deserializeRotation(res));
    });
  }
}
