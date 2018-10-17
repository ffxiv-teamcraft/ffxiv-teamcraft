import { Pipe, PipeTransform } from '@angular/core';
import { TradeSource } from '../../modules/list/model/trade-source';

@Pipe({
  name: 'tradeIcon',
  pure: true
})
export class TradeIconPipe implements PipeTransform {

  public static TRADE_SOURCES_PRIORITIES = {
    // Just in case
    25: 25, // Wolf Mark
    29: 25, // MGP
    // Seals
    20: 23, // Storm
    21: 23, // Serpent
    22: 23, // Flame
    27: 23, // Allied
    10307: 23, // Centurio
    // Tomestones
    28: 20, // Poetics
    35: 1, // Creation (can't obtain them anymore)
    36: 20, // Mendacity
    37: 20, // Genesis
    7811: 20, // Rowena's Token (Soldiery)
    9383: 20, // Rowena's Token (Poetics)
    14298: 20, // Rowena's Token (Lore)
    16928: 20, // Rowena's Token (Scripture)
    19107: 20, // Rowena's Token (Creation)
    21789: 20, // Rowena's Token (Mendacity)
    // Scripts
    10309: 18, // Red crafter
    10311: 18, // Red gatherer
    17833: 18, // Yellow crafter
    17834: 18, // Yellow gatherer
    // Hunt mark log
    7901: 15, // Blood-spattered
    10127: 15, // Unstained
    13625: 15, // Clan
    15918: 15, // Unstained Clan
    17523: 15, // Legendary Clan
    20308: 15, // Veteran's Clan
    21103: 15, // Mythic Clan
    // Beast tribes
    21073: 13, // Ixali
    21074: 13, // Vanu Vanu
    21075: 13, // Sylph
    21076: 13, // Amalj'aa
    21077: 13, // Sahagin
    21078: 13, // Kobold
    21079: 13, // Vath
    21080: 13, // Moogle
    21081: 13, // Kojin
    21935: 13, // Ananta
    22525: 13, // Namazu
    // Primals
    7004: 10, // Weekly quest Garuda/Titan/Ifrit
    7850: 10, // Leviathan
    9559: 10, // Shiva
    12672: 10, // Bismarck
    12673: 10, // Ravana
    13627: 10, // Thordan
    14300: 10, // Sephirot
    15421: 10, // Nidhogg
    16188: 10, // Sophia
    17461: 10, // Zurvan
    19109: 10, // Susano
    19110: 10, // Lakshmi
    21196: 10, // Shinryu
    21773: 10, // Byakko
    23043: 10, // Tsukuyomi
    // Raids
    7577: 8, // Sands of Time
    7578: 8, // Oil of Time
    7812: 8, // Unidentified Allagan Tomestone
    9384: 8, // Encrypted Tomestone
    9385: 8, // Carboncoat
    9386: 8, // Carbontwine
    10325: 8, // Illuminati Gobdip
    10326: 8, // Illuminati Gobtwine
    10327: 8, // Illuminati Gobcoat
    12674: 8, // Tarnished Gordian Lens
    12675: 8, // Tarnished Gordian Shaft
    12676: 8, // Tarnished Gordian Crank
    12677: 8, // Tarnished Gordian Spring
    12678: 8, // Tarnished Gordian Pedal
    12679: 8, // Tarnished Gordian Chain
    12680: 8, // Tarnished Gordian Bolt
    12681: 8, // Gordian Manifesto - Page 1
    12682: 8, // Gordian Manifesto - Page 2
    12683: 8, // Gordian Manifesto - Page 3
    12684: 8, // Gordian Manifesto - Page 4
    13626: 8, // Mhachi Farthing
    14299: 8, // High-capacity Tomestone
    14301: 8, // Tarnished Midan Lens
    14302: 8, // Tarnished Midan Shaft
    14303: 8, // Tarnished Midan Crank
    14304: 8, // Tarnished Midan Spring
    14305: 8, // Tarnished Midan Pedal
    14306: 8, // Tarnished Midan Chain
    14307: 8, // Tarnished Midan Bolt
    14308: 8, // Midan Manifesto - Page 1
    14309: 8, // Midan Manifesto - Page 2
    14310: 8, // Midan Manifesto - Page 3
    14311: 8, // Midan Manifesto - Page 4
    14895: 8, // Midan Gear
    14896: 8, // Illuminati Deep Gobdip
    14897: 8, // Illuminati Taut Gobtwine
    14898: 8, // Illuminati Dark Gobcoat
    15947: 8, // Mhachi Penny
    16541: 8, // Micro Tomestone
    16542: 8, // Illuminati Darkest Gobcoat
    16543: 8, // Illuminati Tautest Gobtwine
    16544: 8, // Illuminati Deepest Gobdip
    16545: 8, // Alexandrian Gear
    16546: 8, // Tarnished Alexandrian Lens
    16547: 8, // Tarnished Alexandrian Shaft
    16548: 8, // Tarnished Alexandrian Crank
    16549: 8, // Tarnished Alexandrian Spring
    16550: 8, // Tarnished Alexandrian Pedal
    16551: 8, // Tarnished Alexandrian Chain
    16552: 8, // Tarnished Alexandrian Bolt
    16553: 8, // Alexandrian Manifesto - Page 1
    16554: 8, // Alexandrian Manifesto - Page 2
    16555: 8, // Alexandrian Manifesto - Page 3
    16556: 8, // Alexandrian Manifesto - Page 4
    17595: 8, // Mhachi Shilling
    19104: 8, // Lost Allagan Roborant
    19105: 8, // Lost Allagan Twine
    19106: 8, // Lost Allagan Glaze
    19108: 8, // Early Model Tomestone
    19111: 8, // Deltascape Lens
    19112: 8, // Deltascape Shaft
    19113: 8, // Deltascape Crank
    19114: 8, // Deltascape Spring
    19115: 8, // Deltascape Pedal
    19116: 8, // Deltascape Chain
    19117: 8, // Deltascape Bolt
    19118: 8, // Deltascape Datalog v1.0
    19119: 8, // Deltascape Datalog v2.0
    19120: 8, // Deltascape Datalog v3.0
    19121: 8, // Deltascape Datalog v4.0
    19122: 8, // Deltascape Crystalloid
    21197: 8, // Dreadwyrm Totem
    21198: 8, // Rabanastran Coin
    21774: 8, // Sigmascape Lens
    21775: 8, // Sigmascape Shaft
    21776: 8, // Sigmascape Crank
    21777: 8, // Sigmascape Spring
    21778: 8, // Sigmascape Pedal
    21779: 8, // Sigmascape Chain
    21780: 8, // Sigmascape Bolt
    21781: 8, // Sigmascape Datalog v1.0
    21782: 8, // Sigmascape Datalog v2.0
    21783: 8, // Sigmascape Datalog v3.0
    21784: 8, // Sigmascape Datalog v4.0
    21785: 8, // Sigmascape Crystalloid
    23174: 8, // Gougan Coin
    // World bosses
    6155: 5, // Behemoth
    6164: 5, // Odin
    12252: 5, // Coeurlregina
    12253: 5, // Proto Ultima
    20521: 5, // Tamamo-no-Gozen
    20638: 5, // Ixion
    // Gardening
    15857: 3, // Althyk Lavender
    15858: 3, // Voidrake
    // Spoils
    13630: 1, // Brass
    13631: 1 // Steel
  };

  transform(tradeSources: TradeSource[]): number {
    const res = { priority: 0, icon: 0 };
    tradeSources.forEach(ts => {
      ts.trades.forEach(trade => {
        trade.currencies.forEach(currency => {
          const id = currency.id;
          if (TradeIconPipe.TRADE_SOURCES_PRIORITIES[id] !== undefined &&
            TradeIconPipe.TRADE_SOURCES_PRIORITIES[id] > res.priority) {
            res.icon = currency.icon;
            res.priority = TradeIconPipe.TRADE_SOURCES_PRIORITIES[id];
          }
        })
      });
    });
    return res.icon;
  }

}
