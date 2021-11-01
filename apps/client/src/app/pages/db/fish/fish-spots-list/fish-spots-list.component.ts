import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { map, startWith } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fish-spots-list',
  templateUrl: './fish-spots-list.component.html',
  styleUrls: ['./fish-spots-list.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishSpotsListComponent {
  public readonly loading$ = this.fishCtx.spotsByFish$.pipe(map((res) => res.loading));

  public readonly spots$ = this.fishCtx.spotsByFish$.pipe(
    map((res) => res.data ?? []),
    startWith([])
  );

  constructor(public readonly settings: SettingsService, public readonly fishCtx: FishContextService) {
  }
}
