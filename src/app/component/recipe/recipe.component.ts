import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Recipe} from '../../model/list/recipe';
import {Observable} from 'rxjs/Observable';
import {I18nName} from '../../model/list/i18n-name';
import {I18nToolsService} from '../../core/i18n-tools.service';

@Component({
    selector: 'app-recipe',
    templateUrl: './recipe.component.html',
    styleUrls: ['./recipe.component.scss']
})
export class RecipeComponent implements OnInit {

    @Output()
    ondelete: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    onedit: EventEmitter<number> = new EventEmitter<number>();

    @ViewChild('amount')
    amount: ElementRef;

    @Input()
    recipe: Recipe;

    constructor(private i18n: I18nToolsService) {
    }

    public delete(): void {
        this.ondelete.emit();
    }

    public getName(i18nName: I18nName): string {
        return this.i18n.getName(i18nName);
    }

    public ngOnInit(): void {
        Observable.fromEvent(this.amount.nativeElement, 'input')
            .debounceTime(500)
            .distinctUntilChanged()
            .map(() => {
                return this.amount.nativeElement.value;
            })
            .subscribe(value => {
                this.onedit.emit(value);
            });
    }

}
