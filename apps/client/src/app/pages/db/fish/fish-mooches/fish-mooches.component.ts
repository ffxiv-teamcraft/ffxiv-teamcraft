import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { LazyIconPipe } from '../../../../pipes/pipes/lazy-icon.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { I18nNameComponent } from '../../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../../modules/item-icon/item-icon/item-icon.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-fish-mooches',
    templateUrl: './fish-mooches.component.html',
    styleUrls: ['./fish-mooches.component.less', '../../common-db.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NzCardModule,
        FlexModule,
        NgIf,
        NgFor,
        ItemIconComponent,
        I18nNameComponent,
        NzSpinModule,
        NzEmptyModule,
        AsyncPipe,
        TranslateModule,
        LazyIconPipe,
    ],
})
export class FishMoochesComponent {
  public readonly loading$ = this.fishCtx.moochesByFish$.pipe(map((res) => res.loading));

  public readonly mooches$ = this.fishCtx.moochesByFish$.pipe(
    map((res) => res.data ?? []),
    startWith([]),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(public readonly settings: SettingsService, public readonly fishCtx: FishContextService) {}
}
