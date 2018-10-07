import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { StoredNode } from '../../../../modules/list/model/stored-node';
import { Observable } from 'rxjs';
import { Aetheryte } from '../../../../core/data/aetheryte';
import { map } from 'rxjs/operators';
import { MapService } from '../../../../modules/map/map.service';

@Component({
  selector: 'app-gathered-by',
  templateUrl: './gathered-by.component.html',
  styleUrls: ['./gathered-by.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheredByComponent extends ItemDetailsPopup implements OnInit {

  constructor(private mapService: MapService) {
    super();
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

  ngOnInit() {
  }

}
