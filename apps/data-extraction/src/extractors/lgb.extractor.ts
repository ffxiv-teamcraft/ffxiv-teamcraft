import { readdirSync, readFileSync } from 'fs-extra';
import { join } from 'path';
import { AbstractExtractor } from '../abstract-extractor';
import { combineLatest } from 'rxjs';

export class LgbExtractor extends AbstractExtractor {
  public isSpecific = true;

  protected doExtract(): any {
    const mapData = require('../../../../client/src/assets/data/maps.json');
    const fates = require('../../../../client/src/assets/data/fates.json');
    const npcs = require('../../../../client/src/assets/data/npcs.json');
    const territoryLayers = require('../../../../client/src/assets/data/territory-layers.json');
    const lgbFolder = '../../../input/lgb';
    const housingMaterialSuppliers = [];

    const aetherytes = [];

    // First things first, let's build the list of territories with multiple maps included.
    const everyMaps = Object.values<any>(mapData);
    everyMaps
      .filter(map => everyMaps.filter(m => m.territory_id === map.territory_id).length > 1)
      .forEach(map => {
        if (!territoryLayers[map.territory_id] || !territoryLayers[map.territory_id].some(entry => {
          return entry.mapId === map.id && entry.placeNameId === map.placename_sub_id;
        })) {
          territoryLayers[map.territory_id] = [
            ...(territoryLayers[map.territory_id] || []),
            {
              mapId: map.id,
              index: map.index,
              placeNameId: map.placename_sub_id,
              bounds: {
                x: {
                  min: 0,
                  max: 0
                },
                y: {
                  min: 0,
                  max: 0
                },
                z: {
                  min: 0,
                  max: 0
                }
              }
            }
          ].sort((a, b) => a.index - b.index);
        }
      });
    // Removing territories with only one map from the layers list.
    Object.keys(territoryLayers).forEach(key => {
      if (territoryLayers[key].length === 1) {
        delete territoryLayers[key];
      }
    });

    // Then, let's work on lgb files
    combineLatest([
      this.aggregateAllPages('https://xivapi.com/Aetheryte?columns=ID,Level0TargetID,MapTargetID,IsAetheryte,AethernetNameTargetID,PlaceNameTargetID,AetherstreamX,AetherstreamY', null, 'LGB Aetherytes'),
      this.aggregateAllPages('https://xivapi.com/HousingAethernet?columns=ID,LevelTargetID,TerritoryType.MapTargetID,PlaceNameTargetID', null, 'LGB Housing Aetherytes')
    ])
      .subscribe(([xivapiAetherytes, xivapiHousingAetherytes]) => {
        const allLgbFiles = readdirSync(join(__dirname, lgbFolder));

        const allLgbs = allLgbFiles.map(filename => {
          const split = filename.split('_');
          const mapKey = split[0];
          const mapId = Object.keys(mapData).find(key => mapData[key].image.indexOf(mapKey) > -1);
          if (!mapData[mapId]) {
            return;
          }
          const territoryId = mapData[mapId].territory_id;
          return {
            territoryId: +territoryId,
            defaultMapId: +mapId,
            type: split[1].split('.')[0],
            filename: filename,
            content: JSON.parse(readFileSync(join(__dirname, lgbFolder, filename), 'utf8'))
          };
        }).filter(entry => entry);

        allLgbs.forEach(lgbEntry => {
          lgbEntry.content.forEach(lgbLayer => {
            lgbLayer.InstanceObjects.forEach(object => {
              let mapId = lgbEntry.defaultMapId;
              if (territoryLayers[lgbEntry.territoryId]) {
                const mapLayer = territoryLayers[lgbEntry.territoryId].find(layer => {
                  const localMapEntry = mapData[layer.mapId];
                  const localCoords = this.getCoords({
                    x: object.Transform.Translation.X,
                    y: object.Transform.Translation.Z,
                    z: object.Transform.Translation.Y
                  }, localMapEntry);
                  return this.isInLayerBounds(localCoords, layer.bounds);
                });
                mapId = mapLayer ? mapLayer.mapId : lgbEntry.defaultMapId;
              }
              const mapEntry = mapData[mapId.toString()];
              if (!mapEntry) {
                return;
              }
              const coords = this.getCoords({
                x: object.Transform.Translation.X,
                y: object.Transform.Translation.Z,
                z: object.Transform.Translation.Y
              }, mapEntry);
              if (coords.x < 0 || coords.y < 0) {
                return;
              }
              const zoneId = mapData[mapId.toString()].placename_id;
              switch (object.AssetType) {
                // ENpcResidents
                case 8:
                  const npc = npcs[object.Object.ParentData.ParentData.BaseId];
                  npc.position = {
                    zoneid: zoneId,
                    map: mapId,
                    ...coords
                  };
                  if (lgbLayer.FestivalID > 0) {
                    npc.festival = lgbLayer.FestivalID;
                  }
                  if (npc.en === 'material supplier' && mapEntry.housing) {
                    housingMaterialSuppliers.push(object.Object.ParentData.ParentData.BaseId);
                  }
                  break;
                // Aetherytes
                case 40:
                  const xivapiAetheryte = xivapiAetherytes.find(aetheryte => {
                      return aetheryte.Level0TargetID === object.InstanceId;
                    })
                    || xivapiHousingAetherytes.find(aetheryte => {
                      return aetheryte.TerritoryType && aetheryte.TerritoryType.MapTargetID === mapId && aetheryte.LevelTargetID === object.InstanceId;
                    });
                  if (xivapiAetheryte) {
                    const aetheryteEntry = {
                      id: xivapiAetheryte.ID,
                      zoneid: zoneId,
                      map: mapId,
                      ...coords,
                      type: xivapiAetheryte.IsAetheryte === 1 ? 0 : 1,
                      nameid: xivapiAetheryte.PlaceNameTargetID || xivapiAetheryte.AethernetNameTargetID,
                      aethernetCoords: {
                        x: xivapiAetheryte.AetherstreamX,
                        y: xivapiAetheryte.AetherstreamY
                      }
                    };
                    aetherytes.push(aetheryteEntry);
                  }
                  break;

                // FATEs
                case 49:
                  const fateId = Object.keys(fates).find(key => fates[key].location === object.InstanceId);
                  if (fateId === undefined) {
                    return;
                  }
                  fates[fateId].position = {
                    map: mapId,
                    zoneid: zoneId,
                    ...coords
                  };
              }

            });
          });
        });

        this.persistToJsonAsset('aetherytes', aetherytes);
        this.persistToJsonAsset('fates', fates);
        this.persistToJsonAsset('npcs', npcs);
        this.persistToTypescript('housing-material-suppliers', 'housingMaterialSuppliers', housingMaterialSuppliers);
        this.persistToJsonAsset('territory-layers', territoryLayers);
        this.done();
      });
  }

  getName(): string {
    return 'LGB';
  }

}
