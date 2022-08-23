import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, filter, first, map, startWith, switchMap, tap } from 'rxjs/operators';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { RotationTag } from './rotation-tag';
import { CraftingRotationService } from '../../../../core/database/crafting-rotation/crafting-rotation.service';
import { CommunityRotationFilters } from '../../../../core/database/crafting-rotation/community-rotation-filters';
import { AuthFacade } from '../../../../+state/auth.facade';

@Component({
  selector: 'app-community-rotations-page',
  templateUrl: './community-rotations-page.component.html',
  styleUrls: ['./community-rotations-page.component.less']
})
export class CommunityRotationsPageComponent {

  public static RLVLS = [
    {
      label: '1 - 10',
      value: 10
    },
    {
      label: '11 - 20',
      value: 20
    },
    {
      label: '21 - 30',
      value: 30
    },
    {
      label: '31 - 40',
      value: 40
    },
    {
      label: '41 - 50',
      value: 50
    },

    // 50 stars
    {
      label: '50 ★',
      value: 55
    },
    {
      label: '50 ★★',
      value: 70
    },
    {
      label: '50 ★★★',
      value: 90
    },
    {
      label: '50 ★★★★',
      value: 110
    },
    {
      label: '51 - 60',
      value: 150
    },

    // 60 stars
    {
      label: '60 ★',
      value: 160
    },
    {
      label: '60 ★★',
      value: 180
    },
    {
      label: '60 ★★★',
      value: 220
    },
    {
      label: '60 ★★★★',
      value: 250
    },
    {
      label: '61 - 70',
      value: 290
    },

    // 70 stars
    {
      label: '70 ★',
      value: 300
    },
    {
      label: '70 ★★',
      value: 320
    },
    {
      label: '70 ★★★',
      value: 350
    },
    {
      label: '70 ★★★★',
      value: 380
    },
    {
      label: '71 - 80',
      value: 420
    },
    {
      label: '80 ★',
      value: 430
    },
    {
      label: '80 ★★',
      value: 450
    },
    {
      label: '80 ★★★',
      value: 480
    },
    {
      label: '80 ★★★★',
      value: 510
    },
    {
      label: '81 - 90',
      value: 560
    },
    {
      label: '90 ★',
      value: 570
    },
    {
      label: '90 ★★',
      value: 580
    },
    {
      label: '90 ★★★',
      value: 610
    },
    {
      label: '90 ★★★★',
      value: 640
    }
  ].sort((a, b) => b.value - a.value);

  public tags: any[];

  public tagsFilter$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  public nameFilter$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public rlvlFilter$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  public durabilityFilter$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  public craftsmanshipFilter$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  public controlFilter$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  public cpFilter$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  public difficultyFilter$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  public qualityFilter$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  public page$: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  public pageSize = 20;

  public totalLength = 0;

  public sets$ = this.authFacade.gearSets$.pipe(map(sets => sets.filter(set => set.jobId <= 15)));

  public setIndex$ = new BehaviorSubject<number>(0);

  public set$ = combineLatest([this.setIndex$, this.sets$]).pipe(
    filter(([, sets]) => sets !== null),
    map(([index, sets]) => sets[index])
  );

  loading = false;

  filteredRotations$: Observable<CraftingRotation[]>;

  public rlvls = CommunityRotationsPageComponent.RLVLS;

  public firstDisplay = true;

  private filters$: Observable<CommunityRotationFilters>;

  constructor(private rotationsFacade: RotationsFacade, private rotationsService: CraftingRotationService,
              private authFacade: AuthFacade, route: ActivatedRoute, router: Router) {
    this.tags = Object.keys(RotationTag).map(key => {
      return {
        value: key,
        label: `SIMULATOR.COMMUNITY_ROTATIONS.TAGS.${key}`
      };
    });
    this.filters$ = combineLatest([
      this.nameFilter$,
      this.tagsFilter$,
      this.rlvlFilter$,
      this.durabilityFilter$,
      this.craftsmanshipFilter$,
      this.controlFilter$,
      this.cpFilter$,
      this.difficultyFilter$,
      this.qualityFilter$
    ]).pipe(
      tap(([name, tags, rlvl, durability, craftsmanship, control, cp, difficulty, quality]: any[]) => {
        this.page$.next(1);
        const queryParams = {};
        if (name?.length > 0) {
          queryParams['name'] = name;
        }
        if (tags.length > 0) {
          queryParams['tags'] = tags.join(',');
        }
        if (rlvl !== null) {
          queryParams['rlvl'] = rlvl;
        }
        if (durability !== null) {
          queryParams['durability'] = durability;
        }
        if (craftsmanship !== null) {
          queryParams['craftsmanship'] = craftsmanship;
        }
        if (control !== null) {
          queryParams['control'] = control;
        }
        if (cp !== null) {
          queryParams['cp'] = cp;
        }
        if (difficulty !== null) {
          queryParams['difficulty'] = difficulty;
        }
        if (quality !== null) {
          queryParams['quality'] = quality;
        }
        router.navigate([], {
          queryParams: queryParams,
          relativeTo: route
        });
      }),
      map(([name, tags, rlvl, durability, craftsmanship, control, cp, difficulty, quality]) => {
        return {
          name: name,
          tags: tags,
          rlvl: rlvl,
          durability: durability,
          craftsmanship: craftsmanship,
          control: control,
          cp: cp,
          difficulty: difficulty,
          quality: quality
        };
      })
    );
    route.queryParamMap
      .pipe(first())
      .subscribe((query) => {
        this.nameFilter$.next(query.get('name') || '');
        if (query.get('tags') !== null) {
          this.tagsFilter$.next(query.get('tags').split(',').filter(tag => tag !== ''));
        }
        if (query.get('rlvl') !== null) {
          this.rlvlFilter$.next(+query.get('rlvl'));
        }
        if (query.get('durability') !== null) {
          this.durabilityFilter$.next(+query.get('durability'));
        }
        if (query.get('craftsmanship') !== null) {
          this.craftsmanshipFilter$.next(+query.get('craftsmanship'));
        }
        if (query.get('control') !== null) {
          this.controlFilter$.next(+query.get('control'));
        }
        if (query.get('cp') !== null) {
          this.cpFilter$.next(+query.get('cp'));
        }
        if (query.get('difficulty') !== null) {
          this.difficultyFilter$.next(+query.get('difficulty'));
        }
        if (query.get('quality') !== null) {
          this.qualityFilter$.next(+query.get('quality'));
        }
      });
    this.filteredRotations$ = this.filters$.pipe(
      filter(filters => !!filters.rlvl),
      tap(() => {
        this.firstDisplay = false;
        this.loading = true;
      }),
      debounceTime(250),
      switchMap((filters) => {
        return this.rotationsService.getCommunityRotations({
          ...filters,
          tags: filters.tags
        }).pipe(
          tap(rotations => {
            this.totalLength = rotations.length;
          }),
          switchMap(rotations => {
            return this.page$.pipe(map(page => {
              const pageStart = Math.max(0, (page - 1) * this.pageSize);
              return rotations.slice(pageStart, pageStart + this.pageSize);
            }));
          })
        );
      }),
      tap(() => setTimeout(() => this.loading = false)),
      startWith([])
    );
  }

  resetFilters(): void {
    this.tagsFilter$.next([]);
    this.rlvlFilter$.next(null);
    this.durabilityFilter$.next(null);
    this.craftsmanshipFilter$.next(null);
    this.controlFilter$.next(null);
    this.cpFilter$.next(null);
    this.firstDisplay = true;
  }

  trackByRotation(index: number, rotation: CraftingRotation): string {
    return rotation.$key;
  }

}
