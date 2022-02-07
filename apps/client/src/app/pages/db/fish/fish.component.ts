import { ChangeDetectionStrategy, Component, Input, OnDestroy, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishContextService } from '../service/fish-context.service';
import { PlatformService } from '../../../core/tools/platform.service';

@Component({
  selector: 'app-fish',
  templateUrl: './fish.component.html',
  styleUrls: ['../common-db.less', './fish.common.less', './fish.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishComponent implements OnDestroy {
  @Input() usedForTpl: TemplateRef<any>;

  @Input() obtentionTpl: TemplateRef<any>;

  constructor(public translate: TranslateService, public settings: SettingsService, public readonly fishCtx: FishContextService,
              public platform: PlatformService) {
  }

  ngOnDestroy() {
    this.fishCtx.setSpotId(undefined);
  }
}
