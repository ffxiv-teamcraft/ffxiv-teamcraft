import { Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { SeoService } from '../../../../core/seo/seo.service';
import { SeoMetaConfig } from '../../../../core/seo/seo-meta-config';
import { Craft } from '@ffxiv-teamcraft/simulator';
import { AbstractSimulationPage } from '../../abstract-simulation-page';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { LazyRecipe } from '@ffxiv-teamcraft/data/model/lazy-recipe';
import { PageLoaderComponent } from '../../../../modules/page-loader/page-loader/page-loader.component';
import { SimulatorComponent } from '../simulator/simulator.component';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-simulator-page',
    templateUrl: './simulator-page.component.html',
    styleUrls: ['./simulator-page.component.less'],
    standalone: true,
    imports: [NgIf, SimulatorComponent, PageLoaderComponent, AsyncPipe]
})
export class SimulatorPageComponent extends AbstractSimulationPage {

  itemId$: Observable<number> = this.route.paramMap.pipe(
    map(params => +params.get('itemId'))
  );

  recipe$: Observable<LazyRecipe> = this.route.paramMap.pipe(
    switchMap(params => {
      return this.itemId$.pipe(
        switchMap(itemId => {
          return this.lazyData.getRow('recipesPerItem', itemId).pipe(
            switchMap(recipes => {
              if (params.get('recipeId') === null && recipes.length > 0) {
                this.router.navigate([recipes[0].id], { relativeTo: this.route });
                return this.lazyData.getRecipe(params.get('recipeId'));
              }
              return this.lazyData.getRecipe(params.get('recipeId'));
            })
          );
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  thresholds$: Observable<number[]> = combineLatest([
    this.itemId$.pipe(
      switchMap(itemId => this.lazyData.getRow('collectables', itemId))
    ),
    this.itemId$.pipe(
      switchMap(itemId => this.lazyData.getRow('satisfactionThresholds', itemId))
    ),
    this.recipe$
  ]).pipe(
    map(([collectable, satisfaction, recipe]) => {
      if (satisfaction) {
        return satisfaction;
      } else if (collectable) {
        return [
          collectable.base.rating * 10,
          collectable.mid.rating * 10,
          collectable.high.rating * 10
        ];
      } else if (recipe.requiredQuality) {
        return [recipe.requiredQuality];
      }
      return [];
    })
  );

  constructor(protected route: ActivatedRoute,
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
    return combineLatest([this.rotationsFacade.selectedRotation$, this.recipe$, this.itemId$]).pipe(
      filter(([, recipe]) => recipe !== undefined),
      map(([rotation, recipe, itemId]) => {
        return {
          title: rotation.getName(),
          description: `rlvl ${recipe.rlvl}, ${recipe.durability} durability, ${rotation.rotation.length} steps`,
          url: `https://ffxivteamcraft.com/simulator/${itemId}/${recipe.id}/${rotation.$key}`
        };
      })
    );
  }

}
