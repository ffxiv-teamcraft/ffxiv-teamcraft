import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ScrollService} from '../services/scroll.service';
import {MarkdownSection} from '../markdown-section';
import {ScrollSpyInfo, ScrollSpyService} from '../services/scroll-spy.service';
import {ReplaySubject} from 'rxjs/ReplaySubject';

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

    private readonly tocReloader$: ReplaySubject<void> = new ReplaySubject<void>(1);

    public markdownContent: Observable<string>;

    public tableOfContent: Observable<MarkdownSection[]>;

    private spyInfo: ScrollSpyInfo;

    private activeSectionIndex = new ReplaySubject<number | null>(1);

    constructor(private translator: TranslateService, private route: ActivatedRoute, private http: HttpClient, private router: Router,
                private scrollService: ScrollService, private scrollSpyService: ScrollSpyService) {
        translator.onLangChange.subscribe(() => {
            this.reloader$.next(null);
            this.tocReloader$.next(null);
        });
    }

    interceptLinks(event: MouseEvent): void {
        if (event.srcElement.tagName === 'A' && event.srcElement.baseURI.indexOf('ffxivteamcraft.com') > -1) {
            // If that's an anchor, intercept the click and handle it properly with router
            event.preventDefault();
            this.router.navigateByUrl((<HTMLAnchorElement>event.srcElement).pathname);
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
                .mergeMap(() => this.route.params)
                .do(() => {
                    this.notFoundInCurrentLang = false;
                    this.notFound = false;
                })
                .map(params => params.page)
                .map(page => {
                    return `${WikiComponent.BASE_WIKI_PATH}/${this.translator.currentLang}/${page}.md`
                })
                .mergeMap(markdownUrl => {
                    return this.http.get(markdownUrl, {responseType: 'text'})
                        .catch(() => {
                            // If page isn't found, return the english one
                            const englishUrl = markdownUrl.replace(`/${this.translator.currentLang}/`, '/en/');
                            this.notFoundInCurrentLang = true;
                            return this.http.get(englishUrl, {responseType: 'text'}).catch(() => {
                                this.notFound = true;
                                return Observable.of(null);
                            });
                        });
                })
                .filter(markdown => markdown !== null)
                .do(() => {
                    this.tocReloader$.next(null);
                });

        this.tableOfContent =
            this.tocReloader$
                .do(() => {
                    if (this.spyInfo !== undefined) {
                        this.spyInfo.unspy();
                        delete this.spyInfo;
                    }
                })
                .map(() => {
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
                })
                .do((sections) => {
                    this.spyInfo = this.scrollSpyService.spyOn(sections.map(section => section.element));
                    this.spyInfo.active
                        .filter(item => item !== null)
                        .subscribe(item => {
                            this.activeSectionIndex.next(item && item.index)
                        });
                })
                .mergeMap((sections) => {
                    return this.activeSectionIndex
                        .map((activeItem) => {
                            sections.forEach((section, index) => {
                                section.active = index === activeItem;
                            });
                            return sections;
                        });
                });
    }
}
