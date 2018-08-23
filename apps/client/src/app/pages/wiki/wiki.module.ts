import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WikiComponent } from './wiki/wiki.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownModule } from 'ngx-markdown';
import { MatInputModule } from '@angular/material';
import { ScrollService } from './services/scroll.service';
import { ScrollSpyService } from './services/scroll-spy.service';

const routes: Routes = [
  {
    path: 'wiki',
    redirectTo: 'wiki/home',
    pathMatch: 'full'
  },
  {
    path: 'wiki/:page',
    component: WikiComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    MatInputModule,

    TranslateModule,
    MarkdownModule.forChild()
  ],
  declarations: [WikiComponent],
  providers: [
    ScrollService,
    ScrollSpyService
  ]
})
export class WikiModule {
}
