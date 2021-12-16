import { SafeHtml } from '@angular/platform-browser';
import { SidebarIconType } from './sidebar-icon-type';
import { SidebarBadgeType } from './sidebar-badge-type';

export interface SidebarEntry {
  name: string;
  icon: {
    type: SidebarIconType;
    content: string | SafeHtml;
  };
  badge?: {
    type: SidebarBadgeType.DOT,
    content: boolean
  } | {
    type: SidebarBadgeType.COUNT,
    content: number
  };
  preventDefault?: boolean;
  exactRouterLinkActive?: boolean;
  hidden?: boolean;
}

export interface SidebarItem extends SidebarEntry {
  link: string;
}

export interface SidebarCategory extends SidebarEntry {
  children: SidebarItem[];
  collapsedKey: string;
}
