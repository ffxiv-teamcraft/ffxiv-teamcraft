import {Component} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor(auth: AngularFireAuth, translate: TranslateService) {
        auth.auth.signInAnonymously();
        translate.setDefaultLang('en');
        translate.use(translate.getBrowserLang());
    }
}
