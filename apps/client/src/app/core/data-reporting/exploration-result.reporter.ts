import { ExplorationType } from '../../model/other/exploration-type';

export interface ExplorationResultReporter {
  getExplorationType(): ExplorationType;
}
