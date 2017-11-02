import {Component} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {tap} from 'rxjs/operators';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    list_count = this.firebase.object('list_count').valueChanges();

    lists_created = this.firebase.object('lists_created').valueChanges();

    constructor(private firebase: AngularFireDatabase) {
    }

}
