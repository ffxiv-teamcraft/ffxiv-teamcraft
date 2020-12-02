import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtractorComponent } from './extractor/extractor.component';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PipesModule } from '../../pipes/pipes.module';
import { HttpClientModule } from '@angular/common/http';
import { DevGuard } from '../../core/guard/dev.guard';
import { NgSerializerModule } from '@kaiu/ng-serializer';
import { AntdSharedModule } from '../../core/antd-shared.module';

const routes: Routes = [
  {
    path: '',
    component: ExtractorComponent,
    canActivate: [DevGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(routes),
    AntdSharedModule,
    FlexLayoutModule,
    PipesModule,
    HttpClientModule,
    NgSerializerModule
  ],
  declarations: [ExtractorComponent]
})
export class ExtractorModule {
}
