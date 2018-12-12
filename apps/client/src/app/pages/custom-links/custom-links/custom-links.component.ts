import { Component } from '@angular/core';
import { CustomLink } from '../../../core/database/custom-links/custom-link';
import { Observable } from 'rxjs';
import { CustomLinksFacade } from '../../../modules/custom-links/+state/custom-links.facade';

@Component({
  selector: 'app-custom-links',
  templateUrl: './custom-links.component.html',
  styleUrls: ['./custom-links.component.less']
})
export class CustomLinksComponent {

  public links$: Observable<CustomLink[]>;

  constructor(private customLinksFacade: CustomLinksFacade) {
    this.links$ = this.customLinksFacade.myCustomLinks$;
    this.customLinksFacade.loadMyCustomLinks();
  }

}
