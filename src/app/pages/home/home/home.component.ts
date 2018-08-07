import {Component} from '@angular/core';
import {ObservableMedia} from '@angular/flex-layout';
import * as fromStats from '../../../reducers/stats.reducer';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {LoadStats} from '../../../actions/stats.actions';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    public stats$: Observable<fromStats.State> = this.store.select('stats');

    constructor(private store: Store<fromStats.State>, private media: ObservableMedia) {
        this.store.dispatch(new LoadStats());
    }

    isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }

}
