import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UsersComponent } from '../users/users.component';
import { RouterLink } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.less'],
    standalone: true,
    imports: [NzTabsModule, RouterLink, UsersComponent, TranslateModule]
})
export class AdminComponent {
}
