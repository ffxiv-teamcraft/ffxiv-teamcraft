import { Component } from '@angular/core';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-loading-screen',
    templateUrl: './loading-screen.component.html',
    styleUrls: ['./loading-screen.component.less'],
    standalone: true,
    imports: [FlexModule]
})
export class LoadingScreenComponent {
  gif = (window as any).randomGif;

  patron = (window as any).randomPatron;
}
