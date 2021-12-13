import { Component, OnInit } from '@angular/core';
import { first, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GearSet } from '@ffxiv-teamcraft/simulator';
import { AuthFacade } from '../../../../+state/auth.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-stats-popup',
  templateUrl: './stats-popup.component.html',
  styleUrls: ['./stats-popup.component.less']
})
export class StatsPopupComponent implements OnInit {

  jobId: number;

  set$: Observable<GearSet>;

  allSets$: Observable<GearSet[]>;

  constructor(private authFacade: AuthFacade, private modalRef: NzModalRef) {
  }

  ngOnInit(): void {
    this.allSets$ = this.authFacade.mainCharacterEntry$.pipe(
      map(entry => {
        return [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(jobId => {
          const set = (entry.stats || []).find(stat => stat.jobId === jobId);
          const jobEntry = (entry.character.ClassJobs || [] as any).find(job => job.JobID === jobId);
          const level = jobEntry ? jobEntry.Level : 0;
          if (set === undefined) {
            return {
              jobId: this.jobId,
              level: level,
              cp: 0,
              control: 0,
              craftsmanship: 0,
              specialist: false
            };
          }
          return set;
        });
      })
    );
    this.set$ = this.allSets$.pipe(
      map(allSets => {
        return { ...allSets.find(set => set.jobId === this.jobId) };
      }),
      first()
    );
  }

  save(set: GearSet): void {
    this.authFacade.saveSet(set);
    this.modalRef.close();
  }

  saveForAll(set: GearSet): void {
    this.allSets$.pipe(
      first()
    ).subscribe((allSets: GearSet[]) => {
      [8, 9, 10, 11, 12, 13, 14, 15].forEach(jobId => {
        const newSet = { ...set, jobId: jobId };
        const previousSet = allSets.find(s => s.jobId === jobId);
        if (set.specialist && previousSet && !previousSet.specialist) {
          newSet.craftsmanship -= 20;
          newSet.control -= 20;
          newSet.cp -= 15;
        } else if (!set.specialist && previousSet && previousSet.specialist) {
          newSet.craftsmanship += 20;
          newSet.control += 20;
          newSet.cp += 15;
        }
        this.authFacade.saveSet(newSet, true);
      });
      this.modalRef.close();
    });
  }

  applySpecChange(set: GearSet, spec: boolean): void {
    if (spec) {
      set.craftsmanship += 20;
      set.control += 20;
      set.cp += 15;
    } else {
      set.craftsmanship -= 20;
      set.control -= 20;
      set.cp -= 15;
    }
  }

  cancel(): void {
    this.modalRef.close();
  }

}
