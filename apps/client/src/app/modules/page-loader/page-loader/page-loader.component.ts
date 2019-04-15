import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-loader',
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.less']
})
export class PageLoaderComponent {

  @Input()
  loading = true;

  @Input()
  message: string;

}
