import {NgModule} from '@angular/core';
import {ListService} from './list.service';
import {UserService} from './user.service';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {ListStore} from './storage/list/list-store';
import {DiffService} from './diff/diff.service';
import {FirestoreListStorage} from './storage/list/firestore-list-storage';
import {ListTemplateService} from './list-template/list-template.service';


@NgModule({
    imports: [
        AngularFirestoreModule,
    ],
    providers: [
        ListService,
        UserService,
        {provide: ListStore, useClass: FirestoreListStorage},
        DiffService,
        ListTemplateService,
    ]
})
export class DatabaseModule {
}
