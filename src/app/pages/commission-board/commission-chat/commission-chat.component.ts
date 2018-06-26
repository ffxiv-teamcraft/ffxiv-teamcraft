import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {UserService} from '../../../core/database/user.service';
import {CommissionService} from '../../../core/database/commission/commission.service';
import {ActivatedRoute} from '@angular/router';
import {map, mergeMap, shareReplay, takeUntil, tap} from 'rxjs/operators';
import {AppUser} from '../../../model/list/app-user';
import {Observable} from 'rxjs/Observable';
import {Commission} from '../../../model/commission/commission';
import {CommissionDiscussion} from '../../../model/commission/commission-discussion';
import {combineLatest, Subject} from 'rxjs/index';

@Component({
    selector: 'app-commission-chat',
    templateUrl: './commission-chat.component.html',
    styleUrls: ['./commission-chat.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionChatComponent implements OnDestroy {

    public commission$: Observable<Commission>;

    public character$: Observable<AppUser>;

    public message = '';

    public discussion$: Observable<CommissionDiscussion>;

    private crafterId: string;

    public chatMembers: { [index: string]: Observable<any> } = {};

    private onDestroy$ = new Subject<void>();

    constructor(private activeRoute: ActivatedRoute, private commissionService: CommissionService, public userService: UserService) {
        this.commission$ = this.activeRoute.paramMap
            .pipe(
                tap(params => this.crafterId = params.get('crafterId')),
                mergeMap(params => this.commissionService.get(params.get('id'), params.get('serverName'))),
                shareReplay()
            );
        this.character$ = this.userService.getCharacter();
        this.discussion$ = combineLatest(this.commission$, this.activeRoute.paramMap)
            .pipe(
                map(res => {
                    const commission = res[0];
                    const crafterId = res[1].get('crafterId');
                    const discussion = commission.discussions.find(d => d.crafterId === crafterId);
                    return discussion || new CommissionDiscussion(crafterId);
                }),
                shareReplay()
            );
        combineLatest(this.character$, this.commission$)
            .pipe(
                takeUntil(this.onDestroy$)
            ).subscribe(res => {
            this.clearNewThings(res[0], res[1]);
        });
    }

    getCharacter(userId: string): Observable<any> {
        if (this.chatMembers[userId] === undefined) {
            this.chatMembers[userId] = this.userService.getCharacter(userId).pipe(shareReplay());
        }
        return this.chatMembers[userId];
    }

    sendMessage(commission: Commission, authorId: string): void {
        let index = commission.discussions.findIndex(d => d.crafterId === this.crafterId);
        if (index === -1) {
            commission.discussions.push(new CommissionDiscussion(this.crafterId));
            index = commission.discussions.length - 1;
        }
        commission.discussions[index].messages.push({
            authorId: authorId,
            content: this.message,
            date: new Date().toISOString()
        });
        this.message = '';
        const notificationTargetId = authorId === commission.authorId ? commission.discussions[index].crafterId : commission.authorId;
        commission.addNewThing(`message:${notificationTargetId}:from:${authorId.substr(0, 5)}`);
        this.commissionService.set(commission.$key, commission).subscribe();
    }

    onTextAreaEnter(event: KeyboardEvent, commission: Commission, authorId: string): void {
        this.sendMessage(commission, authorId);
    }

    clearNewThings(character: any, commission: Commission): void {
        if (commission.hasNewThing(`message:${character.userId}`)) {
            commission.removeNewThing(`message:${character.userId}`);
            this.commissionService.set(commission.$key, commission).subscribe();
        }
    }

    getTextAreaHeight(): string {
        const match = this.message.match(/\n/gi);
        if (match === null) {
            return 'auto';
        }
        return `${match.length * 20 + 20}px`;
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(null);
    }
}
