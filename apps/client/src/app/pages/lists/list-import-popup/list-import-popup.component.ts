import { Component } from '@angular/core';
import { ExternalListLinkParser } from './link-parser/external-list-link-parser';
import { FfxivCraftingLinkParser } from './link-parser/ffxiv-crafting-link-parser';
import { AriyalaLinkParser } from './link-parser/ariyala-link-parser';
import { AriyalaMateriaOptions } from './link-parser/ariyala-materia-options';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GarlandtoolsGroupLinkParser } from './link-parser/garlandtools-group-link-parser';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { TranslateModule } from '@ngx-translate/core';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FlexModule } from '@angular/flex-layout/flex';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-list-import-popup',
    templateUrl: './list-import-popup.component.html',
    styleUrls: ['./list-import-popup.component.less'],
    standalone: true,
    imports: [NgIf, NzGridModule, NzFormModule, NzInputModule, FormsModule, FlexModule, NzCheckboxModule, NzButtonModule, NzWaveModule, PageLoaderComponent, TranslateModule]
})
export class ListImportPopupComponent {

  importLink: string;

  importLinkSupported: boolean;

  linkParsers: ExternalListLinkParser[] = [
    new FfxivCraftingLinkParser(),
    new AriyalaLinkParser(this.http, this.lazyData),
    new GarlandtoolsGroupLinkParser()
  ];

  linkType: string;

  linkTypes: string;

  materiaOptions: AriyalaMateriaOptions = new AriyalaMateriaOptions();

  inProgress = false;

  constructor(private http: HttpClient, private router: Router,
              private ref: NzModalRef, private lazyData: LazyDataFacade) {
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
