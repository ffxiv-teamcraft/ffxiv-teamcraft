import { Component, OnInit } from '@angular/core';
import { Simulation } from '@ffxiv-teamcraft/simulator';
import { TranslateModule } from '@ngx-translate/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { DialogComponent } from '../../../../core/dialog.component';

@Component({
  selector: 'app-simulation-min-stats-popup',
  templateUrl: './simulation-min-stats-popup.component.html',
  styleUrls: ['./simulation-min-stats-popup.component.less'],
  standalone: true,
  imports: [NzAlertModule, TranslateModule]
})
export class SimulationMinStatsPopupComponent extends DialogComponent implements OnInit {

  simulation: Simulation;

  stats: { control: number, craftsmanship: number, cp: number, found: boolean };

  thresholds: number[];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.patchData();
    // setTimeout to queue and make sure CD will see it ocne it's done
    setTimeout(() => {
      this.stats = this.simulation.getMinStats();
    });
  }

}
