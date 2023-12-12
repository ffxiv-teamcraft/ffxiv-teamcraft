import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsService } from '../../settings/settings.service';
import { MediaObserver } from '@angular/flex-layout';
import { Character } from '@xivapi/angular-client';
import { SidebarIconType } from '../sidebar-icon-type';
import { SidebarEntry, SidebarItem } from '../sidebar-entry';
import { SidebarBadgeType } from '../sidebar-badge-type';
import { NavigationSidebarService } from '../navigation-sidebar.service';
import { NzContextMenuService, NzDropdownMenuComponent, NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { PlatformService } from '../../../core/tools/platform.service';
import { TranslateModule } from '@ngx-translate/core';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgSwitch, NgSwitchCase, NgFor, NgTemplateOutlet, NgIf, AsyncPipe } from '@angular/common';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
    selector: 'app-navigation-sidebar',
    templateUrl: './navigation-sidebar.component.html',
    styleUrls: ['./navigation-sidebar.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzMenuModule, NgSwitch, NgSwitchCase, NzIconModule, NzButtonModule, NzBadgeModule, NgFor, NgTemplateOutlet, NgIf, RouterLinkActive, RouterLink, NzDropDownModule, NzToolTipModule, AsyncPipe, TranslateModule]
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
  character: Character;

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

  public isDesktop = this.platformService.isDesktop();

  constructor(public settings: SettingsService, private media: MediaObserver, private platformService: PlatformService,
              private navigationSidebarService: NavigationSidebarService, private nzContextMenuService: NzContextMenuService) {
  }

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContextMenuService.create($event, menu);
  }

  addToFavorites(entry: SidebarItem): void {
    this.settings.sidebarFavorites = [
      ...this.settings.sidebarFavorites,
      entry.link
    ];
  }

  removeFromFavorites(entry: SidebarItem): void {
    this.settings.sidebarFavorites = this.settings.sidebarFavorites.filter(e => e !== entry.link);
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
