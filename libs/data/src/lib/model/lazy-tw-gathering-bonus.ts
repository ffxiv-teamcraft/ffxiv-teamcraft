export interface LazyTwGatheringBonus {
  bonus:          Bonus;
  condition:      Bonus;
  conditionValue: number;
  value:          number;
}

export interface Bonus {
  tw: Tw;
}

export enum Tw {
  GP上限ValueIntegerParameter1Value以上 = "GP上限 <Value>IntegerParameter(1)</Value>以上",
  低於自身等級道具獲得率ValueIntegerParameter1Value = "低於自身等級道具獲得率＋<Value>IntegerParameter(1)</Value>%",
  價值提升ValueIntegerParameter1Value = "價值提升＋<Value>IntegerParameter(1)</Value>%",
  價值提升ValueIntegerParameter1Value上升型 = "價值提升＋<Value>IntegerParameter(1)</Value>%（上升型）",
  慎重提煉追加效果發生率ValueIntegerParameter1Value = "慎重提煉：追加效果發生率＋<Value>IntegerParameter(1)</Value>%",
  慎重提煉追加效果發生率ValueIntegerParameter1Value上升型 = "慎重提煉：追加效果發生率＋<Value>IntegerParameter(1)</Value>%（上升型）",
  採集次數耐久ValueIntegerParameter1Value次 = "採集次數/耐久＋<Value>IntegerParameter(1)</Value>次",
  採集次數耐久ValueIntegerParameter1Value次上升型 = "採集次數/耐久＋<Value>IntegerParameter(1)</Value>次（上升型）",
  收藏價值ValueIntegerParameter1Value = "收藏價值＋<Value>IntegerParameter(1)</Value>",
  收藏價值ValueIntegerParameter1Value上升型 = "收藏價值＋<Value>IntegerParameter(1)</Value>（上升型）",
  收藏價值最大時昇華率ValueIntegerParameter1Value上升型 = "收藏價值最大時：昇華率＋<Value>IntegerParameter(1)</Value>%（上升型）",
  獲得力ValueIntegerParameter1Value以上 = "獲得力 <Value>IntegerParameter(1)</Value>以上",
  獲得數ValueIntegerParameter1Value個 = "獲得數＋<Value>IntegerParameter(1)</Value>個",
  獲得數ValueIntegerParameter1Value個上升型 = "獲得數＋<Value>IntegerParameter(1)</Value>個（上升型）",
  獲得率ValueIntegerParameter1Value = "獲得率＋<Value>IntegerParameter(1)</Value>%",
  連鎖ValueIntegerParameter1Value以上 = "連鎖 <Value>IntegerParameter(1)</Value>以上",
  鑑別力ValueIntegerParameter1Value以上 = "鑑別力 <Value>IntegerParameter(1)</Value>以上",
  集中檢查上升率ValueIntegerParameter1Value = "集中檢查：上升率＋<Value>IntegerParameter(1)</Value>%",
  集中檢查上升率ValueIntegerParameter1Value上升型 = "集中檢查：上升率＋<Value>IntegerParameter(1)</Value>%（上升型）",
  靈巧ValueIntegerParameter1Value以上 = "靈巧 <Value>IntegerParameter(1)</Value>以上",
  額外採集獎勵發生率ValueIntegerParameter1Value = "額外採集獎勵發生率＋<Value>IntegerParameter(1)</Value>%",
  額外採集獎勵發生率ValueIntegerParameter1Value上升型 = "額外採集獎勵發生率＋<Value>IntegerParameter(1)</Value>%（上升型）",
  高於自身等級道具獲得率ValueIntegerParameter1Value = "高於自身等級道具獲得率＋<Value>IntegerParameter(1)</Value>%",
}
