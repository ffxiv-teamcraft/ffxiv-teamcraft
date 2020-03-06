import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { SeoPageComponent } from '../../core/seo/seo-page-component';
import { SeoService } from '../../core/seo/seo.service';

export abstract class AbstractSimulationPage extends SeoPageComponent {
  stats$: Observable<{ craftsmanship: number; control: number; cp: number; spec: boolean; level: number }>;

  constructor(protected route: ActivatedRoute, protected seo: SeoService) {
    super(seo);
    this.stats$ = this.route.queryParamMap.pipe(
      map(query => {
        return query.get('stats');
      }),
      filter(stats => stats !== null),
      map(statsStr => {
        const split = statsStr.split('/');
        return {
          craftsmanship: +split[0],
          control: +split[1],
          cp: +split[2],
          level: +split[3],
          spec: +split[3] === 1
        };
      })
    );
  }
}
