import { Component } from '@angular/core';
import { ExternalListLinkParser } from './link-parser/external-list-link-parser';
import { FfxivCraftingLinkParser } from './link-parser/ffxiv-crafting-link-parser';
import { AriyalaLinkParser } from './link-parser/ariyala-link-parser';
import { AriyalaMateriaOptions } from './link-parser/ariyala-materia-options';
import { HttpClient } from '@angular/common/http';
import { XivapiService } from '@xivapi/angular-client';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GarlandtoolsGroupLinkParser } from './link-parser/garlandtools-group-link-parser';
import { LazyDataService } from '../../../core/data/lazy-data.service';

@Component({
  selector: 'app-list-import-popup',
  templateUrl: './list-import-popup.component.html',
  styleUrls: ['./list-import-popup.component.less']
})
export class ListImportPopupComponent {

  importLink: string;

  importLinkSupported: boolean;

  linkParsers: ExternalListLinkParser[] = [new FfxivCraftingLinkParser(), new AriyalaLinkParser(this.http, this.xivapi, this.lazyData), new GarlandtoolsGroupLinkParser()];

  linkType: string;

  linkTypes: string;

  materiaOptions: AriyalaMateriaOptions = new AriyalaMateriaOptions();

  inProgress = false;

  constructor(private http: HttpClient, private xivapi: XivapiService, private router: Router,
              private ref: NzModalRef, private lazyData: LazyDataService) {
    this.linkTypes = this.linkParsers.map(parser => parser.getName()).join(', ');
  }

  updateLinkSupport(): void {
    if (this.importLink === undefined) {
      return;
    }
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
      if (parser instanceof AriyalaLinkParser) {
        parser.setMateriaOptions(this.materiaOptions);
      }

      parser.parse(this.importLink).pipe(first()).subscribe(code => {
        this.router.navigate(['/import', code], { queryParams: { url: this.importLink } });
        this.ref.close();
      });
    }
  }

}
