import { merge, Observable } from 'rxjs';
import { ProbeReport } from '../model/probe-report';
import { InjectionToken } from '@angular/core';
import { ProbeSource } from '../model/probe-source';
import { ofPacketType } from '../../../core/rxjs/of-packet-type';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { EventHandlerType } from '../../../core/electron/event-handler-type';
import { IpcService } from '../../../core/electron/ipc.service';

export const PLAYER_METRICS_PROBES = new InjectionToken('player-metrics:probes');

export abstract class PlayerMetricProbe {

  protected eventSource$: Observable<ProbeSource> = merge(
    this.ipc.packets$.pipe(ofPacketType('eventStart')),
    this.ipc.packets$.pipe(ofPacketType('eventFinish'))
  ).pipe(
    map(packet => {
      if (packet.type === 'eventFinish') {
        return ProbeSource.UNKNOWN;
      }
      const eventType = packet.eventId >> 16;
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
          switch (packet.eventId & 0xFFFF) {
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
      ofPacketType('actorCast'),
      filter(packet => packet.actioniD === 5)
    ),
    this.ipc.packets$.pipe(
      ofPacketType('initZone')
    ),
    this.ipc.packets$.pipe(
      ofPacketType('actorControl'),
      filter(packet => packet.category === 0x0F)
    )
  ).pipe(
    map(packet => {
      if (packet.type === 'actorCast') {
        return ProbeSource.TELEPORT;
      }
      return ProbeSource.UNKNOWN;
    })
  );

  protected source$ = merge(this.eventSource$, this.teleportSource$);

  protected constructor(protected ipc: IpcService) {
  }

  public abstract getReports(): Observable<ProbeReport>;
}

