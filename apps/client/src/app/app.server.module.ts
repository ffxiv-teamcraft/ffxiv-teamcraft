import { NgModule, PLATFORM_ID } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { FlexLayoutServerModule } from '@angular/flex-layout/server';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslationsLoaderFactory } from './translations-loader';
import { PlatformService } from './core/tools/platform.service';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    FlexLayoutServerModule,
    NoopAnimationsModule,
    ModuleMapLoaderModule,
    ServerTransferStateModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslationsLoaderFactory,
        deps: [HttpClient, PLATFORM_ID, PlatformService]
      }
    }),
  ],
  bootstrap: [AppComponent]
})
export class AppServerModule {
}
