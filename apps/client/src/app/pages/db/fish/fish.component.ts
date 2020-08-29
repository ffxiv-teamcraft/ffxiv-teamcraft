import { Component, Input, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishContextService } from '../service/fish-context.service';

@Component({
  selector: 'app-fish',
  templateUrl: './fish.component.html',
  styleUrls: ['./fish.component.less'],
})
export class FishComponent {
  @Input()
  public set xivapiFish(fish: { ID?: number }) {
    if (fish?.ID >= 0) this.fishCtx.setFishId(fish.ID);
  }

  @Input() usedForTpl: TemplateRef<any>;

  @Input() obtentionTpl: TemplateRef<any>;

  public readonly spotIdFilter$ = this.fishCtx.spotId$.pipe(map((spotId) => spotId ?? -1));

  constructor(public translate: TranslateService, public settings: SettingsService, public readonly fishCtx: FishContextService) {}

  public setSpotIdFilter(spotId: number) {
    this.fishCtx.setSpotId(spotId === -1 ? undefined : spotId);
  }
}
