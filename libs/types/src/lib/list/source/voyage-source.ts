import { I18nName } from "../../i18n-name";
import { ExplorationType } from "../details-model/exploration-type";

export interface VoyageSource {
  type: ExplorationType;
  name: I18nName;
}
