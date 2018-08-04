import {RelationshipService} from '../database/relational/relationship.service';
import {NotificationRelationship} from './notification-relationship';
import {Injectable, NgZone} from '@angular/core';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {AngularFirestore} from 'angularfire2/firestore';
import {PendingChangesService} from '../database/pending-changes/pending-changes.service';
import {UserService} from '../database/user.service';
import {IpcService} from '../electron/ipc.service';
import {TranslateService} from '@ngx-translate/core';
import {LocalizedDataService} from '../data/localized-data.service';
import {map, mergeMap, shareReplay} from 'rxjs/operators';
import {I18nToolsService} from '../tools/i18n-tools.service';
import {combineLatest, Observable} from 'rxjs';
import {AbstractNotification} from './abstract-notification';
import {SettingsService} from '../../pages/settings/settings.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService extends RelationshipService<NotificationRelationship> {

    public readonly notifications$: Observable<NotificationRelationship[]>;

    constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                protected pendingChangesService: PendingChangesService, private userService: UserService, private ipc: IpcService,
                private translateService: TranslateService, private localizedDataService: LocalizedDataService,
                private i18nTools: I18nToolsService, private settings: SettingsService) {
        super(firestore, serializer, zone, pendingChangesService);
        this.notifications$ = this.userService.getUserData()
            .pipe(
                mergeMap(user => this.getByFrom(user.$key)),
                map(relationships => {
                    return relationships.sort((a, b) => {
                        return a.to.date > b.to.date ? -1 : 1;
                    })
                }),
                shareReplay(),
            );
    }

    public init(): void {
        // Initialize notifications listener.
        this.notifications$.subscribe((relationships) => this.handleNotifications(relationships));
    }

    handleNotifications(relationships: NotificationRelationship[]): void {
        const toAlert = relationships.filter(r => !r.to.alerted);
        if (!this.settings.notificationsMuted) {
            // If there's only one, handle it alone.
            if (toAlert.length === 1) {
                this.ipc.send('notification:user', {
                    title: 'FFXIV Teamcraft',
                    content: toAlert[0].to.getContent(this.translateService, this.localizedDataService, this.i18nTools),
                });
            } else {
                this.ipc.send('notification:user', {
                    title: 'FFXIV Teamcraft',
                    content: this.translateService.instant('NOTIFICATIONS.You_have_x_notifications', {amount: toAlert.length})
                });
            }
        }
        // Save notifications changes.
        combineLatest(
            ...toAlert.map(relationship => {
                relationship.to.alerted = true;
                return this.set(relationship.$key, relationship);
            })
        ).subscribe();

        // Clean notifications.
        combineLatest(
            ...relationships
                .filter(relationship => {
                    // Get only notifications that are more than a week (8 days) old
                    return (Date.now() - relationship.to.date) > 691200000
                })
                .map(relationship => {
                    // delete these notifications
                    return this.remove(relationship.$key);
                })
        ).subscribe();
    }

    public prepareNotification(target: string, notification: AbstractNotification): NotificationRelationship {
        const relationship = new NotificationRelationship();
        relationship.from = target;
        relationship.to = notification;
        return relationship;
    }

    protected getRelationCollection(): string {
        return 'notifications';
    }

    protected getClass(): any {
        return NotificationRelationship;
    }

}
