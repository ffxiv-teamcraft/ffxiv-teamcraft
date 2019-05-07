import { Craft } from './craft';
import { I18nData } from '../common/i18n-data';
import { I18nDataRow } from '../common/i18n-data-row';
import { DeserializeFieldName } from '@kaiu/serializer';
import { Fish } from './fish';
import { SatisfactionData } from './satisfaction-data';
import { Masterpiece } from './masterpiece';

export class Item implements I18nData {

  fr: I18nDataRow;
  en: I18nDataRow;
  de: I18nDataRow;
  ja: I18nDataRow;

  id: number;
  patch: number;
  price?: number;
  patchCategory: number;
  ilvl: number;
  category: number;
  rarity: number;
  strengths: string[];
  attr: Attr;
  tradeable?: number;
  craft?: Craft[];
  vendors?: number[];
  tradeShops?: any[];
  drops?: number[];
  nodes?: number[];
  ventures?: number[];
  voyages?: string[];
  instances?: number[];
  reducedFrom?: number[];
  desynthedFrom?: number[];
  fishingSpots?: number[];
  fish?: Fish;
  seeds?: number[];
  collectable: 1 | 0;
  satisfaction: SatisfactionData[];
  masterpiece: Masterpiece;

  ingredient_of?: { [index: string]: number };
  tradeCurrency?: any[];

  @DeserializeFieldName('icon')
  _icon: number;

  public get icon(): number {
    return this._icon;
  }

  public hasNodes(): boolean {
    return this.nodes !== undefined;
  }

  public hasFishingSpots(): boolean {
    return this.fishingSpots !== undefined;
  }

  public isCraft(): boolean {
    return this.craft !== undefined;
  }
}
