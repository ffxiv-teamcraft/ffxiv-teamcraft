import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { LazyDataService } from '../../../core/data/lazy-data.service';

@Component({
  selector: 'app-gearset-creation-popup',
  templateUrl: './gearset-creation-popup.component.html',
  styleUrls: ['./gearset-creation-popup.component.less']
})
export class GearsetCreationPopupComponent implements OnInit {

  public form: FormGroup;

  public availableJobs = this.gt.getJobs().filter(job => job.id > 0);

  public gearset: TeamcraftGearset;

  constructor(private modalRef: NzModalRef, private fb: FormBuilder,
              private gt: GarlandToolsService, private lazyData: LazyDataService) {
  }

  public submit(): void {
    this.modalRef.close(this.form.value);
  }

  ngOnInit(): void {
    if (this.gearset) {
      const jobCategoryId = [32, 33, 156, 157, 158, 159].find(categoryId => {
        return this.lazyData.data.jobCategories[categoryId.toString()].jobs.includes(this.lazyData.data.jobAbbr[this.gearset.job.toString()].en);
      });
      const category = this.lazyData.data.jobCategories[jobCategoryId.toString()];
      this.availableJobs = this.availableJobs.filter(job => category.jobs.includes(job.abbreviation));
    }
    this.form = this.fb.group({
      name: [this.gearset?.name, Validators.required],
      job: [this.gearset?.job, Validators.required]
    });
  }

}
