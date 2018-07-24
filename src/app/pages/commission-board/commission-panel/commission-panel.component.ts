import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Commission} from '../../../model/commission/commission';
import {Observable} from 'rxjs/Observable';
import {UserService} from '../../../core/database/user.service';
import {AppUser} from '../../../model/list/app-user';
import {CommissionService} from '../../../core/database/commission/commission.service';
import {MatDialog} from '@angular/material';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {filter, first, map, mergeMap} from 'rxjs/operators';
import {ListService} from '../../../core/database/list.service';
import {CommissionStatus} from '../../../model/commission/commission-status';

@Component({
    selector: 'app-commission-panel',
    templateUrl: './commission-panel.component.html',
    styleUrls: ['./commission-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommissionPanelComponent implements OnInit {

    @Input()
    commission: Commission;

    user$: Observable<AppUser>;

    public author$: Observable<any>;

    private characters: { [index: string]: Observable<any> } = {};

    /**
     * We keep a backup of the user here;
     */
    user: AppUser;

    public chatBadge: boolean;

    public canApply$: Observable<boolean>;

    constructor(private userService: UserService, private commissionService: CommissionService, private dialog: MatDialog,
                private listService: ListService) {
    }

    public apply(commission: Commission, userId: string): void {
        commission.candidateIds.push(userId);
        commission.addNewThing(`application:${commission.authorId}`);
        this.commissionService.set(commission.$key, commission).subscribe();
    }

    public delete(): void {
        this.dialog.open(ConfirmationPopupComponent)
            .afterClosed()
            .pipe(
                filter(res => res),
                mergeMap(() => {
                    return this.listService.get(this.commission.listId)
                        .pipe(
                            first(),
                            map(list => {
                                // Give the list back to the original author.
                                list.authorId = this.commission.authorId;
                                return list;
                            }),
                            mergeMap(list => {
                                return this.listService.set(list.$key, list);
                            })
                        );
                }),
                mergeMap(() => {
                    return this.commissionService.remove(this.commission.$key, this.commission.server);
                })
            ).subscribe();
    }

    public getCharacter(uid: string): Observable<any> {
        if (this.characters[uid] === undefined) {
            this.characters[uid] = this.userService.getCharacter(uid);
        }
        return this.characters[uid];
    }

    public hasChatBadge(commission: Commission, user: AppUser): boolean {
        if (user !== null) {
            if (this.chatBadge === undefined) {
                this.chatBadge = commission.hasNewThing(`message:${user.$key}`);
            }
        }
        return this.chatBadge;
    }

    public getStatus(commission: Commission): string {
        return CommissionStatus[commission.status];
    }

    ngOnInit(): void {
        this.author$ = this.userService.getCharacter(this.commission.authorId);
        this.user$ = this.userService.getUserData();

        this.canApply$ = this.user$.pipe(
            mergeMap(user => this.listService.getUserLists(user.$key)
                .pipe(
                    map(lists => {
                        // If the user has already made at least 10 commissions with a rating at 3 or more,
                        // he can apply 5 commissions at the same time,
                        // else it's limited to 3.
                        if (user.ratings.length > 10 && user.rating > 3) {
                            return lists.filter(list => list.isCommissionList).length <= 5;
                        } else {
                            return lists.filter(list => list.isCommissionList).length <= 3;
                        }
                    })
                )
            )
        );
    }

}
