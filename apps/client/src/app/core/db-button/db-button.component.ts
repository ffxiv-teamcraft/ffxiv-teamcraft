import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-db-button',
  templateUrl: './db-button.component.html',
  styleUrls: ['./db-button.component.less']
})
export class DbButtonComponent {

  @Input()
  type: string;

  @Input()
  id: number;

  constructor(public translate: TranslateService) {
  }

}
