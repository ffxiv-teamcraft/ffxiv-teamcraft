import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Stats } from './stats';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(protected firebase: AngularFireDatabase, protected serializer: NgSerializerService) {
  }

  getStats(): Observable<Stats> {
    return this.firebase.object(`stats`)
      .snapshotChanges()
      .pipe(
        map((snap: any) => {
          return this.serializer.deserialize<Stats>(snap.payload, Stats);
        }),
        shareReplay(1)
      );
  }

}
