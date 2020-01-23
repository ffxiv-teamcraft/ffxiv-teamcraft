import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';

@Component({
  selector: 'app-gearset-creation-popup',
  templateUrl: './gearset-creation-popup.component.html',
  styleUrls: ['./gearset-creation-popup.component.less']
})
export class GearsetCreationPopupComponent implements OnInit {

  public control: FormGroup;

  public availableJobs = this.gt.getJobs().filter(job => job.id > 0);

  constructor(private modalRef: NzModalRef, private fb: FormBuilder,
              private gt: GarlandToolsService) {
  }

  public submit(): void {
    this.modalRef.close(this.control.value);
  }

  ngOnInit(): void {
    this.control = this.fb.group({
      name: ['', Validators.required],
      job: [null, Validators.required]
    });
  }

}
