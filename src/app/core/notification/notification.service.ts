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
import {map, mergeMap} from 'rxjs/operators';
import {I18nToolsService} from '../tools/i18n-tools.service';
import {combineLatest} from 'rxjs';

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
                map(relationships => relationships.filter(r => !r.to.alerted))
            )
            .subscribe((relationships) => this.handleNotifications(relationships));
    }

    handleNotifications(relationships: NotificationRelationship[]): void {
        // If there's only one, handle it alone.
        if (relationships.length === 1) {
            this.ipc.send('notification:user', {
                title: 'FFXIV Teamcraft',
                content: relationships[0].to.getContent(this.translateService, this.localizedDataService, this.i18nTools),
            });
        } else {
            this.ipc.send('notification:user', {
                title: 'FFXIV Teamcraft',
                content: this.translateService.instant('NOTIFICATIONS.You_have_x_notifications', {amount: relationships.length})
            });
        }
        // Save notifications changes.
        combineLatest(
            ...relationships.map(relationship => {
                relationship.to.alerted = true;
                return this.set(relationship.$key, relationship);
            })
        ).subscribe();
    }

    protected getRelationCollection(): string {
        return 'notifications';
    }

    protected getClass(): any {
        return NotificationRelationship;
    }

}
