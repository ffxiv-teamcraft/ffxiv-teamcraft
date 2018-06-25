import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../core/database/user.service';
import {CommissionService} from '../../../core/database/commission/commission.service';
import {ActivatedRoute} from '@angular/router';
import {map, mergeMap, shareReplay} from 'rxjs/operators';
import {combineLatest} from 'rxjs';
import {AppUser} from '../../../model/list/app-user';
import {Observable} from 'rxjs/Observable';
import {Commission} from '../../../model/commission/commission';
import {CommissionDiscussion} from '../../../model/commission/commission-discussion';

@Component({
    selector: 'app-commission-chat',
    templateUrl: './commission-chat.component.html',
    styleUrls: ['./commission-chat.component.scss']
})
export class CommissionChatComponent implements OnInit {

    public commission$: Observable<Commission>;

    public character$: Observable<AppUser>;

    public message: string;

    public discussion$: Observable<CommissionDiscussion>;

    constructor(private activeRoute: ActivatedRoute, private commissionService: CommissionService, public userService: UserService) {
    }

    sendMessage(commission: Commission, discussion: CommissionDiscussion, authorId: string): void {
        discussion.messages.push({
            authorId: authorId,
            content: this.message,
            date: new Date().toISOString()
        });
        this.commissionService.set(commission.$key, commission).subscribe(() => {
            delete this.message;
        })
    }

    ngOnInit() {
        this.commission$ = this.activeRoute.params
            .pipe(
                mergeMap(params => this.commissionService.get(params.id, params.server)),
                shareReplay()
            );
        this.character$ = this.userService.getCharacter();
        this.discussion$ = combineLatest(this.commission$, this.activeRoute.params)
            .pipe(
                map(res => {
                    const commission = res[0];
                    const crafterId = res[1].crafterId;
                    const discussion = commission.discussions.find(d => d.crafterId === crafterId);
                    return discussion || new CommissionDiscussion(crafterId);
                }),
                shareReplay()
            )
    }

}
