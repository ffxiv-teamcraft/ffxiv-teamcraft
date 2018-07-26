import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {ModificationEntry} from '../../../model/list/modification-entry';
import {Observable} from 'rxjs/Observable';
import {DataService} from '../../../core/api/data.service';
import {pluck} from 'rxjs/operators';

@Component({
    selector: 'app-list-history-popup',
    templateUrl: './list-history-popup.component.html',
    styleUrls: ['./list-history-popup.component.scss']
})
export class ListHistoryPopupComponent {

    characters: { [index: number]: Observable<string> } = {};

    public listHistory: ModificationEntry[] = [];

    constructor(@Inject(MAT_DIALOG_DATA) public entries: ModificationEntry[], private dataService: DataService) {
        // Filter the old entries before trying to display things.
        this.listHistory = entries.filter(entry => entry.characterId !== undefined);
    }

    public getCharacterName(lodestoneId: number): Observable<string> {
        if (this.characters[lodestoneId] === undefined) {
            this.characters[lodestoneId] = this.dataService.getCharacter(lodestoneId).pipe(pluck('name'));
        }
        return this.characters[lodestoneId];
    }

}
