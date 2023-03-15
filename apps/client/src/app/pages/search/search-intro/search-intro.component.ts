import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {PlatformService} from '../../../core/tools/platform.service';
import {Database, objectVal, ref} from '@angular/fire/database';
import {GuidesService} from "../../../core/database/guides.service";
import {where} from "@angular/fire/firestore";

interface FeatureEntry {
  link: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-search-intro',
  templateUrl: './search-intro.component.html',
  styleUrls: ['./search-intro.component.less']
})
export class SearchIntroComponent {

  counter$ = objectVal<string>(ref(this.firebase, 'lists_created'));

  guides$ = this.guidesService.query(where('featured', "==", true));

  constructor(private firebase: Database, public translate: TranslateService,
              public platform: PlatformService, private guidesService: GuidesService) {
  }

}
