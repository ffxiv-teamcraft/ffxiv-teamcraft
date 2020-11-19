import { Injectable } from '@angular/core';
import { IpcService } from '../../core/electron/ipc.service';
import { combineLatest, merge, Observable } from 'rxjs';
import { filter, map, scan, withLatestFrom, shareReplay, distinctUntilKeyChanged } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { CraftingReplay } from './model/crafting-replay';
import firebase from 'firebase/app';
import { CrafterStats } from '@ffxiv-teamcraft/simulator';
import { CraftingReplayFacade } from './+state/crafting-replay.facade';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Injectable({ providedIn: 'root' })
export class CraftingReplayService {

  public static readonly CRAFTING_EVENT_ID = 0xA0001;

  public stats$: Observable<CrafterStats> = combineLatest([this.ipc.playerStatsPackets$, this.ipc.updateClassInfoPackets$]).pipe(
    map(([playerStats, updateClassInfo]) => {
      return new CrafterStats(
        updateClassInfo.classId,
        playerStats.craftsmanship,
        playerStats.control,
        playerStats.cp,
        false,
        updateClassInfo.level,
        [80, 80, 80, 80, 80, 80, 80, 80]
      );
    }),
    shareReplay(1)
  );

  constructor(private ipc: IpcService, private afs: AngularFirestore, private craftingReplayFacade: CraftingReplayFacade,
              private lazyData: LazyDataService) {
  }

  public init(): void {
    merge(this.ipc.eventPlay4Packets$, this.ipc.eventPlay32Packets$)
      .pipe(
        filter(packet => packet.eventId === CraftingReplayService.CRAFTING_EVENT_ID),
        withLatestFrom(this.stats$),
        filter(([, stats]) => !!stats),
        scan((replay: CraftingReplay, [packet, stats]) => {
          if (packet.type === 'eventPlay4') {
            switch (packet.param1) {
              case 1:
                return null;
              case 2:
                return new CraftingReplay(
                  this.afs.createId(),
                  this.lazyData.data.recipes.find(r => r.id === packet.param2)?.result,
                  packet.param2,
                  firebase.firestore.Timestamp.now(),
                  stats
                );
              case 4:
              case 6:
                if (!replay) return null;
                replay.endTime = firebase.firestore.Timestamp.now();
                return replay;
              default:
                return replay;
            }
          } else if (packet.type === 'eventPlay32') {
            if (!replay) return null;
            replay.steps.push({
              action: packet.param5,
              addedProgression: packet.param9,
              addedQuality: packet.param11,
              solidityDifference: new Int32Array([packet.param14])[0],
              state: packet.param16,
              success: this.isSuccess(packet)
            });
          }
          return replay;
        }, null),
        filter(replay => replay && !!replay.endTime && replay.steps.length > 0),
        distinctUntilKeyChanged('$key')
      )
      .subscribe(replay => {
        this.craftingReplayFacade.addReplay(replay);
      });
  }

  isSuccess(eventPlay32: any): boolean {
    if (new Int32Array([eventPlay32.param14])[0] < 0) {
      return eventPlay32.param9 > 0 || eventPlay32.param11 > 0;
    }
    return true;
  }
}
