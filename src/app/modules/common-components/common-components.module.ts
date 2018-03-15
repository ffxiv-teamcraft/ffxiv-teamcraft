import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AmountInputComponent} from './amount-input/amount-input.component';
import {ItemIconComponent} from './item-icon/item-icon.component';
import {RandomGifComponent} from './random-gif/random-gif.component';
import {
    MatButtonModule, MatChipsModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule, MatProgressSpinnerModule,
    MatTooltipModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {PipesModule} from '../../pipes/pipes.module';
import {CoreModule} from '../../core/core.module';
import {EorzeanTimeComponent} from './eorzean-time/eorzean-time.component';
import {ListPanelComponent} from './list-panel/list-panel.component';
import {RecipeComponent} from './recipe/recipe.component';
import {ClipboardModule} from 'ngx-clipboard';
import {RouterModule} from '@angular/router';
import {SettingsModule} from '../../pages/settings/settings.module';
import {TooltipModule} from '../tooltip/tooltip.module';
import {CharacterAddPopupComponent} from './character-add-popup/character-add-popup.component';
import {ConfirmationPopupComponent} from './confirmation-popup/confirmation-popup.component';
import {ForgotPasswordPopupComponent} from './forgot-password-popup/forgot-password-popup.component';
import {LoginPopupComponent} from './login-popup/login-popup.component';
import {NameEditPopupComponent} from './name-edit-popup/name-edit-popup.component';
import {ListNamePopupComponent} from './list-name-popup/list-name-popup.component';
import {RegisterPopupComponent} from './register-popup/register-popup.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {CommentsModule} from '../comments/comments.module';
import { FfxivcraftingAmountInputComponent } from './ffxivcrafting-amount-input/ffxivcrafting-amount-input.component';

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

        ClipboardModule,

        CoreModule,
        PipesModule,
        SettingsModule,
        TooltipModule,
        CommentsModule,
    ],
    declarations: [
        AmountInputComponent,
        ItemIconComponent,
        RandomGifComponent,
        EorzeanTimeComponent,
        ListPanelComponent,
        RecipeComponent,
        CharacterAddPopupComponent,
        ConfirmationPopupComponent,
        ForgotPasswordPopupComponent,
        LoginPopupComponent,
        NameEditPopupComponent,
        ListNamePopupComponent,
        RegisterPopupComponent,
        FfxivcraftingAmountInputComponent,
    ],
    exports: [
        RandomGifComponent,
        ListPanelComponent,
        RecipeComponent,
        EorzeanTimeComponent,
        AmountInputComponent,
        ItemIconComponent,
        FfxivcraftingAmountInputComponent,
    ],
    entryComponents: [
        AmountInputComponent,
        ItemIconComponent,
        RandomGifComponent,
        EorzeanTimeComponent,
        ListPanelComponent,
        RecipeComponent,
        CharacterAddPopupComponent,
        ConfirmationPopupComponent,
        ForgotPasswordPopupComponent,
        LoginPopupComponent,
        NameEditPopupComponent,
        ListNamePopupComponent,
        RegisterPopupComponent,
    ]
})
export class CommonComponentsModule {
}
