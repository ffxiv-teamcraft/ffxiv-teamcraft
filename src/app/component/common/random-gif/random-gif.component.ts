import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-random-gif',
    templateUrl: './random-gif.component.html',
    styleUrls: ['./random-gif.component.scss']
})
export class RandomGifComponent implements OnInit {

    gif: string;

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.http.get<any>('https://api.giphy.com/v1/gifs/random?api_key=0r0WR80YybAuW4mfIT3KzXQjpNfa7gjY&tag=funny').subscribe(res => {
            this.gif = res.data.image_url;
        });
    }

}
