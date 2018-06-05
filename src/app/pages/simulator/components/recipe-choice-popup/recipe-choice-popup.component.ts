import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {debounceTime, distinctUntilChanged, first, takeUntil} from 'rxjs/operators';
import {fromEvent, Subject} from 'rxjs/index';
import {Recipe} from '../../../../model/list/recipe';
import {DataService} from '../../../../core/api/data.service';
import {GarlandToolsService} from '../../../../core/api/garland-tools.service';
import {HtmlToolsService} from '../../../../core/tools/html-tools.service';

@Component({
    selector: 'app-recipe-choice-popup',
    templateUrl: './recipe-choice-popup.component.html',
    styleUrls: ['./recipe-choice-popup.component.scss']
})
export class RecipeChoicePopupComponent implements OnDestroy, OnInit {

    results: Recipe[] = [];

    @ViewChild('filter')
    filterElement: ElementRef;

    onDestroy$: Subject<void> = new Subject<void>();

    query: string;

    constructor(private dataService: DataService, private gt: GarlandToolsService, private htmlTools: HtmlToolsService) {
    }

    private doSearch(): void {
        this.dataService.searchItem(this.query, [], true)
            .pipe(first())
            .subscribe(results => {
                this.results = <Recipe[]>results;
            })
    }

    /**
     * Gets job informations from a given job id.
     * @param {number} id
     * @returns {any}
     */
    getJob(id: number): any {
        return this.gt.getJob(id);
    }

    /**
     * Generates star html string for recipes with stars.
     * @param {number} nb
     * @returns {string}
     */
    getStars(nb: number): string {
        return this.htmlTools.generateStars(nb);
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
    }

    ngOnInit(): void {
        fromEvent(this.filterElement.nativeElement, 'keyup')
            .pipe(
                takeUntil(this.onDestroy$),
                debounceTime(500),
                distinctUntilChanged()
            ).subscribe(() => {
            this.doSearch();
        });
    }

}
