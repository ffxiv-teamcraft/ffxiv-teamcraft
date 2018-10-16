import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatProgressSpinnerModule,
  MatTooltipModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { ClipboardModule } from 'ngx-clipboard';
import { RouterModule } from '@angular/router';
import { SettingsModule } from '../../pages/settings/settings.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { ForgotPasswordPopupComponent } from './forgot-password-popup/forgot-password-popup.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommentsModule } from '../comments/comments.module';
import { UserSelectionPopupComponent } from './user-selection-popup/user-selection-popup.component';
import { FcCrestComponent } from './fc-crest/fc-crest.component';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    FlexLayoutModule,

    MatInputModule,
    MatTooltipModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatCheckboxModule,

    ClipboardModule,

    CoreModule,
    PipesModule,
    SettingsModule,
    TooltipModule,
    CommentsModule
  ],
  declarations: [
    ForgotPasswordPopupComponent,
    UserSelectionPopupComponent,
    FcCrestComponent,
  ],
  entryComponents: [
    ForgotPasswordPopupComponent,
    UserSelectionPopupComponent,
  ]
})
export class CommonComponentsModule {
}
