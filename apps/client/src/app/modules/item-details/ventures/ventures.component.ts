import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { Venture } from '../../../model/garland-tools/venture';
import { DataType } from '../../list/data/data-type';
import { getItemSource } from '../../list/model/list-row';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-ventures',
  templateUrl: './ventures.component.html',
  styleUrls: ['./ventures.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VenturesComponent extends ItemDetailsPopup implements OnInit {
  DOWM = { 'en': 'Disciple of War/Magic', 'ja': '戦闘職', 'de': 'Krieger/Magier', 'fr': 'Combattant' };

  public ventures: Venture[] = [];
  
  constructor(private gt: GarlandToolsService) {
    super();
  }

  ngOnInit(): void {
    this.ventures = this.gt.getVentures(getItemSource(this.item, DataType.VENTURES)).map(venture => {
      venture.amountsDetails = this.gt.ventureAmounts(venture);
      return venture;
    });
  }

}
