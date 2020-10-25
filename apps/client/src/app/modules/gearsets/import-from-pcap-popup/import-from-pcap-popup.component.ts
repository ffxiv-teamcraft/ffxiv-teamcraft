import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { filter, map, takeUntil } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { combineLatest } from 'rxjs';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { Memoized } from '../../../core/decorators/memoized';
import { debounceBufferTime } from '../../../core/rxjs/debounce-buffer-time';
import { GearsetsFacade } from '../+state/gearsets.facade';

@Component({
  selector: 'app-import-from-pcap-popup',
  templateUrl: './import-from-pcap-popup.component.html',
  styleUrls: ['./import-from-pcap-popup.component.less']
})
export class ImportFromPcapPopupComponent extends TeamcraftComponent {

  public updateMode = false;

  public job: number;

  public gearsetName: string;

  public availableJobs = this.gt.getJobs().filter(job => job.id > 0);

  constructor(private modalRef: NzModalRef, private gt: GarlandToolsService,
              private ipc: IpcService, private lazyData: LazyDataService,
              private gearsetsFacade: GearsetsFacade) {
    super();
    combineLatest([this.ipc.itemInfoPackets$.pipe(debounceBufferTime(2000)), this.ipc.updateClassInfoPackets$]).pipe(
      takeUntil(this.onDestroy$),
      filter(([, updateClassInfo]) => updateClassInfo.classId === this.job),
      map(([packets]) => packets)
    ).subscribe((packets) => {
      const gearset = new TeamcraftGearset();
      gearset.name = this.gearsetName;
      gearset.job = this.job;
      packets
        .filter(p => p.containerId === 1000)
        .forEach(packet => {
          const itemMeldingData = this.lazyData.data.itemMeldingData[packet.catalogId];
          const materias = (packet.materia || <number[]>[]).map(m => +m);
          while (materias.length < itemMeldingData.slots) {
            materias.push(0);
          }
          if (itemMeldingData.overmeld) {
            while (materias.length < 5) {
              materias.push(0);
            }
          }
          gearset[this.gearsetsFacade.getPropertyName(packet.slot)] = {
            itemId: packet.catalogId,
            hq: packet.hqFlag === 1,
            materias: materias,
            canOvermeld: itemMeldingData.overmeld,
            materiaSlots: itemMeldingData.slots,
            baseParamModifier: itemMeldingData.modifier
          };
        });

      this.modalRef.close(gearset);
    });
  }

  @Memoized()
  private getPropertyName(slot: number): string {
    switch (slot) {
      case 0:
        return 'mainHand';
      case 1:
        return 'offHand';
      case 2:
        return 'head';
      case 3:
        return 'chest';
      case 4:
        return 'gloves';
      case 5:
        return 'belt';
      case 6:
        return 'legs';
      case 7:
        return 'feet';
      case 8:
        return 'earRings';
      case 9:
        return 'necklace';
      case 10:
        return 'bracelet';
      case 11:
        return 'ring2';
      case 12:
        return 'ring1';
      case 13:
        return 'crystal';
    }
  }

}
