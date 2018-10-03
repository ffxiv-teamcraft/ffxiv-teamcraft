import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutEditorComponent } from './layout-editor/layout-editor.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { LayoutEditorRowComponent } from './layout-editor-row/layout-editor-row.component';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,

    CoreModule,
    LayoutModule,
    NgxDnDModule,
    PipesModule,

    TranslateModule,
    NgZorroAntdModule
  ],
  declarations: [LayoutEditorComponent, LayoutEditorRowComponent],
  exports: [LayoutEditorComponent],
  entryComponents: [LayoutEditorComponent]
})
export class LayoutEditorModule {
}
