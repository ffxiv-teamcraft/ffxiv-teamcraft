import {Component} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    list_count = this.firebase.object('/list_count');

    lists_created = this.firebase.object('/lists_created');

    constructor(private firebase: AngularFireDatabase) {
    }

}
