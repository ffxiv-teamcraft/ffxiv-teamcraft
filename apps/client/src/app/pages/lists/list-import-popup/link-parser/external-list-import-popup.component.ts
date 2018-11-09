import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ItemData } from '../../../model/garland-tools/item-data';
import { combineLatest, concat, Observable } from 'rxjs';
import { ExternalListLinkParser } from './external-list-link-parser';
import { FfxivCraftingLinkParser } from './ffxiv-crafting-link-parser';
import { DataService } from '../../../core/api/data.service';
import { ExternalListData } from './external-list-data';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { HtmlToolsService } from '../../../core/tools/html-tools.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatRadioChange } from '@angular/material';
import { ListManagerService } from '../../../core/list/list-manager.service';
import { ListService } from '../../../core/database/list.service';
import { List } from '../../../model/list/list';
import { filter, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { AriyalaLinkParser } from './ariyala-link-parser';
import { HttpClient } from '@angular/common/http';

declare const gtag: Function;

@Component({
    selector: 'app-external-list-import-popup',
    templateUrl: './external-list-import-popup.component.html',
    styleUrls: ['./external-list-import-popup.component.scss']
})
export class ExternalListImportPopupComponent implements OnInit {

    supportedWebsites: string[] = ['ffxivcrafting.com', 'craftingasaservice.com'];

    externalLinkGroup: FormGroup;

    listNameGroup: FormGroup;

    listEntries: Observable<{ itemData: ItemData, quantity: number }[]>;

    recipeChoices: { [index: number]: { recipeId: string, quantity: number } } = {};

    readonly linkParsers: ExternalListLinkParser[] = [new FfxivCraftingLinkParser(), new AriyalaLinkParser(this.http)];

    creatingList = false;

    progress = 0;

    constructor(private formBuilder: FormBuilder, private dataService: DataService, private gt: GarlandToolsService,
                private htmlTools: HtmlToolsService, private dialogRef: MatDialogRef<ExternalListImportPopupComponent>,
                private listManager: ListManagerService, private listService: ListService,
                @Inject(MAT_DIALOG_DATA) private data: { listName: string, userId: string },
                private http: HttpClient) {
    }

    /**
     * Custom validator for list import link, we store it in a field to make sure `this` context isn't lost.
     * @param {FormControl} control
     */
    private importlinkValidator: ValidatorFn = (control: FormControl): { [key: string]: any } => {
        for (const parser of this.linkParsers) {
            if (control.value !== null && parser.canParse(control.value)) {
                // Return null = no errors
                return null;
            }
        }
        return {
            invalidLink: true
        };
    };

    /**
     * Parses the import link to create our data Observable.
     */
    parseImportLink(): void {
        const url = this.externalLinkGroup.controls.externalLink.value;
        let parse$: Observable<ExternalListData[]>;
        for (const parser of this.linkParsers) {
            if (parser.canParse(url)) {
                parse$ = parser.parse(url);
                break;
            }
        }
        this.listEntries = parse$.pipe(
            switchMap(entries => {
                return combineLatest(entries.map(entry => this.dataService.getItem(entry.itemId)
                    .pipe(map(itemData => ({ itemData: itemData, quantity: entry.quantity }))))
                )
                    .pipe(
                        tap(entriesResult => {
                            this.recipeChoices = {};
                            for (const entry of entriesResult) {
                                const crafts = entry.itemData.item.craft;
                                // Prepare choices for each row that has only one recipe available
                                if (crafts.length === 1) {
                                    this.recipeChoices[entry.itemData.item.id] = { recipeId: crafts[0].id, quantity: entry.quantity };
                                } else {
                                    this.recipeChoices[entry.itemData.item.id] = { recipeId: null, quantity: entry.quantity };
                                }
                            }
                        })
                    );
            })
        );
    }

    /**
     * Sets the choice for a given item with two or more recipes
     * @param {number} itemId
     * @param {MatRadioChange} changeEvent
     */
    setChoice(itemId: number, changeEvent: MatRadioChange): void {
        this.recipeChoices[itemId].recipeId = changeEvent.value;
    }

    itemNeedsChoice(itemId: number): boolean {
        return this.recipeChoices[itemId].recipeId === null;
    }

    /**
     * Checks if a choice is needed
     * @returns {boolean}
     */
    needsChoices(): boolean {
        return Object.keys(this.recipeChoices)
            .map(key => this.recipeChoices[key]).find(choice => choice.recipeId === null) !== undefined;
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

    createList(): void {
        gtag('send', 'event', 'List', 'import');
        let done = 0;
        this.creatingList = true;
        const list = new List();
        list.authorId = this.data.userId;
        list.name = this.listNameGroup.controls.listName.value;
        const entries = Object.keys(this.recipeChoices).map(key => ({ itemId: key, ...this.recipeChoices[key] }));
        concat(...entries.map(entry => {
            return this.listManager.addToList(entry.itemId, list, entry.recipeId, entry.quantity);
        }))
            .pipe(
                tap(() => {
                    done++;
                    this.progress = Math.ceil(100 * done / Object.keys(this.recipeChoices).length);
                }),
                filter(() => this.progress >= 100),
                mergeMap(resultList => this.listService.add(resultList))
            ).subscribe(() => {
            this.dialogRef.close();
            this.creatingList = false;
        });
    }

    ngOnInit(): void {
        this.externalLinkGroup = this.formBuilder.group({
            externalLink: new FormControl('', [Validators.required, this.importlinkValidator])
        });
        this.listNameGroup = this.formBuilder.group({
            listName: new FormControl(this.data.listName || '', [Validators.required])
        });
    }
}
