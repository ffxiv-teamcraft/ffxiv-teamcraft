import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GearSet } from '../../../simulator/model/gear-set';
import { AuthFacade } from '../../../../+state/auth.facade';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-stats-popup',
  templateUrl: './stats-popup.component.html',
  styleUrls: ['./stats-popup.component.less']
})
export class StatsPopupComponent implements OnInit {

  jobId: number;

  set$: Observable<GearSet>;

  constructor(private authFacade: AuthFacade, private modalRef: NzModalRef) {
  }

  ngOnInit(): void {
    this.set$ = this.authFacade.mainCharacterEntry$.pipe(
      map(entry => {
        const set = (entry.stats || []).find(stat => stat.jobId === this.jobId);
        if (set === undefined) {
          return {
            jobId: this.jobId,
            level: entry.character.ClassJobs[`${this.jobId}_${this.jobId}`].Level,
            cp: 0,
            control: 0,
            craftsmanship: 0,
            specialist: false
          };
        }
        return set;
      })
    );
  }

  save(set: GearSet): void {
    this.authFacade.saveSet(set);
    this.modalRef.close();
  }

  saveForAll(set: GearSet): void {
    [8, 9, 10, 11, 12, 13, 14, 15].forEach(jobId => {
      this.authFacade.saveSet({ ...set, jobId: jobId });
    });
    this.modalRef.close();
  }

  cancel(): void {
    this.modalRef.close();
  }

}
