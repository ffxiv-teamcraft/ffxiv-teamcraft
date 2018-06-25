import {Component} from '@angular/core';

@Component({
    selector: 'app-commission-board',
    templateUrl: './commission-board.component.html',
    styleUrls: ['./commission-board.component.scss']
})
export class CommissionBoardComponent {

    navLinks = [
        {
            path: 'board',
            label: 'COMMISSION_BOARD.Board',
        },
        {
            path: 'my-requests',
            label: 'COMMISSION_BOARD.My_requests',
        },
        {
            path: 'my-crafts',
            label: 'COMMISSION_BOARD.My_crafts',
        }
    ];
}
