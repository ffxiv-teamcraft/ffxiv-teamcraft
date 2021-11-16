import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogComponent } from './blog/blog.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { CoreModule } from '../../core/core.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';
import { PipesModule } from '../../pipes/pipes.module';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { ProgressPopupModule } from '../../modules/progress-popup/progress-popup.module';
import { AntdSharedModule } from '../../core/antd-shared.module';

const routes: Routes = [
  {
    path: '',
    component: BlogComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  },
  {
    path: ':slug',
    component: BlogComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [BlogComponent, BlogPostComponent],
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    AntdSharedModule,
    CoreModule,
    FullpageMessageModule,
    PageLoaderModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    ProgressPopupModule,

    RouterModule.forChild(routes),
    MarkdownModule,
    UserAvatarModule,
    PipesModule
  ]
})
export class BlogModule {
}
