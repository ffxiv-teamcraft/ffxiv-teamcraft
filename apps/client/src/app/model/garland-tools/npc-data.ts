import { DeserializeAs } from '@kaiu/serializer';
import { GtNpc } from './gt-npc';

export class NpcData {

  @DeserializeAs(GtNpc)
  npc: GtNpc;

  partials: any[];

  public getPartial(id: string, type?: string): any | undefined {
    return this.partials.filter(p => type !== undefined ? p.type === type : true).find(p => p.id === id);
  }
}
