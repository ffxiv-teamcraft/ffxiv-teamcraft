import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MapMarker } from '../../../modules/map/map-marker';
import { MapService } from '../../../modules/map/map.service';
import { uniq } from 'lodash';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { MapComponent } from '../../../modules/map/map/map.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-cosmic-intervention',
    templateUrl: './cosmic-intervention.component.html',
    styleUrls: ['./cosmic-intervention.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NzButtonModule, NzWaveModule, MapComponent, NzGridModule, NzFormModule, NzSelectModule, FormsModule, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe]
})
export class CosmicInterventionComponent {


}
