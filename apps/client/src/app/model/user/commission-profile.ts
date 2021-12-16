import { CommissionRating } from '../../modules/commission-board/model/commission-rating';
import { FiredFeedback } from '../../modules/commission-board/model/fired-feedback';
import { ResignedFeedback } from '../../modules/commission-board/model/resigned-feedback';
import { DataModel } from '../../core/database/storage/data-model';

export class CommissionProfile extends DataModel {
  ratings: CommissionRating[] = [];

  firedFeedbacks: FiredFeedback[] = [];

  resignedFeedback: ResignedFeedback[] = [];
}
