import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ListRow } from '../../../model/list/list-row';
import { Aetheryte } from '../../../core/data/aetheryte';
import { Observable } from 'rxjs';
import { StoredNode } from '../../../model/list/stored-node';
import { MapService } from '../../map/map.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-gathered-by-popup',
  templateUrl: './gathered-by-popup.component.html',
  styleUrls: ['./gathered-by-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheredByPopupComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ListRow, private mapService: MapService) {
  }

  getClosestAetheryte(node: StoredNode): Observable<Aetheryte> {
    return this.mapService.getMapById(node.zoneid)
      .pipe(
        map((mapData) => {
          return this.mapService.getNearestAetheryte(mapData, { x: node.coords[0], y: node.coords[1] });
        })
      );
  }

  getDespawnTime(time: number, uptime: number): string {
    const res = (time + uptime / 60) % 24;
    return res.toString();
  }
}
