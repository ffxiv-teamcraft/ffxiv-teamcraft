import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../database/pending-changes/pending-changes.service';
import { AbstractNotification } from './abstract-notification';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreRelationalStorage } from '../database/storage/firestore/firestore-relational-storage';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends FirestoreRelationalStorage<AbstractNotification> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
    // this.notifications$ = this.userService.getUserData()
    //     .pipe(
    //         mergeMap(user => this.getByFrom(user.$key)),
    //         map(relationships => {
    //             return relationships.sort((a, b) => {
    //                 return a.to.date > b.to.date ? -1 : 1;
    //             })
    //         }),
    //         shareReplay(),
    //     );
  }

  // handleNotifications(relationships: AbstractNotification[]): void {
  //   const toAlert = relationships.filter(r => !r.to.alerted);
  //   if (!this.settings.notificationsMuted) {
  //     // If there's only one, handle it alone.
  //     if (toAlert.length === 1) {
  //       this.ipc.send('notification:user', {
  //         title: 'FFXIV Teamcraft',
  //         content: toAlert[0].to.getContent(this.translateService, this.localizedDataService, this.i18nTools)
  //       });
  //     } else {
  //       this.ipc.send('notification:user', {
  //         title: 'FFXIV Teamcraft',
  //         content: this.translateService.instant('NOTIFICATIONS.You_have_x_notifications', { amount: toAlert.length })
  //       });
  //     }
  //   }
  //   // Save notifications changes.
  //   combineLatest(
  //     ...toAlert.map(relationship => {
  //       relationship.to.alerted = true;
  //       return this.set(relationship.$key, relationship);
  //     })
  //   ).subscribe();
  //
  //   // Clean notifications.
  //   combineLatest(
  //     ...relationships
  //       .filter(relationship => {
  //         // Get only notifications that are more than a week (8 days) old
  //         return (Date.now() - relationship.to.date) > 691200000;
  //       })
  //       .map(relationship => {
  //         // delete these notifications
  //         return this.remove(relationship.$key);
  //       })
  //   ).subscribe();
  // }

  protected getBaseUri(): string {
    return 'notifications';
  }

  protected getClass(): any {
    return AbstractNotification;
  }

}
