import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone } from '@angular/core';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { MetricsDashboardLayout } from '../../modules/player-metrics/display/metrics-dashboard-layout';

@Injectable({ providedIn: 'root' })
export class MetricsDashboardsService extends FirestoreRelationalStorage<MetricsDashboardLayout> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected prepareData<R>(data: MetricsDashboardLayout): R {
    const clone: any = super.prepareData(data);
    clone.grid = data.grid.reduce((obj, row, index) => {
      return {
        ...obj,
        [index]: row
      };
    }, {});
    return clone;
  }

  protected beforeDeserialization(data: any): MetricsDashboardLayout {
    const layout = super.beforeDeserialization(data);
    const gridClone = JSON.parse(JSON.stringify(layout.grid));
    layout.grid = Object.keys(gridClone).reduce((array, key) => {
      array[+key] = gridClone[key];
      return array;
    }, []);
    return layout;
  }

  protected getBaseUri(params?: any): string {
    return 'metrics-dashboards';
  }

  protected getClass(): any {
    return MetricsDashboardLayout;
  }
}
