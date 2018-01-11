import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BellNodesService} from '../../../core/data/bell-nodes.service';
import {Observable} from 'rxjs/Observable';
import {MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-add-alarm-popup',
    templateUrl: './add-alarm-popup.component.html',
    styleUrls: ['./add-alarm-popup.component.scss']
})
export class AddAlarmPopupComponent implements OnInit {

    itemName: string;

    @ViewChild('searchInput')
    searchInput: ElementRef;

    results: Observable<any[]>;

    constructor(private bellNodesService: BellNodesService, private dialogRef: MatDialogRef<AddAlarmPopupComponent>) {
    }

    close(node: any): void {
        this.dialogRef.close(node);
    }

    ngOnInit() {
        this.results = Observable.fromEvent(this.searchInput.nativeElement, 'keyup')
            .debounceTime(250)
            .map(() => {
                return this.bellNodesService.getNodesByItemName(this.itemName);
            });
    }

}
