import {Component, Input, OnInit} from '@angular/core';
import {Commission} from '../../../model/commission/commission';
import {Observable} from 'rxjs/Observable';
import {UserService} from '../../../core/database/user.service';
import {AppUser} from '../../../model/list/app-user';
import {CommissionService} from '../../../core/database/commission/commission.service';

@Component({
    selector: 'app-commission-panel',
    templateUrl: './commission-panel.component.html',
    styleUrls: ['./commission-panel.component.scss']
})
export class CommissionPanelComponent implements OnInit {

    @Input()
    commission: Commission;

    user$: Observable<AppUser>;

    public author$: Observable<any>;

    constructor(private userService: UserService, private commissionService: CommissionService) {
    }

    public apply(commission: Commission, userId: string): void {
        commission.candidateIds.push(userId);
        this.commissionService.set(commission.$key, commission).subscribe();
    }

    ngOnInit(): void {
        this.author$ = this.userService.getCharacter(this.commission.authorId);
        this.user$ = this.userService.getUserData();
    }

}
