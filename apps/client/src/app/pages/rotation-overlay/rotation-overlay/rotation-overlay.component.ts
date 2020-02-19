import { Component } from '@angular/core';
import { RotationsFacade } from '../../../modules/rotations/+state/rotations.facade';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { CraftingRotation } from '../../../model/other/crafting-rotation';
import { SimulationService } from '../../../core/simulation/simulation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-rotation-overlay',
  templateUrl: './rotation-overlay.component.html',
  styleUrls: ['./rotation-overlay.component.less']
})
export class RotationOverlayComponent {

  public rotation$: Observable<CraftingRotation>;

  constructor(private rotationsFacade: RotationsFacade, private route: ActivatedRoute,
              private simulationService: SimulationService, private translate: TranslateService) {
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
        rotation.actions = simulationService.callRegistry(this.translate.currentLang, 'deserializeRotation', rotation.rotation);
        return rotation;
      })
    );
  }

}
