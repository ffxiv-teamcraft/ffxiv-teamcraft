import { Vector2 } from '@ffxiv-teamcraft/types';
import { MapMarker } from '../../../modules/map/map-marker';
import { I18nName } from '@ffxiv-teamcraft/types';
import { Observable } from 'rxjs';

export interface MapRelatedElement {
  type: 'fate' | 'mob' | 'npc' | 'node' | 'hunt';
  linkType?: string;
  id: number;
  name: I18nName | Observable<I18nName>;
  description?: I18nName;
  coords: Vector2;
  marker: MapMarker;
  additionalData?: any;
}
