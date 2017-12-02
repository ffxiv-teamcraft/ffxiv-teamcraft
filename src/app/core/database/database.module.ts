import {NgModule} from '@angular/core';
import {ListService} from './list.service';
import {UserService} from './user.service';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {ListStore} from './storage/list/list-store';
import {FirebaseListStorage} from './storage/list/firebase-list-storage';
import {DiffService} from './diff/diff.service';


@NgModule({
    imports: [
        AngularFirestoreModule,
    ],
    providers: [
        ListService,
        UserService,
        {provide: ListStore, useClass: FirebaseListStorage},
        DiffService,
    ]
})
export class DatabaseModule {
}
