import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { MateriaService } from '../../../modules/gearsets/materia.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { StatsService } from '../../../modules/gearsets/stats.service';
import { sum } from 'lodash';
import { Memoized } from '../../../core/decorators/memoized';


interface MateriaMenuEntry {
  baseParamId: number;
  materias: number[];
}

@Component({
  selector: 'app-materias-popup',
  templateUrl: './materias-popup.component.html',
  styleUrls: ['./materias-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MateriasPopupComponent implements OnInit {

  equipmentPiece: EquipmentPiece;

  job: number;

  materiaMenu: MateriaMenuEntry[] = [];

  mobileEdit: number;

  constructor(private lazyData: LazyDataService, public materiasService: MateriaService,
              private modalRef: NzModalRef, private statsService: StatsService) {
  }

  getBonus(materia: number, index: number): { overcapped: boolean, value: number } {
    return this.materiasService.getMateriaBonus(this.equipmentPiece, materia, index);
  }

  getMeldingChances(materiaItemId: number, slot: number): number {
    return this.materiasService.getMeldingChances(this.equipmentPiece, materiaItemId, slot);
  }

  resetMaterias(index: number): void {
    for (let i = index; i < this.equipmentPiece.materias.length; i++) {
      this.setMateria(i, 0);
    }
  }

  apply(): void {
    this.modalRef.close(this.equipmentPiece);
  }

  optimize(): void {
    this.equipmentPiece.materias = this.combinations(this.equipmentPiece.materias).sort((a, b) => {
      return sum(b.map((m, i) => {
        return this.getMateriaScore(m, i);
      })) - sum(a.map((m, i) => {
        return this.getMateriaScore(m, i);
      }));
    })[0];
  }

  @Memoized()
  private getMateriaScore(materiaId: number, index: number): number {
    const meldingChances = this.getMeldingChances(materiaId, index);
    if (meldingChances === 0) {
      // If a materia has 0% chances of melding, nuke it.
      return -1000;
    }
    const materia = this.materiasService.getMateria(materiaId);
    switch (materia.tier) {
      case 1:
      case 2:
      case 3:
      case 4:
        return meldingChances;
      case 5:
      case 7:
        return meldingChances * 10;
      case 6:
      case 8:
        return meldingChances * 30;
    }
  }

  combinations(a: number[]) {
    if (a.length < 2) return [a];
    let c, d;
    const b = [];
    for (c = 0; c < a.length; c++) {
      const e = a.splice(c, 1),
        f = this.combinations(a);
      for (d = 0; d < f.length; d++) b.push([e[0]].concat(f[d]));
      a.splice(c, 0, e[0]);
    }
    return b;
  }

  setMateria(index: number, materia: number): void {
    if (materia > 0 && this.getMeldingChances(materia, index) === 0) {
      return;
    }
    this.equipmentPiece = {
      ...this.equipmentPiece,
      materias: [
        ...this.equipmentPiece.materias.map((m, i) => {
          if (i === index) {
            return materia;
          }
          return m;
        })
      ]
    };
  }

  cancel(): void {
    this.modalRef.close(null);
  }

  ngOnInit(): void {
    const relevantBaseParamsIds = this.statsService.getRelevantBaseStats(this.job);
    this.materiaMenu = this.lazyData.data.materias
      .filter(materia => relevantBaseParamsIds.indexOf(materia.baseParamId) > -1)
      .reduce((acc, materia) => {
        let menuRow = acc.find(row => row.baseParamId === materia.baseParamId);
        if (menuRow === undefined) {
          acc.push({
            baseParamId: materia.baseParamId,
            materias: []
          });
          menuRow = acc[acc.length - 1];
        }
        menuRow.materias.unshift(materia.itemId);
        return acc;
      }, []);
  }

}
