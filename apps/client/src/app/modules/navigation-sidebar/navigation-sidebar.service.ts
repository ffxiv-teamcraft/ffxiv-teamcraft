import { combineLatest, Observable } from 'rxjs';
import { SidebarCategory, SidebarItem } from './sidebar-entry';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';
import { SidebarIconType } from './sidebar-icon-type';
import { SettingsService } from '../settings/settings.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PlatformService } from '../../core/tools/platform.service';
import { IpcService } from '../../core/electron/ipc.service';
import { SidebarBadgeType } from './sidebar-badge-type';
import { AuthFacade } from '../../+state/auth.facade';
import { CommissionsFacade } from '../commission-board/+state/commissions.facade';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationSidebarService {

  public commissionNotificationsCount$ = this.commissionsFacade.notifications$.pipe(
    map(notifications => notifications.length),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private settingsChange$ = this.settings.settingsChange$.pipe(
    filter(change => ['sidebar-state', 'sidebar-favorites'].includes(change)),
    startWith('')
  );

  public content$: Observable<SidebarCategory[]> = combineLatest([
    this.settingsChange$,
    this.ipc.machinaToggle$,
    this.authFacade.loggedIn$.pipe(startWith(false)),
    this.authFacade.mainCharacter$.pipe(startWith(null as any)),
    this.commissionNotificationsCount$.pipe(startWith(0))
  ]).pipe(
    map(([, pcapEnabled, loggedIn, character, commissionNotificationsCount]) => {
      const layout: SidebarCategory[] = [
        {
          name: 'SIDEBAR.General',
          collapsedKey: 'general',
          icon: {
            type: SidebarIconType.ANTD,
            content: 'home'
          },
          children: [
            {
              name: 'ITEMS.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'search'
              },
              link: '/search'
            },
            {
              name: 'Lists',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'profile'
              },
              link: '/lists'
            },
            {
              name: 'SIMULATOR.Title',
              icon: {
                type: SidebarIconType.COMPANION_SVG,
                content: this.sanitizer.bypassSecurityTrustHtml('&#xF239;')
              },
              link: '/simulator',
              preventDefault: true
            },
            {
              name: 'SIMULATOR.Rotations',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'build'
              },
              link: '/rotations'
            },
            {
              name: 'GEARSETS.Title',
              icon: {
                type: SidebarIconType.COMPANION_SVG,
                content: this.sanitizer.bypassSecurityTrustHtml('&#x0F202;')
              },
              link: '/gearsets'
            },
            {
              name: 'INVENTORY.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'appstore'
              },
              link: '/inventory',
              hidden: !pcapEnabled
            },
            {
              name: 'CRAFTING_REPLAYS.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'video-camera'
              },
              link: '/crafting-replays'
            },
            {
              name: 'METRICS.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'stock'
              },
              link: '/metrics',
              hidden: !this.platformService.isDesktop()
            },
            {
              name: 'ALLAGAN_REPORTS.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'reconciliation'
              },
              link: '/allagan-reports'
            }
          ]
        },
        {
          name: 'SIDEBAR.Sharing',
          collapsedKey: 'sharing',
          icon: {
            type: SidebarIconType.ANTD,
            content: 'share-alt'
          },
          children: [
            {
              name: 'Public_lists',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'solution'
              },
              link: '/community-lists'
            },
            {
              name: 'SIMULATOR.COMMUNITY_ROTATIONS.Title',
              icon: {
                type: SidebarIconType.CUSTOM,
                content: this.sanitizer.bypassSecurityTrustHtml('<img class="man-attacked-by-tetris-block anticon" src="./assets/icons/svg/thing.svg"/>')
              },
              link: '/community-rotations'
            }
          ]
        },
        {
          name: 'SIDEBAR.Commissions',
          collapsedKey: 'commissions',
          hidden: !loggedIn,
          badge: {
            type: SidebarBadgeType.COUNT,
            content: commissionNotificationsCount
          },
          icon: {
            type: SidebarIconType.ANTD,
            content: 'shop'
          },
          children: [
            {
              name: 'SIDEBAR.Commission_board',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'project'
              },
              hidden: !character,
              link: `/commissions/board/${character?.DC || 'korea'}`
            },
            {
              name: 'SIDEBAR.My_commissions',
              icon: {
                type: SidebarIconType.COMPANION_SVG,
                content: this.sanitizer.bypassSecurityTrustHtml('&#xE703;')
              },
              badge: {
                type: SidebarBadgeType.DOT,
                content: commissionNotificationsCount > 0
              },
              link: '/commissions',
              exactRouterLinkActive: true
            },
            {
              name: 'SIDEBAR.Archived_commissions',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'container'
              },
              link: '/commissions/archives'
            }
          ]
        },
        {
          name: 'SIDEBAR.Gathering',
          collapsedKey: 'gathering',
          icon: {
            type: SidebarIconType.COMPANION_SVG,
            content: this.sanitizer.bypassSecurityTrustHtml('&#xF121;')
          },
          children: [
            {
              name: 'ALARMS.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'bell'
              },
              link: '/alarms'
            },
            {
              name: 'GATHERING_LOCATIONS.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'environment-o'
              },
              link: '/gathering-location'
            }
          ]
        },
        {
          name: 'SIDEBAR.Island_Sanctuary',
          collapsedKey: 'island',
          icon: {
            type: SidebarIconType.ANTD_ICONFONT,
            content: 'icon-tree'
          },
          children: [
            {
              name: 'ISLAND_SANCTUARY.WORKSHOP.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'area-chart'
              },
              link: '/island-workshop'
            },
          ]
        },
        {
          name: 'SIDEBAR.Leveling',
          collapsedKey: 'leveling',
          icon: {
            type: SidebarIconType.CUSTOM_FONT,
            content: this.sanitizer.bypassSecurityTrustHtml('&#xE902;')
          },
          children: [
            {
              name: 'LEVEQUESTS.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'book'
              },
              link: '/levequests'
            },
            {
              name: 'DESYNTH.Title',
              icon: {
                type: SidebarIconType.ANTD_ICONFONT,
                content: 'icon-vectorcombine'
              },
              link: '/desynth'
            },
            {
              name: 'LEVELING_EQUIPMENT.Title',
              icon: {
                type: SidebarIconType.CUSTOM_FONT,
                content: this.sanitizer.bypassSecurityTrustHtml('&#xE900;')
              },
              link: '/leveling-equipment'
            }
          ]
        },
        {
          name: 'SIDEBAR.Currencies',
          collapsedKey: 'currencies',
          icon: {
            type: SidebarIconType.CUSTOM_FONT,
            content: this.sanitizer.bypassSecurityTrustHtml('&#xE904;')
          },
          children: [
            {
              name: 'GC_SUPPLY.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'file-done'
              },
              link: '/gc-supply'
            },
            {
              name: 'CURRENCY_SPENDING.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'shopping'
              },
              link: '/currency-spending'
            },
            {
              name: 'COLLECTABLES.Title',
              icon: {
                type: SidebarIconType.CUSTOM_FONT,
                content: this.sanitizer.bypassSecurityTrustHtml('&#xE903;')
              },
              link: '/collectables'
            },
            {
              name: 'PROFITS.Title',
              hidden: !loggedIn,
              icon: {
                type: SidebarIconType.ANTD,
                content: 'dollar'
              },
              link: '/profits-helper'
            }
          ]
        },
        {
          name: 'SIDEBAR.Helpers',
          collapsedKey: 'helpers',
          icon: {
            type: SidebarIconType.ANTD,
            content: 'appstore'
          },
          children: [
            {
              name: 'INVENTORY_OPTIMIZER.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'container'
              },
              link: '/inventory-optimizer',
              hidden: !this.platformService.isDesktop()
            },
            {
              name: 'RETAINERS.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'alert'
              },
              link: '/retainers',
              hidden: !this.platformService.isDesktop()
            },
            {
              name: 'RETAINER_VENTURES.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'carry-out'
              },
              link: '/retainer-ventures'
            },
            {
              name: 'VOYAGE_TRACKER.Title',
              icon: {
                type: SidebarIconType.CUSTOM_FONT,
                content: this.sanitizer.bypassSecurityTrustHtml('&#xE905;')
              },
              link: '/voyage-tracker',
              hidden: !this.platformService.isDesktop()
            },
            {
              name: 'TREASURE_FINDER.Title',
              icon: {
                type: SidebarIconType.CUSTOM_FONT,
                content: this.sanitizer.bypassSecurityTrustHtml('&#xE906;')
              },
              link: '/treasure-finder'
            },
            {
              name: 'LIST_DETAILS.LAYOUT_DIALOG.Layouts',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'format-painter'
              },
              link: '/layouts'
            },
            {
              name: 'MACRO_TRANSLATION.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'translation'
              },
              link: '/macro-translator'
            },
            {
              name: 'LOG_TRACKER.Title',
              icon: {
                type: SidebarIconType.ANTD_ICONFONT,
                content: 'icon-book'
              },
              link: '/log-tracker'
            },
            {
              name: 'RECIPE_FINDER.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'experiment'
              },
              link: '/recipe-finder'
            },
            {
              name: 'FOOD_PICKER.Title',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'shopping-cart'
              },
              link: '/food-picker'
            },
            {
              name: 'ALARMS.REALTIME.Reset_timers',
              icon: {
                type: SidebarIconType.ANTD,
                content: 'hourglass'
              },
              link: '/reset-timers'
            }
          ]
        }
      ];
      const sidebarFavorites = this.settings.sidebarFavorites;
      if (sidebarFavorites.length > 0) {
        const favoriteLinks: SidebarItem[] = [];
        layout.forEach(category => {
          category.children.forEach(child => {
            if (sidebarFavorites.includes(child.link)) {
              favoriteLinks.push(child);
            }
          });
          return category;
        });
        layout.unshift({
          name: 'SIDEBAR.Favorites',
          icon: {
            type: SidebarIconType.ANTD,
            content: 'star'
          },
          children: favoriteLinks.sort((a, b) => {
            return sidebarFavorites.indexOf(a.link) - sidebarFavorites.indexOf(b.link);
          }),
          collapsedKey: 'favorites'
        });
      }
      return layout;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public allLinks$: Observable<SidebarItem[]> = this.content$.pipe(
    map(content => {
      return [].concat.apply([], content.filter(category => category.name !== 'SIDEBAR.Favorites').map(category => category.children.filter(child => !child.hidden)));
    })
  );

  constructor(private settings: SettingsService, private sanitizer: DomSanitizer, private platformService: PlatformService,
              private ipc: IpcService, private authFacade: AuthFacade, private commissionsFacade: CommissionsFacade) {
  }
}
