import { ChangeDetectionStrategy, Component, Input, OnDestroy, TemplateRef } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishContextService } from '../service/fish-context.service';
import { PlatformService } from '../../../core/tools/platform.service';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { FishMoochesComponent } from './fish-mooches/fish-mooches.component';
import { FishWeatherTransitionsComponent } from './fish-weather-transitions/fish-weather-transitions.component';
import { FishWeathersComponent } from './fish-weathers/fish-weathers.component';
import { FishBiteTimesComponent } from './fish-bite-times/fish-bite-times.component';
import { FishSpotsListComponent } from './fish-spots-list/fish-spots-list.component';
import { FishHooksetsComponent } from './fish-hooksets/fish-hooksets.component';
import { FishBaitsComponent } from './fish-baits/fish-baits.component';
import { FishHoursComponent } from './fish-hours/fish-hours.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FishDetailsContainerComponent } from './fish-details-container/fish-details-container.component';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { FishLuresComponent } from './fish-lures/fish-lures.component';

@Component({
    selector: 'app-fish',
    templateUrl: './fish.component.html',
    styleUrls: ['../common-db.less', './fish.common.less', './fish.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
  imports: [PageLoaderComponent, FishDetailsContainerComponent, NgTemplateOutlet, NzDividerModule, FlexModule, FishHoursComponent, FishBaitsComponent, FishHooksetsComponent, FishSpotsListComponent, FishBiteTimesComponent, FishWeathersComponent, FishWeatherTransitionsComponent, FishMoochesComponent, DbCommentsComponent, AsyncPipe, TranslateModule, FishLuresComponent]
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
