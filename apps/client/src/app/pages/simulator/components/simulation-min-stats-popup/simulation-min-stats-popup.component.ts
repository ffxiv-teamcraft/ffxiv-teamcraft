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

  ngOnInit(): void {
    setTimeout(() => {
      this.stats = this.simulation.getMinStats();
    });
  }

}
