import { Component } from '@angular/core';
import { ExternalListLinkParser } from './link-parser/external-list-link-parser';
import { FfxivCraftingLinkParser } from './link-parser/ffxiv-crafting-link-parser';
import { AriyalaLinkParser } from './link-parser/ariyala-link-parser';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-list-import-popup',
  templateUrl: './list-import-popup.component.html',
  styleUrls: ['./list-import-popup.component.less']
})
export class ListImportPopupComponent {

  importLink: string;

  importLinkSupported: boolean;

  linkParsers: ExternalListLinkParser[] = [new FfxivCraftingLinkParser(), new AriyalaLinkParser(this.http)];

  linkType: string;

  linkTypes: string;

  inProgress = false;

  constructor(private http: HttpClient, private router: Router, private ref: NzModalRef) {
    this.linkTypes = this.linkParsers.map(parser => parser.getName()).join(', ');
  }

  updateLinkSupport(): void {
    this.importLinkSupported = this.linkParsers.reduce((supported, parser) => {
      if (parser.canParse(this.importLink)) {
        this.linkType = parser.getName();
      }
      return supported || parser.canParse(this.importLink);
    }, false);
  }

  public submit(): void {
    const parser = this.linkParsers.find(p => p.canParse(this.importLink));
    if (parser !== undefined) {
      this.inProgress = true;
      parser.parse(this.importLink).pipe(first()).subscribe(code => {
        this.router.navigate(['/import', code]);
        this.ref.close();
      });
    }
  }

}
