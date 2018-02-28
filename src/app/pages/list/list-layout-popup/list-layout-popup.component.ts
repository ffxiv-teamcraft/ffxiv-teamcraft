import {Component} from '@angular/core';
import {LayoutService} from '../../../core/layout/layout.service';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {LayoutRow} from '../../../core/layout/layout-row';
import {LayoutRowOrder} from '../../../core/layout/layout-row-order.enum';
import {ImportInputBoxComponent} from './import-input-box/import-input-box.component';
import {TranslateService} from '@ngx-translate/core';
import {NgSerializerService} from '@kaiu/ng-serializer';

@Component({
    selector: 'app-list-layout-popup',
    templateUrl: './list-layout-popup.component.html',
    styleUrls: ['./list-layout-popup.component.scss']
})
export class ListLayoutPopupComponent {

    public rows: LayoutRow[] = [];

    constructor(public layoutService: LayoutService, private dialogRef: MatDialogRef<ListLayoutPopupComponent>,
                private dialog: MatDialog, private snackBar: MatSnackBar, private translator: TranslateService,
                private serializer: NgSerializerService) {
        this.rows = layoutService.layout.rows.slice().sort((a, b) => a.index - b.index);
    }

    public save(): void {
        this.layoutService.layout.rows = this.rows;
        this.layoutService.persist();
        this.dialogRef.close();
    }

    updateIndex(index: number, modifier: -1 | 1): void {
        this.rows[index + modifier].index -= modifier;
        this.rows[index].index += modifier;
        this.rows = this.rows.sort((a, b) => a.index - b.index);
    }

    deleteRow(row: LayoutRow): void {
        this.rows = this.rows.filter(r => r !== row);
    }

    addRow(): void {
        this.rows.push(new LayoutRow('', 'NAME', LayoutRowOrder.DESC, 'NONE', this.rows.length));
    }

    public export(): string {
        return btoa(JSON.stringify(this.rows));
    }

    public afterCopy(): void {
        this.snackBar.open(
            this.translator.instant('LIST_DETAILS.LAYOUT_DIALOG.Import_string_copied'),
            '',
            {
                duration: 2000,
                extraClasses: ['snack']
            }
        );
    }

    public reset(): void {
        this.rows = this.layoutService.defaultLayout.slice().sort((a, b) => a.index - b.index);
    }

    public import(): void {
        this.dialog.open(ImportInputBoxComponent).afterClosed().subscribe(importString => {
            if (importString !== undefined) {
                this.rows = this.serializer.deserialize<LayoutRow>(JSON.parse(atob(importString)), [LayoutRow]);
            }
        });
    }

}
