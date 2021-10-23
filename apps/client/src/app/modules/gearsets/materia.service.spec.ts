import { inject, TestBed } from '@angular/core/testing';
import { MateriaService } from './materia.service';
import { BaseParam } from './base-param';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';

describe('MateriaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LazyDataFacade,
        MateriaService
      ]
    });
  });

  it('should be created', inject([MateriaService], (service: MateriaService) => {
    expect(service).toBeTruthy();
  }));

  it('should be able to get a materia using item id', inject([MateriaService], async (service: MateriaService) => {
    const materia = await service.getMateria(26727).toPromise();
    expect(materia.itemId).toBe(26727);
    expect(materia.tier).toBe(8);
    expect(materia.value).toBe(60);
    expect(materia.baseParamId).toBe(6);
  }));

  it('should be able to get max stat using item id', inject([MateriaService], async (service: MateriaService) => {
    // Dwarven Mythril Ring
    const cpCap = await service.getItemCapForStat(27225, BaseParam.CP).toPromise();
    const cmsCap = await service.getItemCapForStat(27225, BaseParam.CRAFTSMANSHIP).toPromise();
    const ctrlCap = await service.getItemCapForStat(27225, BaseParam.CONTROL).toPromise();
    expect(cpCap).toBe(38);
    expect(cmsCap).toBe(66);
    expect(ctrlCap).toBe(84);

    //Bug I had, giving NaN instead
    const cpCapManasilverBracelets = await service.getItemCapForStat(27214, BaseParam.CP).toPromise();
    expect(cpCapManasilverBracelets).toBe(70);
  }));
});
