import {Component} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {ObservableMedia} from '@angular/flex-layout';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    list_count = this.firebase.object('list_count').valueChanges();

    lists_created = this.firebase.object('lists_created').valueChanges();

    commissions_created = this.firebase.object('commissions_created').valueChanges();

    constructor(private firebase: AngularFireDatabase, private media: ObservableMedia) {
    }

    isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }

}
