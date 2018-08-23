import { XivdbLinkBase } from './bases/xivdb-link-base';
import { AbstractLinkBase } from './abstract-link-base';
import { GarlandToolsLinkBase } from './bases/garland-tools-link-base';
import { GamerEscapeLinkBase } from './bases/gamer-escape-link-base';

export class LinkBase {
  static readonly XIVDB: AbstractLinkBase = new XivdbLinkBase();
  static readonly GARLAND_TOOLS: LinkBase = new GarlandToolsLinkBase();
  static readonly GAMER_ESCAPE: LinkBase = new GamerEscapeLinkBase();

  // static readonly LODESTONE: LinkBase =; TODO

  static byName(name: string): AbstractLinkBase {
    return this[name];
  }
}
