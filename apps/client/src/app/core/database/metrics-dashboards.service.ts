import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone, inject } from '@angular/core';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { MetricsDashboardLayout } from '../../modules/player-metrics/display/metrics-dashboard-layout';
import { Firestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class MetricsDashboardsService extends FirestoreRelationalStorage<MetricsDashboardLayout> {
  protected firestore: Firestore;
  protected serializer: NgSerializerService;
  protected zone: NgZone;
  protected pendingChangesService: PendingChangesService;


  constructor() {
    const firestore = inject(Firestore);
    const serializer = inject(NgSerializerService);
    const zone = inject(NgZone);
    const pendingChangesService = inject(PendingChangesService);

    super(firestore, serializer, zone, pendingChangesService);
  
    this.firestore = firestore;
    this.serializer = serializer;
    this.zone = zone;
    this.pendingChangesService = pendingChangesService;
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

  protected getBaseUri(): string {
    return 'metrics-dashboards';
  }

  protected getClass(): any {
    return MetricsDashboardLayout;
  }
}
