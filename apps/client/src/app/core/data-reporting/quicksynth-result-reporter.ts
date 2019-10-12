import { combineLatest, merge, Observable, partition } from 'rxjs';
import { ofPacketSubType } from '../rxjs/of-packet-subtype';
import { DataReporter } from './data-reporter';
import { MachinaService } from '../electron/machina.service';
import { buffer, debounceTime, filter, map, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { ofPacketType } from '../rxjs/of-packet-type';
import { LazyDataService } from '../data/lazy-data.service';
import { Tables } from '@ffxiv-teamcraft/simulator';
import { isEqual } from 'lodash';
import { InventoryPatch } from '../../model/user/inventory/inventory-patch';
import { forwardRef, Inject } from '@angular/core';

export class QuicksynthResultReporter implements DataReporter {

  constructor(private machina: MachinaService, @Inject(forwardRef(() => LazyDataService)) private lazyData: LazyDataService) {
  }

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const quicksynthResults$ = packets$.pipe(
      ofPacketSubType('craftingUnk'),
      // 18 => success, 19 => success HQ, 24 => fail
      filter(packet => packet.param1 === 18 || packet.param1 === 19 || packet.param1 === 24),
      debounceTime(1000)
    );

    const crafterStatsPackets$ = packets$.pipe(
      ofPacketType('playerStats')
    );

    const classInfoPackets$ = packets$.pipe(
      ofPacketType('updateClassInfo')
    );

    const itemInfoPackets$ = packets$.pipe(
      ofPacketType('itemInfo')
    );

    const itemsRemoved$ = this.machina.inventoryPatches$.pipe(
      filter(patch => {
        return patch.quantity < 0;
      })
    );

    const ingredients$ = itemsRemoved$.pipe(
      buffer(itemsRemoved$.pipe(debounceTime(500)))
    );

    const soulCrystal$ = itemInfoPackets$.pipe(
      filter(packet => {
        return packet.catalogId >= 10337 && packet.catalogId <= 10344 && packet.slot === 13 && packet.containerId === 1000;
      }),
      startWith({
        catalogId: 0
      })
    );

    const crafterStats$ = combineLatest([crafterStatsPackets$, classInfoPackets$, soulCrystal$]).pipe(
      map(([crafterStatsPacket, classInfo, soulCrystal]) => {
        return {
          craftsmanship: crafterStatsPacket.craftsmanship,
          control: crafterStatsPacket.control,
          cp: crafterStatsPacket.cp,
          clvl: Tables.LEVEL_TABLE[classInfo.level] || classInfo.level,
          specialist: soulCrystal.catalogId === classInfo.classId + 10329
        };
      })
    );

    const [success$, fail$] = partition(quicksynthResults$, (packet) => packet.param1 !== 24);

    const successReports$ = success$.pipe(
      withLatestFrom(classInfoPackets$),
      map(([packet, classInfo]) => {
        return {
          recipe: this.lazyData.recipes.find(r => {
            return r.qs && r.result === packet.itemID && r.job === classInfo.classId;
          }),
          packet: packet
        };
      }),
      filter((data) => data.recipe !== undefined),
      withLatestFrom(crafterStats$),
      map(([data, crafterStats]) => {
        return [
          {
            success: true,
            HQ: data.packet.itemHQ,
            rlvl: data.recipe.rlvl,
            ...crafterStats
          }
        ];
      })
    );

    const failReports$ = fail$.pipe(
      withLatestFrom(ingredients$),
      map(([, ingredients]) => {
        return this.lazyData.recipes.find(r => {
          return r.qs && isEqual(r.ingredients, ingredients.filter(i => i.itemId > 19).map((i: InventoryPatch) => ({
            id: i.itemId,
            amount: Math.abs(i.quantity)
          })));
        });
      }),
      filter(recipe => recipe !== undefined),
      withLatestFrom(crafterStats$),
      map(([recipe, crafterStats]) => {
        return [
          {
            success: false,
            rlvl: recipe.rlvl,
            ...crafterStats
          }
        ];
      })
    );

    return merge(successReports$, failReports$);
  }

  getDataType(): string {
    return 'quicksynthresults';
  }
}
