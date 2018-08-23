import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ResourceComment } from '../resource-comment';
import { DataService } from '../../../core/api/data.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-comment-row',
  templateUrl: './comment-row.component.html',
  styleUrls: ['./comment-row.component.scss']
})
export class CommentRowComponent implements OnInit {

  @Input()
  comment: ResourceComment;

  @Input()
  canDelete = false;

  authorIcon: string;

  authorName: string;

  @Output()
  delete: EventEmitter<void> = new EventEmitter<void>();

  constructor(private db: DataService, private translate: TranslateService) {
  }

  ngOnInit(): void {
    if (this.comment.authorId > -1) {
      this.db.getCharacter(this.comment.authorId).subscribe(character => {
        this.authorIcon = character.avatar;
        this.authorName = character.name;
      });
    } else {
      this.authorName = this.translate.instant('Anonymous');
    }
  }

  deleteComment(): void {
    if (this.canDelete) {
      this.delete.emit();
    }
  }

  getDate(): string {
    return new Date(this.comment.date).toLocaleString();
  }

}
