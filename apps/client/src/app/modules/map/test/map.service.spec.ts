import { getTpCost } from '../get-tp-cost';
import { TestLazyAetherytes } from './test-lazy-aetherytes';
import { TestTelepoRelay } from './test-telepo-relay';
import { TestTerritoryTypeTelepoRelay } from './test-territory-type-telepo-relay';

describe('TP Cost computing', () => {
  const limsa = TestLazyAetherytes.find(a => a.id === 8);
  const uldah = TestLazyAetherytes.find(a => a.id === 9);
  const gridania = TestLazyAetherytes.find(a => a.id === 2);
  const kugane = TestLazyAetherytes.find(a => a.id === 111);
  const shaaloani = TestLazyAetherytes.find(a => a.id === 229);
  const mareLamentorum = TestLazyAetherytes.find(a => a.id === 174);

  it('Should compute right costs from Limsa', () => {
    expect(getTpCost(TestTelepoRelay as any, TestTerritoryTypeTelepoRelay, limsa, gridania)).toEqual(617);
    expect(getTpCost(TestTelepoRelay as any, TestTerritoryTypeTelepoRelay, limsa, uldah)).toEqual(456);
    expect(getTpCost(TestTelepoRelay as any, TestTerritoryTypeTelepoRelay, limsa, shaaloani)).toEqual(1085);
    expect(getTpCost(TestTelepoRelay as any, TestTerritoryTypeTelepoRelay, limsa, kugane)).toEqual(1505);
    expect(getTpCost(TestTelepoRelay as any, TestTerritoryTypeTelepoRelay, limsa, mareLamentorum)).toEqual(1555);
  });
});
