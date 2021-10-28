import { Directive, HostBinding, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';

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

  constructor(private lazyData: LazyDataFacade) {
  }

  ngOnInit(): void {
    this.lazyData.getRow('rarities', this.appItemRarity)
      .pipe(
        first()
      )
      .subscribe(rarity => {
        this.color = this.colors[rarity] || '#f3f3f3';
      });
  }
}
