import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmountInputComponent } from './amount-input/amount-input.component';
import { RandomGifComponent } from './random-gif/random-gif.component';
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
import { EorzeanTimeComponent } from './eorzean-time/eorzean-time.component';
import { ListPanelComponent } from './list-panel/list-panel.component';
import { ClipboardModule } from 'ngx-clipboard';
import { RouterModule } from '@angular/router';
import { SettingsModule } from '../../pages/settings/settings.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { ConfirmationPopupComponent } from './confirmation-popup/confirmation-popup.component';
import { ForgotPasswordPopupComponent } from './forgot-password-popup/forgot-password-popup.component';
import { NameEditPopupComponent } from './name-edit-popup/name-edit-popup.component';
import { ListNamePopupComponent } from './list-name-popup/list-name-popup.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommentsModule } from '../comments/comments.module';
import { FfxivcraftingAmountInputComponent } from './ffxivcrafting-amount-input/ffxivcrafting-amount-input.component';
import { PermissionsPopupComponent } from './permissions-popup/permissions-popup.component';
import { PermissionsRowComponent } from './permissions-popup/permissions-row/permissions-row.component';
import { UserSelectionPopupComponent } from './user-selection-popup/user-selection-popup.component';
import { FcCrestComponent } from './fc-crest/fc-crest.component';
import { AlarmGroupNamePopupComponent } from './alarm-group-name-popup/alarm-group-name-popup.component';

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
    AmountInputComponent,
    RandomGifComponent,
    EorzeanTimeComponent,
    ListPanelComponent,
    ConfirmationPopupComponent,
    ForgotPasswordPopupComponent,
    NameEditPopupComponent,
    ListNamePopupComponent,
    FfxivcraftingAmountInputComponent,
    PermissionsPopupComponent,
    PermissionsRowComponent,
    UserSelectionPopupComponent,
    FcCrestComponent,
    AlarmGroupNamePopupComponent,
  ],
  exports: [
    RandomGifComponent,
    ListPanelComponent,
    EorzeanTimeComponent,
    AmountInputComponent,
    FfxivcraftingAmountInputComponent
  ],
  entryComponents: [
    AmountInputComponent,
    RandomGifComponent,
    EorzeanTimeComponent,
    ListPanelComponent,
    ConfirmationPopupComponent,
    ForgotPasswordPopupComponent,
    NameEditPopupComponent,
    ListNamePopupComponent,
    PermissionsPopupComponent,
    UserSelectionPopupComponent,
    AlarmGroupNamePopupComponent,
  ]
})
export class CommonComponentsModule {
}
