import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsService } from '../../settings/settings.service';
import { MediaObserver } from '@angular/flex-layout';
import { Character } from '@xivapi/angular-client';
import { SidebarIconType } from '../sidebar-icon-type';
import { SidebarEntry } from '../sidebar-entry';
import { SidebarBadgeType } from '../sidebar-badge-type';
import { NavigationSidebarService } from '../navigation-sidebar.service';

@Component({
  selector: 'app-navigation-sidebar',
  templateUrl: './navigation-sidebar.component.html',
  styleUrls: ['./navigation-sidebar.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationSidebarComponent {

  @Input()
  commissionNotificationsCount: number;

  @Input()
  desktop = false;

  @Input()
  pcapEnabled = false;

  @Input()
  mappyEnabled = false;

  @Input()
  loggedIn = false;

  @Input()
  character: Character & { Datacenter: string };

  @Input()
  collapsed: boolean;

  @Input()
  version: string;

  @Output()
  showPatchNotes = new EventEmitter();

  SidebarIconType = SidebarIconType;

  SidebarBadgeType = SidebarBadgeType;

  public state = this.settings.sidebarState;

  public content$ = this.navigationSidebarService.content$;

  constructor(public settings: SettingsService, private media: MediaObserver,
              private navigationSidebarService: NavigationSidebarService) {
  }

  public onNavLinkClick(): void {
    if (this.media.isActive('lt-md')) {
      this.settings.compactSidebar = true;
    }
  }

  public onOpenChange(collapsedKey: string, change: boolean): void {
    if (!this.settings.compactSidebar) {
      this.state = {
        ...this.state,
        [collapsedKey]: change
      };
      this.settings.sidebarState = this.state;
    }
  }

  trackByName(index: number, entry: SidebarEntry): string {
    return entry.name;
  }

}
