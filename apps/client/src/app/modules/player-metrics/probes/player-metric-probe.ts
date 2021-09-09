import { merge, Observable } from 'rxjs';
import { ProbeReport } from '../model/probe-report';
import { InjectionToken } from '@angular/core';
import { ProbeSource } from '../model/probe-source';
import { ofMessageType } from '../../../core/rxjs/of-message-type';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { EventHandlerType } from '../../../core/electron/event-handler-type';
import { IpcService } from '../../../core/electron/ipc.service';

export const PLAYER_METRICS_PROBES = new InjectionToken('player-metrics:probes');

export abstract class PlayerMetricProbe {

  protected eventSource$: Observable<ProbeSource> = merge(
    this.ipc.packets$.pipe(ofMessageType('eventStart')),
    this.ipc.packets$.pipe(ofMessageType('eventFinish'))
  ).pipe(
    map(packet => {
      if (packet.type === 'eventFinish') {
        return ProbeSource.UNKNOWN;
      }
      const eventType = packet.parsedIpcData.eventId >> 16;
      switch (eventType) {
        case EventHandlerType.Fishing:
          return ProbeSource.FISHING;
        case EventHandlerType.Craft:
          return ProbeSource.CRAFTING;
        case EventHandlerType.GatheringPoint:
          return ProbeSource.GATHERING;
        case EventHandlerType.Shop:
          return ProbeSource.VENDOR;
        case EventHandlerType.CustomTalk:
          switch (packet.parsedIpcData.eventId & 0xFFFF) {
            case 0x27:
              return ProbeSource.MARKETBOARD;
            case 0x220:
              return ProbeSource.RETAINER;
            default:
              return ProbeSource.UNKNOWN;
          }
        default:
          return ProbeSource.UNKNOWN;
      }
    }),
    distinctUntilChanged()
  );

  protected teleportSource$ = merge(
    this.ipc.packets$.pipe(
      ofMessageType('actorCast'),
      filter(message => message.parsedIpcData.actionId === 5)
    ),
    this.ipc.packets$.pipe(
      ofMessageType('initZone')
    ),
    this.ipc.packets$.pipe(
      ofMessageType('actorControl'),
      filter(message => message.parsedIpcData.category === 0x0F)
    )
  ).pipe(
    map(packet => {
      if (packet.type === 'actorCast') {
        return ProbeSource.TELEPORT;
      }
      return ProbeSource.UNKNOWN;
    }),
    startWith(ProbeSource.UNKNOWN)
  );

  protected source$ = merge(this.eventSource$, this.teleportSource$);

  protected constructor(protected ipc: IpcService) {
  }

  public abstract getReports(): Observable<ProbeReport>;
}

