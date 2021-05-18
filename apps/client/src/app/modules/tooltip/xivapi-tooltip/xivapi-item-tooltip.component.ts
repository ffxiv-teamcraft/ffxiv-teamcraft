import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';

@Component({
  selector: 'app-xivdb-tooltip-component',
  templateUrl: './xivapi-item-tooltip.component.html',
  styleUrls: ['./xivapi-item-tooltip.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XivapiItemTooltipComponent implements OnInit {

  constructor(private l12n: LocalizedDataService, private lazyData: LazyDataService,
              private cd: ChangeDetectorRef) {
  }

  @Input() item: any;

  /**
   * Main attributes are ilvl, attack damage or duration for foods.
   */
  public mainAttributes = [];

  public stats = [];

  public patch: any;

  ngOnInit(): void {
    this.cd.reattach();
    if (this.item === undefined) {
      return;
    }
    this.patch = this.lazyData.patches.find(patch => patch.ID === this.item.Patch);
    this.mainAttributes.push({
      name: 'TOOLTIP.Level',
      value: this.item.LevelEquip
    });
    this.mainAttributes.push({
      name: 'TOOLTIP.Ilvl',
      value: this.item.LevelItem
    });
    // If the item has some damage, handle it.
    if (this.item.DamagePhys || this.item.DamageMag) {
      if (this.item.DamagePhys > this.item.DamageMag) {
        this.mainAttributes.push({
          name: 'TOOLTIP.Damage_phys',
          value: this.item.DamagePhys,
          valueHq: this.item.DamagePhys + this.item.BaseParamValueSpecial0
        });
      } else {
        this.mainAttributes.push({
          name: 'TOOLTIP.Damage_mag',
          value: this.item.DamageMag,
          valueHq: this.item.DamageMag + this.item.BaseParamValueSpecial1
        });
      }
    }
    // If the item has some defense, handle it.
    if (this.item.DefensePhys || this.item.DefenseMag) {
      this.mainAttributes.push({
        name: 'TOOLTIP.Defense_phys',
        value: this.item.DefensePhys,
        valueHq: this.item.DefensePhys + this.item.BaseParamValueSpecial0
      });
      this.mainAttributes.push({
        name: 'TOOLTIP.Defense_mag',
        value: this.item.DefenseMag,
        valueHq: this.item.DefenseMag + this.item.BaseParamValueSpecial1
      });
    }
    // Handle stats
    this.stats.push(...Object.keys(this.item)
      .filter(key => /^BaseParam\d+$/.test(key) && this.item[key] && key !== undefined)
      .map(key => {
        const statIndex = key.match(/(\d+)/)[0];
        const res: any = {
          name: this.l12n.xivapiToI18n(this.item[key], 'baseParams'),
          value: this.item[`BaseParamValue${statIndex}`],
          requiresPipe: true
        };
        if (this.item.CanBeHq === 1) {
          const statId = this.item[`BaseParam${statIndex}TargetID`];
          const specialParamKey = Object.keys(this.item)
            .filter(k => /^BaseParamSpecial\d+TargetID$/.test(k) && this.item[k])
            .find(k => this.item[k] === statId);
          if (specialParamKey) {
            const specialParamIndex = specialParamKey.match(/(\d+)/)[0];
            res.valueHq = res.value + this.item[`BaseParamValueSpecial${specialParamIndex}`];
          } else {
            res.valueHq = res.value;
          }
        }
        return res;
      })
    );

    if (this.item.ItemFood !== undefined) {
      const food = this.item.ItemFood;
      for (let i = 0; i <= 2; i++) {
        const statsEntry: any = {};
        const value = food[`Value${i}`];
        const valueHq = food[`ValueHQ${i}`];
        const isRelative = food[`IsRelative${i}`] === 1;
        const max = food[`Max${i}`];
        const maxHq = food[`MaxHQ${i}`];
        if (value > 0) {
          statsEntry.name = this.l12n.xivapiToI18n(food[`BaseParam${i}`], 'baseParams');
          statsEntry.requiresPipe = true;
          if (isRelative) {
            statsEntry.value = `${value}% (${max})`;
            statsEntry.valueHq = `${valueHq}% (${maxHq})`;
          } else {
            statsEntry.value = value.toString();
          }
          this.stats.push(statsEntry);
        }
      }
    }

    if (this.item.ItemSpecialBonus) {
      this.item.SetBonuses = this.lazyData.data.itemSetBonuses[this.item.ID]?.bonuses;
    }

    this.cd.detectChanges();
  }


}
