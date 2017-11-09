import {NgModule} from '@angular/core';
import {ListService} from './list.service';
import {UserService} from './user.service';
import {AngularFirestoreModule} from 'angularfire2/firestore';


@NgModule({
    imports: [
        AngularFirestoreModule,
    ],
    providers: [
        ListService,
        UserService
    ]
})
export class FirebaseDataModule {
}
