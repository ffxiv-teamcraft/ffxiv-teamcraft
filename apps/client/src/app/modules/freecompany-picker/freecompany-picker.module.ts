import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatabaseModule } from '../../core/database/database.module';
import { FreecompanyPickerService } from './freecompany-picker.service';
import { FreecompanyPickerComponent } from './user-picker/freecompany-picker.component';


@NgModule({
    imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    DatabaseModule,
    FreecompanyPickerComponent
],
    exports: [FreecompanyPickerComponent],
    providers: [FreecompanyPickerService]
})
export class FreecompanyPickerModule {
}
