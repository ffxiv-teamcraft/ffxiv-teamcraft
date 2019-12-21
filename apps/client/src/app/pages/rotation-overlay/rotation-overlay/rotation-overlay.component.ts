import { Component } from '@angular/core';
import { RotationsFacade } from '../../../modules/rotations/+state/rotations.facade';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { CraftingActionsRegistry } from '@ffxiv-teamcraft/simulator';
import { CraftingRotation } from '../../../model/other/crafting-rotation';

@Component({
  selector: 'app-rotation-overlay',
  templateUrl: './rotation-overlay.component.html',
  styleUrls: ['./rotation-overlay.component.less']
})
export class RotationOverlayComponent {

  public rotation$: Observable<CraftingRotation>;

  constructor(private rotationsFacade: RotationsFacade, private route: ActivatedRoute) {
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
        rotation.actions = CraftingActionsRegistry.deserializeRotation(rotation.rotation);
        return rotation;
      })
    );
  }

}
