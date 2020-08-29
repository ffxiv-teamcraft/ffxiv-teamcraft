import { Component, Input, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishContextService } from '../service/fish-context.service';

@Component({
  selector: 'app-fish',
  templateUrl: './fish.component.html',
  styleUrls: ['../common-db.less', './fish.common.less', './fish.component.less'],
})
export class FishComponent {
  @Input()
  public set xivapiFish(fish: { ID?: number }) {
    if (fish?.ID >= 0) this.fishCtx.setFishId(fish.ID);
  }

  @Input() usedForTpl: TemplateRef<any>;

  @Input() obtentionTpl: TemplateRef<any>;

  constructor(public translate: TranslateService, public settings: SettingsService, public readonly fishCtx: FishContextService) {}
}
