import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Commission} from '../../../model/commission/commission';
import {Observable} from 'rxjs/Observable';
import {CommissionService} from '../../../core/database/commission/commission.service';
import {mergeMap, shareReplay} from 'rxjs/operators';
import {UserService} from '../../../core/database/user.service';
import {CommissionStatus} from '../../../model/commission/commission-status';
import {AppUser} from '../../../model/list/app-user';

@Component({
    selector: 'app-commission-details',
    templateUrl: './commission-details.component.html',
    styleUrls: ['./commission-details.component.scss']
})
export class CommissionDetailsComponent implements OnInit {

    public commission$: Observable<Commission>;

    public author$: Observable<any>;

    public user$: Observable<AppUser>;

    constructor(private activeRoute: ActivatedRoute, private commissionService: CommissionService, private userService: UserService) {
    }

    public getStatus(commission: Commission): string {
        return CommissionStatus[commission.status];
    }

    ngOnInit(): void {
        this.commission$ = this.activeRoute.paramMap
            .pipe(
                mergeMap(params => this.commissionService.get(params.get('id'), params.get('serverName'))),
                shareReplay()
            );
        this.author$ = this.commission$
            .pipe(
                mergeMap(commission => {
                    return this.userService.getCharacter(commission.authorId);
                }),
                shareReplay(),
            );
        this.user$ = this.userService.getUserData();
    }

}
