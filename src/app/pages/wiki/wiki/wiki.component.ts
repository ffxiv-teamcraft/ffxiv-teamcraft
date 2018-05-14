import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, of, ReplaySubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ScrollService} from '../services/scroll.service';
import {MarkdownSection} from '../markdown-section';
import {ScrollSpyInfo, ScrollSpyService} from '../services/scroll-spy.service';
import {ObservableMedia} from '@angular/flex-layout';
import {catchError, filter, map, mergeMap, tap} from 'rxjs/operators';

@Component({
    selector: 'app-wiki',
    templateUrl: './wiki.component.html',
    styleUrls: ['./wiki.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class WikiComponent implements OnInit {

    private static readonly BASE_WIKI_PATH = '/assets/wiki';

    @ViewChild('markdown')
    public markdownRef: ElementRef;

    public notFound = false;

    public notFoundInCurrentLang = false;

    private readonly reloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

    private readonly tocReloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

    public markdownContent: Observable<string>;

    public tableOfContent: Observable<MarkdownSection[]>;

    private spyInfo: ScrollSpyInfo;

    private activeSectionIndex = new ReplaySubject<number | null>(1);

    constructor(private translator: TranslateService, private route: ActivatedRoute, private http: HttpClient, private router: Router,
                private scrollService: ScrollService, private scrollSpyService: ScrollSpyService, private media: ObservableMedia) {
        translator.onLangChange.subscribe(() => {
            this.reloader$.next(null);
            this.tocReloader$.next(null);
        });
    }

    interceptLinks(event: MouseEvent): void {
        if (event.srcElement.tagName === 'A') {
            event.preventDefault();
            if (((<any>event.srcElement).href.indexOf('ffxivteamcraft.com') > -1 ||
                (<any>event.srcElement).href.indexOf('localhost') > -1)) {
                // If that's an anchor, intercept the click and handle it properly with router
                this.router.navigateByUrl((<HTMLAnchorElement>event.srcElement).pathname);
            } else {
                window.open((<any>event.srcElement).href, '_blank');
            }
        }
    }

    scrollTo(element: Element, index: number): void {
        this.scrollService.scrollToElement(element);
        // Wait a bit before emitting index
        setTimeout(() => {
            this.activeSectionIndex.next(index);
        }, 50);
    }

    ngOnInit(): void {
        this.markdownContent =
            this.reloader$
                .pipe(
                    mergeMap(() => this.route.params),
                    tap(() => {
                        this.notFoundInCurrentLang = false;
                        this.notFound = false;
                    }),
                    map(params => params.page),
                    map(page => {
                        return `${WikiComponent.BASE_WIKI_PATH}/${this.translator.currentLang}/${page}.md`
                    }),
                    mergeMap(markdownUrl => {
                        return this.http.get(markdownUrl, {responseType: 'text'})
                            .pipe(
                                mergeMap(res => {
                                    if (res.indexOf('<!doctype html>') > -1) {
                                        // If page isn't found, return the english one
                                        // This has to be done because of firebase not handling redirection properly for not found pages.
                                        return this.getEnglishFallback(markdownUrl);
                                    }
                                    return of(res);
                                }),
                                catchError(() => {
                                    return this.getEnglishFallback(markdownUrl);
                                })
                            );
                    }),
                    filter(markdown => markdown !== null),
                    tap(() => {
                        setTimeout(() => {
                            this.tocReloader$.next(null);
                        }, 100);
                    })
                );

        this.tableOfContent =
            this.tocReloader$
                .pipe(
                    tap(() => {
                        if (this.spyInfo !== undefined) {
                            this.spyInfo.unspy();
                            delete this.spyInfo;
                        }
                    }),
                    map(() => {
                        const headings: NodeList = this.markdownRef.nativeElement.querySelectorAll('h1,h2,h3');
                        return Object.keys(headings)
                            .map(key => headings[key])
                            .map(node => {
                                return {
                                    title: node.innerText,
                                    element: node,
                                    level: node.localName,
                                    active: false
                                };
                            });
                    }),
                    tap((sections) => {
                        this.spyInfo = this.scrollSpyService.spyOn(sections.map(section => section.element));
                        this.spyInfo.active
                            .pipe(filter(item => item !== null))
                            .subscribe(item => {
                                this.activeSectionIndex.next(item && item.index)
                            });
                    }),
                    mergeMap((sections) => {
                        return this.activeSectionIndex
                            .pipe(
                                map((activeItem) => {
                                    sections.forEach((section, index) => {
                                        section.active = index === activeItem;
                                    });
                                    return sections;
                                })
                            );
                    })
                );
    }

    getEnglishFallback(markdownUrl: string): Observable<string> {
        // If page isn't found, return the english one
        const englishUrl = markdownUrl.replace(`/${this.translator.currentLang}/`, '/en/');
        this.notFoundInCurrentLang = true;
        return this.http.get(englishUrl, {responseType: 'text'})
            .pipe(
                catchError(() => {
                    this.notFound = true;
                    return of(null);
                })
            );
    }

    isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }
}
