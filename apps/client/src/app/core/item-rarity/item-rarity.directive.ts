import { Directive, HostBinding, Input, OnInit } from '@angular/core';
import { rarities } from '../data/sources/rarities';

@Directive({
  selector: '[appItemRarity]'
})
export class ItemRarityDirective implements OnInit {

  colors = {
    1: '#f3f3f3',
    2: '#c0ffc0',
    3: '#5990ff',
    4: '#b38cff',
    7: '#d789b6'
  };

  @HostBinding('style.color')
  color: string;

  @Input()
  appItemRarity: number;

  ngOnInit(): void {
    const rarity = rarities[this.appItemRarity];
    this.color = this.colors[rarity] || '#f3f3f3';
  }
}
