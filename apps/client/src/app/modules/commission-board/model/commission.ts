import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { CommissionStatus } from './commission-status';
import { CommissionTag } from './commission-tag';
import firebase from 'firebase/compat/app';
import { CommissionRating } from './commission-rating';

export class Commission extends DataWithPermissions {

  createdAt: firebase.firestore.Timestamp;

  bump: firebase.firestore.Timestamp;

  name: string;

  description = '';

  contactInformations: string;

  /**
   * The $key of the list is the $key of the commission,
   * this is meant to make permissions easier to compute, as we can say that a list cannot be deleted
   * if it has a commission associated and not completed
   */
  crafterId: string = null;

  crafterContact: string = null;

  includesMaterials = false;

  requiresOnlyMaterials = false;

  /**
   * The price that the buyer is willing to pay, defaults to 0 if he wants to negotiate the price or doesn't know which one to set.
   */
  price = 0;

  status: CommissionStatus = CommissionStatus.OPENED;

  candidates: { uid: string, offer: number, contact: string, date: firebase.firestore.Timestamp }[] = [];

  tags: CommissionTag[] = [];

  ratings: Record<string, CommissionRating> = {};

  datacenter: string;

  server: string;

  materialsProgression = 0;

  itemsProgression = 0;

  totalItems = 0;

  items: { id: number, amount: number, done: number }[] = [];
}
