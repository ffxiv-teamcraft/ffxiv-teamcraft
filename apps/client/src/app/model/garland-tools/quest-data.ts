import { DeserializeAs } from '@kaiu/serializer';
import { GtInstance } from './gt-instance';
import { GtQuest } from './gt-quest';

export class QuestData {

  @DeserializeAs(GtQuest)
  quest: GtQuest;

  partials: any[];

  public getPartial(id: string, type?: string): any | undefined {
    return this.partials.filter(p => type !== undefined ? p.type === type : true).find(p => p.id === id);
  }
}
