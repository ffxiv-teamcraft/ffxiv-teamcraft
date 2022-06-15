import { Component } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from '../../../../model/garland-tools/item';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { DataService } from '../../../../core/api/data.service';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { SeoService } from '../../../../core/seo/seo.service';
import { SeoMetaConfig } from '../../../../core/seo/seo-meta-config';
import { Craft } from '@ffxiv-teamcraft/simulator';
import { AbstractSimulationPage } from '../../abstract-simulation-page';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { LazyRecipe } from '../../../../lazy-data/model/lazy-recipe';

@Component({
  selector: 'app-simulator-page',
  templateUrl: './simulator-page.component.html',
  styleUrls: ['./simulator-page.component.less']
})
export class SimulatorPageComponent extends AbstractSimulationPage {

  item$: Observable<Item> = this.route.paramMap.pipe(
    switchMap(params => {
      return this.dataService.getItem(+params.get('itemId'));
    }),
    map(itemData => itemData.item),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  recipe$: Observable<Craft | LazyRecipe> = this.route.paramMap.pipe(
    switchMap(params => {
      return this.item$.pipe(
        switchMap(item => {
          if (params.get('recipeId') === null && item.craft.length > 0) {
            this.router.navigate([item.craft[0].id], { relativeTo: this.route });
            return this.lazyData.getRecipe(params.get('recipeId'));
          }
          return this.lazyData.getRecipe(params.get('recipeId'));
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  thresholds$: Observable<number[]> = this.item$.pipe(
    switchMap(item => {
      if (item.collectable === 1) {
        // If it's a delivery item
        if (item.satisfaction !== undefined) {
          // We want thresholds on quality, not collectable score.
          return of(item.satisfaction[0].rating.map(r => r * 10));
        } else if (item.masterpiece !== undefined) {
          return of(item.masterpiece.rating.map(r => r * 10));
        } else {
          return this.lazyData.getRow('collectables', item.id).pipe(
            map(supply => {
              if (supply) {
                return [
                  supply.base.rating * 10,
                  supply.mid.rating * 10,
                  supply.high.rating * 10
                ];
              }
              return [];
            })
          );
        }
      }
    })
  );

  constructor(protected route: ActivatedRoute, private dataService: DataService,
              private rotationsFacade: RotationsFacade, private router: Router,
              protected seo: SeoService, private lazyData: LazyDataFacade) {
    super(route, seo);
    this.route.paramMap.pipe(
      map(params => params.get('rotationId'))
    ).subscribe(id => {
      if (id === null) {
        this.rotationsFacade.createRotation();
        this.rotationsFacade.selectRotation(undefined);
      } else {
        this.rotationsFacade.getRotation(id);
        this.rotationsFacade.selectRotation(id);
      }
    });
  }


  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return combineLatest([this.rotationsFacade.selectedRotation$, this.recipe$, this.item$]).pipe(
      filter(([, recipe]) => recipe !== undefined),
      map(([rotation, recipe, item]) => {
        return {
          title: rotation.getName(),
          description: `rlvl ${recipe.rlvl}, ${recipe.durability} durability, ${rotation.rotation.length} steps`,
          url: `https://ffxivteamcraft.com/simulator/${item.id}/${recipe.id}/${rotation.$key}`
        };
      })
    );
  }

}
