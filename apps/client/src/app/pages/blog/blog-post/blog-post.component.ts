import { Component, Input } from '@angular/core';
import { BlogEntry } from '../blog-entry';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.less']
})
export class BlogPostComponent {

  @Input()
  post: BlogEntry;

  constructor(private router: Router, public translate: TranslateService) {
  }

  public handleClick(event: any): void {
    if (event.srcElement.tagName === 'A') {
      event.preventDefault();
      if (!(<any>event.srcElement).href.startsWith('http')) {
        // If that's an anchor, intercept the click and handle it properly with router
        this.router.navigateByUrl((<HTMLAnchorElement>event.srcElement).pathname);
      } else {
        window.open((<any>event.srcElement).href, '_blank');
      }
    }
  }

}
