import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-regeneration-popup',
    templateUrl: './regeneration-popup.component.html',
    styleUrls: ['./regeneration-popup.component.scss']
})
export class RegenerationPopupComponent implements OnInit {

    gif: string;

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.http.get<any>('https://api.giphy.com/v1/gifs/random?api_key=0r0WR80YybAuW4mfIT3KzXQjpNfa7gjY&tag=funny').subscribe(res => {
            this.gif = res.data.image_url;
        });
    }

}
