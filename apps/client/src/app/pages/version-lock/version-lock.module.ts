import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { VersionLockGuard } from './version-lock.guard';
import { VersionLockComponent } from './version-lock/version-lock.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [{
  path: 'version-lock',
  component: VersionLockComponent
}];

@NgModule({
  imports: [
    CommonModule,
    FullpageMessageModule,
    TranslateModule,

    RouterModule.forChild(routes)
  ],
  declarations: [
    VersionLockComponent
  ],
  providers: [
    VersionLockGuard
  ]
})
export class VersionLockModule {
}
