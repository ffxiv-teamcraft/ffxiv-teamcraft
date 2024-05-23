import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { MateriaService } from '../../../modules/gearsets/materia.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { StatsService } from '../../../modules/gearsets/stats.service';
import { sum } from 'lodash';
import { Memoized } from '../../../core/decorators/memoized';
import { combineLatest, Observable, of } from 'rxjs';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { first, map, shareReplay } from 'rxjs/operators';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { AsyncPipe } from '@angular/common';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ItemCapsTableComponent } from '../../../modules/gearsets/item-caps-table/item-caps-table.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { DialogComponent } from '../../../core/dialog.component';


interface MateriaMenuEntry {
  baseParamId: number;
  materias: number[];
}

@Component({
  selector: 'app-materias-popup',
  templateUrl: './materias-popup.component.html',
  styleUrls: ['./materias-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [FlexModule, ItemCapsTableComponent, NzDividerModule, ItemIconComponent, NzButtonModule, NzIconModule, I18nNameComponent, NzWaveModule, NzDropDownModule, NzSelectModule, FormsModule, NzMenuModule, AsyncPipe, TranslateModule, I18nPipe, I18nRowPipe, ItemNamePipe, IfMobilePipe]
})
export class MateriasPopupComponent extends DialogComponent {

  equipmentPiece: EquipmentPiece;

  job: number;

  materiaMenu$: Observable<MateriaMenuEntry[]> = this.lazyData.getEntry('materias').pipe(
    map(materias => {
      const relevantBaseParamsIds = this.statsService.getRelevantBaseStats(this.job);
      return materias
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

    })
  );

  mobileEdit: number;

  bonusesCache: Record<string, Observable<{ overcapped: boolean, value: number }>> = {};

  meldingChancesCache: Record<string, Observable<number>> = {};

  constructor(private lazyData: LazyDataFacade, public materiasService: MateriaService,
              private modalRef: NzModalRef, private statsService: StatsService) {
    super();
    this.patchData();
  }

  getBonus(materia: number, index: number): Observable<{ overcapped: boolean, value: number }> {
    const cacheKey = `${materia}:${index}`;
    if (!this.bonusesCache[cacheKey]) {
      this.bonusesCache[cacheKey] = this.materiasService.getMateriaBonus(this.equipmentPiece, materia, index).pipe(
        shareReplay(1)
      );
    }
    return this.bonusesCache[cacheKey];
  }

  getMeldingChances(materiaItemId: number, slot: number): Observable<number> {
    if (!materiaItemId) {
      return of(0);
    }
    const cacheKey = `${materiaItemId}:${slot}`;
    if (!this.meldingChancesCache[cacheKey]) {
      this.meldingChancesCache[cacheKey] = this.materiasService.getMeldingChances(this.equipmentPiece, materiaItemId, slot).pipe(
        shareReplay(1)
      );
    }
    return this.meldingChancesCache[cacheKey];
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
    safeCombineLatest(this.combinations(this.equipmentPiece.materias).map(combination => {
      return safeCombineLatest(combination.map((materia, i) => {
        return this.getMateriaScore(materia, i);
      })).pipe(
        map(scores => {
          return {
            combination,
            score: sum(scores)
          };
        })
      );
    })).pipe(
      first()
    ).subscribe(combinations => {
      this.equipmentPiece.materias = combinations.sort((a, b) => b.score - a.score)[0].combination;
    });
  }

  combinations(a: number[]): number[][] {
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
    this.getMeldingChances(materia, index)
      .subscribe(meldingChances => {
        if (materia > 0 && meldingChances === 0) {
          return;
        }
        this.meldingChancesCache = {};
        this.bonusesCache = {};
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
      });
  }

  cancel(): void {
    this.modalRef.close(null);
  }

  @Memoized()
  private getMateriaScore(materiaId: number, index: number): Observable<number> {
    return combineLatest([
      this.getMeldingChances(materiaId, index),
      this.materiasService.getMateria(materiaId)
    ]).pipe(
      map(([meldingChances, materia]) => {
        if (meldingChances === 0) {
          // If a materia has 0% chances of melding, nuke it.
          return -10000000000000;
        }
        switch (materia.tier) {
          case 1:
          case 2:
          case 3:
          case 4:
            return meldingChances;
          case 5:
          case 7:
          case 9:
            return meldingChances * 10;
          case 6:
          case 8:
          case 10:
            return meldingChances * 30;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

}
