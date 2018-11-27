import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../model/common/i18n-name';

@Pipe({
  name: 'ffxivgardening'
})
export class FfxivgardeningPipe implements PipeTransform {

  static FFXIV_GARDENING_IDS = [
    { gid: 1, seedId: 7725 },
    { gid: 2, seedId: 7726 },
    { gid: 3, seedId: 7715 },
    { gid: 4, seedId: 7736 },
    { gid: 5, seedId: 7718 },
    { gid: 6, seedId: 7717 },
    { gid: 7, seedId: 7719 },
    { gid: 8, seedId: 7737 },
    { gid: 9, seedId: 7727 },
    { gid: 10, seedId: 7728 },
    { gid: 11, seedId: 8572 },
    { gid: 12, seedId: 7729 },
    { gid: 13, seedId: 7738 },
    { gid: 14, seedId: 7740 },
    { gid: 15, seedId: 7721 },
    { gid: 16, seedId: 7722 },
    { gid: 17, seedId: 7723 },
    { gid: 18, seedId: 7741 },
    { gid: 19, seedId: 7742 },
    { gid: 20, seedId: 7743 },
    { gid: 21, seedId: 7730 },
    { gid: 22, seedId: 7744 },
    { gid: 23, seedId: 7731 },
    { gid: 24, seedId: 7732 },
    { gid: 25, seedId: 7733 },
    { gid: 26, seedId: 7724 },
    { gid: 27, seedId: 7734 },
    { gid: 28, seedId: 7751 },
    { gid: 29, seedId: 7750 },
    { gid: 30, seedId: 7753 },
    { gid: 31, seedId: 8169 },
    { gid: 32, seedId: 8171 },
    { gid: 33, seedId: 8173 },
    { gid: 34, seedId: 7746 },
    { gid: 35, seedId: 7748 },
    { gid: 36, seedId: 7752 },
    { gid: 37, seedId: 8167 },
    { gid: 38, seedId: 8170 },
    { gid: 39, seedId: 8172 },
    { gid: 40, seedId: 7745 },
    { gid: 41, seedId: 7747 },
    { gid: 42, seedId: 7755 },
    { gid: 43, seedId: 7757 },
    { gid: 44, seedId: 8186 },
    { gid: 45, seedId: 8188 },
    { gid: 46, seedId: 8183 },
    { gid: 47, seedId: 8185 },
    { gid: 48, seedId: 7754 },
    { gid: 49, seedId: 7756 },
    { gid: 50, seedId: 8187 },
    { gid: 51, seedId: 8182 },
    { gid: 52, seedId: 8184 },
    { gid: 53, seedId: 7720 },
    { gid: 54, seedId: 7749 },
    { gid: 55, seedId: 7735 },
    { gid: 56, seedId: 7739 },
    { gid: 57, seedId: 7716 },
    { gid: 58, seedId: 8174 },
    { gid: 59, seedId: 8175 },
    { gid: 60, seedId: 8176 },
    { gid: 61, seedId: 8177 },
    { gid: 62, seedId: 8178 },
    { gid: 63, seedId: 8179 },
    { gid: 64, seedId: 8180 },
    { gid: 69, seedId: 13768 },
    { gid: 68, seedId: 13767 },
    { gid: 67, seedId: 13766 },
    { gid: 66, seedId: 13765 },
    { gid: 65, seedId: 13755 },
    { gid: 70, seedId: 15855 },
    { gid: 71, seedId: 15856 },
    { gid: 72, seedId: 14007 },
    { gid: 73, seedId: 15865 },
    { gid: 74, seedId: 15866 },
    { gid: 75, seedId: 15867 },
    { gid: 76, seedId: 15868 },
    { gid: 77, seedId: 15869 },
    { gid: 78, seedId: 15870 },
    { gid: 79, seedId: 16016 },
    { gid: 80, seedId: 17547 },
    { gid: 81, seedId: 17546 },
    { gid: 82, seedId: 17996 },
    { gid: 83, seedId: 20795 },
    { gid: 84, seedId: 20792 },
    { gid: 85, seedId: 20794 },
    { gid: 86, seedId: 21875 },
    { gid: 87, seedId: 22589 },
    { gid: 88, seedId: 24165 }
  ];

  transform(id: number): I18nName {
    const seedId = FfxivgardeningPipe.FFXIV_GARDENING_IDS.find(entry => entry.seedId === id);
    if (seedId !== undefined) {
      return {
        en: `http://www.ffxivgardening.com/seed-details.php?SeedID=${seedId.gid}`,
        fr: `http://fr.ffxivgardening.com/seed-details.php?SeedID=${seedId.gid}`,
        de: `http://de.ffxivgardening.com/seed-details.php?SeedID=${seedId.gid}`,
        ja: `http://ja.ffxivgardening.com/seed-details.php?SeedID=${seedId.gid}`,
        ko: `http://ko.ffxivgardening.com/seed-details.php?SeedID=${seedId.gid}`
      };
    }
    // If the id isn't found, go to home page directly
    return {
      en: `http://www.ffxivgardening.com/`,
      fr: `http://fr.ffxivgardening.com/`,
      de: `http://de.ffxivgardening.com/`,
      ja: `http://ja.ffxivgardening.com/`,
      ko: `http://ko.ffxivgardening.com/`
    };
  }

}
