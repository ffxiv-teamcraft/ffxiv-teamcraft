import { Component, OnInit } from '@angular/core';
import { Simulation } from '@ffxiv-teamcraft/simulator';

@Component({
  selector: 'app-simulation-min-stats-popup',
  templateUrl: './simulation-min-stats-popup.component.html',
  styleUrls: ['./simulation-min-stats-popup.component.less']
})
export class SimulationMinStatsPopupComponent implements OnInit {

  simulation: Simulation;

  stats: { control: number, craftsmanship: number, cp: number, found: boolean };

  thresholds: number[];

  ngOnInit(): void {
    // setTimeout to queue and make sure CD will see it ocne it's done
    setTimeout(() => {
      this.stats = this.simulation.getMinStats();
    });
  }

}
