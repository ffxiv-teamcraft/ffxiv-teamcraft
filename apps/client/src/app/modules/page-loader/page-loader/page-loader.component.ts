import { Component, Input } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
    selector: 'app-page-loader',
    templateUrl: './page-loader.component.html',
    styleUrls: ['./page-loader.component.less'],
    standalone: true,
    imports: [NzSpinModule]
})
export class PageLoaderComponent {

  @Input()
  loading = true;

  @Input()
  message: string;

}
