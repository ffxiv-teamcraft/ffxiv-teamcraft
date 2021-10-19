import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogEntry } from '../blog-entry';
import { AuthFacade } from '../../../+state/auth.facade';
import { first, map, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';
import { BlogService } from '../../../core/database/blog.service';
import { Router } from '@angular/router';
import { combineLatest, Observable, from } from 'rxjs';
import { UserService } from '../../../core/database/user.service';
import { BlogPostNotification } from '../../../model/notification/blog-post-notification';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { requestsWithDelay } from '../../../core/rxjs/requests-with-delay';
import * as _ from 'lodash';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-new-entry',
  templateUrl: './new-entry.component.html',
  styleUrls: ['./new-entry.component.less']
})
export class NewEntryComponent {

  form: FormGroup;

  preview$: Observable<BlogEntry>;

  users$: Observable<string[]> = this.userService.getAllIds().pipe(shareReplay(1));

  constructor(private fb: FormBuilder, private authFacade: AuthFacade,
              private blogService: BlogService, private router: Router,
              private userService: UserService, private progress: ProgressPopupService,
              private db: AngularFirestore) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      description: ['', [Validators.required]],
      message: ['', [Validators.required]]
    });

    this.preview$ = combineLatest([this.authFacade.userId$, this.form.valueChanges]).pipe(
      map(([userId, data]) => {
        const post = new BlogEntry();
        post.author = userId;
        post.content = data.message;
        post.slug = data.slug;
        post.description = data.description;
        post.title = data.title;
        return post;
      }),
      shareReplay(1)
    );
  }



  submit(): void {
    const data = this.form.getRawValue();
    this.preview$.pipe(
      first(),
      switchMap((post) => {
        return this.blogService.add(post);
      }),
      withLatestFrom(this.users$),
      switchMap(([, userIds]) => {
        const notifications = _.chunk(userIds, 200)
          .map(ids => {
            const batch = this.db.firestore.batch();
            ids.forEach(userId => {
              const notification = new BlogPostNotification(data.title, data.slug, userId);
              const ref = this.db.collection('/notifications').doc(this.db.createId()).ref;
              batch.set(ref, JSON.parse(JSON.stringify(notification)));
            });
            return from(batch.commit());
          });
        return this.progress.showProgress(requestsWithDelay(notifications, 0, true), Math.ceil(userIds.length / 200));
      })
    ).subscribe(() => {
      this.router.navigate(['blog', data.slug]);
    });
  }

}
