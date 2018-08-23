import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsPopupComponent } from './comments-popup/comments-popup.component';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { MatButtonModule, MatDialogModule, MatIconModule, MatInputModule, MatListModule, MatTooltipModule } from '@angular/material';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CommentsButtonComponent } from './comments-button/comments-button.component';
import { CommentRowComponent } from './comment-row/comment-row.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsModule } from '../../pages/settings/settings.module';

@NgModule({
  imports: [
    CommonModule,
    AngularFireDatabaseModule,

    CoreModule,
    PipesModule,
    SettingsModule,

    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatTooltipModule,
    MatListModule,
    MatDialogModule,

    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [
    CommentsPopupComponent,
    CommentsButtonComponent,
    CommentRowComponent
  ],
  exports: [
    CommentsPopupComponent,
    CommentsButtonComponent
  ],
  entryComponents: [
    CommentsPopupComponent
  ]
})
export class CommentsModule {
}
