import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FlexModule } from "@angular/flex-layout";
import { TranslateModule } from "@ngx-translate/core";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzProgressModule } from "ng-zorro-antd/progress";
import { ActionComponent } from "../action/action.component";
import { DialogComponent } from "../../../../../app/core/dialog.component";
import { Craft, CraftingAction, CrafterStats } from "@ffxiv-teamcraft/simulator";
import { Subscription } from "rxjs";
import { SolverService } from "../../service/solver.service";
import { NzModalRef } from "ng-zorro-antd/modal";

@Component({
  selector: 'app-solver-popup',
  templateUrl: './solver-popup.component.html',
  styleUrls: ['./solver-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FlexModule,
    NzProgressModule,
    NzButtonModule,
    TranslateModule,
    ActionComponent
  ]
})
export class SolverPopupComponent extends DialogComponent implements OnInit, OnDestroy {
  recipe: Craft;
  stats: CrafterStats;
  hqIngredients: { id: number; amount: number }[] = [];

  running = true;
  depth = 0;
  bestQuality = 0;
  bestSuccess = false;
  resultActions: CraftingAction[] = [];

  private sub: Subscription;
  private solver: SolverService = inject(SolverService);
  private modalRef: NzModalRef = inject(NzModalRef);
  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.patchData();
    this.sub = this.solver.solve(this.recipe, this.stats, this.hqIngredients).subscribe({
      next: ({ progress, result }) => {
        if (progress) {
          this.depth = progress.depth;
          this.bestQuality = progress.bestQuality;
          this.bestSuccess = progress.bestSuccess;
        }
        if (result) {
          this.resultActions = result;
          this.running = false;
        }
        this.cd.markForCheck();
      },
      error: () => {
        this.running = false;
        this.cd.markForCheck();
      }
    });
  }

  apply(): void {
    this.modalRef.close(this.resultActions);
  }

  progressFormat(): () => string {
    return () => `${this.bestQuality} / ${this.recipe.quality}`;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}