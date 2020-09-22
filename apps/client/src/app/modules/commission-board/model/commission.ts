import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { CommissionStatus } from './commission-status';
import { CommissionPayment } from './commission-payment';
import { CommissionTag } from './commission-tag';

export class Commission extends DataWithPermissions {

  /**
   * The $key of the list is the $key of the commission,
   * this is meant to make permissions easier to compute, as we can say that a list cannot be deleted
   * if it has a commission associated and not completed
   */

  crafterId: string;

  includesMaterials = false;

  /**
   * The price that the buyer is willing to pay, defaults to 0 if he wants to negotiate the price or doesn't know which one to set.
   */
  price = 0;

  status: CommissionStatus = CommissionStatus.OPENED;

  payments: CommissionPayment[] = [];

  candidates: string[] = [];

  tags: CommissionTag[] = [];

  ratedBy: Record<string, boolean> = {};
}
