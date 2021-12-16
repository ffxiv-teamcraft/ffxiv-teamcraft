import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.less']
})
export class LoadingScreenComponent {
  gif = (window as any).randomGif;

  patron = (window as any).randomPatron;
}
