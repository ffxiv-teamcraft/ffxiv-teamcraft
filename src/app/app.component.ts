import { Component } from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor(private auth: AngularFireAuth) {
        auth.auth.signInAnonymously();
    }
}
