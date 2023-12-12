import { Component } from '@angular/core';
import { RotationsFacade } from '../../../modules/rotations/+state/rotations.facade';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { CraftingRotation } from '../../../model/other/crafting-rotation';
import { SimulationService } from '../../../core/simulation/simulation.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { ActionComponent } from '../../simulator/components/action/action.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { OverlayContainerComponent } from '../../../modules/overlay-container/overlay-container/overlay-container.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-rotation-overlay',
    templateUrl: './rotation-overlay.component.html',
    styleUrls: ['./rotation-overlay.component.less'],
    standalone: true,
    imports: [NgIf, OverlayContainerComponent, FlexModule, NgFor, ActionComponent, PageLoaderComponent, AsyncPipe]
})
export class RotationOverlayComponent {

  public rotation$: Observable<CraftingRotation>;

  constructor(private rotationsFacade: RotationsFacade, private route: ActivatedRoute,
              private simulationService: SimulationService, private settings: SettingsService) {
    this.rotation$ = this.route.paramMap.pipe(
      tap(params => {
        const id = params.get('rotationId');
        this.rotationsFacade.getRotation(id);
        this.rotationsFacade.selectRotation(id);
      }),
      switchMap(() => {
        return this.rotationsFacade.selectedRotation$;
      }),
      map((rotation: any) => {
        rotation.actions = this.registry.deserializeRotation(rotation.rotation);
        return rotation;
      })
    );
  }

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  private get registry() {
    return this.simulator.CraftingActionsRegistry;
  }

}
