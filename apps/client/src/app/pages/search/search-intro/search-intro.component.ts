import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'app-search-intro',
  templateUrl: './search-intro.component.html',
  styleUrls: ['./search-intro.component.less']
})
export class SearchIntroComponent {

  counter$ = this.firebase.object<number>('lists_created').valueChanges();

  constructor(private firebase: AngularFireDatabase) {
  }

}
