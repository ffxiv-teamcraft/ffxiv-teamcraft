import {NgModule} from '@angular/core';
import {ListService} from './list.service';
import {UserService} from './user.service';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {LIST_STORE} from './storage/list/list-store';
import {FirestoreListStorage} from './storage/list/firestore-list-storage';


@NgModule({
    imports: [
        AngularFirestoreModule,
    ],
    providers: [
        ListService,
        UserService,
        {provide: LIST_STORE, useClass: FirestoreListStorage}
    ]
})
export class DatabaseModule {
}
