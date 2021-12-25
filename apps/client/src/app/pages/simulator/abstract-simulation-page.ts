import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { SeoPageComponent } from '../../core/seo/seo-page-component';
import { SeoService } from '../../core/seo/seo.service';
import { RouteConsumables } from './model/route-consumables';

export abstract class AbstractSimulationPage extends SeoPageComponent {
  stats$: Observable<{
    craftsmanship: number,
    control: number,
    cp: number,
    spec: boolean,
    level: number,
  }>;

  consumables$: Observable<RouteConsumables>;

  protected constructor(protected route: ActivatedRoute, protected seo: SeoService) {
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

    this.consumables$ = route.queryParamMap.pipe(
      map(params => {
        const consumables = new RouteConsumables();
        const food = params.get('food');
        if (food) {
          const split = food.split(',');
          consumables.food = { id: +split[0], hq: split[1] === '1' };
        }

        const med = params.get('med');
        if (med) {
          const split = med.split(',');
          consumables.medicine = { id: +split[0], hq: split[1] === '1' };
        }

        const fca = params.get('fca');
        if (fca) {
          consumables.freeCompanyActions = fca.split(',').map((n: String) => +n) as [number, number];
        }
        return consumables;
      })
    );
  }
}
