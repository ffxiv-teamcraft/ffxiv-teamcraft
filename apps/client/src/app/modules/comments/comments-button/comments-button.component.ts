import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CommentsPopupComponent } from '../comments-popup/comments-popup.component';
import { ListRow } from '../../list/model/list-row';
import { List } from '../../list/model/list';
import { ObservableMedia } from '@angular/flex-layout';
import { SettingsService } from '../../../pages/settings/settings.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-comments-button',
  templateUrl: './comments-button.component.html',
  styleUrls: ['./comments-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsButtonComponent implements OnInit, OnChanges {

  @Input()
  row: ListRow;

  @Input()
  list: List;

  @Input()
  name: string;

  @Input()
  isOwnList = false;

  @Input()
  color = 'accent';

  @Output()
  updated: EventEmitter<void> = new EventEmitter<void>();

  amount: number;

  constructor(private dialog: MatDialog, private media: ObservableMedia, public settings: SettingsService) {
  }

  openPopup(): void {
    this.dialog
      .open(CommentsPopupComponent, { data: { name: this.name, row: this.row, list: this.list, isOwnList: this.isOwnList } })
      .afterClosed()
      .pipe(first())
      .subscribe(() => this.updated.emit());
  }

  ngOnInit(): void {
    this.processAmount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.processAmount();
  }

  isMobile(): boolean {
    return this.media.isActive('xs') || this.media.isActive('sm');
  }

  private processAmount(): void {
    // If we don't have a row defined, that's because it's a list comments button.
    if (this.row !== undefined) {
      this.amount = this.row.comments === undefined ? 0 : this.row.comments.length;
    } else {
      this.amount = this.list.comments === undefined ? 0 : this.list.comments.length;
    }
  }

}
