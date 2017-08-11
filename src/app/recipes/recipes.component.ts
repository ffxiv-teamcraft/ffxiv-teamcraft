import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-recipes',
    templateUrl: './recipes.component.html',
    styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {

    recipes: Observable<any[]>;

    @ViewChild('filter')
    filter: ElementRef;

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.recipes = Observable.fromEvent(this.filter.nativeElement, 'keyup')
            .debounceTime(200)
            .distinctUntilChanged()
            .mergeMap(() => {
                const filter = this.filter.nativeElement.value;
                if (filter === '') {
                    return Observable.of([]);
                }
                return this.http.get<any>(`https://api.xivdb.com/search?language=fr&string=${filter}&one=recipes`)
                    .map(results => {
                        return results.recipes.results;
                    });
            });
    }

}
