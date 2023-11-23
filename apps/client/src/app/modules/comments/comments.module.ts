import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsPopupComponent } from './comments-popup/comments-popup.component';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UserAvatarModule } from '../user-avatar/user-avatar.module';
import { CommentsService } from './comments.service';
import { FormsModule } from '@angular/forms';


@NgModule({
    imports: [
    CommonModule,
    TranslateModule,
    FlexLayoutModule,
    UserAvatarModule,
    FormsModule,
    CommentsPopupComponent
],
    exports: [CommentsPopupComponent]
})
export class CommentsModule {
}
