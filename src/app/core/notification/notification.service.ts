import {RelationshipService} from '../database/relational/relationship.service';
import {NotificationRelationship} from './notification-relationship';
import {Injectable, NgZone} from '@angular/core';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {AngularFirestore} from 'angularfire2/firestore';
import {PendingChangesService} from '../database/pending-changes/pending-changes.service';
import {UserService} from '../database/user.service';
import {AbstractNotification} from './abstract-notification';
import {IpcService} from '../electron/ipc.service';
import {TranslateService} from '@ngx-translate/core';
import {LocalizedDataService} from '../data/localized-data.service';
import {map, mergeMap} from 'rxjs/operators';
import {I18nToolsService} from '../tools/i18n-tools.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService extends RelationshipService<NotificationRelationship> {

    constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                protected pendingChangesService: PendingChangesService, private userService: UserService, private ipc: IpcService,
                private translateService: TranslateService, private localizedDataService: LocalizedDataService,
                private i18nTools: I18nToolsService) {
        super(firestore, serializer, zone, pendingChangesService);
    }

    public init(): void {
        // Initialize notifications listener.
        this.userService.getUserData()
            .pipe(
                mergeMap(user => this.getByFrom(user.$key)),
                map(relationships => relationships.map(r => r.to))
            )
            .subscribe((notifications) => this.handleNotifications(notifications));
    }

    handleNotifications(notifications: AbstractNotification[]): void {
        // If there's only one, handle it alone.
        if (notifications.length === 1) {
            this.ipc.send('notification:user', {
                title: 'FFXIV Teamcraft',
                content: notifications[0].getContent(this.translateService, this.localizedDataService, this.i18nTools),
            });
        } else {
            this.ipc.send('notification:user', {
                title: 'FFXIV Teamcraft',
                content: this.translateService.instant('NOTIFICATIONS.You_have_x_notifications', {amount: notifications.length})
            });
        }
    }

    protected getRelationCollection(): string {
        return 'notifications';
    }

    protected getClass(): any {
        return NotificationRelationship;
    }

}
