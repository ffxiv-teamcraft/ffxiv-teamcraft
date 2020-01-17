import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gearsets-page',
  templateUrl: './gearsets-page.component.html',
  styleUrls: ['./gearsets-page.component.less']
})
export class GearsetsPageComponent implements OnInit {

  public loaded$: Observable<boolean> = this.gearsetsFacade.loaded$;

  public gearsets$: Observable<TeamcraftGearset[]> = this.gearsetsFacade.myGearsets$;

  constructor(private dialog: NzModalService, private gearsetsFacade: GearsetsFacade) {
  }

  newGearset(): void {
    this.gearsetsFacade.createGearset();
  }

  ngOnInit(): void {
    this.gearsetsFacade.loadAll();
  }

}
