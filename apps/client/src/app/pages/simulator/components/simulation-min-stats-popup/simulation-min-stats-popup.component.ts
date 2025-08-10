import { Component, OnInit } from '@angular/core';
import { Simulation } from '@ffxiv-teamcraft/simulator';
import { TranslateModule } from '@ngx-translate/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { DialogComponent } from '../../../../core/dialog.component';

@Component({
  selector: 'app-simulation-min-stats-popup',
  templateUrl: './simulation-min-stats-popup.component.html',
  styleUrls: ['./simulation-min-stats-popup.component.less'],
  standalone: true,
  imports: [NzAlertModule, NzDividerModule, TranslateModule]
})
export class SimulationMinStatsPopupComponent extends DialogComponent implements OnInit {

  simulation: Simulation;

  stats: { control: number, craftsmanship: number, cp: number, found: boolean };

  statsRaw: { control: number, craftsmanship: number, cp: number, found: boolean };

  bonuses: { control: number, cp: number, craftsmanship: number };

  thresholds: number[];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.patchData();
    // setTimeout to queue and make sure CD will see it once it's done
    setTimeout(() => {
      this.stats = this.simulation.getMinStats();

      this.statsRaw = {
        control: this.stats.control - this.bonuses.control,
        craftsmanship: this.stats.craftsmanship - this.bonuses.craftsmanship,
        cp: Math.max(180, this.stats.cp - this.bonuses.cp),
        found: Object.values(this.bonuses).some(s => s > 0),
      };
    });
  }

}
