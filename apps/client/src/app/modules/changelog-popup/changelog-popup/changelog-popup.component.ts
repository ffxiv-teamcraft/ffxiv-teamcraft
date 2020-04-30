import { ChangeDetectionStrategy, Component } from '@angular/core';
import { environment } from 'apps/client/src/environments/environment';

@Component({
  selector: 'app-changelog-popup',
  templateUrl: './changelog-popup.component.html',
  styleUrls: ['./changelog-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangelogPopupComponent {
  public patchNotes = environment.patchNotes;
}
