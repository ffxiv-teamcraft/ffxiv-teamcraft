import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-model-viewer',
    templateUrl: './model-viewer.component.html',
    styleUrls: ['./model-viewer.component.less'],
    standalone: true
})
export class ModelViewerComponent implements OnInit {

  @Input()
  slot: number | string;

  @Input()
  models: string[];

  url: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(`https://garlandtools.org/db/3d/viewer.html?id=${this.slot}/${this.models[0]}`);
  }

}
