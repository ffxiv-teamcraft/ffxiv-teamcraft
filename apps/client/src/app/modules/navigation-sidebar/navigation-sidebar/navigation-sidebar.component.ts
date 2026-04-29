import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
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
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
    selector: 'app-navigation-sidebar',
    templateUrl: './navigation-sidebar.component.html',
    styleUrls: ['./navigation-sidebar.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzMenuModule, NzIconModule, NzButtonModule, NzBadgeModule, NgTemplateOutlet, RouterLinkActive, RouterLink, NzDropDownModule, NzTooltipModule, AsyncPipe, TranslateModule]
})
export class NavigationSidebarComponent {
  settings = inject(SettingsService);
  private media = inject(MediaObserver);
  private platformService = inject(PlatformService);
  private navigationSidebarService = inject(NavigationSidebarService);
  private nzContextMenuService = inject(NzContextMenuService);


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
