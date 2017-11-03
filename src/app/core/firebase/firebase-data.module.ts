import {NgModule} from '@angular/core';
import {ListService} from './list.service';
import {UserService} from './user.service';


@NgModule({
    providers: [
        ListService,
        UserService
    ]
})
export class FirebaseDataModule {
}
