import {Component} from '@angular/core';
import {LayoutService} from '../../../core/layout/layout.service';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {LayoutRow} from '../../../core/layout/layout-row';
import {LayoutRowOrder} from '../../../core/layout/layout-row-order.enum';
import {ImportInputBoxComponent} from './import-input-box/import-input-box.component';
import {TranslateService} from '@ngx-translate/core';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {ListLayout} from '../../../core/layout/list-layout';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {filter} from 'rxjs/operators';

@Component({
    selector: 'app-list-layout-popup',
    templateUrl: './list-layout-popup.component.html',
    styleUrls: ['./list-layout-popup.component.scss']
})
export class ListLayoutPopupComponent {

    public availableLayouts: ListLayout[];

    public selectedIndex = 0;

    constructor(public layoutService: LayoutService, private dialogRef: MatDialogRef<ListLayoutPopupComponent>,
                private dialog: MatDialog, private snackBar: MatSnackBar, private translator: TranslateService,
                private serializer: NgSerializerService) {
        this.layoutService.layouts.subscribe(layouts => {
            this.availableLayouts = layouts;
            if (this.availableLayouts[this.selectedIndex] === undefined) {
                this.selectedIndex = 0;
            }
        });
        this.selectedIndex = +(localStorage.getItem('layout:selected') || 0);
    }

    public newLayout(): void {
        this.availableLayouts.push(new ListLayout('New layout', this.layoutService.defaultLayout));
        this.selectedIndex = this.availableLayouts.length - 1;
    }

    public deleteLayout(): void {
        this.dialog.open(ConfirmationPopupComponent)
            .afterClosed()
            .pipe(filter(res => res === true))
            .subscribe(() => {
                this.availableLayouts.splice(this.selectedIndex, 1);
                this.selectedIndex = 0;
            });
    }

    public save(): void {
        localStorage.setItem('layout:selected', this.selectedIndex.toString());
        this.layoutService.persist(this.availableLayouts).subscribe(() => {
            this.dialogRef.close();
        });
    }

    updateIndex(index: number, modifier: -1 | 1): void {
        this.availableLayouts[this.selectedIndex].rows[index + modifier].index -= modifier;
        this.availableLayouts[this.selectedIndex].rows[index].index += modifier;
        this.availableLayouts[this.selectedIndex].rows = this.availableLayouts[this.selectedIndex].rows.sort((a, b) => a.index - b.index);
    }

    deleteRow(row: LayoutRow): void {
        this.availableLayouts[this.selectedIndex].rows = this.availableLayouts[this.selectedIndex].rows.filter(r => r !== row);
    }

    addRow(): void {
        this.availableLayouts[this.selectedIndex].rows
            .push(new LayoutRow('', 'NAME', LayoutRowOrder.DESC, 'NONE', this.availableLayouts[this.selectedIndex].rows.length));
    }

    public export(): string {
        return btoa(JSON.stringify(this.availableLayouts[this.selectedIndex].rows));
    }

    public afterCopy(): void {
        this.snackBar.open(
            this.translator.instant('LIST_DETAILS.LAYOUT_DIALOG.Import_string_copied'),
            '',
            {
                duration: 2000,
                panelClass: ['snack']
            }
        );
    }

    public import(): void {
        this.dialog.open(ImportInputBoxComponent).afterClosed().subscribe(importString => {
            if (importString !== undefined) {
                const newLayout = new ListLayout('Imported layout',
                    this.serializer.deserialize<LayoutRow>(JSON.parse(atob(importString)), [LayoutRow]));
                this.availableLayouts.push(newLayout);
                this.selectedIndex = this.availableLayouts.length - 1;
            }
        });
    }

    public trackByLayout(index: number, layout: ListLayout): string {
        return layout.base64;
    }

}
