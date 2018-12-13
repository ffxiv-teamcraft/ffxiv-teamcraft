import { Component } from '@angular/core';
import { CustomLinksFacade } from '../../../modules/custom-links/+state/custom-links.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.less']
})
export class LinkComponent {

  notFound = false;

  constructor(private customLinksFacade: CustomLinksFacade, private route: ActivatedRoute,
              private router: Router) {
    this.route.paramMap.pipe(
      first(),
      tap(params => {
        this.customLinksFacade.load(params.get('nickname'), params.get('uri'));
      }),
      switchMap(params => {
        return this.customLinksFacade.allCustomLinks$.pipe(
          map(links => {
            return links.find(link => {
              return link.authorNickname === params.get('nickname') && link.uri === params.get('uri');
            });
          }),
          filter(link => link !== undefined)
        );
      }),
      first()
    ).subscribe(link => {
      this.notFound = link.notFound;
      if (!link.notFound) {
        this.router.navigateByUrl(link.redirectTo);
      }
    });
  }

}
