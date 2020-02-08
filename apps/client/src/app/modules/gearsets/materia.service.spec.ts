import { inject, TestBed } from '@angular/core/testing';
import { MateriaService } from './materia.service';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { LazyDataTestService } from '../../../test/lazy-data-test-service';
import { BaseParam } from './base-param';

describe('MateriaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LazyDataService, useFactory: () => new LazyDataTestService() },
        MateriaService
      ]
    });
  });

  it('should be created', inject([MateriaService], (service: MateriaService) => {
    expect(service).toBeTruthy();
  }));

  it('should be able to get a materia using item id', inject([MateriaService], (service: MateriaService) => {
    const materia = service.getMateria(26727);
    expect(materia.itemId).toBe(26727);
    expect(materia.tier).toBe(8);
    expect(materia.value).toBe(60);
    expect(materia.baseParamId).toBe(6);
  }));

  it('should be able to get max stat using item id', inject([MateriaService], (service: MateriaService) => {
    // Dwarven Mythril Ring
    const cpCap = service.getItemCapForStat(27225, BaseParam.CP);
    const cmsCap = service.getItemCapForStat(27225, BaseParam.CRAFTSMANSHIP);
    const ctrlCap = service.getItemCapForStat(27225, BaseParam.CONTROL);
    expect(cpCap).toBe(38);
    expect(cmsCap).toBe(66);
    expect(ctrlCap).toBe(84);

    //Bug I had, giving NaN instead
    const cpCapManasilverBracelets = service.getItemCapForStat(27214, BaseParam.CP);
    expect(cpCapManasilverBracelets).toBe(70);
  }));
});
