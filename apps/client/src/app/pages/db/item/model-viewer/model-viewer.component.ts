import { Component, Input, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-model-viewer',
    templateUrl: './model-viewer.component.html',
    styleUrls: ['./model-viewer.component.less'],
    standalone: true
})
export class ModelViewerComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);


  @Input()
  slot: number | string;

  @Input()
  models: string[];

  url: SafeHtml;

  ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(`https://garlandtools.org/db/3d/viewer.html?id=${this.slot}/${this.models[0]}`);
  }

}
