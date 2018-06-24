import {Component, Inject} from '@angular/core';
import {GearSet} from '../../simulator/model/gear-set';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserService} from '../../../core/database/user.service';
import {first} from 'rxjs/operators';
import {AppUser} from '../../../model/list/app-user';

@Component({
    selector: 'app-stats-edit-popup',
    templateUrl: './stats-edit-popup.component.html',
    styleUrls: ['./stats-edit-popup.component.scss']
})
export class StatsEditPopupComponent {

    public userData: AppUser;

    public set: GearSet;

    constructor(private userService: UserService, @Inject(MAT_DIALOG_DATA) public data: { set: GearSet, jobs: any[] },
                private ref: MatDialogRef<StatsEditPopupComponent>) {
        this.userService.getUserData().pipe(first()).subscribe(data => this.userData = data);
        this.set = this.data.set;
    }

    saveSet(set: GearSet): void {
        // First of all, remove old gearset in userData for this job.
        this.userData.gearSets = (this.userData.gearSets || []).filter(s => s.jobId !== set.jobId);
        // Then add this set to custom sets
        set.custom = true;
        this.userData.gearSets.push(set);
        this.userService.set(this.userData.$key, this.userData).subscribe(() => {
            this.ref.close();
        });
    }

    saveAllSets(set: GearSet): void {
        // Clear out all of the existing custom sets
        this.userData.gearSets = [];

        // Then create a custom set for each job using the provided set data
        this.data.jobs.forEach((job, i) => {
            this.userData.gearSets.push({ ...set, jobId: i + 8, abbr: job.abbr, name: job.name });
        });

        this.userService.set(this.userData.$key, this.userData).subscribe(() => {
            this.ref.close();
        });
    }

    resetSet(set: GearSet): void {
        this.userData.gearSets = this.userData.gearSets.filter(s => s.jobId !== set.jobId);
        this.userService.set(this.userData.$key, this.userData).subscribe(() => {
            this.ref.close();
        });
    }

}
