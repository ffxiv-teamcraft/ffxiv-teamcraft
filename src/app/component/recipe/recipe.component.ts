import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Recipe} from '../../model/list/recipe';

@Component({
    selector: 'app-recipe',
    templateUrl: './recipe.component.html',
    styleUrls: ['./recipe.component.scss']
})
export class RecipeComponent {

    @Output()
    ondelete: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    onedit: EventEmitter<number> = new EventEmitter<number>();

    @ViewChild('amount')
    amount: ElementRef;

    @Input()
    recipe: Recipe;

    @Input()
    readonly = false;

    constructor() {
    }

    public delete(): void {
        this.ondelete.emit();
    }

}
