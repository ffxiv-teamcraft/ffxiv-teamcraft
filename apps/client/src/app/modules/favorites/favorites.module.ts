import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';


@NgModule({
    imports: [
    CommonModule,
    CoreModule,
    TranslateModule,
    FavoriteButtonComponent
],
    exports: [FavoriteButtonComponent]
})
export class FavoritesModule {
}
