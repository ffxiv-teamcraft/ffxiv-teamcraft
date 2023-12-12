import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SettingsService } from '../../settings/settings.service';
import * as semver from 'semver';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownModule } from 'ngx-markdown';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-changelog-popup',
    templateUrl: './changelog-popup.component.html',
    styleUrls: ['./changelog-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgFor, NzDividerModule, MarkdownModule, TranslateModule]
})
export class ChangelogPopupComponent implements OnInit {
  public patchNotes: typeof environment.patchNotes;

  constructor(private settings: SettingsService) {
  }

  ngOnInit(): void {
    const notes = environment.patchNotes.filter(entry => {
      return semver.gt(entry.version, this.settings.lastChangesSeen);
    });
    if (notes.length === 0) {
      this.patchNotes = environment.patchNotes.slice(0, 1);
    } else {
      this.patchNotes = notes;
    }
  }
}
