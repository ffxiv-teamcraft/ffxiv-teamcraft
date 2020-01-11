import { Directive, HostBinding, Input, OnInit } from '@angular/core';
import { LazyDataService } from '../data/lazy-data.service';

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

  constructor(private lazyData: LazyDataService) {
  }

  ngOnInit(): void {
    const rarity = this.lazyData.data.rarities[this.appItemRarity];
    this.color = this.colors[rarity] || '#f3f3f3';
  }
}
