import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { BehaviorSubject } from 'rxjs';

export interface Retainer {
  name: string;
  order: number;
  itemCount: number;
  itemSellingCount: number;
  level: number;
  job: number;
  task: number;
  taskComplete: number;
  gil: number;
}

@Injectable({
  providedIn: 'root'
})
export class RetainersService {

  private static readonly LS_KEY = 'retainers';

  public retainers$ = new BehaviorSubject(JSON.parse(localStorage.getItem(RetainersService.LS_KEY) || '{}'));

  public get retainers(): Record<string, Retainer> {
    return this.retainers$.value;
  }

  constructor(private ipc: IpcService) {
  }

  init(): void {
    this.ipc.retainerInformationPackets$.subscribe(packet => {
      const retainers = this.retainers;
      retainers[packet.retainerID.toString(16)] = {
        name: packet.name,
        order: packet.hireOrder,
        itemCount: packet.itemCount,
        itemSellingCount: packet.itemSellingCount,
        level: packet.level,
        job: packet.classJobID,
        task: packet.ventureID,
        taskComplete: packet.ventureComplete,
        gil: packet.gil
      };
      this.retainers$.next(retainers);
      this.persist();
    });
  }

  persist(): void {
    localStorage.setItem(RetainersService.LS_KEY, JSON.stringify(this.retainers));
  }
}
