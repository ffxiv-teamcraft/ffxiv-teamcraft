import { Vector2 } from '../../../core/tools/vector2';
import { MapMarker } from '../../../modules/map/map-marker';
import { I18nName } from '../../../model/common/i18n-name';

export interface MapRelatedElement {
  type: 'fate' | 'mob' | 'npc' | 'node' | 'hunt';
  id: number;
  name: I18nName;
  description?: I18nName;
  coords: Vector2;
  marker: MapMarker;
  additionalData?: any;
}
