import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../core/database/user.service';
import {CustomLinksService} from '../../../core/database/custom-links/custom-links.service';
import {CustomLink} from '../../../core/database/custom-links/costum-link';

@Component({
    selector: 'app-link',
    templateUrl: './link.component.html',
    styleUrls: ['./link.component.scss']
})
export class LinkComponent implements OnInit {

    constructor(private activeRoute: ActivatedRoute, private userService: UserService, private customLinksService: CustomLinksService,
                private router: Router) {
    }

    ngOnInit() {
        this.activeRoute.params.switchMap(params => {
            return this.customLinksService.getByUri(params.uri);
        }).subscribe((link: CustomLink) => {
            this.router.navigate(link.redirectTo.split('/'));
        });
    }

}
