import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { Observable } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';

@Component({
  selector: 'app-gearsets-page',
  templateUrl: './gearsets-page.component.html',
  styleUrls: ['./gearsets-page.component.less']
})
export class GearsetsPageComponent implements OnInit {

  public loaded$: Observable<boolean> = this.gearsetsFacade.loaded$;

  public gearsets$: Observable<TeamcraftGearset[]> = this.gearsetsFacade.myGearsets$;

  public userId$: Observable<string> = this.authFacade.userId$;

  constructor(private dialog: NzModalService, private gearsetsFacade: GearsetsFacade,
              private authFacade: AuthFacade) {
  }

  newGearset(): void {
    this.gearsetsFacade.createGearset();
  }

  importGearset(): void {
    this.gearsetsFacade.importGearset();
  }

  deleteGearset(key: string): void {
    this.gearsetsFacade.delete(key);
  }

  ngOnInit(): void {
    this.gearsetsFacade.loadAll();
  }

}
