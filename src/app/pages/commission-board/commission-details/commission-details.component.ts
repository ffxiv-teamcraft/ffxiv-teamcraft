import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Commission} from '../../../model/commission/commission';
import {Observable} from 'rxjs/Observable';
import {CommissionService} from '../../../core/database/commission/commission.service';
import {catchError, filter, first, map, mergeMap, shareReplay} from 'rxjs/operators';
import {UserService} from '../../../core/database/user.service';
import {CommissionStatus} from '../../../model/commission/commission-status';
import {AppUser} from '../../../model/list/app-user';
import {combineLatest, of} from 'rxjs';
import {MatDialog} from '@angular/material';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {ListService} from '../../../core/database/list.service';
import {RatingPopupComponent} from '../rating-popup/rating-popup.component';

@Component({
    selector: 'app-commission-details',
    templateUrl: './commission-details.component.html',
    styleUrls: ['./commission-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CommissionDetailsComponent implements OnInit {

    public commission$: Observable<Commission>;

    public author$: Observable<any>;

    public user$: Observable<AppUser>;

    private characters: { [index: string]: Observable<any> } = {};

    editPrice = false;

    payment: number;

    constructor(private activeRoute: ActivatedRoute, private commissionService: CommissionService, private userService: UserService,
                private dialog: MatDialog, private listService: ListService) {
    }

    public save(commission: Commission): void {
        this.commissionService.set(commission.$key, commission).subscribe();
    }

    public apply(commission: Commission, userId: string): void {
        commission.candidateIds.push(userId);
        commission.addNewThing(`application:${commission.authorId}`);
        this.commissionService.set(commission.$key, commission).subscribe();
    }

    public getStatus(commission: Commission): string {
        return CommissionStatus[commission.status];
    }

    public getCharacter(uid: string): Observable<any> {
        if (this.characters[uid] === undefined) {
            this.characters[uid] = this.userService.getCharacter(uid);
        }
        return this.characters[uid];
    }

    public addPayment(commission: Commission): void {
        commission.payments.push({date: new Date().toISOString(), amount: this.payment});
        delete this.payment;
        this.save(commission);
    }

    public deletePayment(commission: Commission, payment: { date: string, amount: number }): void {
        commission.payments = commission.payments.filter(p => p.date !== payment.date && p.amount !== payment.amount);
        this.save(commission);
    }

    /**
     * Transforms the rating of a user into an array of length between 1 and 5
     * @param {AppUser} user
     * @returns {any[]}
     */
    getRating(user: AppUser): 1 | .5 | 0 [] {
        let rating = user.rating;
        const result = [];
        while (rating >= 1) {
            rating--;
            result.push(1);
        }
        if (rating >= .5) {
            result.push(.5);
        }
        while (result.length < 5) {
            result.push(0);
        }
        return result;
    }

    hire(commission: Commission, userId: string): void {
        this.dialog.open(ConfirmationPopupComponent, {data: 'COMMISSION_BOARD.Confirm_hire'})
            .afterClosed()
            .pipe(
                filter(res => res),
                map(() => {
                    commission.status = CommissionStatus.ACCEPTED;
                    commission.crafterId = userId;
                    commission.addNewThing(`application:${userId}`);
                    return commission;
                }),
                mergeMap(com => {
                    return this.commissionService.set(com.$key, com)
                        .pipe(
                            map(() => {
                                return com;
                            })
                        )
                }),
                mergeMap(com => {
                    return this.listService.get(com.listId)
                        .pipe(
                            first(),
                            map(list => {
                                list.authorId = com.crafterId;
                                list.commissionId = com.$key;
                                list.commissionServer = com.server;
                                return list;
                            }),
                            mergeMap(list => {
                                return this.listService.set(list.$key, list);
                            })
                        )
                })
            ).subscribe()
    }

    fireCrafter(commission: Commission, crafter: AppUser): void {
        this.dialog.open(ConfirmationPopupComponent, {data: 'COMMISSION_BOARD.Confirm_fire'})
            .afterClosed()
            .pipe(
                filter(res => res),
                mergeMap(() => {
                    return this.dialog.open(RatingPopupComponent, {data: crafter}).afterClosed();
                }),
                filter(closed => closed !== 'cancel')
            ).pipe(
            map(() => {
                commission.status = CommissionStatus.CREATED;
                delete commission.crafterId;
                return commission;
            }),
            mergeMap(com => {
                return this.commissionService.set(com.$key, com)
                    .pipe(
                        map(() => {
                            return com;
                        })
                    )
            }),
            mergeMap(com => {
                return this.listService.get(com.listId)
                    .pipe(
                        first(),
                        map(list => {
                            delete list.authorId;
                            delete list.commissionId;
                            return list;
                        }),
                        mergeMap(list => {
                            return this.listService.set(list.$key, list);
                        })
                    )
            })
        ).subscribe()
    }

    withdrawCrafter(commission: Commission, author: AppUser): void {
        this.dialog.open(ConfirmationPopupComponent, {data: 'COMMISSION_BOARD.Confirm_withdraw'})
            .afterClosed()
            .pipe(
                filter(res => res),
                mergeMap(() => {
                    return this.dialog.open(RatingPopupComponent, {data: author}).afterClosed();
                }),
                filter(closed => closed !== 'cancel')
            ).pipe(
            map(() => {
                commission.status = CommissionStatus.CREATED;
                commission.candidateIds = commission.candidateIds.filter(id => id !== commission.crafterId);
                delete commission.crafterId;
                commission.addNewThing(`application:${author.$key}`);
                return commission;
            }),
            mergeMap(com => {
                return this.commissionService.set(com.$key, com)
                    .pipe(
                        map(() => {
                            return com;
                        })
                    )
            }),
            mergeMap(com => {
                return this.listService.get(com.listId)
                    .pipe(
                        first(),
                        map(list => {
                            delete list.authorId;
                            delete list.commissionId;
                            return list;
                        }),
                        mergeMap(list => {
                            return this.listService.set(list.$key, list);
                        })
                    )
            })
        ).subscribe()
    }

    removeApplicationNewThing(): void {
        combineLatest(this.user$, this.commission$)
            .pipe(
                first(),
                map((data) => {
                    const commission = data[1];
                    commission.removeNewThing(`application:${data[0].$key}`);
                    return commission;
                }),
                mergeMap(commission => {
                    return this.commissionService.set(commission.$key, commission);
                })
            ).subscribe();
    }

    public hasChatBadge(commission: Commission, user: AppUser): boolean {
        if (user !== null) {
            return commission.hasNewThing(`message:${user.$key}`);
        }
        return false;
    }

    public markAsFinished(commission: Commission): void {
        this.dialog.open(ConfirmationPopupComponent, {data: 'CONFIRMATION_BOARD.Confirm_archive'})
            .afterClosed()
            .pipe(
                filter(res => res),
                mergeMap(() => {
                    return this.listService.get(commission.listId)
                        .pipe(
                            first(),
                            map(list => {
                                delete list.authorId;
                                return list;
                            }),
                            mergeMap(list => {
                                return this.listService.set(list.$key, list);
                            })
                        )
                }),
                mergeMap(() => {
                    commission.status = CommissionStatus.DONE;
                    commission.addNewThing(`rate:${commission.authorId}`);
                    commission.addNewThing(`rate:${commission.crafterId}`);
                    return this.commissionService.set(commission.$key, commission);
                })
            )
            .subscribe(() => {
            });
    }

    ngOnInit(): void {
        this.commission$ = this.activeRoute.params
            .pipe(
                mergeMap(params => this.commissionService.get(params['id'], params['serverName'])),
                catchError(() => of(null)),
                filter(res => res !== null),
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
        this.commission$.pipe(
            filter(com => com.hasNewThings),
            mergeMap(commission => {
                commission.removeNewThing(`application:${commission.authorId}`);
                return this.commissionService.set(commission.$key, commission);
            })
        );
        this.removeApplicationNewThing();
        combineLatest(this.commission$, this.user$)
            .pipe(
                filter(data => {
                    return data[0].status === CommissionStatus.DONE && data[0].ratedBy[data[1].$key] === undefined
                        && (data[0].authorId === data[1].$key || data[0].crafterId === data[1].$key);
                }),
                first(),
                mergeMap(data => {
                    return this.getCharacter(data[0].crafterId)
                        .pipe(
                            first(),
                            mergeMap(character => {
                                return this.dialog.open(RatingPopupComponent, {data: character.user})
                                    .afterClosed()
                                    .pipe(
                                        filter(res => res !== 'cancel'),
                                        mergeMap(() => {
                                            const commission = data[0];
                                            commission.removeNewThing(`rate:${data[1].$key}`);
                                            commission.ratedBy[data[1].$key] = true;
                                            return this.commissionService.set(commission.$key, commission);
                                        })
                                    );
                            })
                        );
                })
            )
            .subscribe(() => {
            })
    }

}
