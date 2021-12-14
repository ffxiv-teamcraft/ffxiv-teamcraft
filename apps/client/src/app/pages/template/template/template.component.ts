import { Component } from '@angular/core';
import { CustomLinksFacade } from '../../../modules/custom-links/+state/custom-links.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ListTemplate } from '../../../core/database/custom-links/list-template';
import { List } from '../../../modules/list/model/list';
import { ListController } from '../../../modules/list/list-controller';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.less']
})
export class TemplateComponent {

  notFound = false;

  status = 'Loading';

  constructor(private customLinksFacade: CustomLinksFacade, private route: ActivatedRoute,
              private router: Router, private listsFacade: ListsFacade) {
    this.route.paramMap.pipe(
      first(),
      tap(params => {
        this.customLinksFacade.load(params.get('nickname'), params.get('uri'), true);
      }),
      switchMap(params => {
        return this.customLinksFacade.allCustomLinks$.pipe(
          map(templates => {
            return templates.find(template => {
              return template.authorNickname === params.get('nickname')
                && template.uri === params.get('uri')
                && template.type === 'template';
            });
          }),
          filter(template => template !== undefined),
          tap(template => this.notFound = template.notFound)
        );
      }),
      first(),
      filter(template => !template.notFound),
      switchMap((template: ListTemplate) => {
        this.listsFacade.load(template.originalListId);
        return this.listsFacade.allListDetails$.pipe(
          map(lists => lists.find(l => l.$key === template.originalListId)),
          filter(l => l !== undefined),
          first(),
          tap(l => this.notFound = l.notFound),
          filter(l => !l.notFound),
          tap(() => this.status = 'Copying'),
          map(original => {
            const clone = ListController.clone(original);
            this.listsFacade.addList(clone);
            return clone;
          }),
          switchMap(clone => {
            return this.listsFacade.myLists$.pipe(
              map((lists: List[]) => lists.find(l => l.createdAt.seconds === clone.createdAt.seconds && l.$key !== undefined)),
              filter(l => l !== undefined)
            );
          })
        );
      }),
      first()
    ).subscribe(clone => {
      this.router.navigate(['/list', clone.$key]);
    });
  }

}
