import {Component, OnInit} from '@angular/core';
import {TeamService} from '../../core/database/team.service';
import {Team} from '../../model/other/team';
import {Observable} from 'rxjs/index';

@Component({
    selector: 'app-team',
    templateUrl: './team.component.html',
    styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {

    public teams$: Observable<Team[]>;

    constructor(private teamService: TeamService) {
        this.teams$ = this.teamService.getUserTeams()
    }

    ngOnInit() {
    }

}
