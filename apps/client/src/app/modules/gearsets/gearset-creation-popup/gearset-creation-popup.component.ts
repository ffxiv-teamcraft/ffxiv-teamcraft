import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import { jobAbbrs } from '@ffxiv-teamcraft/data/handmade/job-abbr-en';
import { observeInput } from '../../../core/rxjs/observe-input';

@Component({
  selector: 'app-gearset-creation-popup',
  templateUrl: './gearset-creation-popup.component.html',
  styleUrls: ['./gearset-creation-popup.component.less']
})
export class GearsetCreationPopupComponent implements OnInit {

  public form: UntypedFormGroup;

  public gearset: TeamcraftGearset;

  public availableJobs$ = observeInput(this, 'gearset', true).pipe(
    switchMap(gearset => {
      if (!gearset) {
        return of(Object.keys(jobAbbrs).map(k => +k).filter(Boolean));
      }
      return combineLatest([
        this.lazyData.getEntry('jobCategories'),
        this.lazyData.getEntry('jobAbbr')
      ]).pipe(
        map(([jobCategories, jobAbbr]) => {
          const jobCategoryId = [32, 33, 182, 183, 184, 185].find(categoryId => {
            return jobCategories[categoryId.toString()].jobs.includes(jobAbbr[this.gearset.job.toString()].en);
          });
          const category = jobCategories[jobCategoryId.toString()];
          return Object.keys(jobAbbrs).map(k => +k).filter(Boolean).filter(job => category.jobs.includes(jobAbbrs[job]));
        })
      );
    })
  );

  constructor(private modalRef: NzModalRef, private fb: UntypedFormBuilder,
              private lazyData: LazyDataFacade) {
  }

  public submit(): void {
    this.modalRef.close(this.form.value);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.gearset?.name, Validators.required],
      job: [this.gearset?.job, Validators.required]
    });
  }

}
