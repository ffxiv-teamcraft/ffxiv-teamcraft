import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationSidebarComponent } from './navigation-sidebar/navigation-sidebar.component';
import { PipesModule } from '../../pipes/pipes.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { TranslateModule } from '@ngx-translate/core';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [NavigationSidebarComponent],
  exports: [
    NavigationSidebarComponent
  ],
  imports: [
    CommonModule,
    PipesModule,
    TranslateModule,
    FlexLayoutModule,
    RouterModule,
    FormsModule,

    NzIconModule,
    NzLayoutModule,
    NzBadgeModule,
    NzButtonModule,
    NzMenuModule,
    NzToolTipModule
  ]
})
export class NavigationSidebarModule {
}
