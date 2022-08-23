import { Pipe, PipeTransform } from '@angular/core';
import { TradeSource } from '../../modules/list/model/trade-source';

@Pipe({
  name: 'tradeIcon',
  pure: true
})
export class TradeIconPipe implements PipeTransform {

  public static TRADE_SOURCES_PRIORITIES = {
    // Seals
    20: 30, // Storm
    21: 30, // Serpent
    22: 30, // Flame
    27: 29, // Allied
    10307: 19, // Centurio
    26533: 30, // Sack of nuts (lol)
    // Scrips
    10309: 0, // Red crafter
    10311: 0, // Red gatherer
    17833: 0, // Yellow crafter
    17834: 0, // Yellow gatherer
    25199: 30, // White crafter
    25200: 30, // White gatherer
    33913: 30, // Purple crafter
    33914: 30, // Purple gatherer
    // Tomestones
    28: 28, // Poetics
    35: 0, // Creation (can't obtain them anymore)
    36: 0, // Mendacity
    37: 0, // Genesis
    38: 0, // Goetia
    39: 0, // Phantasmagoria
    40: 0, // Allegory
    41: 0, // Revelation
    42: 0, // Aphorism
    43: 25, // Astronomy
    44: 25, // Causality
    7811: 28, // Rowena's Token (Soldiery)
    9383: 28, // Rowena's Token (Poetics)
    14298: 28, // Rowena's Token (Lore)
    16928: 28, // Rowena's Token (Scripture)
    19107: 28, // Rowena's Token (Creation)
    21789: 28, // Rowena's Token (Mendacity)
    23978: 28, // Rowena's Token (Genesis)
    // Craft upgrade
    23210: 27, // Resistance Token
    23382: 27, // Thavnairian Rain
    24988: 27, // Rakshasa Token
    24989: 27, // Doman Reiyaku
    // Fates stones
    26807: 23,
    // Just in case
    25: 22, // Wolf Mark
    29: 22, // MGP
    // Hunt mark log
    7901: 22, // Blood-spattered Mark Log
    10127: 22, // Unstained Mark Log
    13625: 22, // Clan Mark Log
    15918: 22, // Unstained Clan Mark Log
    17523: 22, // Legendary Clan Mark Log
    20308: 22, // Veteran's Clan Mark Log
    21103: 22, // Mythic Clan Mark Log
    23176: 22, // Doyen's Clan Mark Log
    24805: 22, // Pearless Clan Mark Log
    // Beast tribes
    21073: 20, // Ixali
    21074: 20, // Vanu Vanu
    21075: 20, // Sylph
    21076: 20, // Amalj'aa
    21077: 20, // Sahagin
    21078: 20, // Kobold
    21079: 20, // Vath
    21080: 20, // Moogle
    21081: 20, // Kojin
    21935: 20, // Ananta
    22525: 20, // Namazu
    // World bosses
    6155: 18, // Behemoth
    6164: 18, // Odin
    12252: 18, // Coeurlregina
    12253: 18, // Proto Ultima
    20521: 18, // Tamamo-no-Gozen
    20638: 18, // Ixion
    // Extremes
    7004: 15, // Weekly quest Garuda/Titan/Ifrit
    7850: 15, // Leviathan
    9559: 15, // Shiva
    12672: 15, // Bismarck
    12673: 15, // Ravana
    13627: 15, // Thordan
    14300: 15, // Sephirot
    15421: 15, // Nidhogg
    16188: 15, // Sophia
    17461: 15, // Zurvan
    19109: 15, // Susano
    19110: 15, // Lakshmi
    21196: 15, // Shinryu
    21773: 15, // Byakko
    23043: 15, // Tsukuyomi
    23962: 15, // Suzaku
    24797: 15, // Seiryu
    // 24 man raids
    13626: 12, // Mhachi Farthing
    15947: 12, // Mhachi Penny
    17595: 12, // Mhachi Shilling
    21198: 12, // Rabanastran Coin
    23174: 12, // Gougan Coin
    24798: 12, // Mullondeis Coin
    // 8 man raids (upgrades)
    7577: 10, // Sands of Time
    7578: 10, // Oil of Time
    9385: 10, // Carboncoat
    9386: 10, // Carbontwine
    10325: 10, // Illuminati Gobdip
    10326: 10, // Illuminati Gobtwine
    10327: 10, // Illuminati Gobcoat
    14896: 10, // Illuminati Deep Gobdip
    14897: 10, // Illuminati Taut Gobtwine
    14898: 10, // Illuminati Dark Gobcoat
    16542: 10, // Illuminati Darkest Gobcoat
    16543: 10, // Illuminati Tautest Gobtwine
    16544: 10, // Illuminati Deepest Gobdip
    19104: 10, // Lost Allagan Roborant
    19105: 10, // Lost Allagan Twine
    19106: 10, // Lost Allagan Glaze
    21786: 10, // Ryumyaku Solvent
    21787: 10, // Ryumyaku Weave
    21788: 10, // Ryumyaku Polish
    23975: 10, // Scaevan Ester
    23976: 10, // Scaevan Weave
    23977: 10, // Scaevan Shellac
    // 8 man raids (token)
    7812: 8, // Unidentified Allagan Tomestone
    9384: 8, // Encrypted Tomestone
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
    16541: 8, // Micro Tomestone
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
    21790: 8, // Prototype Tomestone
    23963: 8, // Alphascape Lens
    23964: 8, // Alphascape Shaft
    23965: 8, // Alphascape Crank
    23966: 8, // Alphascape Spring
    23967: 8, // Alphascape Pedal
    23968: 8, // Alphascape Chain
    23969: 8, // Alphascape Bolt
    23970: 8, // Alphascape Datalog v1.0
    23971: 8, // Alphascape Datalog v2.0
    23972: 8, // Alphascape Datalog v3.0
    23973: 8, // Alphascape Datalog v4.0
    23974: 8, // Alphascape Crystalloid
    23979: 8, // Military-grade Tomestone
    16783: 8, // Machi demimatter
    // Ultimate
    21197: 5, // Bahamut
    23175: 5, // Ultima Arma
    // Gardening
    15857: 20, // Althyk Lavender
    15858: 3, // Voidrake
    // Spoils
    13630: 1, // Brass
    13631: 1 // Steel
  };

  transform(tradeSources: TradeSource[]): number {
    const res: any = { priority: 0, id: 0 };
    tradeSources.forEach(ts => {
      ts.trades.forEach(trade => {
        trade.currencies.forEach(currency => {
          const id = currency.id;
          if (TradeIconPipe.TRADE_SOURCES_PRIORITIES[id] !== undefined &&
            TradeIconPipe.TRADE_SOURCES_PRIORITIES[id] > res.priority) {
            res.id = currency.id;
            res.priority = TradeIconPipe.TRADE_SOURCES_PRIORITIES[id];
          }
        });
      });
    });
    return res.id;
  }

}
