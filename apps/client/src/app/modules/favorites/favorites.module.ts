import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    TranslateModule,
    AntdSharedModule
  ],
  declarations: [FavoriteButtonComponent],
  exports: [FavoriteButtonComponent]
})
export class FavoritesModule {
}
