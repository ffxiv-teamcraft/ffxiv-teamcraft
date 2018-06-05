import {Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {fromEvent, Subject} from 'rxjs/index';
import {Recipe} from '../../../../model/list/recipe';

@Component({
    selector: 'app-recipe-choice-popup',
    templateUrl: './recipe-choice-popup.component.html',
    styleUrls: ['./recipe-choice-popup.component.scss']
})
export class RecipeChoicePopupComponent implements OnDestroy {

    results: Recipe[] = [];

    @ViewChild('filter')
    filterElement: ElementRef;

    onDestroy$: Subject<void> = new Subject<void>();

    filterValue: string;

    constructor() {
        fromEvent(this.filterElement.nativeElement, 'keyup')
            .pipe(
                takeUntil(this.onDestroy$),
                debounceTime(500),
                distinctUntilChanged()
            ).subscribe(() => {
            this.doSearch();
        })
    }

    private doSearch(): void {

    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
    }

}
