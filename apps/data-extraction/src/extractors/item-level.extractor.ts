import { AbstractExtractor } from '../abstract-extractor';

export class ItemLevelExtractor extends AbstractExtractor {
  protected doExtract(): any {
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
    this.getAllPages(`https://xivapi.com/ItemLevel?columns=${itemLevelColumns.join(',')}`).subscribe(page => {
      page.Results.forEach(entry => {
        itemLevel[entry.ID] = entry;
      });
    }, null, () => {
      this.persistToJsonAsset('item-level', itemLevel);
      this.done();
    });
  }

  getName(): string {
    return 'item-level';
  }

}
