import {Injectable, NgZone} from "@angular/core";
import {FirestoreStorage} from "./storage/firestore/firestore-storage";
import {TeamcraftGuide} from "./guides/teamcraft-guide";
import {Class} from "@kaiu/serializer";
import {Firestore} from "@angular/fire/firestore";
import {NgSerializerService} from "@kaiu/ng-serializer";
import {PendingChangesService} from "./pending-changes/pending-changes.service";

@Injectable({
  providedIn: 'root'
})
export class GuidesService extends FirestoreStorage<any> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return "guides";
  }

  protected getClass(): Class {
    return TeamcraftGuide;
  }

}
