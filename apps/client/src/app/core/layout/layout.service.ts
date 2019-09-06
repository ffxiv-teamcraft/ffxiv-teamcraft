import { Injectable, NgZone } from '@angular/core';
import { LayoutRow } from './layout-row';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { LayoutRowOrder } from './layout-row-order.enum';
import { LayoutRowFilter } from './layout-row-filter';
import { ListLayout } from './list-layout';
import { FirestoreRelationalStorage } from '../database/storage/firestore/firestore-relational-storage';
import { PendingChangesService } from '../database/pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class LayoutService extends FirestoreRelationalStorage<ListLayout> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService,
              protected zone: NgZone, protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public get defaultLayout(): ListLayout {
    const layout = new ListLayout();
    layout.name = 'Default Layout';
    layout.rows = [
      new LayoutRow('Timed nodes', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_TIMED.name,
        0, true, false, false, true, false, false, true),
      new LayoutRow('Vendors ', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.CAN_BE_BOUGHT.name,
        1, false, false, true, true, false, false, true),
      new LayoutRow('Reducible', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_REDUCTION.name,
        2, false, false, false, true, false, false, true),
      new LayoutRow('Tomes/Tokens/Scrips', 'NAME', LayoutRowOrder.DESC, 'IS_TOME_TRADE:or:IS_SCRIPT_TRADE',
        3, false, false, false, true, false, false, true),
      new LayoutRow('Fishing', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_GATHERED_BY_FSH.name,
        4, false, false, false, true, false, false, true),
      new LayoutRow('Gathering', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_GATHERING.name,
        5, true, false, false, true, false, false, true),
      new LayoutRow('Drops_or_GC', 'NAME', LayoutRowOrder.DESC,
        LayoutRowFilter.IS_MONSTER_DROP.name + ':or:' + LayoutRowFilter.IS_GC_TRADE.name,
        6, false, false, false, true, false, false, true),
      new LayoutRow('Pre_crafts', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_CRAFT.name,
        8, false, true, false, true, false, false, true),
      new LayoutRow('Other', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.ANYTHING.name,
        7, true, false, false, true, false, false, true)
    ];
    layout.recipeOrder = LayoutRowOrder.ASC;
    layout.recipeOrderBy = 'JOB';
    return layout;
  }

  protected getBaseUri(params?: any): string {
    return '/layouts';
  }

  protected getClass(): any {
    return ListLayout;
  }

}
