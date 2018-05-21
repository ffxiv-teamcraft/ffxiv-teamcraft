import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../core/database/user.service';
import {CustomLinksService} from '../../../core/database/custom-links/custom-links.service';
import {CustomLink} from '../../../core/database/custom-links/custom-link';
import {switchMap} from 'rxjs/operators';

@Component({
    selector: 'app-link',
    templateUrl: './link.component.html',
    styleUrls: ['./link.component.scss']
})
export class LinkComponent implements OnInit {

    notFound = false;

    constructor(private activeRoute: ActivatedRoute, private userService: UserService, private customLinksService: CustomLinksService,
                private router: Router) {
    }

    ngOnInit() {
        this.activeRoute.params
            .pipe(switchMap(params => {
                    return this.customLinksService.getByUriAndNickname(decodeURI(params.uri), decodeURI(params.nickName));
                })
            ).subscribe((link: CustomLink) => {
            if (link === undefined) {
                this.notFound = true;
            }
            this.router.navigate(link.redirectTo.split('/'));
        });
    }

}
