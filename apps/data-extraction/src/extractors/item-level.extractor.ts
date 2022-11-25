import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class ItemLevelExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const itemLevel = {};
    const itemLevelColumns = [
      'AdditionalEffect',
      'AttackMagicPotency',
      'AttackPower',
      'AttackSpeed',
      'BindResistance',
      'BlindResistance',
      'BlockRate',
      'BlockStrength',
      'BluntResistance',
      'CP',
      'CarefulDesynthesis',
      'Control',
      'Craftsmanship',
      'CriticalHit',
      'CriticalHitEvasion',
      'CriticalHitPower',
      'CriticalHitResilience',
      'Defense',
      'Delay',
      'Determination',
      'Dexterity',
      'DirectHitRate',
      'DoomResistance',
      'EXPBonus',
      'EarthResistance',
      'EnfeeblingMagicPotency',
      'EnhancementMagicPotency',
      'Enmity',
      'EnmityReduction',
      'Evasion',
      'FireResistance',
      'GP',
      'GameContentLinks',
      'Gathering',
      'HP',
      'Haste',
      'HealingMagicPotency',
      'HeavyResistance',
      'ID',
      'IceResistance',
      'IncreasedSpiritbondGain',
      'Intelligence',
      'LightningResistance',
      'MP',
      'MagicDefense',
      'MagicResistance',
      'MagicalDamage',
      'Mind',
      'Morale',
      'MovementSpeed',
      'ParalysisResistance',
      'Patch',
      'Perception',
      'PetrificationResistance',
      'PhysicalDamage',
      'PiercingResistance',
      'Piety',
      'PoisonResistance',
      'ProjectileResistance',
      'ReducedDurabilityLoss',
      'Refresh',
      'Regen',
      'SilenceResistance',
      'SkillSpeed',
      'SlashingResistance',
      'SleepResistance',
      'SlowResistance',
      'SpellSpeed',
      'Spikes',
      'Strength',
      'StunResistance',
      'TP',
      'Tenacity',
      'Vitality',
      'WaterResistance',
      'WindResistance'
    ];
    this.getSheet(xiv, 'ItemLevel', itemLevelColumns)
      .subscribe(ilvls => {
        ilvls.forEach(entry => {
          if (entry.index === 0) {
            return;
          }
          const withoutIndexes = this.removeIndexes(entry);
          // We want to sort props to match previous behavior and make sure nothing is being missed.
          itemLevel[entry.index] = this.sortProperties(withoutIndexes);
        });
        this.persistToJsonAsset('item-level', itemLevel);
        this.done();
      });
  }

  getName(): string {
    return 'item-level';
  }

}
