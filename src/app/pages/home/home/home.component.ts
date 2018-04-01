import {Component} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {ObservableMedia} from '@angular/flex-layout';
import {SeoService} from '../../../core/seo/seo.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    list_count = this.firebase.object('list_count').valueChanges();

    lists_created = this.firebase.object('lists_created').valueChanges();

    constructor(private firebase: AngularFireDatabase, private media: ObservableMedia, private seo: SeoService) {
        this.seo.setConfig({
            title: 'FFXIV Teamcraft - Home',
            description: 'Create lists, share, contribute, craft',
            image: '/assets/branding/logo.png',
            slug: 'home'
        });
    }

    isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }

}
