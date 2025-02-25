import { Component, DestroyRef, inject } from '@angular/core';
import { PlatformService } from '../../../core/tools/platform.service';
import { auditTime, distinctUntilChanged, filter, fromEvent, map, Observable, startWith, take, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';


@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrls: ['./ad.component.less'],
  imports: [
    AsyncPipe
  ],
  standalone: true
})
export class AdComponent {

  #destroyRef = inject(DestroyRef);

  #router = inject(Router);

  slotId$: Observable<string>;

  constructor(private platform: PlatformService) {
    if (!this.platform.isOverlay()) {
      (window as any).AdSlots = { cmd: [], renderOnFirstLoad: true, divCheck: false };
      this.#router.events.pipe(
        filter(e => e instanceof NavigationEnd)
      ).subscribe((e: NavigationEnd) => {
        (window as any).AdSlots.pageURL = e.url;
      });

      this.slotId$ = fromEvent(window, 'resize')
        .pipe(
          map(event => (event.currentTarget as any)?.innerWidth),
          startWith(window.innerWidth),
          auditTime(1000),
          map(width => {
            if (width > 475 && width < 1350) {
              return 'mobile';
            } else if (width >= 1350) {
              return 'desktop';
            }
            return null;
          }),
          distinctUntilChanged(),
          takeUntilDestroyed(this.#destroyRef),
          map((platform) => {
            switch (platform) {
              case 'mobile':
                return 'nn_small_lb2';
              case 'desktop':
                return 'nn_lb1';
              default:
                return 'nn_lb1';
            }
          })
        );
      this.slotId$.pipe(
        take(1)
      ).subscribe(() => {
        const kumoEl: HTMLScriptElement = document.createElement('script');
        kumoEl.async = true;
        kumoEl.setAttribute('src', `https://kumo.network-n.com/dist/app.js`);
        kumoEl.setAttribute('site', this.platform.isDesktop() ? `ffxiv-teamcraft` : `ffxiv-teamcraft-desktop-site`);
        document.head.appendChild(kumoEl);
      });
    }
  }

}
