import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsPopupComponent } from './comments-popup/comments-popup.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UserAvatarModule } from '../user-avatar/user-avatar.module';
import { CommentsService } from './comments.service';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    NgZorroAntdModule,
    TranslateModule,
    FlexLayoutModule,
    UserAvatarModule,
    FormsModule
  ],
  providers: [CommentsService],
  declarations: [CommentsPopupComponent],
  exports: [CommentsPopupComponent],
  entryComponents: [CommentsPopupComponent]
})
export class CommentsModule {
}
