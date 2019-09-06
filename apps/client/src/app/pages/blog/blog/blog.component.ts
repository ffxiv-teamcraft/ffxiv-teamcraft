import { Component } from '@angular/core';
import { BlogService } from '../../../core/database/blog.service';
import { BlogEntry } from '../blog-entry';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { AuthFacade } from '../../../+state/auth.facade';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.less']
})
export class BlogComponent {

  posts$: Observable<BlogEntry[]>;

  admin$ = this.authFacade.user$.pipe(map(user => user.admin));

  constructor(private blogService: BlogService, private activeRoute: ActivatedRoute,
              private linkTools: LinkToolsService, private authFacade: AuthFacade) {
    this.posts$ = this.activeRoute.paramMap.pipe(
      switchMap((params) => {
        const slug = params.get('slug');
        return this.blogService.getAll().pipe(
          map(posts => {
            return slug ? posts.filter(post => post.slug === slug) : posts.sort((a, b) => {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
          })
        );
      })
    );
  }

}
