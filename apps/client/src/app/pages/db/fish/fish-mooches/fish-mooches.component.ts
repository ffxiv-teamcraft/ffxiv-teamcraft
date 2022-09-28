import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fish-mooches',
  templateUrl: './fish-mooches.component.html',
  styleUrls: ['./fish-mooches.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishMoochesComponent {
  public readonly loading$ = this.fishCtx.moochesByFish$.pipe(map((res) => res.loading));

  public readonly mooches$ = this.fishCtx.moochesByFish$.pipe(
    map((res) => res.data ?? []),
    startWith([]),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(public readonly settings: SettingsService, public readonly fishCtx: FishContextService) {
  }
}
