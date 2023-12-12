import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.less'],
    standalone: true,
    imports: [TranslateModule]
})
export class AboutComponent {
}
