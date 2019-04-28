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
import { ClipboardModule } from 'ngx-clipboard';
import { TextQuestionPopupModule } from '../text-question-popup/text-question-popup.module';
import { NgSerializerModule } from '@kaiu/ng-serializer';
import { LayoutRowDisplayEditorComponent } from './layout-row-display-editor/layout-row-display-editor.component';
import { LayoutOrderPopupComponent } from './layout-order-popup/layout-order-popup.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    ClipboardModule,
    DragDropModule,

    CoreModule,
    LayoutModule,
    NgxDnDModule,
    PipesModule,
    TextQuestionPopupModule,

    NgSerializerModule,

    TranslateModule,
    NgZorroAntdModule
  ],
  declarations: [LayoutEditorComponent, LayoutEditorRowComponent, LayoutRowDisplayEditorComponent, LayoutOrderPopupComponent],
  exports: [LayoutEditorComponent, LayoutRowDisplayEditorComponent],
  entryComponents: [LayoutEditorComponent, LayoutRowDisplayEditorComponent, LayoutOrderPopupComponent]
})
export class LayoutEditorModule {
}
