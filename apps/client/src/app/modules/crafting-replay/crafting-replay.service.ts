import { Injectable } from '@angular/core';
import { IpcService } from '../../core/electron/ipc.service';
import { combineLatest, merge, Observable } from 'rxjs';
import { distinctUntilKeyChanged, filter, map, scan, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CraftingReplay } from './model/crafting-replay';
import firebase from 'firebase/compat/app';
import { CrafterStats } from '@ffxiv-teamcraft/simulator';
import { CraftingReplayFacade } from './+state/crafting-replay.facade';
import { ofMessageType } from '../../core/rxjs/of-message-type';
import { EventPlay32 } from '@ffxiv-teamcraft/pcap-ffxiv';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { EnvironmentService } from '../../core/environment.service';

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
        [this.env.maxLevel, this.env.maxLevel, this.env.maxLevel, this.env.maxLevel, this.env.maxLevel, this.env.maxLevel, this.env.maxLevel, this.env.maxLevel]
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private ipc: IpcService, private afs: AngularFirestore, private craftingReplayFacade: CraftingReplayFacade,
              private lazyData: LazyDataFacade, private env: EnvironmentService) {
  }

  public init(): void {
    this.lazyData.getRecipes().pipe(
      switchMap(recipes => {
        return merge(this.ipc.packets$.pipe(ofMessageType('eventPlay4')), this.ipc.packets$.pipe(ofMessageType('eventPlay32')))
          .pipe(
            filter(message => message.parsedIpcData.eventId === CraftingReplayService.CRAFTING_EVENT_ID),
            withLatestFrom(this.stats$),
            filter(([, stats]) => !!stats),
            scan((replay: CraftingReplay, [message, stats]) => {
              const packet = message.parsedIpcData;
              if (message.type === 'eventPlay4') {
                switch (packet.params[0]) {
                  case 1:
                    return null;
                  case 2:
                    return new CraftingReplay(
                      this.afs.createId(),
                      recipes.find(r => r.id.toString() === packet.params[1]?.toString())?.result,
                      packet.params[1],
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
              } else if (message.type === 'eventPlay32') {
                if (!replay) return null;
                replay.steps.push({
                  action: packet.params[4],
                  addedProgression: packet.params[8],
                  addedQuality: packet.params[10],
                  solidityDifference: new Int32Array([packet.params[13]])[0],
                  state: packet.params[15],
                  success: this.isSuccess(packet)
                });
              }
              return replay;
            }, null),
            filter(replay => replay && !!replay.endTime && replay.steps.length > 0),
            distinctUntilKeyChanged('$key')
          );
      })
    ).subscribe(replay => {
      this.craftingReplayFacade.addReplay(replay);
    });
  }

  isSuccess(eventPlay32: EventPlay32): boolean {
    if (new Int32Array([eventPlay32.params[13]])[0] < 0) {
      return eventPlay32.params[8] > 0 || eventPlay32.params[10] > 0;
    }
    return true;
  }
}
