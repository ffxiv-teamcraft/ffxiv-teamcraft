import { TestBed } from '@angular/core/testing';
import { CraftingActionsRegistry } from '@ffxiv-teamcraft/simulator';

import { SimulationService } from './simulation.service';
import { Region } from '@ffxiv-teamcraft/types';

describe('SimulationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SimulationService = TestBed.get(SimulationService);
    expect(service).toBeTruthy();
  });

  it('Should give the same registry for all regions after patch synchronization', () => {
    const service: SimulationService = TestBed.get(SimulationService);
    const registry = service.getSimulator(Region.Global).CraftingActionsRegistry.ALL_ACTIONS.map(a => a.name);
    const krRegistry = service.getSimulator(Region.Korea).CraftingActionsRegistry.ALL_ACTIONS.map(a => a.name);
    const cnRegistry = service.getSimulator(Region.China).CraftingActionsRegistry.ALL_ACTIONS.map(a => a.name);

    const expectedRetail = CraftingActionsRegistry.ALL_ACTIONS.map(a => a.name);

    expect(registry).toEqual(expectedRetail);
    expect(krRegistry).toEqual(expectedRetail);
    expect(cnRegistry).toEqual(expectedRetail);
  });
});
