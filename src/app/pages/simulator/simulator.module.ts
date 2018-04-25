import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorPageComponent } from './simulator-page/simulator-page.component';
import { SimulatorComponent } from './simulator/simulator.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SimulatorPageComponent, SimulatorComponent]
})
export class SimulatorModule { }
