import { Component } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { map, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { debounceBufferTime } from '../../../core/rxjs/debounce-buffer-time';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { GearsetsFacade } from '../+state/gearsets.facade';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MateriaService } from '../materia.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { Job } from '@ffxiv-teamcraft/data/model/lazy-equipment';

import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { FlexModule } from '@angular/flex-layout/flex';


@Component({
  selector: 'app-sync-from-pcap-popup',
  templateUrl: './sync-from-pcap-popup.component.html',
  styleUrls: ['./sync-from-pcap-popup.component.less'],
  standalone: true,
  imports: [FlexModule, NzAlertModule, NzTimelineModule, TranslateModule]
})
export class SyncFromPcapPopupComponent extends TeamcraftComponent {

  public timeline: { color: string, label: string }[] = [];

  constructor(private ipc: IpcService, private lazyData: LazyDataFacade,
              private i18n: I18nToolsService, private materiaService: MateriaService,
              private gearsetsFacade: GearsetsFacade, private translate: TranslateService
  ) {
    super();
    combineLatest([
      this.ipc.itemInfoPackets$.pipe(debounceBufferTime(2000)),
      this.ipc.updateClassInfoPackets$,
      this.lazyData.getEntry('materias'),
      this.lazyData.getEntry('equipment'),
      this.lazyData.getEntry('itemMeldingData'),
      this.lazyData.getEntry('jobAbbr')
    ]).pipe(
      takeUntil(this.onDestroy$),
      switchMap(([packets, classInfo, materiasData, equipmentData, lazyItemMeldingData, jobAbbr]) => {
        return this.i18n.getNameObservable('jobName', classInfo.classId).pipe(
          map(name => {
            name = name.charAt(0).toUpperCase() + name.slice(1);
            this.timeline.push({
              color: 'blue',
              label: this.translate.instant('GEARSETS.SYNC.Importing_gearset', { name })
            });
            const gearset = new TeamcraftGearset();
            gearset.name = name;
            gearset.job = classInfo.classId;
            gearset.fromSync = true;
            delete gearset.crystal;
            delete gearset.offHand;
            packets
              .filter(p => {
                return p.containerId === 1000
                  && (equipmentData[p.catalogId]?.jobs || []).includes(jobAbbr[classInfo.classId]?.en as Job);
              })
              .forEach(packet => {
                const itemMeldingData = lazyItemMeldingData[packet.catalogId];
                const materias = (packet.materia || <number[]>[]).map((materia, index) => {
                  return this.materiaService.getMateriaItemIdFromPacketMateria(+materia, packet.materiaTiers[index], materiasData) || 0;
                });
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
                  hq: packet.hqFlag,
                  materias: materias,
                  canOvermeld: itemMeldingData.overmeld,
                  materiaSlots: itemMeldingData.slots,
                  baseParamModifier: itemMeldingData.modifier
                };
              });
            return gearset;
          })
        );
      }),
      withLatestFrom(this.gearsetsFacade.myGearsets$.pipe(
        map(gearsets => {
          return gearsets.filter(g => g.fromSync);
        })
      )),
      switchMap(([gearset, syncGearsets]) => {
        return this.i18n.getNameObservable('jobName', gearset.job).pipe(
          map(name => {
            return [
              gearset,
              syncGearsets,
              name.charAt(0).toUpperCase() + name.slice(1)
            ];
          })
        );
      })
    ).subscribe(([gearset, syncGearsets, name]: [TeamcraftGearset, any[], string]) => {
      const syncGearset = syncGearsets.find(set => {
        return set.job === gearset.job;
      });

      this.timeline.pop();

      if (syncGearset) {
        const updatedSet = Object.assign(syncGearset, gearset);
        this.gearsetsFacade.update(updatedSet.$key, updatedSet);
      } else {
        this.gearsetsFacade.createGearset(gearset, true);
      }
      this.timeline.push({
        color: 'green',
        label: this.translate.instant('GEARSETS.SYNC.Imported_gearset', { name })
      });
    });
  }

}
