import { LazyAetheryte } from '@ffxiv-teamcraft/data/model/lazy-aetheryte';
import { MAP_OVERRIDES } from './map-overrides';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { LazyTerritoryTypeTelepoRelay } from '@ffxiv-teamcraft/data/model/lazy-territory-type-telepo-relay';


function getSamePlaneTPCost(from: LazyTerritoryTypeTelepoRelay, to: LazyTerritoryTypeTelepoRelay): number {
  const aetherStreamDistance = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
  return 100 + aetherStreamDistance * Math.max(1000, from.ex + to.ex + 600) / 5000;
}

export function getTpCost(telepoRelay: LazyData['telepoRelay'], territoryTypeTelepoRelay: LazyData['territoryTypeTelepoRelay'], from: LazyAetheryte, to: LazyAetheryte, favoriteAetherytes: number[] = [], freeAetheryte?: number): number {
  //https://github.com/aers/FFXIVClientStructs/blob/78aa8890dbfdec9bc4bcadf9630892439a446404/FFXIVClientStructs/FFXIV/Client/Game/UI/Telepo.cs#L20
  if (from === undefined || to === undefined) {
    return 999;
  }
  if (freeAetheryte === to.nameid) {
    return 0;
  }

  const fromCoords = from.aethernetCoords;
  const toCoords = to.aethernetCoords;
  const fromTelepo = territoryTypeTelepoRelay[from.territory];
  const toTelepo = territoryTypeTelepoRelay[to.territory];
  if (fromCoords === undefined || toCoords === undefined || fromTelepo === undefined || fromTelepo === undefined) {
    return 999;
  }

  if ((MAP_OVERRIDES[from.map] || from.map) === (MAP_OVERRIDES[to.map] || to.map)) {
    return 70;
  }

  const divider = favoriteAetherytes.indexOf(to.nameid) > -1 ? 2 : 1;

  let baseCost: number;

  if (fromTelepo.relay === toTelepo.relay) {
    baseCost = getSamePlaneTPCost(fromTelepo, toTelepo);
  } else {
    const relay = telepoRelay[fromTelepo.relay][toTelepo.relay];
    baseCost = getSamePlaneTPCost(fromTelepo, territoryTypeTelepoRelay[relay.enter]) + getSamePlaneTPCost(toTelepo, territoryTypeTelepoRelay[relay.exit]) + relay.cost;
  }

  if (baseCost > 1000) {
    baseCost = 1000 + ((baseCost - 1000) / 2);
  }

  return Math.floor(baseCost / divider);
}
