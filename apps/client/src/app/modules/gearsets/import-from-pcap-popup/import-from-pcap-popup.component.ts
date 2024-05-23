import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { IpcService } from '../../../core/electron/ipc.service';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { filter, map, takeUntil } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { Memoized } from '../../../core/decorators/memoized';
import { debounceBufferTime } from '../../../core/rxjs/debounce-buffer-time';
import { GearsetsFacade } from '../+state/gearsets.facade';
import { MateriaService } from '../materia.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';
import { jobAbbrs } from '@ffxiv-teamcraft/data/handmade/job-abbr-en';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-import-from-pcap-popup',
    templateUrl: './import-from-pcap-popup.component.html',
    styleUrls: ['./import-from-pcap-popup.component.less'],
    standalone: true,
    imports: [FlexModule, NzGridModule, NzFormModule, NzInputModule, FormsModule, NzSelectModule, NzAlertModule, JobUnicodePipe, I18nPipe, TranslateModule, I18nRowPipe]
})
export class ImportFromPcapPopupComponent extends TeamcraftComponent {

  public updateMode = false;

  public job: number;

  public gearsetName: string;

  public availableJobs = Object.keys(jobAbbrs).map(k => +k).filter(Boolean);

  constructor(private modalRef: NzModalRef, private ipc: IpcService, private lazyData: LazyDataFacade,
              private gearsetsFacade: GearsetsFacade, private materiaService: MateriaService) {
    super();
    combineLatest([this.ipc.itemInfoPackets$.pipe(debounceBufferTime(2000)), this.ipc.updateClassInfoPackets$]).pipe(
      takeUntil(this.onDestroy$),
      filter(([, updateClassInfo]) => updateClassInfo.classId === this.job),
      map(([packets]) => packets),
      withLazyData(this.lazyData, 'itemMeldingData', 'materias')
    ).subscribe(([packets, lazyItemMeldingData, materiasData]) => {
      const gearset = new TeamcraftGearset();
      gearset.name = this.gearsetName;
      gearset.job = this.job;
      packets
        .filter(p => p.containerId === 1000)
        .forEach(packet => {
          const itemMeldingData = lazyItemMeldingData[packet.catalogId];
          const materias = (packet.materia || <number[]>[]).map((materia, index) => {
            return this.materiaService.getMateriaItemIdFromPacketMateria(+materia, packet.materiaTiers[index], materiasData) || 0;
          });
          while (materias.length < itemMeldingData?.slots) {
            materias.push(0);
          }
          if (itemMeldingData?.overmeld) {
            while (materias.length < 5) {
              materias.push(0);
            }
          }
          gearset[this.gearsetsFacade.getPropertyName(packet.slot)] = {
            itemId: packet.catalogId,
            hq: packet.hqFlag,
            materias: materias,
            canOvermeld: itemMeldingData?.overmeld || false,
            materiaSlots: itemMeldingData?.slots || 0,
            baseParamModifier: itemMeldingData?.modifier || 1
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
