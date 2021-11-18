import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';

@Component({
  selector: 'app-gearset-creation-popup',
  templateUrl: './gearset-creation-popup.component.html',
  styleUrls: ['./gearset-creation-popup.component.less']
})
export class GearsetCreationPopupComponent implements OnInit {

  public form: FormGroup;

  public availableJobs$;

  public gearset: TeamcraftGearset;

  constructor(private modalRef: NzModalRef, private fb: FormBuilder,
              private gt: GarlandToolsService, private lazyData: LazyDataFacade) {
  }

  public submit(): void {
    this.modalRef.close(this.form.value);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.gearset?.name, Validators.required],
      job: [this.gearset?.job, Validators.required]
    });

    this.availableJobs$ = of(this.gearset).pipe(
      switchMap(gearset => {
        if (!gearset) {
          return of(this.gt.getJobs().filter(job => job.id > 0));
        }
        return combineLatest([
          this.lazyData.getEntry('jobCategories'),
          this.lazyData.getEntry('jobAbbr')
        ]).pipe(
          map(([jobCategories, jobAbbr]) => {
            const jobCategoryId = [32, 33, 156, 157, 158, 159].find(categoryId => {
              return jobCategories[categoryId.toString()].jobs.includes(jobAbbr[this.gearset.job.toString()].en);
            });
            const category = jobCategories[jobCategoryId.toString()];
            return this.gt.getJobs().filter(job => job.id > 0).filter(job => category.jobs.includes(job.abbreviation));
          })
        );
      })
    );
  }

}
