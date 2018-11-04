import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { GarlandToolsService } from './core/api/garland-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { IpcService } from './core/electron/ipc.service';
import { NavigationEnd, Router } from '@angular/router';
import { faDiscord, faFacebookF, faGithub } from '@fortawesome/fontawesome-free-brands';
import { faBell, faCalculator, faGavel, faMap } from '@fortawesome/fontawesome-free-solid';
import fontawesome from '@fortawesome/fontawesome';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { AuthFacade } from './+state/auth.facade';
import { Character } from '@xivapi/angular-client';
import { NzModalService } from 'ng-zorro-antd';
import { RegisterPopupComponent } from './core/auth/register-popup/register-popup.component';
import { LoginPopupComponent } from './core/auth/login-popup/login-popup.component';
import { EorzeanTimeService } from './core/time/eorzean-time.service';
import { ListsFacade } from './modules/list/+state/lists.facade';
import { AngularFireDatabase } from '@angular/fire/database';
import { WorkshopsFacade } from './modules/workshop/+state/workshops.facade';
import { SettingsService } from './modules/settings/settings.service';
import { TeamsFacade } from './modules/teams/+state/teams.facade';

declare const ga: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  public static LOCALES: string[] = ['en', 'de', 'fr', 'ja', 'pt', 'es'];

  locale: string;

  version = environment.version;

  public overlay = false;

  public windowDecorator = false;

  public overlayOpacity = 1;

  collapsedSidebar = false;

  collapsedAlarmsBar = true;

  public loggedIn$: Observable<boolean>;

  public character$: Observable<Character>;

  public userId$ = this.authFacade.userId$;

  public loading$: Observable<boolean>;

  public time$: Observable<string>;

  constructor(private gt: GarlandToolsService, private translate: TranslateService,
              private ipc: IpcService, private router: Router, private firebase: AngularFireDatabase,
              private authFacade: AuthFacade, private dialog: NzModalService, private eorzeanTime: EorzeanTimeService,
              private listsFacade: ListsFacade, private workshopsFacade: WorkshopsFacade, public settings: SettingsService,
              public teamsFacade: TeamsFacade) {

    this.time$ = this.eorzeanTime.getEorzeanTime().pipe(
      map(date => {
        const minutes = date.getUTCMinutes();
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${date.getUTCHours()}:${minutesStr}`;
      })
    );

    // Google Analytics
    router.events
      .pipe(
        distinctUntilChanged((previous: any, current: any) => {
          if (current instanceof NavigationEnd) {
            return previous.url === current.url;
          }
          return true;
        })
      ).subscribe((event: any) => {
      this.overlay = event.url.indexOf('?overlay') > -1;
      this.ipc.on('window-decorator', (e, value) => {
        this.windowDecorator = value;
      });
      if (this.overlay) {
        this.ipc.on(`overlay:${this.ipc.overlayUri}:opacity`, (value) => {
          this.overlayOpacity = value;
        });
        this.ipc.send('overlay:get-opacity', { uri: this.ipc.overlayUri });
      }
      ga('set', 'page', event.url);
      ga('send', 'pageview');
    });

    // this.gt.preload();
    // Translation
    this.translate.setDefaultLang('en');
    const lang = localStorage.getItem('locale');
    if (lang !== null) {
      this.use(lang);
    } else {
      this.use(this.translate.getBrowserLang());
    }
    this.translate.onLangChange.subscribe(change => {
      this.locale = change.lang;
    });

    fontawesome.library.add(faDiscord, faFacebookF, faGithub, faCalculator, faBell, faMap, faGavel);

    this.firebase.object('maintenance').valueChanges().subscribe(maintenance => {
      if (maintenance && environment.production) {
        this.router.navigate(['maintenance']);
      }
    });
  }

  ngOnInit(): void {
    // Loading is !loaded
    this.loading$ = this.authFacade.loaded$.pipe(map(loaded => !loaded));
    this.loggedIn$ = this.authFacade.loggedIn$;
    this.character$ = this.authFacade.mainCharacter$;

    this.authFacade.loadUser();
    this.listsFacade.loadMyLists();
    this.workshopsFacade.loadMyWorkshops();
    this.listsFacade.loadListsWithWriteAccess();
    this.workshopsFacade.loadWorkshopsWithWriteAccess();
    this.teamsFacade.loadMyTeams();
  }

  openRegisterPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Registration'),
      nzContent: RegisterPopupComponent,
      nzFooter: null
    });
  }

  openLoginPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Login'),
      nzContent: LoginPopupComponent,
      nzFooter: null
    });
  }

  logOut(): void {
    this.authFacade.logout();
  }

  use(lang: string): void {
    if (AppComponent.LOCALES.indexOf(lang) === -1) {
      lang = 'en';
    }
    this.locale = lang;
    localStorage.setItem('locale', lang);
    this.translate.use(lang);
  }

  openSettings(): void {
    this.settings.openSettings();
  }

}
