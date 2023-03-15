import {Injectable} from "@angular/core";
import {FirestoreStorage} from "./storage/firestore/firestore-storage";
import {TeamcraftGuide} from "./guides/teamcraft-guide";
import {Class} from "@kaiu/serializer";

@Injectable({
  providedIn: 'root'
})
export class GuidesService extends FirestoreStorage<any> {
  protected getBaseUri(): string {
    return "guides";
  }

  protected getClass(): Class {
    return TeamcraftGuide;
  }

}
